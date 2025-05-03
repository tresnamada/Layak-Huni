import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * Check if a user has admin privileges
 * @param userId The user ID to check
 * @returns True if the user is an admin, false otherwise
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(profileRef);
    return docSnap.exists() && docSnap.data().isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Sets a user as an admin
 * @param userId The user ID to make an admin
 * @returns Promise<boolean> True if successful, false otherwise
 */
export const setUserAsAdmin = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    // Update the user's profile
    const profileRef = doc(db, 'profiles', userId);
    await updateDoc(profileRef, {
      isAdmin: true,
      updatedAt: new Date().toISOString(),
    });
    
    return true;
  } catch (error) {
    console.error('Error setting user as admin:', error);
    return false;
  }
};

/**
 * Removes admin privileges from a user
 * @param userId The user ID to remove admin privileges from
 * @returns Promise<boolean> True if successful, false otherwise
 */
export const removeUserAsAdmin = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    // Update the user's profile
    const profileRef = doc(db, 'profiles', userId);
    await updateDoc(profileRef, {
      isAdmin: false,
      updatedAt: new Date().toISOString(),
    });
    
    return true;
  } catch (error) {
    console.error('Error removing admin privileges:', error);
    return false;
  }
}; 