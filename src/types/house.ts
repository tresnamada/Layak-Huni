export interface Material {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  imageUrl?: string;
}

export interface Room {
  name: string;
  area: number;
  description: string;
  imageUrl?: string;
}

export interface Blueprint {
  url: string;
  description: string;
  type: 'floor' | 'elevation' | 'section' | 'detail';
  imageUrl?: string;
}

export interface ConstructionStage {
  name: string;
  duration: number;
  description: string;
  imageUrl?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface HouseSpecifications {
  floorCount: number;
  bedroomCount: number;
  bathroomCount: number;
  carportCount: number;
  buildingArea: number;
  landArea: number;
}

export interface EstimatedCost {
  materialCost: number;
  laborCost: number;
  otherCost: number;
  totalCost: number;
}

export interface HouseFormData {
  name: string;
  harga: string | number;
  luas: string | number;
  tipe: string;
  material: string;
  durasi: string | number;
  description: string;
  materials: Material[];
  rooms: Room[];
  blueprints: Blueprint[];
  features: string[];
  constructionStages: ConstructionStage[];
  specifications: HouseSpecifications;
  estimatedCost: EstimatedCost;
} 