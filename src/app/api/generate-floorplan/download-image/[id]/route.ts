import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Generate the SVG content for the floor plan
    const svgContent = generateFloorPlanSVG(id);
    
    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="denah-rumah-${id}.svg"`,
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Error generating floor plan image download:', error);
    return NextResponse.json({
      error: 'Failed to generate floor plan image download'
    }, { status: 500 });
  }
}

function generateFloorPlanSVG(id: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="800" height="600" fill="#ffffff" stroke="#dee2e6" stroke-width="2"/>
  
  <!-- Outer walls -->
  <rect x="40" y="40" width="720" height="520" fill="none" stroke="#343a40" stroke-width="4"/>
  
  <!-- Living Room -->
  <rect x="60" y="60" width="240" height="200" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/>
  <text x="180" y="170" text-anchor="middle" font-family="Arial" font-size="18" fill="#1976d2" font-weight="bold">Ruang Tamu</text>
  <text x="180" y="190" text-anchor="middle" font-family="Arial" font-size="14" fill="#1976d2">3 x 4 m</text>
  
  <!-- Master Bedroom -->
  <rect x="320" y="60" width="200" height="200" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="2"/>
  <text x="420" y="160" text-anchor="middle" font-family="Arial" font-size="18" fill="#7b1fa2" font-weight="bold">Kamar Tidur Utama</text>
  <text x="420" y="180" text-anchor="middle" font-family="Arial" font-size="14" fill="#7b1fa2">3 x 3 m</text>
  
  <!-- Kitchen -->
  <rect x="540" y="60" width="200" height="120" fill="#e8f5e8" stroke="#388e3c" stroke-width="2"/>
  <text x="640" y="120" text-anchor="middle" font-family="Arial" font-size="18" fill="#388e3c" font-weight="bold">Dapur</text>
  <text x="640" y="140" text-anchor="middle" font-family="Arial" font-size="14" fill="#388e3c">2 x 3 m</text>
  
  <!-- Bathroom -->
  <rect x="540" y="200" width="200" height="60" fill="#fff3e0" stroke="#f57c00" stroke-width="2"/>
  <text x="640" y="235" text-anchor="middle" font-family="Arial" font-size="16" fill="#f57c00" font-weight="bold">Kamar Mandi</text>
  <text x="640" y="250" text-anchor="middle" font-family="Arial" font-size="12" fill="#f57c00">1.5 x 2 m</text>
  
  <!-- Second Bedroom -->
  <rect x="60" y="280" width="200" height="160" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="2"/>
  <text x="160" y="360" text-anchor="middle" font-family="Arial" font-size="18" fill="#7b1fa2" font-weight="bold">Kamar Tidur 2</text>
  <text x="160" y="380" text-anchor="middle" font-family="Arial" font-size="14" fill="#7b1fa2">3 x 3 m</text>
  
  <!-- Family Room -->
  <rect x="280" y="280" width="240" height="160" fill="#e1f5fe" stroke="#0277bd" stroke-width="2"/>
  <text x="400" y="360" text-anchor="middle" font-family="Arial" font-size="18" fill="#0277bd" font-weight="bold">Ruang Keluarga</text>
  <text x="400" y="380" text-anchor="middle" font-family="Arial" font-size="14" fill="#0277bd">3 x 4 m</text>
  
  <!-- Study Room -->
  <rect x="540" y="280" width="200" height="160" fill="#f1f8e9" stroke="#689f38" stroke-width="2"/>
  <text x="640" y="360" text-anchor="middle" font-family="Arial" font-size="18" fill="#689f38" font-weight="bold">Ruang Kerja</text>
  <text x="640" y="380" text-anchor="middle" font-family="Arial" font-size="14" fill="#689f38">2 x 3 m</text>
  
  <!-- Main Door -->
  <rect x="175" y="35" width="30" height="10" fill="#795548"/>
  <text x="190" y="30" text-anchor="middle" font-family="Arial" font-size="10" fill="#795548">Pintu Utama</text>
  
  <!-- Interior Doors -->
  <rect x="300" y="155" width="20" height="30" fill="#795548"/>
  <rect x="260" y="275" width="20" height="30" fill="#795548"/>
  <rect x="520" y="355" width="20" height="30" fill="#795548"/>
  
  <!-- Windows -->
  <rect x="50" y="120" width="10" height="40" fill="#81c784"/>
  <rect x="50" y="320" width="10" height="40" fill="#81c784"/>
  <rect x="580" y="50" width="40" height="10" fill="#81c784"/>
  <rect x="680" y="50" width="40" height="10" fill="#81c784"/>
  <rect x="750" y="120" width="10" height="40" fill="#81c784"/>
  <rect x="750" y="320" width="10" height="40" fill="#81c784"/>
  
  <!-- Title -->
  <text x="400" y="500" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#343a40">
    Denah Rumah Custom Design
  </text>
  <text x="400" y="525" text-anchor="middle" font-family="Arial" font-size="16" fill="#6c757d">
    ID: ${id} | Luas Total: 80m²
  </text>
  
  <!-- Scale indicator -->
  <text x="60" y="540" font-family="Arial" font-size="14" fill="#6c757d">Skala: 1:100</text>
  
  <!-- Legend -->
  <g transform="translate(60, 460)">
    <text x="0" y="0" font-family="Arial" font-size="14" font-weight="bold" fill="#343a40">Keterangan:</text>
    <rect x="0" y="10" width="15" height="15" fill="#795548"/>
    <text x="20" y="22" font-family="Arial" font-size="12" fill="#343a40">Pintu</text>
    <rect x="80" y="10" width="15" height="15" fill="#81c784"/>
    <text x="100" y="22" font-family="Arial" font-size="12" fill="#343a40">Jendela</text>
  </g>
</svg>`;
}
