import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export const isArchitect = async (userId: string): Promise<boolean> => {
  try {
    // Check in profiles collection
    const profileDoc = await getDoc(doc(db, 'profiles', userId));
    if (profileDoc.exists()) {
      const data = profileDoc.data();
      if (data.isArchitect === true || data.role === "architect") {
        return true;
      }
    }

    // Check in users collection
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.role === "architect";
    }

    return false;
  } catch (error) {
    console.error('Error checking architect status:', error);
    return false;
  }
};

export const setUserAsArchitect = async (userId: string): Promise<void> => {
  try {
    // Update in profiles collection
    const profileRef = doc(db, 'profiles', userId);
    await updateDoc(profileRef, {
      isArchitect: true,
      role: "architect"
    });

    // Update in users collection
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: "architect"
    });
  } catch (error) {
    console.error('Error setting user as architect:', error);
    throw error;
  }
};

export const removeUserAsArchitect = async (userId: string): Promise<void> => {
  try {
    // Update in profiles collection
    const profileRef = doc(db, 'profiles', userId);
    await updateDoc(profileRef, {
      isArchitect: false,
      role: "user"
    });

    // Update in users collection
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: "user"
    });
  } catch (error) {
    console.error('Error removing architect role:', error);
    throw error;
  }
}; 