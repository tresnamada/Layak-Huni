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
      // Process arrays with proper type checking and conversion
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

  if (houseData.durasi !== undefined && Number(houseData.durasi) <= 0) {
    errors.durasi = 'Durasi harus lebih dari 0';
  }

  if (houseData.harga !== undefined && Number(houseData.harga) <= 0) {
    errors.harga = 'Harga harus lebih dari 0';
  }

  if (houseData.luas !== undefined && Number(houseData.luas) <= 0) {
    errors.luas = 'Luas harus lebih dari 0';
  }

  if (!houseData.material?.trim()) {
    errors.material = 'Material wajib diisi';
  }

  if (!houseData.tipe?.trim()) {
    errors.tipe = 'Tipe rumah wajib diisi';
  }

  // Validate materials
  if (Array.isArray(houseData.materials)) {
    houseData.materials.forEach((material, index) => {
      if (!material.name?.trim()) {
        errors[`materials.${index}.name`] = 'Nama material wajib diisi';
      }
      if (Number(material.quantity) <= 0) {
        errors[`materials.${index}.quantity`] = 'Jumlah material harus lebih dari 0';
      }
      if (!material.unit?.trim()) {
        errors[`materials.${index}.unit`] = 'Satuan material wajib diisi';
      }
      if (Number(material.price) < 0) {
        errors[`materials.${index}.price`] = 'Harga material tidak boleh negatif';
      }
    });
  }

  // Validate blueprints
  if (Array.isArray(houseData.blueprints)) {
    houseData.blueprints.forEach((blueprint, index) => {
      if (!blueprint.url?.trim()) {
        errors[`blueprints.${index}.url`] = 'URL blueprint wajib diisi';
      }
      if (!blueprint.type) {
        errors[`blueprints.${index}.type`] = 'Tipe blueprint wajib diisi';
      }
    });
  }

  // Validate construction stages
  if (Array.isArray(houseData.constructionStages)) {
    houseData.constructionStages.forEach((stage, index) => {
      if (!stage.name?.trim()) {
        errors[`constructionStages.${index}.name`] = 'Nama tahap wajib diisi';
      }
      if (Number(stage.duration) <= 0) {
        errors[`constructionStages.${index}.duration`] = 'Durasi tahap harus lebih dari 0';
      }
    });
  }

  // Validate specifications
  if (houseData.specifications) {
    if (Number(houseData.specifications.floorCount) <= 0) {
      errors['specifications.floorCount'] = 'Jumlah lantai harus lebih dari 0';
    }
    if (Number(houseData.specifications.bedroomCount) <= 0) {
      errors['specifications.bedroomCount'] = 'Jumlah kamar tidur harus lebih dari 0';
    }
    if (Number(houseData.specifications.bathroomCount) <= 0) {
      errors['specifications.bathroomCount'] = 'Jumlah kamar mandi harus lebih dari 0';
    }
    if (Number(houseData.specifications.buildingArea) <= 0) {
      errors['specifications.buildingArea'] = 'Luas bangunan harus lebih dari 0';
    }
    if (Number(houseData.specifications.landArea) <= 0) {
      errors['specifications.landArea'] = 'Luas tanah harus lebih dari 0';
    }
  }

  // Validate estimated costs
  if (houseData.estimatedCost) {
    if (Number(houseData.estimatedCost.materialCost) < 0) {
      errors['estimatedCost.materialCost'] = 'Biaya material tidak boleh negatif';
    }
    if (Number(houseData.estimatedCost.laborCost) < 0) {
      errors['estimatedCost.laborCost'] = 'Biaya tenaga kerja tidak boleh negatif';
    }
    if (Number(houseData.estimatedCost.otherCost) < 0) {
      errors['estimatedCost.otherCost'] = 'Biaya lainnya tidak boleh negatif';
    }
    if (Number(houseData.estimatedCost.totalCost) < 0) {
      errors['estimatedCost.totalCost'] = 'Total biaya tidak boleh negatif';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 