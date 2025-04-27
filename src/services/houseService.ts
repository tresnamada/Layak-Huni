import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

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
  createdAt?: any;
  createdBy?: string;
}

export interface HouseFormData {
  name: string;
  harga: number;
  luas: number;
  tipe: string;
  material: string;
  durasi: number;
  description: string;
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
    // Store base64 image directly in Firestore
    const docData = {
      ...houseData,
      imageUrl: imageBase64, // Store base64 directly
      createdAt: serverTimestamp(),
      ...(userId && { createdBy: userId })
    };
    
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
    const updateData: any = { ...houseData };
    
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