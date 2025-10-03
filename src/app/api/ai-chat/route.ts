import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { collection, getDocs, DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
         process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo-api-key";
};

// Define types for house data
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
  createdAt?: Timestamp;
  createdBy?: string;
  [key: string]: string | number | string[] | DocumentData | DocumentData[] | Timestamp | undefined;
}

// Available Gemini models to try
const AVAILABLE_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];

// Initialize Gemini AI with API key from environment variable
const primaryApiKey = process.env.GEMINI_API_KEY;
const fallbackApiKey = process.env.GEMINI_FALLBACK_API_KEY;

if (!primaryApiKey && !fallbackApiKey) {
  throw new Error('No Gemini API keys are set in environment variables');
}

// Initialize genAI with primary key first
let genAI = new GoogleGenerativeAI(primaryApiKey!);

// Modify retryWithBackoff to handle API key rotation
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  initialDelay: number = 1000,
  useApiKey: 'primary' | 'fallback' = 'primary'
): Promise<T> {
  let lastError: Error | null = null;
  
  // Set up the API with the appropriate key
  const apiKey = useApiKey === 'primary' ? primaryApiKey : fallbackApiKey;
  if (!apiKey) {
    throw new Error(`${useApiKey} API key is not available`);
  }

  // Reinitialize the genAI instance with the selected API key
  genAI = new GoogleGenerativeAI(apiKey);
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${i + 1} failed with ${useApiKey} API key:`, error);
      
      // If we're using the primary key and it's failing with capacity/quota errors
      // and we have a fallback key, switch to it instead of retrying
      if (useApiKey === 'primary' && 
          fallbackApiKey && 
          i === 0 && 
          (error instanceof Error && 
           (error.message.toLowerCase().includes('capacity') || 
            error.message.toLowerCase().includes('quota') ||
            error.message.includes('429') || 
            error.message.includes('403')))) {
        console.log('Primary API key failing, switching to fallback key...');
        try {
          return await retryWithBackoff(fn, maxRetries, initialDelay, 'fallback');
        } catch (fallbackError) {
          console.error('Fallback key also failed:', fallbackError);
          throw fallbackError;
        }
      }
      
      // For other errors, retry with exponential backoff
      if (error instanceof Error && 
          (error.message.includes('503') || 
           error.message.includes('500') || 
           error.message.includes('timeout') ||
           error.message.toLowerCase().includes('capacity'))) {
        // Exponential backoff with jitter
        const jitter = Math.random() * 0.3 + 0.85; // Random between 0.85 and 1.15
        const delay = initialDelay * Math.pow(2, i) * jitter;
        console.log(`Retrying in ${Math.floor(delay)}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  
  throw lastError || new Error('Retry failed for unknown reason');
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { userMessage, answers, stage, type, userId } = await request.json();
    
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

Buat 5 pertanyaan spesifik untuk memahami kebutuhan mereka dengan lebih baik. Beberapa pertanyaan bisa memiliki opsi pilihan, sementara yang lain bisa berupa pertanyaan terbuka.

Format setiap pertanyaan sebagai objek JSON dengan field berikut:
- id: string (contoh: "style-1", "budget-1", "space-1", "location-1", "features-1")
- question: string (pertanyaan dalam Bahasa Indonesia)
- type: "options" atau "text"
- options: array of string (hanya untuk type "options")
- placeholder: string (hanya untuk type "text", contoh: "Jelaskan kebutuhan ruang Anda...")

Pertanyaan harus mencakup:
1. Gaya dan desain rumah (type: "options", opsi: Modern, Minimalis, Klasik, Kontemporer, Mediterania)
2. Budget (type: "options", opsi: <500jt, 500jt-1M, 1M-2M, >2M)
3. Kebutuhan ruang (type: "text", placeholder: "Jelaskan kebutuhan ruang Anda...")
4. Lokasi preferensi (type: "options", opsi: Jakarta, Bandung, Surabaya, Bali, Medan)
5. Fitur khusus (type: "text", placeholder: "Apa fitur khusus yang Anda inginkan di rumah?")

Untuk pertanyaan dengan type "options":
- Harus memiliki minimal 4 opsi yang jelas dan mudah dipahami
- Opsi harus mencakup semua kemungkinan jawaban yang relevan

Untuk pertanyaan dengan type "text":
- Berikan placeholder yang jelas untuk membantu user menjawab
- Pertanyaan harus memungkinkan user untuk memberikan jawaban detail

Format respons sebagai array JSON, tanpa teks atau format tambahan.
`;

      try {
        response = await retryWithBackoff(() => chat.sendMessage(questionsPrompt));
        const aiResponse = response.response.text();
        
        // Clean the response to ensure it's valid JSON
        const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
        
        return NextResponse.json({ 
          response: cleanResponse,
          success: true
        });
      } catch (error) {
        console.error('Error generating questions:', error);
        return NextResponse.json(
          { 
            error: 'Gagal memproses pertanyaan. Silakan coba lagi dalam beberapa saat.',
            details: error instanceof Error ? error.message : 'Unknown error',
            success: false
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

      try {
        response = await retryWithBackoff(() => chat.sendMessage(analysisPrompt));
        const aiResponse = response.response.text();
        
        // Clean the response to ensure it's valid JSON
        const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
        
        return NextResponse.json({ 
          response: cleanResponse,
          success: true
        });
      } catch (error) {
        console.error('Error generating analysis:', error);
        return NextResponse.json(
          { 
            error: 'Gagal menganalisis preferensi. Silakan coba lagi dalam beberapa saat.',
            details: error instanceof Error ? error.message : 'Unknown error',
            success: false
          },
          { status: 503 }
        );
      }
    } else if (stage === 'design') {
      // Authentication check for design generation
      if (!userId && type === 'suggestions') {
        return NextResponse.json(
          { 
            error: 'Anda harus login untuk menggunakan fitur ini.',
            requiresAuth: true,
            success: false
          },
          { status: 401 }
        );
      }
      
      // Generate design suggestions based on user description
      const designPrompt = `
Anda adalah asisten AI untuk SiapHuni, platform pembuatan rumah custom di Indonesia.

User meminta: "${userMessage}"

Berdasarkan permintaan tersebut, buatlah 3 desain rumah yang berbeda. Setiap desain harus detail dan realistis.

Format respons HARUS berupa objek JSON dengan struktur berikut:

{
  "suggestions": [
    {
      "id": "desain-1",
      "name": "Nama Desain 1",
      "style": "Gaya desain (Modern/Minimalis/Klasik/dll)",
      "description": "Deskripsi lengkap tentang desain rumah",
      "keyFeatures": [
        "Fitur utama 1",
        "Fitur utama 2",
        "Fitur utama 3"
      ],
      "estimatedPrice": "Estimasi harga dalam Rupiah",
      "characteristics": {
        "exterior": [
          "Karakteristik eksterior 1",
          "Karakteristik eksterior 2"
        ],
        "interior": [
          "Karakteristik interior 1",
          "Karakteristik interior 2"
        ],
        "materials": [
          "Material utama 1",
          "Material utama 2"
        ],
        "sustainability": [
          "Fitur ramah lingkungan 1",
          "Fitur ramah lingkungan 2"
        ]
      },
      "suitability": [
        "Cocok untuk lokasi tertentu",
        "Cocok untuk keluarga dengan anak-anak",
        "Cocok untuk pasangan muda"
      ]
    }
  ]
}

PENTING:
1. Respons HARUS berupa JSON yang valid
2. JANGAN tambahkan teks atau komentar di luar format JSON
3. Pastikan semua string menggunakan tanda kutip ganda (")
4. Pastikan semua array dan objek memiliki format yang benar
5. JANGAN gunakan tanda kutip tunggal (')
6. JANGAN gunakan karakter khusus dalam string

Berikan HANYA respons JSON tanpa pengantar atau penjelasan tambahan.
`;

      try {
        response = await retryWithBackoff(() => chat.sendMessage(designPrompt));
        const aiResponse = response.response.text();
        
        // Clean the response to ensure it's valid JSON
        const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
        
        // Validate JSON before sending
        try {
          JSON.parse(cleanResponse);
          return NextResponse.json({ 
            response: cleanResponse,
            success: true
          });
        } catch (parseError) {
          console.error('Invalid JSON response:', parseError);
          return NextResponse.json(
            { 
              error: 'Gagal memproses desain yang dihasilkan',
              details: 'Format respons tidak valid',
              success: false
            },
            { status: 500 }
          );
        }
      } catch (error) {
        console.error('Error generating design:', error);
        return NextResponse.json(
          { 
            error: 'Gagal membuat desain. Silakan coba lagi dalam beberapa saat.',
            details: error instanceof Error ? error.message : 'Unknown error',
            success: false
          },
          { status: 503 }
        );
      }
    } else if (stage === 'features') {
      // Generate features based on selected style
      const featuresPrompt = `
Anda adalah asisten AI untuk SiapHuni, platform pembuatan rumah custom di Indonesia.

User telah memilih desain: "${userMessage}"

Berdasarkan gaya tersebut, buatlah 6-8 fitur rumah yang sesuai. Setiap fitur harus detail dan realistis.

Format respons sebagai objek JSON dengan struktur:
{
  "features": [
    {
      "id": "fitur-1",
      "name": "Nama Fitur 1",
      "description": "Deskripsi fitur",
      "category": "exterior" | "interior" | "material" | "sustainability",
      "compatibility": ["gaya-1", "gaya-2"],
      "estimatedPrice": "Estimasi penambahan biaya"
    }
  ]
}

Pastikan fitur-fitur tersebut bervariatif mencakup kategori berikut:
- Interior (contoh: layout ruangan, pencahayaan alami, dll)
- Eksterior (contoh: gaya fasad, bahan dinding, dll)
- Material (contoh: kayu, beton, bamboo, dll)
- Keberlanjutan (contoh: panel surya, sistem air hujan, dll)

Berikan HANYA respons JSON tanpa pengantar atau penjelasan tambahan.
`;

      try {
        response = await retryWithBackoff(() => chat.sendMessage(featuresPrompt));
        const aiResponse = response.response.text();
        
        // Clean the response to ensure it's valid JSON
        const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
        
        return NextResponse.json({ 
          response: cleanResponse,
          success: true
        });
      } catch (error) {
        console.error('Error generating features:', error);
        return NextResponse.json(
          { 
            error: 'Gagal membuat fitur. Silakan coba lagi dalam beberapa saat.',
            details: error instanceof Error ? error.message : 'Unknown error',
            success: false
          },
          { status: 503 }
        );
      }
    } else if (stage === 'budget') {
      // Generate budget analysis
      const budgetPrompt = `
Anda adalah asisten AI untuk platform SiapHuni yang membantu calon pembeli rumah menemukan rumah impian mereka.

User meminta analisis budget: "${userMessage}"

Berikan analisis detail tentang budget yang diberikan user. Format sebagai objek JSON dengan field berikut:

{
  "range": "Range budget yang dianalisis",
  "description": "Penjelasan tentang apa yang bisa didapatkan dengan budget tersebut",
  "features": [
    "Fitur 1 yang bisa didapat dengan budget ini",
    "Fitur 2 yang bisa didapat dengan budget ini",
    "Fitur 3 yang bisa didapat dengan budget ini"
  ],
  "considerations": [
    "Pertimbangan 1 untuk budget ini",
    "Pertimbangan 2 untuk budget ini",
    "Pertimbangan 3 untuk budget ini"
  ]
}

Berikan analisis yang realistis dan sesuai dengan harga properti di Indonesia.
Sertakan pertimbangan tentang lokasi, kualitas material, dan fitur tambahan.

Berikan HANYA respons JSON tanpa pengantar atau penjelasan tambahan.
`;

      try {
        response = await retryWithBackoff(() => chat.sendMessage(budgetPrompt));
        const aiResponse = response.response.text();
        
        // Clean the response to ensure it's valid JSON
        const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
        
        return NextResponse.json({ 
          response: cleanResponse,
          success: true
        });
      } catch (error) {
        console.error('Error generating budget analysis:', error);
        return NextResponse.json(
          { 
            error: 'Gagal menganalisis budget. Silakan coba lagi dalam beberapa saat.',
            details: error instanceof Error ? error.message : 'Unknown error',
            success: false
          },
          { status: 503 }
        );
      }
    } else if (stage === 'floorplan') {
      // Auto-generate floor plan based on user's custom design choices
      const floorPlanPrompt = `
Anda adalah asisten AI arsitektur untuk SiapHuni, platform pembuatan rumah custom di Indonesia.

User telah menyelesaikan pemilihan desain dengan detail berikut:
${userMessage}

Tugas Anda: Buatlah denah rumah (floor plan) yang DETAIL, REALISTIS, dan sesuai dengan pilihan user.

Format respons sebagai objek JSON dengan struktur LENGKAP:
{
  "floorPlan": {
    "name": "Nama Denah yang menarik",
    "description": "Deskripsi singkat denah (1-2 kalimat)",
    "totalArea": "Luas total (contoh: 80m²)",
    "layoutType": "Single Floor" atau "Two Floors",
    "orientation": "Utara-Selatan" atau "Timur-Barat",
    "rooms": [
      {
        "id": "room-1",
        "name": "Nama Ruangan",
        "size": "4x3m",
        "area": "12m²",
        "position": {
          "x": 10,
          "y": 10,
          "width": 30,
          "height": 25
        },
        "color": "#e3f2fd",
        "description": "Fungsi ruangan",
        "features": ["Fitur 1", "Fitur 2"]
      }
    ],
    "doors": [
      {
        "id": "door-1",
        "from": "Eksterior",
        "to": "Ruang Tamu",
        "position": { "x": 25, "y": 10 },
        "type": "main"
      }
    ],
    "windows": [
      {
        "id": "window-1",
        "room": "Ruang Tamu",
        "position": { "x": 15, "y": 10 },
        "size": "large",
        "orientation": "north"
      }
    ],
    "features": [
      "Pencahayaan alami optimal",
      "Ventilasi silang",
      "Sirkulasi efisien"
    ],
    "circulation": {
      "efficiency": "Baik/Sangat Baik",
      "description": "Penjelasan sirkulasi"
    },
    "recommendations": [
      "Rekomendasi 1",
      "Rekomendasi 2",
      "Rekomendasi 3"
    ]
  }
}

ATURAN PENTING:
1. Koordinat position (x, y, width, height) dalam skala 0-100
2. Pastikan ruangan TIDAK OVERLAP - hitung koordinat dengan teliti
3. Total luas ruangan ≈ 70-80% dari totalArea (sisanya untuk sirkulasi)
4. Ruangan harus bersebelahan secara logis (kamar mandi dekat kamar tidur, dapur dekat ruang makan)
5. Pintu "main" dari eksterior ke ruang tamu, pintu "interior" antar ruangan
6. Jendela di dinding luar untuk ventilasi
7. Warna ruangan berbeda-beda untuk visualisasi:
   - Ruang Tamu: #e3f2fd (biru muda)
   - Kamar Tidur: #f3e5f5 (ungu muda)
   - Dapur: #e8f5e8 (hijau muda)
   - Kamar Mandi: #fff3e0 (orange muda)
   - Ruang Keluarga: #e1f5fe (biru terang)

UKURAN STANDAR RUANGAN:
- Ruang Tamu: 12-16m² (4x3m atau 4x4m)
- Kamar Tidur Utama: 12-16m² (4x3m atau 4x4m)
- Kamar Tidur: 9-12m² (3x3m)
- Dapur: 6-9m² (2x3m atau 3x3m)
- Kamar Mandi: 3-4m² (1.5x2m atau 2x2m)
- Ruang Keluarga: 12-16m² (4x3m atau 4x4m)

CONTOH LAYOUT (untuk referensi koordinat):
Rumah 80m² bisa dibagi:
- Baris atas (y: 10-40): Ruang Tamu (x:10-40), Kamar Tidur 1 (x:45-70), Dapur (x:75-95)
- Baris bawah (y: 45-75): Kamar Tidur 2 (x:10-40), Ruang Keluarga (x:45-75), Kamar Mandi (x:80-95)

Berikan HANYA respons JSON tanpa pengantar atau penjelasan tambahan.
`;

      try {
        response = await retryWithBackoff(() => chat.sendMessage(floorPlanPrompt));
        const aiResponse = response.response.text();
        
        // Clean the response to ensure it's valid JSON
        const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
        
        return NextResponse.json({ 
          response: cleanResponse,
          success: true
        });
      } catch (error) {
        console.error('Error generating floor plan:', error);
        return NextResponse.json(
          { 
            error: 'Gagal membuat denah. Silakan coba lagi dalam beberapa saat.',
            details: error instanceof Error ? error.message : 'Unknown error',
            success: false
          },
          { status: 503 }
        );
      }
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

      try {
        response = await retryWithBackoff(() => chat.sendMessage(chatPrompt));
        const aiResponse = response.response.text();
        
        return NextResponse.json({ 
          response: aiResponse,
          success: true
        });
      } catch (error) {
        console.error('Error in general chat:', error);
        return NextResponse.json(
          { 
            error: 'Gagal memproses pesan. Silakan coba lagi dalam beberapa saat.',
            details: error instanceof Error ? error.message : 'Unknown error',
            success: false
          },
          { status: 503 }
        );
      }
    }
  } catch (error) {
    console.error('Error in AI chat API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Gagal memproses permintaan Anda', 
        details: errorMessage,
        apiKeyStatus: primaryApiKey ? 'Primary API key is set' : 'Primary API key is NOT set',
        fallbackApiKeyStatus: fallbackApiKey ? 'Fallback API key is set' : 'Fallback API key is NOT set',
        success: false
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
      await model.generateContent("Respond with OK if you can read this");
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
    // Skip Firebase operations during build time if not configured
    if (!isFirebaseConfigured()) {
      console.log('Firebase not configured, returning empty house data for build');
      return [];
    }

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
    // Return empty array on error to prevent build failure
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