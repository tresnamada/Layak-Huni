import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc, updateDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';

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
  imageUrl: string;
  name?: string;
}

export interface ConstructionStage {
  name: string;
  duration: number;
  description: string;
  imageUrl?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface HouseData {
  id?: string;
  name: string;
  harga: number;
  luas: number;
  tipe: string;
  material: string;
  durasi: number;
  description: string;
  imageUrl: string;
  createdAt?: Timestamp;
  createdBy?: string;
  // Multiple items support
  materials: Material[];
  rooms: Room[];
  blueprints: Blueprint[];
  features: string[];
  constructionStages: ConstructionStage[];
  specifications: {
    floorCount: number;
    bedroomCount: number;
    bathroomCount: number;
    carportCount: number;
    buildingArea: number;
    landArea: number;
  };
  estimatedCost: {
    materialCost: number;
    laborCost: number;
    otherCost: number;
    totalCost: number;
  };
}

export interface HouseFormData {
  name: string;
  harga: number | string;
  luas: number | string;
  tipe: string;
  material: string;
  durasi: number | string;
  description: string;
  // Multiple items support
  materials: Material[];
  rooms: Room[];
  blueprints: Blueprint[];
  features: string[];
  constructionStages: ConstructionStage[];
  specifications: {
    floorCount: number | string;
    bedroomCount: number | string;
    bathroomCount: number | string;
    carportCount: number | string;
    buildingArea: number | string;
    landArea: number | string;
  };
  estimatedCost: {
    materialCost: number | string;
    laborCost: number | string;
    otherCost: number | string;
    totalCost: number | string;
  };
}

/**
 * Add a new house to Firestore
 * @param houseData The house data to add
 * @param imageBase64 The base64 image string
 * @param userId The ID of the user adding the house
 * @returns Promise with the ID of the new house document
 */
export const addHouse = async (
  houseData: HouseFormData, 
  imageBase64: string, 
  userId?: string
): Promise<string> => {
  try {
    // Validate required fields
    if (!houseData.name || !houseData.material || !imageBase64) {
      throw new Error('Missing required fields: name, material, or image');
    }

    // Convert string values to numbers and ensure proper formatting
    const processedData = {
      name: String(houseData.name || ''),
      harga: Number(houseData.harga) || 0,
      luas: Number(houseData.luas) || 0,
      durasi: Number(houseData.durasi) || 0,
      tipe: String(houseData.tipe || ''),
      material: String(houseData.material || ''),
      description: String(houseData.description || ''),
      // Process arrays
      materials: Array.isArray(houseData.materials) ? houseData.materials.map(m => ({
        name: String(m.name || ''),
        quantity: Number(m.quantity) || 0,
        unit: String(m.unit || ''),
        price: Number(m.price) || 0,
        imageUrl: m.imageUrl || ''
      })) : [],
      rooms: Array.isArray(houseData.rooms) ? houseData.rooms.map(r => ({
        name: String(r.name || ''),
        area: Number(r.area) || 0,
        description: String(r.description || ''),
        imageUrl: r.imageUrl || ''
      })) : [],
      blueprints: Array.isArray(houseData.blueprints) ? houseData.blueprints.map(b => ({
        url: String(b.url || ''),
        description: String(b.description || ''),
        type: b.type || 'floor',
        imageUrl: b.imageUrl || '',
        name: b.name || ''
      })) : [],
      features: Array.isArray(houseData.features) ? houseData.features.map(f => String(f || '')) : [],
      constructionStages: Array.isArray(houseData.constructionStages) ? houseData.constructionStages.map(s => ({
        name: String(s.name || ''),
        duration: Number(s.duration) || 0,
        description: String(s.description || ''),
        imageUrl: s.imageUrl || '',
        status: s.status || 'pending'
      })) : [],
      specifications: {
        floorCount: Number(houseData.specifications?.floorCount) || 0,
        bedroomCount: Number(houseData.specifications?.bedroomCount) || 0,
        bathroomCount: Number(houseData.specifications?.bathroomCount) || 0,
        carportCount: Number(houseData.specifications?.carportCount) || 0,
        buildingArea: Number(houseData.specifications?.buildingArea) || 0,
        landArea: Number(houseData.specifications?.landArea) || 0
      },
      estimatedCost: {
        materialCost: Number(houseData.estimatedCost?.materialCost) || 0,
        laborCost: Number(houseData.estimatedCost?.laborCost) || 0,
        otherCost: Number(houseData.estimatedCost?.otherCost) || 0,
        totalCost: Number(houseData.estimatedCost?.totalCost) || 0
      }
    };

    // Store base64 image directly in Firestore
    const docData = {
      ...processedData,
      imageUrl: imageBase64,
      createdAt: serverTimestamp(),
      ...(userId && { createdBy: userId })
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'houses'), docData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding house:', error);
    throw error;
  }
};

/**
 * Get all houses from Firestore
 * @returns Promise with array of house data
 */
export const getAllHouses = async (): Promise<HouseData[]> => {
  try {
    const housesQuery = query(collection(db, 'houses'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(housesQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as HouseData));
  } catch (error) {
    console.error('Error getting houses:', error);
    throw error;
  }
};

/**
 * Get a single house by ID
 * @param id The ID of the house to get
 * @returns Promise with the house data
 */
export const getHouseById = async (id: string): Promise<HouseData | null> => {
  try {
    const docRef = doc(db, 'houses', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as HouseData;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting house with id ${id}:`, error);
    throw error;
  }
};

/**
 * Update an existing house
 * @param id ID of the house to update
 * @param houseData Updated house data
 * @param newImageBase64 New image as base64 string (if changed)
 * @returns Promise<void> indicating success
 */
export const updateHouse = async (
  id: string, 
  houseData: Partial<Omit<HouseData, 'id' | 'createdAt'>>, 
  newImageBase64?: string
): Promise<void> => {
  try {
    const updateData: Partial<HouseData> = { ...houseData };
    
    // If there's a new image, update the imageUrl with the base64 string
    if (newImageBase64) {
      updateData.imageUrl = newImageBase64;
    }
    
    // Update the house document in Firestore
    const docRef = doc(db, 'houses', id);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error(`Error updating house with id ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a house
 * @param id ID of the house to delete
 * @returns Promise<void> indicating success
 */
export const deleteHouse = async (id: string): Promise<void> => {
  try {
    // Delete the house document from Firestore
    const docRef = doc(db, 'houses', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting house with id ${id}:`, error);
    throw error;
  }
}; 