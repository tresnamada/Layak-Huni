import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // Generate a simple SVG floor plan based on the ID
  const svg = generateMockFloorPlanSVG(id);

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

function generateMockFloorPlanSVG(id: string): string {
  // Create a simple floor plan SVG based on the ID
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="400" height="300" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
  
  <!-- Outer walls -->
  <rect x="20" y="20" width="360" height="260" fill="none" stroke="#343a40" stroke-width="3"/>
  
  <!-- Living Room -->
  <rect x="30" y="30" width="120" height="100" fill="#e3f2fd" stroke="#1976d2" stroke-width="1"/>
  <text x="90" y="85" text-anchor="middle" font-family="Arial" font-size="12" fill="#1976d2">Ruang Tamu</text>
  
  <!-- Master Bedroom -->
  <rect x="160" y="30" width="100" height="100" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="1"/>
  <text x="210" y="85" text-anchor="middle" font-family="Arial" font-size="12" fill="#7b1fa2">K. Tidur Utama</text>
  
  <!-- Kitchen -->
  <rect x="270" y="30" width="100" height="60" fill="#e8f5e8" stroke="#388e3c" stroke-width="1"/>
  <text x="320" y="65" text-anchor="middle" font-family="Arial" font-size="12" fill="#388e3c">Dapur</text>
  
  <!-- Bathroom -->
  <rect x="270" y="100" width="100" height="30" fill="#fff3e0" stroke="#f57c00" stroke-width="1"/>
  <text x="320" y="120" text-anchor="middle" font-family="Arial" font-size="10" fill="#f57c00">K. Mandi</text>
  
  <!-- Second Bedroom -->
  <rect x="30" y="140" width="100" height="80" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="1"/>
  <text x="80" y="185" text-anchor="middle" font-family="Arial" font-size="12" fill="#7b1fa2">K. Tidur 2</text>
  
  <!-- Family Room -->
  <rect x="140" y="140" width="120" height="80" fill="#e1f5fe" stroke="#0277bd" stroke-width="1"/>
  <text x="200" y="185" text-anchor="middle" font-family="Arial" font-size="12" fill="#0277bd">R. Keluarga</text>
  
  <!-- Study Room -->
  <rect x="270" y="140" width="100" height="80" fill="#f1f8e9" stroke="#689f38" stroke-width="1"/>
  <text x="320" y="185" text-anchor="middle" font-family="Arial" font-size="12" fill="#689f38">R. Kerja</text>
  
  <!-- Doors -->
  <line x1="90" y1="20" x2="90" y2="30" stroke="#795548" stroke-width="3"/>
  <line x1="30" y1="180" x2="40" y2="180" stroke="#795548" stroke-width="3"/>
  <line x1="150" y1="80" x2="160" y2="80" stroke="#795548" stroke-width="3"/>
  
  <!-- Windows -->
  <rect x="25" y="60" width="5" height="20" fill="#81c784"/>
  <rect x="25" y="160" width="5" height="20" fill="#81c784"/>
  <rect x="290" y="25" width="20" height="5" fill="#81c784"/>
  <rect x="340" y="25" width="20" height="5" fill="#81c784"/>
  
  <!-- Title -->
  <text x="200" y="250" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="#343a40">
    Denah Rumah - ${id.substring(3, 8)}
  </text>
  
  <!-- Scale indicator -->
  <text x="30" y="270" font-family="Arial" font-size="10" fill="#6c757d">Skala: 1:100</text>
</svg>`;
}
