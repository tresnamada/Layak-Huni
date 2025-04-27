import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * Checks if a user has admin privileges
 * @param userId The user ID to check
 * @returns Promise<boolean> True if the user is an admin, false otherwise
 */
export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    // First check if there's an admin field in the user's profile
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      const profileData = profileSnap.data();
      if (profileData.isAdmin === true) {
        return true;
      }
    }
    
    // If not found in profile, check the dedicated admins collection
    const adminRef = doc(db, 'admins', userId);
    const adminSnap = await getDoc(adminRef);
    
    return adminSnap.exists() && adminSnap.data()?.active === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Sets a user as an admin
 * @param userId The user ID to make an admin
 * @param byUserId The ID of the user making the change (for audit)
 * @returns Promise<boolean> True if successful, false otherwise
 */
export const setUserAsAdmin = async (userId: string, byUserId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    // Update the user's profile
    const profileRef = doc(db, 'profiles', userId);
    await updateDoc(profileRef, {
      isAdmin: true,
      updatedAt: new Date().toISOString(),
    });
    
    // Add entry to admins collection
    const adminRef = doc(db, 'admins', userId);
    await setDoc(adminRef, {
      active: true,
      createdAt: new Date().toISOString(),
      createdBy: byUserId,
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
 * @param byUserId The ID of the user making the change (for audit)
 * @returns Promise<boolean> True if successful, false otherwise
 */
export const removeUserAsAdmin = async (userId: string, byUserId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    // Update the user's profile
    const profileRef = doc(db, 'profiles', userId);
    await updateDoc(profileRef, {
      isAdmin: false,
      updatedAt: new Date().toISOString(),
    });
    
    // Update entry in admins collection
    const adminRef = doc(db, 'admins', userId);
    await setDoc(adminRef, {
      active: false,
      updatedAt: new Date().toISOString(),
      updatedBy: byUserId,
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error removing admin privileges:', error);
    return false;
  }
}; 