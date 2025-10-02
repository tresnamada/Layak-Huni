import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // Generate the SVG content for the floor plan
    const svgContent = generateFloorPlanSVG(id);
    
    // Create a simple HTML template with the SVG
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Denah Rumah - ${id}</title>
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            background: white;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #333;
            margin-bottom: 5px;
        }
        .header p {
            color: #666;
            margin: 0;
        }
        .floor-plan {
            text-align: center;
            margin: 20px 0;
        }
        .specifications {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .spec-item {
            margin: 10px 0;
            padding: 8px;
            background: white;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Denah Rumah Custom Design</h1>
        <p>ID: ${id}</p>
        <p>Dibuat pada: ${new Date().toLocaleDateString('id-ID')}</p>
    </div>
    
    <div class="floor-plan">
        ${svgContent}
    </div>
    
    <div class="specifications">
        <h3>Spesifikasi Denah</h3>
        <div class="spec-item"><strong>Luas Total:</strong> 80m²</div>
        <div class="spec-item"><strong>Ruang Tamu:</strong> 3x4m</div>
        <div class="spec-item"><strong>Kamar Tidur Utama:</strong> 3x3m</div>
        <div class="spec-item"><strong>Kamar Tidur 2:</strong> 3x3m</div>
        <div class="spec-item"><strong>Dapur:</strong> 2x3m</div>
        <div class="spec-item"><strong>Kamar Mandi:</strong> 1.5x2m</div>
        <div class="spec-item"><strong>Ruang Keluarga:</strong> 3x4m</div>
        <div class="spec-item"><strong>Ruang Kerja:</strong> 2x3m</div>
    </div>
</body>
</html>`;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="denah-rumah-${id}.html"`,
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Error generating floor plan download:', error);
    return NextResponse.json({
      error: 'Failed to generate floor plan download'
    }, { status: 500 });
  }
}

function generateFloorPlanSVG(id: string): string {
  return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
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
