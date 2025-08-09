import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Fungsi untuk mengubah file menjadi format yang dapat digunakan oleh Google API
async function fileToGenerativePart(file: File) {
  const base64EncodedData = Buffer.from(await file.arrayBuffer()).toString('base64');
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}


export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const imageFile = data.get('image') as File | null;
    const budget = data.get('budget') as string | null;

    // Validasi input
    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (!budget) {
      return NextResponse.json({ error: 'No budget provided' }, { status: 400 });
    }

        // Pindahkan pengecekan API Key dan inisialisasi ke dalam handler
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      // Jangan crash, kirim respons error JSON yang benar
      return NextResponse.json({ error: 'GEMINI_API_KEY environment variable is not set' }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(API_KEY);

    const imagePart = await fileToGenerativePart(imageFile);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `
      Anda adalah seorang desainer interior AI bernama SiHuni.
      Analisis gambar ruangan ini. Berikan rekomendasi item interior (furnitur, dekorasi, dll.) yang cocok untuk ruangan ini dengan total anggaran sebesar Rp ${parseInt(budget).toLocaleString('id-ID')}.

      Berikan saran dalam format JSON dengan struktur berikut:
      {
        "analysis": {
          "room_type": "(e.g., Ruang Tamu, Kamar Tidur)",
          "description": "Deskripsi singkat tentang kondisi ruangan saat ini."
        },
        "recommendations": [
          {
            "item_name": "Nama Barang",
            "description": "Deskripsi singkat mengapa barang ini cocok.",
            "estimated_price": 1500000,
            "placement_suggestion": "Saran penempatan di dalam ruangan."
          }
        ],
        "summary": "Ringkasan singkat dari semua rekomendasi dan bagaimana mereka cocok dengan anggaran."
      }

      Pastikan total harga dari semua item yang direkomendasikan tidak melebihi anggaran yang diberikan. Jadilah kreatif dan berikan saran yang praktis dan estetis.
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // Membersihkan dan mem-parsing JSON dari respons teks
    const jsonString = responseText.replace(/```json\n|```/g, '').trim();
    const jsonResponse = JSON.parse(jsonString);

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error('Error in interior API:', error);
    // Mengirim pesan error yang jelas ke frontend
    return NextResponse.json(
      { error: 'An internal server error occurred.', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }

}