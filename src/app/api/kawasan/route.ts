import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { location, latitude, longitude } = await request.json();
    
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

    // Prompt yang lebih komprehensif dengan data tambahan
    const prompt = `
Kamu adalah "SiHuni", asisten AI ahli geologi, klimatologi, dan perencanaan kawasan di Indonesia.
Lakukan analisis risiko bencana komprehensif untuk lokasi ${location} ${latitude && longitude ? `(koordinat: ${latitude}, ${longitude})` : ''} di Indonesia.

⚠️ ATURAN:
- Hanya jawab dengan JSON murni.
- Gunakan data geografis, historis, dan klimatologi aktual.
- Berikan rekomendasi praktis dan dapat diimplementasikan.

FORMAT RESPONS YANG DIMINTA:
{
  "analisis_risiko": {
    "banjir": {
      "level": "tinggi/sedang/rendah",
      "faktor": ["faktor 1", "faktor 2"],
      "frekuensi": "x kali dalam 5 tahun terakhir",
      "musim": "bulan-bulan rawan"
    },
    "longsor": {
      "level": "tinggi/sedang/rendah",
      "faktor": ["faktor 1", "faktor 2"],
      "frekuensi": "x kali dalam 5 tahun terakhir",
      "musim": "bulan-bulan rawan"
    },
    "kebakaran": {
      "level": "tinggi/sedang/rendah",
      "faktor": ["faktor 1", "faktor 2"],
      "frekuensi": "x kali dalam 5 tahun terakhir",
      "musim": "bulan-bulan rawan"
    },
    "gempa": {
      "level": "tinggi/sedang/rendah",
      "faktor": ["faktor 1", "faktor 2"],
      "frekuensi": "x kali dalam 10 tahun terakhir",
      "zona": "zona gempa berdasarkan BMKG"
    },
    "tsunami": {
      "level": "tinggi/sedang/rendah",
      "faktor": ["faktor 1", "faktor 2"],
      "jarak_pantai": "x km",
      "elevasi": "meter di atas permukaan laut"
    }
  },
  "data_geografis": {
    "ketinggian": "meter di atas permukaan laut",
    "kemiringan_lereng": "derajat",
    "jenis_tanah": "jenis tanah dominan",
    "curah_hujan": "rata-rata mm/tahun",
    "jarak_sungai": "x km",
    "jarak_pantai": "x km",
    "jarak_gunung": "x km"
  },
  "rekomendasi_kawasan": {
    "zona_teraman": "deskripsi zona teraman di lokasi",
    "zona_berisiko": "deskripsi zona berisiko",
    "arah_pembangunan": "orientasi optimal bangunan",
    "setback_minimal": "jarak minimal dari elemen berisiko",
    "alternatif_lokasi": ["lokasi alternatif 1", "lokasi alternatif 2"]
  },
  "rekomendasi_desain": {
    "fondasi": "jenis fondasi yang direkomendasikan",
    "struktur": "sistem struktur bangunan",
    "material": {
      "dinding": "material dinding yang disarankan",
      "atap": "material atap yang disarankan",
      "lantai": "material lantai yang disarankan"
    },
    "fitur_keamanan": ["fitur 1", "fitur 2", "fitur 3"],
    "teknologi_mitigasi": ["teknologi 1", "teknologi 2"]
  },
  "rekomendasi_lingkungan": {
    "drainase": "sistem drainase yang disarankan",
    "vegetasi": "jenis tanaman yang direkomendasikan",
    "penahan_angin": "sistem penahan angin",
    "efisiensi_energi": "rekomendasi efisiensi energi"
  },
  "daftar_material": [
    {
      "nama": "nama material",
      "jenis": "jenis material",
      "keunggulan": ["keunggulan 1", "keunggulan 2"],
      "sumber": "sumber lokal/tersedia"
    }
  ],
  "skor_risiko": {
    "total": 1-10,
    "kategori": "sangat rendah/rendah/sedang/tinggi/sangat tinggi",
    "trend": "meningkat/menurun/stabil"
  }
}

Data tambahan untuk analisis:
- Gunakan data historis bencana di wilayah tersebut jika tersedia
- Pertimbangkan pola curah hujan dan perubahan iklim
- Sertakan rekomendasi material lokal yang berkelanjutan
- Berikan solusi berbasis alam (nature-based solutions) jika memungkinkan
- Pertimbangkan aspek budaya dan kearifan lokal
`;

    let responseText = '';
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        break;
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'status' in err && err.status === 429) {
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
      // Bersihkan respons dari karakter non-JSON jika ada
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      console.error("❌ JSON parsing gagal. Raw:", responseText);
      return NextResponse.json(
        { error: "Format JSON AI tidak valid", raw: responseText },
        { status: 502 }
      );
    }

    // Validasi dan penambahan data default jika diperlukan
    const defaultStructure = {
      analisis_risiko: {},
      data_geografis: {},
      rekomendasi_kawasan: {},
      rekomendasi_desain: {},
      rekomendasi_lingkungan: {},
      daftar_material: [],
      skor_risiko: {}
    };

    analysisData = { ...defaultStructure, ...analysisData };

    return NextResponse.json(analysisData);
  } catch (error: unknown) {
    console.error("Error in /api/kawasan:", error);
    const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' ? error.message : '';
    const isOverloaded =
      (error && typeof error === 'object' && 'status' in error && error.status === 503) || /503|unavailable|overloaded/i.test(message);

    if (isOverloaded) {
      return NextResponse.json(
        { error: "Layanan AI sedang sibuk (503). Silakan coba lagi." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Failed to analyze risk" }, { status: 500 });
  }
}