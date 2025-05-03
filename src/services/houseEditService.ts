import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { HouseData, HouseFormData } from './houseService';

/**
 * Get a house by ID for editing
 * @param id The ID of the house to edit
 * @returns Promise with the house data
 */
export const getHouseForEdit = async (id: string): Promise<HouseData | null> => {
  try {
    const docRef = doc(db, 'houses', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as HouseData;
    }
    return null;
  } catch (error) {
    console.error(`Error getting house with id ${id}:`, error);
    throw error;
  }
};

/**
 * Update a house in Firestore
 * @param id ID of the house to update
 * @param houseData Updated house data
 * @param newImageBase64 New image as base64 string (if changed)
 * @returns Promise<void> indicating success
 */
export const updateHouse = async (
  id: string,
  houseData: Partial<HouseFormData>,
  newImageBase64?: string
): Promise<void> => {
  try {
    // Create a clean update object with default values
    const updateData: Partial<HouseData> = {
      name: houseData.name || '',
      durasi: Number(houseData.durasi) || 0,
      harga: Number(houseData.harga) || 0,
      luas: Number(houseData.luas) || 0,
      material: houseData.material || '',
      tipe: houseData.tipe || '',
      description: houseData.description || '',
      // Initialize arrays with empty arrays if not provided
      materials: [],
      rooms: [],
      blueprints: [],
      features: [],
      constructionStages: [],
      // Initialize nested objects with default values
      specifications: {
        floorCount: 0,
        bedroomCount: 0,
        bathroomCount: 0,
        carportCount: 0,
        buildingArea: 0,
        landArea: 0
      },
      estimatedCost: {
        materialCost: 0,
        laborCost: 0,
        otherCost: 0,
        totalCost: 0
      }
    };

    // Handle arrays with proper type checking and conversion
    if (Array.isArray(houseData.materials)) {
      updateData.materials = houseData.materials.map(material => ({
        name: String(material.name || ''),
        quantity: Number(material.quantity) || 0,
        unit: String(material.unit || ''),
        price: Number(material.price) || 0
      }));
    }

    if (Array.isArray(houseData.rooms)) {
      updateData.rooms = houseData.rooms.map(room => ({
        name: String(room.name || ''),
        area: Number(room.area) || 0,
        description: String(room.description || '')
      }));
    }

    if (Array.isArray(houseData.blueprints)) {
      updateData.blueprints = houseData.blueprints.map(blueprint => ({
        url: String(blueprint.url || ''),
        description: String(blueprint.description || '')
      }));
    }

    if (Array.isArray(houseData.features)) {
      updateData.features = houseData.features.map(feature => String(feature || ''));
    }

    if (Array.isArray(houseData.constructionStages)) {
      updateData.constructionStages = houseData.constructionStages.map(stage => ({
        name: String(stage.name || ''),
        duration: Number(stage.duration) || 0,
        description: String(stage.description || '')
      }));
    }

    // Handle nested objects with proper type checking and conversion
    if (houseData.specifications) {
      updateData.specifications = {
        floorCount: Number(houseData.specifications.floorCount) || 0,
        bedroomCount: Number(houseData.specifications.bedroomCount) || 0,
        bathroomCount: Number(houseData.specifications.bathroomCount) || 0,
        carportCount: Number(houseData.specifications.carportCount) || 0,
        buildingArea: Number(houseData.specifications.buildingArea) || 0,
        landArea: Number(houseData.specifications.landArea) || 0
      };
    }

    if (houseData.estimatedCost) {
      updateData.estimatedCost = {
        materialCost: Number(houseData.estimatedCost.materialCost) || 0,
        laborCost: Number(houseData.estimatedCost.laborCost) || 0,
        otherCost: Number(houseData.estimatedCost.otherCost) || 0,
        totalCost: Number(houseData.estimatedCost.totalCost) || 0
      };
    }

    // If there's a new image, update the imageUrl
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
 * Validate house data before update
 * @param houseData The house data to validate
 * @returns Object containing validation status and errors
 */
export const validateHouseData = (houseData: Partial<HouseFormData>): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  if (!houseData.name?.trim()) {
    errors.name = 'Nama rumah wajib diisi';
  }

  if (houseData.durasi !== undefined && houseData.durasi <= 0) {
    errors.durasi = 'Durasi harus lebih dari 0';
  }

  if (houseData.harga !== undefined && houseData.harga <= 0) {
    errors.harga = 'Harga harus lebih dari 0';
  }

  if (houseData.luas !== undefined && houseData.luas <= 0) {
    errors.luas = 'Luas harus lebih dari 0';
  }

  if (!houseData.material?.trim()) {
    errors.material = 'Material wajib diisi';
  }

  if (!houseData.tipe?.trim()) {
    errors.tipe = 'Tipe rumah wajib diisi';
  }

  // Validate specifications
  if (houseData.specifications) {
    if (houseData.specifications.floorCount <= 0) {
      errors['specifications.floorCount'] = 'Jumlah lantai harus lebih dari 0';
    }
    if (houseData.specifications.bedroomCount <= 0) {
      errors['specifications.bedroomCount'] = 'Jumlah kamar tidur harus lebih dari 0';
    }
    if (houseData.specifications.bathroomCount <= 0) {
      errors['specifications.bathroomCount'] = 'Jumlah kamar mandi harus lebih dari 0';
    }
    if (houseData.specifications.buildingArea <= 0) {
      errors['specifications.buildingArea'] = 'Luas bangunan harus lebih dari 0';
    }
    if (houseData.specifications.landArea <= 0) {
      errors['specifications.landArea'] = 'Luas tanah harus lebih dari 0';
    }
  }

  // Validate estimated costs
  if (houseData.estimatedCost) {
    if (houseData.estimatedCost.materialCost < 0) {
      errors['estimatedCost.materialCost'] = 'Biaya material tidak boleh negatif';
    }
    if (houseData.estimatedCost.laborCost < 0) {
      errors['estimatedCost.laborCost'] = 'Biaya tenaga kerja tidak boleh negatif';
    }
    if (houseData.estimatedCost.otherCost < 0) {
      errors['estimatedCost.otherCost'] = 'Biaya lainnya tidak boleh negatif';
    }
    if (houseData.estimatedCost.totalCost < 0) {
      errors['estimatedCost.totalCost'] = 'Total biaya tidak boleh negatif';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 