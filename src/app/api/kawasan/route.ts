import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { location } = await request.json();
    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is not set" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
Kamu adalah "SiHuni", asisten AI ramah dan sesuai budaya Indonesia.
Analisis risiko bencana pada lokasi ${location} di Indonesia.

⚠️ ATURAN:
- Hanya jawab dengan JSON murni.
- Tidak boleh ada teks di luar JSON.
- Gunakan tanda kutip ganda " untuk semua string.
- Nilai risiko hanya: "tinggi", "sedang", atau "rendah".
- Semua teks dalam array "barang" harus relevan dan spesifik.

Format:
{
  "banjir": "tinggi/sedang/rendah",
  "longsor": "tinggi/sedang/rendah",
  "kebakaran": "tinggi/sedang/rendah",
  "rekomendasi": {
    "kawasan": "Penjelasan lokasi dari ${location}, termasuk jarak perkiraan ke gunung dan laut terdekat.",
    "konstruksi": "Saran desain dan material yang spesifik (contoh: 'Gunakan beton bertulang K-300', 'Atap baja ringan').",
    "penguatan_struktur": "Tips penguatan rumah yang konkret dan mudah diikuti.",
    "barang": ["contoh material spesifik 1", "contoh material spesifik 2"]
  }
}
    `;

    let responseText = '';
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        break;
      } catch (err: any) {
        if (err.status === 429) {
          return NextResponse.json(
            { error: "Terlalu banyak permintaan (429). Coba lagi nanti." },
            { status: 429 }
          );
        }
        if (attempt === 3) throw err;
        await new Promise((res) => setTimeout(res, 700 * attempt));
      }
    }

    if (!responseText) throw new Error("Empty response from AI");



    let analysisData;
    try {
      analysisData = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ JSON parsing gagal. Raw:", responseText);
      return NextResponse.json(
        { error: "Format JSON AI tidak valid", raw: responseText },
        { status: 502 }
      );
    }
    if (!analysisData.rekomendasi || typeof analysisData.rekomendasi !== "object") {
      analysisData.rekomendasi = {
        konstruksi: "",
        penguatan_struktur: "",
        barang: []
      };
    }

    return NextResponse.json(analysisData);
  } catch (error: any) {
    console.error("Error in /api/kawasan:", error);
    const message = typeof error?.message === "string" ? error.message : "";
    const isOverloaded =
      error?.status === 503 || /503|unavailable|overloaded/i.test(message);

    if (isOverloaded) {
      return NextResponse.json(
        { error: "Layanan AI sedang sibuk (503). Silakan coba lagi." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Failed to analyze risk" }, { status: 500 });
  }
}
