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
  durasi?: number;
  harga?: number;
  luas?: number;
  material?: string;
  tipe?: string;
  lokasi?: string;
  fasilitas?: string[];
  [key: string]: string | number | string[] | undefined;
}

// Available Gemini models to try
const AVAILABLE_MODELS = ['gemini-2.0-flash'];

// Initialize Gemini AI with API key from environment variable
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}
const genAI = new GoogleGenerativeAI(apiKey);

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

Format respons sebagai array JSON, tanpa teks atau format tambahan.
`;

      response = await chat.sendMessage(questionsPrompt);
      const aiResponse = response.response.text();
      
      // Clean the response to ensure it's valid JSON
      const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      
      return NextResponse.json({ 
        response: cleanResponse,
      });
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
      "location": "Lokasi rumah",
      "features": [
        "Fitur 1",
        "Fitur 2",
        "Fitur 3"
      ]
    }
  ]
}

Rumah yang tersedia:
${JSON.stringify(houses, null, 2)}

Berikan respons dalam format JSON, tanpa teks atau format tambahan.
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
    const housesCollection = collection(db, 'test');
    const housesSnapshot = await getDocs(housesCollection);
    
    const houses: HouseData[] = [];
    housesSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      houses.push({
        id: doc.id,
        ...doc.data()
      } as HouseData);
    });
    
    return houses;
  } catch (error) {
    console.error('Error fetching house data:', error);
    return [];
  }
}

// System prompt with house data
function getSystemPrompt(houses: HouseData[]) {
  return `
You are SiHuni, an AI assistant for a prebuilt house consultation app in Indonesia.
Your job is to help users find the perfect prebuilt house that matches their needs and preferences.

Here is the current database of houses:
${JSON.stringify(houses, null, 2)}

Follow these guidelines:
1. Be friendly, helpful, and professional.
2. Speak in Bahasa Indonesia, using proper and respectful language.
3. Analyze user needs carefully before making recommendations.
4. When recommending houses, include all relevant details (durasi, harga, luas, material, tipe).
5. Format prices as "X juta" (e.g., "450 juta").
6. Format areas as "X km²" (e.g., "7 km²").
7. If the user's needs don't match any house perfectly, suggest the closest option and explain why.
8. Only recommend houses that exist in the database.
9. If asked about houses not in the database, politely explain that they are not currently available.

Your name is SiHuni and you are an expert on prebuilt houses in Indonesia.
`;
} 