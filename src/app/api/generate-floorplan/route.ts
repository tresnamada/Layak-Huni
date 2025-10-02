import { NextRequest, NextResponse } from 'next/server';

interface FloorPlanRequest {
  designStyle: string;
  budget: string;
  location: string;
  features: string[];
  rooms: string[];
  size: string;
}

interface FloorPlanResponse {
  success: boolean;
  floorPlan?: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    specifications: {
      totalArea: string;
      rooms: Array<{
        name: string;
        size: string;
        description: string;
      }>;
      features: string[];
    };
    downloadUrl: string;
    aiData?: {
      name?: string;
      description?: string;
      totalArea?: string;
      rooms?: Array<{
        name: string;
        size: string;
        description: string;
      }>;
      features?: string[];
    }; // AI-generated floor plan data for dynamic rendering
  };
  fallback?: boolean; // Indicates if this is fallback mock data
  error?: string;
}

// Mock floor plan data based on design parameters
const generateMockFloorPlan = (params: FloorPlanRequest) => {
  const { designStyle, budget, location, features } = params;
  
  // Determine house size based on budget
  let totalArea = '48m²';
  if (budget.includes('500-800')) {
    totalArea = '63m²';
  } else if (budget.includes('800-1.2')) {
    totalArea = '80m²';
  } else if (budget.includes('1.2')) {
    totalArea = '108m²';
  }

  // Base rooms configuration
  const baseRooms = [
    { name: 'Ruang Tamu', size: '3x4m', description: 'Area penerima tamu dengan pencahayaan alami' },
    { name: 'Kamar Tidur Utama', size: '3x3m', description: 'Kamar tidur dengan ventilasi baik' },
    { name: 'Dapur', size: '2x3m', description: 'Dapur dengan sirkulasi udara optimal' },
    { name: 'Kamar Mandi', size: '1.5x2m', description: 'Kamar mandi dengan sistem drainase baik' }
  ];

  // Add additional rooms based on budget and features
  const additionalRooms = [];
  if (budget.includes('500-800') || budget.includes('800-1.2') || budget.includes('1.2')) {
    additionalRooms.push({ name: 'Kamar Tidur 2', size: '3x3m', description: 'Kamar tidur tambahan' });
  }
  if (budget.includes('800-1.2') || budget.includes('1.2')) {
    additionalRooms.push({ name: 'Ruang Keluarga', size: '3x4m', description: 'Area berkumpul keluarga' });
  }
  if (budget.includes('1.2')) {
    additionalRooms.push(
      { name: 'Kamar Tidur 3', size: '3x3m', description: 'Kamar tidur ketiga' },
      { name: 'Ruang Kerja', size: '2x3m', description: 'Area kerja/study room' }
    );
  }

  // Generate floor plan based on style and location
  const floorPlanId = `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: floorPlanId,
    name: `Denah Rumah ${designStyle}`,
    description: `Denah rumah bergaya ${designStyle} dengan luas ${totalArea}, disesuaikan untuk lahan ${location.toLowerCase()}`,
    imageUrl: `/api/generate-floorplan/mock-image/${floorPlanId}`,
    specifications: {
      totalArea,
      rooms: [...baseRooms, ...additionalRooms],
      features: [
        'Pencahayaan alami optimal',
        'Ventilasi silang',
        'Sirkulasi yang efisien',
        ...features.slice(0, 3)
      ]
    },
    downloadUrl: `/api/generate-floorplan/download/${floorPlanId}`
  };
};

export async function POST(request: NextRequest) {
  try {
    const body: FloorPlanRequest = await request.json();
    
    // Validate required fields
    if (!body.designStyle || !body.budget || !body.location) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: designStyle, budget, or location'
      }, { status: 400 });
    }

    // Determine total area based on budget
    let totalArea = '48m²';
    if (body.budget.includes('500-800')) {
      totalArea = '63m²';
    } else if (body.budget.includes('800-1.2')) {
      totalArea = '80m²';
    } else if (body.budget.includes('1.2')) {
      totalArea = '108m²';
    }

    // Prepare detailed message for AI
    const aiMessage = `
Gaya Desain: ${body.designStyle}
Budget: ${body.budget}
Lokasi Lahan: ${body.location}
Luas Total: ${totalArea}
Fitur yang Dipilih: ${body.features.join(', ')}
Ukuran Rumah: ${body.size}
Ruangan yang Diinginkan: ${body.rooms.join(', ')}
`;

    console.log('Generating floor plan with AI for:', body.designStyle);

    // Call AI to generate dynamic floor plan
    try {
      const aiResponse = await fetch(`${request.nextUrl.origin}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: aiMessage,
          stage: 'floorplan',
          type: 'generation'
        }),
      });

      const aiData = await aiResponse.json();
      
      if (aiData.success && aiData.response) {
        const parsedFloorPlan = JSON.parse(aiData.response);
        const floorPlanData = parsedFloorPlan.floorPlan;
        
        // Generate unique ID
        const floorPlanId = `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('AI generated floor plan successfully:', floorPlanId);
        
        // Format response to match existing interface
        const floorPlan = {
          id: floorPlanId,
          name: floorPlanData.name || `Denah Rumah ${body.designStyle}`,
          description: floorPlanData.description || `Denah rumah bergaya ${body.designStyle}`,
          imageUrl: `/api/generate-floorplan/mock-image/${floorPlanId}`,
          specifications: {
            totalArea: floorPlanData.totalArea || totalArea,
            rooms: floorPlanData.rooms.map((room: { name: string; size: string; description: string }) => ({
              name: room.name,
              size: room.size,
              description: room.description
            })),
            features: floorPlanData.features || []
          },
          downloadUrl: `/api/generate-floorplan/download/${floorPlanId}`,
          // Store AI-generated data for dynamic rendering
          aiData: floorPlanData
        };

        const response: FloorPlanResponse = {
          success: true,
          floorPlan
        };

        return NextResponse.json(response);
      } else {
        throw new Error('AI failed to generate floor plan');
      }
    } catch (aiError) {
      console.error('AI generation failed, falling back to mock:', aiError);
      
      // Fallback to mock if AI fails
      const floorPlan = generateMockFloorPlan(body);
      const response: FloorPlanResponse = {
        success: true,
        floorPlan,
        fallback: true // Indicate this is fallback data
      };
      return NextResponse.json(response);
    }

  } catch (error) {
    console.error('Error generating floor plan:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate floor plan'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Floor Plan Generation API',
    endpoints: {
      'POST /api/generate-floorplan': 'Generate floor plan based on design parameters',
      'GET /api/generate-floorplan/mock-image/[id]': 'Get mock floor plan image',
      'GET /api/generate-floorplan/download/[id]': 'Download floor plan file'
    }
  });
}
