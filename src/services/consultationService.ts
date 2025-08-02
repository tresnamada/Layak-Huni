import { db } from '../lib/firebase';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { GeneratedDesign } from './designService';
import { getAvailableArchitects } from './userService';

export type ConsultationStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Consultation {
  id?: string;
  userId: string;
  architectId: string | null; // null when pending assignment
  designId: string;
  designData: GeneratedDesign;
  status: ConsultationStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a new consultation request from a user
 */
export const createConsultation = async (userId: string, designId: string, designData: GeneratedDesign) => {
  try {
    // First, check if we have available architects
    const architectsResult = await getAvailableArchitects();
    let assignedArchitectId: string | null = null;
    
    // Assign to first available architect if any
    if (architectsResult.success && architectsResult.architects.length > 0) {
      assignedArchitectId = architectsResult.architects[0].uid;
    }
    
    const consultationsCollection = collection(db, 'consultations');
    
    const consultationData: Omit<Consultation, 'id'> = {
      userId,
      architectId: assignedArchitectId,
      designId,
      designData,
      status: assignedArchitectId ? 'active' : 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(consultationsCollection, consultationData);
    
    return { 
      success: true, 
      consultationId: docRef.id,
      architectAssigned: !!assignedArchitectId
    };
  } catch (error) {
    console.error('Error creating consultation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create consultation request' 
    };
  }
};

/**
 * Get a specific consultation by ID
 */
export const getConsultation = async (consultationId: string) => {
  try {
    const consultationRef = doc(db, 'consultations', consultationId);
    const docSnap = await getDoc(consultationRef);
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        consultation: {
          id: docSnap.id,
          ...docSnap.data() as Omit<Consultation, 'id'>
        } as Consultation
      };
    } else {
      return { 
        success: false, 
        error: 'Consultation not found' 
      };
    }
  } catch (error) {
    console.error('Error getting consultation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to retrieve consultation' 
    };
  }
};

/**
 * Get all consultations for a user
 */
export const getUserConsultations = async (userId: string) => {
  try {
    const consultationsCollection = collection(db, 'consultations');
    const q = query(
      consultationsCollection, 
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const consultations: Consultation[] = [];
    
    querySnapshot.forEach((doc) => {
      consultations.push({
        id: doc.id,
        ...doc.data() as Omit<Consultation, 'id'>
      } as Consultation);
    });
    
    return { 
      success: true, 
      consultations 
    };
  } catch (error) {
    console.error('Error getting user consultations:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to retrieve consultations',
      consultations: []
    };
  }
};

/**
 * Get all consultations for an architect
 */
export const getArchitectConsultations = async (architectId: string) => {
  try {
    const consultationsCollection = collection(db, 'consultations');
    const q = query(
      consultationsCollection, 
      where('architectId', '==', architectId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const consultations: Consultation[] = [];
    
    querySnapshot.forEach((doc) => {
      consultations.push({
        id: doc.id,
        ...doc.data() as Omit<Consultation, 'id'>
      } as Consultation);
    });
    
    return { 
      success: true, 
      consultations 
    };
  } catch (error) {
    console.error('Error getting architect consultations:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to retrieve consultations',
      consultations: []
    };
  }
};

/**
 * Update consultation status
 */
export const updateConsultationStatus = async (consultationId: string, status: ConsultationStatus) => {
  try {
    const consultationRef = doc(db, 'consultations', consultationId);
    
    await updateDoc(consultationRef, {
      status,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating consultation status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update consultation status' 
    };
  }
};

/**
 * Assign an architect to a consultation
 */
export const assignArchitectToConsultation = async (consultationId: string, architectId: string) => {
  try {
    const consultationRef = doc(db, 'consultations', consultationId);
    
    await updateDoc(consultationRef, {
      architectId,
      status: 'active',
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error assigning architect to consultation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to assign architect to consultation' 
    };
  }
}; 