import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { app } from '@/firebase';

const auth = getAuth(app);

/**
 * Check if a user has admin privileges
 * @param userId The user ID to check
 * @returns True if the user is an admin, false otherwise
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'admins', userId);
    const docSnap = await getDoc(userRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

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