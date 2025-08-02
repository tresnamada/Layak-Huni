import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Check if a user has admin privileges
 * @param userId The user ID to check
 * @returns True if the user is an admin, false otherwise
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    // First check in users collection for role="admin"
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data().role === "admin") {
      return true;
    }
    
    // For backward compatibility, also check profiles collection
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    return profileSnap.exists() && (
      profileSnap.data().isAdmin === true || 
      profileSnap.data().role === "admin"
    );
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
    
    // Update the user's document in users collection, create if it doesn't exist
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      role: "admin",
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    
    // For backward compatibility, also update profiles collection
    const profileRef = doc(db, 'profiles', userId);
    await setDoc(profileRef, {
      role: "admin",
      isAdmin: true, // Keep this for backward compatibility
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    
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
    
    // Update the user's document in users collection, create if it doesn't exist
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      role: "user",
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    
    // For backward compatibility, also update profiles collection
    const profileRef = doc(db, 'profiles', userId);
    await setDoc(profileRef, {
      role: "user",
      isAdmin: false,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error removing admin privileges:', error);
    return false;
  }
}; 