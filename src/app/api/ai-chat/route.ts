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
  [key: string]: any;
}

// Available Gemini models to try
const AVAILABLE_MODELS = ['gemini-2.0-flash'];

// Initialize Gemini AI with your API key
// In production, use environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key-here');

export async function POST(request: Request) {
  try {
    const { userMessage, chatHistory, stage } = await request.json();
    
    // Log request data for debugging
    console.log('Request received:', { userMessage, stage });
    
    // Fetch house data from Firestore
    console.log('Fetching house data...');
    const houses = await getHouseData();
    console.log('House data fetched:', houses.length);
    
    // Try to initialize a working model
    const model = await initializeWorkingModel(houses);
    
    // Format the chat history for Gemini
    const formattedHistory = formatChatHistory(chatHistory);
    
    // Create a chat session
    console.log('Creating chat session...');
    const chat = model.startChat({
      history: formattedHistory,
    });
    
    // Handle different stages of the conversation
    let response;
    console.log('Sending message to Gemini, stage:', stage);
    
    if (stage === 'initial') {
      // First user message - AI should generate 5 follow-up questions
      response = await chat.sendMessage(
        `User is asking about prebuilt houses: "${userMessage}". Generate 5 specific questions to understand their needs better. Format as a numbered list.`
      );
    } else if (stage === 'questions_answered') {
      // User has answered the questions - AI should recommend houses
      response = await chat.sendMessage(
        `Based on our conversation and the user's answers: "${userMessage}", recommend the most suitable house from our database. Explain why it matches their needs.`
      );
    } else {
      // General chat
      response = await chat.sendMessage(userMessage);
    }
    
    console.log('Received response from Gemini');
    const aiResponse = response.response.text();
    
    return NextResponse.json({ 
      response: aiResponse,
    });
  } catch (error) {
    console.error('Error in AI chat API:', error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check if API key is available
    const apiKeyStatus = process.env.GEMINI_API_KEY 
      ? 'API key is set' 
      : 'API key is NOT set';
    console.error('API key status:', apiKeyStatus);
    
    return NextResponse.json(
      { error: 'Failed to process your request', details: error instanceof Error ? error.message : 'Unknown error' },
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

// Function to format chat history for Gemini
function formatChatHistory(chatHistory: ChatMessage[]) {
  if (!chatHistory || !Array.isArray(chatHistory)) return [];
  
  return chatHistory.map(msg => ({
    role: 'user',
    parts: [{ text: msg.content }],
  }));
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