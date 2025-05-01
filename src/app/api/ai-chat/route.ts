import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { collection, getDocs, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';

// Define types for chat messages and house data
interface ChatMessage {
  isUser: boolean;
  content: string;
}

interface HouseData {
  id: string;
  name: string;
  durasi: number;
  harga: number;
  luas: number;
  material: string;
  tipe: string;
  description: string;
  imageUrl: string;
  createdAt?: any;
  createdBy?: string;
  [key: string]: string | number | string[] | any;
}

// Available Gemini models to try
const AVAILABLE_MODELS = ['gemini-2.0-flash'];

// Initialize Gemini AI with API key from environment variable
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}
const genAI = new GoogleGenerativeAI(apiKey);

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (error instanceof Error && error.message.includes('503')) {
        // Exponential backoff
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  
  throw lastError;
}

export async function POST(request: Request) {
  try {
    const { userMessage, answers, stage } = await request.json();
    
    // Fetch house data from Firestore
    const houses = await getHouseData();
    
    // Initialize the model with system prompt
    const model = await initializeWorkingModel(houses);
    
    // Create a chat session
    const chat = model.startChat({
      history: [],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    let response;
    
    if (stage === 'initial') {
      // Generate personalized questions based on user's initial query
      const questionsPrompt = `
Anda adalah asisten AI untuk platform SiapHuni yang membantu calon pembeli rumah menemukan rumah impian mereka.

User bertanya tentang rumah siap huni: "${userMessage}"

Buat 5 pertanyaan spesifik untuk memahami kebutuhan mereka dengan lebih baik. Pertanyaan harus personal dan relevan dengan query awal mereka.

Format setiap pertanyaan sebagai objek JSON dengan field berikut:
- id: string (contoh: "style-1", "budget-1", "space-1", "location-1", "features-1")
- question: string (pertanyaan dalam Bahasa Indonesia)
- type: "options" atau "text"
- options: array of string (hanya untuk type "options")

Pertanyaan harus mencakup:
1. Gaya dan desain rumah (contoh opsi: Modern, Minimalis, Klasik, Kontemporer)
2. Budget (contoh opsi: <500jt, 500jt-1M, 1M-2M, >2M)
3. Kebutuhan ruang (contoh opsi: 2-3 kamar, 4-5 kamar, >5 kamar)
4. Lokasi preferensi (contoh opsi: Jakarta, Bandung, Surabaya, Bali)
5. Fitur khusus (contoh opsi: Kolam renang, Taman luas, Smart home, Parkir mobil)

Pastinya anda boleh improvisasi opsi anda sendiri. Jika user bertanya atau meminta sesuatu yang sudah ada di opsi, maka anda boleh menambahkan opsi baru. Seperti contoh pertanyaan user: "Saya ingin rumah yang minimalis di budget sekitar 500jt-2M." Maka anda boleh menambahkan opsi lainnya untuk memudahkan fase analisis nantinya. Tetap respon dengan format JSON yang benar.

Format respons sebagai array JSON, tanpa teks atau format tambahan.
`;

      try {
        response = await retryWithBackoff(() => chat.sendMessage(questionsPrompt));
        const aiResponse = response.response.text();
        
        // Clean the response to ensure it's valid JSON
        const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
        
        return NextResponse.json({ 
          response: cleanResponse,
        });
      } catch (error) {
        console.error('Error generating questions:', error);
        return NextResponse.json(
          { 
            error: 'Gagal memproses pertanyaan. Silakan coba lagi dalam beberapa saat.',
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 503 }
        );
      }
    } else if (stage === 'analysis') {
      // Generate house recommendations based on collected answers
      const analysisPrompt = `
Anda adalah asisten AI untuk platform SiapHuni yang membantu calon pembeli rumah menemukan rumah impian mereka.

Berdasarkan preferensi user:
${JSON.stringify(answers, null, 2)}

Analisis database rumah kami dan berikan analisis detail. Format respons sebagai objek JSON dengan field berikut:

{
  "summary": "Ringkasan singkat analisis kebutuhan user",
  "recommendations": [
    "Rekomendasi 1 tentang gaya rumah",
    "Rekomendasi 2 tentang budget",
    "Rekomendasi 3 tentang lokasi",
    "Rekomendasi 4 tentang fitur khusus"
  ],
  "matchingHouses": [
    {
      "id": "string",
      "name": "Nama rumah",
      "matchScore": number (0-1),
      "details": "Penjelasan detail mengapa rumah ini cocok",
      "highlights": [
        "Poin keunggulan 1",
        "Poin keunggulan 2",
        "Poin keunggulan 3"
      ],
      "price": "Format harga (contoh: 750 juta)",
      "area": "Luas bangunan (contoh: 150 m²)",
      "material": "Material utama (contoh: Beton)",
      "constructionTime": "Durasi pembangunan (contoh: 30 hari)"
    }
  ],
  "advice": {
    "title": "Saran untuk Rumah Impian Anda",
    "content": "Penjelasan detail tentang saran yang diberikan",
    "suggestions": [
      "Saran 1 untuk meningkatkan kenyamanan rumah",
      "Saran 2 untuk mengoptimalkan budget",
      "Saran 3 untuk memilih lokasi yang tepat"
    ]
  },
  "customDesignSuggestion": {
    "title": "Desain Custom untuk Rumah Impian Anda",
    "description": "Penjelasan tentang mengapa desain custom bisa menjadi solusi terbaik",
    "benefits": [
      "Manfaat 1 dari desain custom",
      "Manfaat 2 dari desain custom",
      "Manfaat 3 dari desain custom"
    ]
  }
}

Rumah yang tersedia:
${houses.map(house => ({
  id: house.id,
  name: house.name,
  price: house.harga,
  area: house.luas,
  type: house.tipe,
  material: house.material,
  constructionTime: house.durasi,
  description: house.description
})).map(h => JSON.stringify(h)).join('\n')}

Pertimbangkan hal berikut dalam analisis:
1. Jika tidak ada rumah yang cocok dengan kriteria user, berikan saran untuk desain custom
2. Berikan rekomendasi yang realistis dan sesuai dengan budget
3. Sertakan saran untuk meningkatkan kenyamanan dan nilai properti
4. Jika user tidak puas dengan opsi yang ada, arahkan ke desain custom

Cocokkan dengan kebutuhan user dan berikan respons dalam format JSON, tanpa teks atau format tambahan.
`;

      response = await chat.sendMessage(analysisPrompt);
      const aiResponse = response.response.text();
      
      // Clean the response to ensure it's valid JSON
      const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      
      return NextResponse.json({ 
        response: cleanResponse,
      });
    } else {
      // General chat
      const chatPrompt = `
Anda adalah asisten AI untuk platform SiapHuni yang membantu calon pembeli rumah menemukan rumah impian mereka.

User: "${userMessage}"

Jawab pertanyaan user dengan ramah dan informatif dalam Bahasa Indonesia. Fokus pada:
1. Memberikan informasi yang akurat tentang rumah siap huni
2. Menjelaskan proses pembelian rumah
3. Memberikan saran berdasarkan kebutuhan user
4. Menggunakan bahasa yang sopan dan profesional

Jawab dengan format teks biasa, tanpa JSON atau format khusus.
`;

      response = await chat.sendMessage(chatPrompt);
      const aiResponse = response.response.text();
      
      return NextResponse.json({ 
        response: aiResponse,
      });
    }
  } catch (error) {
    console.error('Error in AI chat API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Gagal memproses permintaan Anda', 
        details: errorMessage,
        apiKeyStatus: apiKey ? 'API key is set' : 'API key is NOT set'
      },
      { status: 500 }
    );
  }
}

// Function to initialize a working Gemini model, trying different versions
async function initializeWorkingModel(houses: HouseData[]): Promise<GenerativeModel> {
  const systemPrompt = getSystemPrompt(houses);
  
  // Try each model until one works
  for (const modelVersion of AVAILABLE_MODELS) {
    try {
      console.log(`Trying to initialize model: ${modelVersion}`);
      const model = genAI.getGenerativeModel({ 
        model: modelVersion,
        systemInstruction: systemPrompt
      });
      
      // Test the model with a simple prompt
      const testResult = await model.generateContent("Respond with OK if you can read this");
      console.log(`Model ${modelVersion} initialized successfully`);
      return model;
    } catch (modelError) {
      console.error(`Error initializing model ${modelVersion}:`, modelError);
    }
  }
  
  // If all models fail, throw an error
  throw new Error(`Failed to initialize any Gemini model. Tried: ${AVAILABLE_MODELS.join(', ')}`);
}

// Function to get house data from Firestore
async function getHouseData(): Promise<HouseData[]> {
  try {
    const housesCollection = collection(db, 'houses');
    const housesSnapshot = await getDocs(housesCollection);
    
    const houses: HouseData[] = [];
    housesSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const houseData = {
        id: doc.id,
        ...doc.data()
      } as HouseData;
      
      // Ensure required fields are present
      houses.push(houseData);
    });
    
    console.log(`Fetched ${houses.length} houses from Firestore`);
    return houses;
  } catch (error) {
    console.error('Error fetching house data:', error);
    return [];
  }
}

// System prompt with house data
function getSystemPrompt(houses: HouseData[]) {
  const houseSummary = houses.map(house => {
    return {
      id: house.id,
      name: house.name || 'Rumah Tanpa Nama',
      price: `${house.harga} juta`,
      area: `${house.luas} m²`,
      type: house.tipe,
      material: house.material,
      constructionTime: `${house.durasi} hari`,
      description: house.description
    };
  });

  return `
You are SiHuni, an AI assistant for a prebuilt house consultation app in Indonesia.
Your job is to help users find the perfect prebuilt house that matches their needs and preferences.

Here is the current database of houses:
${JSON.stringify(houseSummary, null, 2)}

Follow these guidelines:
1. Be friendly, helpful, and professional.
2. Speak in Bahasa Indonesia, using proper and respectful language.
3. Analyze user needs carefully before making recommendations.
4. When recommending houses, include all relevant details (name, harga, luas, material, tipe, durasi).
5. Format prices as "X juta" (e.g., "450 juta").
6. Format areas as "X m²" (e.g., "150 m²").
7. If the user's needs don't match any house perfectly, suggest the closest option and explain why.
8. Only recommend houses that exist in the database.
9. If asked about houses not in the database, politely explain that they are not currently available.
`;
} 