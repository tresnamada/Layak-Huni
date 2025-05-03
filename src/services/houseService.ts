import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc, updateDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';

export interface Material {
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface Room {
  name: string;
  area: number;
  description: string;
}

export interface Blueprint {
  url: string;
  description: string;
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
  // Simplified fields without arrays
  mainMaterial: {
    name: string;
    quantity: number;
    unit: string;
    price: number;
  };
  mainRoom: {
    name: string;
    area: number;
    description: string;
  };
  mainBlueprint: {
    url: string;
    description: string;
  };
  mainFeature: string;
  mainConstructionStage: {
    name: string;
    duration: number;
    description: string;
  };
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
  // Simplified fields without arrays
  mainMaterial: {
    name: string;
    quantity: number | string;
    unit: string;
    price: number | string;
  };
  mainRoom: {
    name: string;
    area: number | string;
    description: string;
  };
  mainBlueprint: {
    url: string;
    description: string;
  };
  mainFeature: string;
  mainConstructionStage: {
    name: string;
    duration: number | string;
    description: string;
  };
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

    // Log the data being processed
    console.log('Processing house data:', {
      ...houseData,
      imageBase64Length: imageBase64.length
    });

    // Convert string values to numbers and ensure proper formatting
    const processedData = {
      name: String(houseData.name || ''),
      harga: Number(houseData.harga) || 0,
      luas: Number(houseData.luas) || 0,
      durasi: Number(houseData.durasi) || 0,
      tipe: String(houseData.tipe || ''),
      material: String(houseData.material || ''),
      description: String(houseData.description || ''),
      // Simplified fields without arrays
      mainMaterial: {
        name: String(houseData.mainMaterial?.name || ''),
        quantity: Number(houseData.mainMaterial?.quantity) || 0,
        unit: String(houseData.mainMaterial?.unit || ''),
        price: Number(houseData.mainMaterial?.price) || 0
      },
      mainRoom: {
        name: String(houseData.mainRoom?.name || ''),
        area: Number(houseData.mainRoom?.area) || 0,
        description: String(houseData.mainRoom?.description || '')
      },
      mainBlueprint: {
        url: String(houseData.mainBlueprint?.url || ''),
        description: String(houseData.mainBlueprint?.description || '')
      },
      mainFeature: String(houseData.mainFeature || ''),
      mainConstructionStage: {
        name: String(houseData.mainConstructionStage?.name || ''),
        duration: Number(houseData.mainConstructionStage?.duration) || 0,
        description: String(houseData.mainConstructionStage?.description || '')
      },
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

    // Log the processed data
    console.log('Processed data:', {
      ...processedData,
      imageBase64: 'present'
    });

    // Store base64 image directly in Firestore
    const docData = {
      ...processedData,
      imageUrl: imageBase64,
      createdAt: serverTimestamp(),
      ...(userId && { createdBy: userId })
    };
    
    // Log the final data structure (without the actual image data)
    console.log('Final data structure:', {
      ...docData,
      imageUrl: 'present'
    });

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'houses'), docData);
    console.log('Successfully added house with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding house:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
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