import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

export type UserRole = 'user' | 'architect' | 'admin';

export interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  isAvailable?: boolean; // For architects - whether they're available to take consultations
  createdAt: string;
  updatedAt: string;
}

/**
 * Create or update a user record with role information
 */
export const setUserRole = async (
  userId: string, 
  role: UserRole, 
  email?: string,
  displayName?: string
) => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        role,
        updatedAt: new Date().toISOString(),
        ...(email && { email }),
        ...(displayName && { displayName })
      });
    } else {
      // Create new user
      await setDoc(userRef, {
        uid: userId,
        role,
        email: email || '',
        displayName: displayName || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error setting user role:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to set user role' 
    };
  }
};

/**
 * Get user data including role
 */
export const getUserData = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        userData: docSnap.data() as UserData 
      };
    } else {
      return { 
        success: false, 
        error: 'User data not found' 
      };
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get user data' 
    };
  }
};

/**
 * Update architect availability status
 */
export const setArchitectAvailability = async (architectId: string, isAvailable: boolean) => {
  try {
    const userRef = doc(db, 'users', architectId);
    
    await updateDoc(userRef, {
      isAvailable,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating architect availability:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update architect availability' 
    };
  }
};

/**
 * Get all available architects
 */
export const getAvailableArchitects = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      where('role', '==', 'architect'),
      where('isAvailable', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const architects: UserData[] = [];
    
    querySnapshot.forEach((doc) => {
      architects.push(doc.data() as UserData);
    });
    
    return { 
      success: true, 
      architects 
    };
  } catch (error) {
    console.error('Error getting available architects:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get available architects',
      architects: []
    };
  }
}; 