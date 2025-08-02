import { Timestamp } from 'firebase/firestore';

export interface PrebuiltDesign {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  blueprints?: string[];
  category: string;
  features: string[];
  specifications: {
    area: string;
    bedrooms: number;
    bathrooms: number;
    floors: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
