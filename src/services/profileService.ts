import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  profileImage?: string;
  joinDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export const createProfile = async (userId: string, data: ProfileData) => {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await setDoc(profileRef, profileData);
    return { success: true };
  } catch (error) {
    console.error('Error creating profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create profile' 
    };
  }
};

export const getProfile = async (userId: string) => {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(profileRef);
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        data: docSnap.data() as ProfileData 
      };
    } else {
      return { 
        success: false, 
        error: 'Profile not found' 
      };
    }
  } catch (error) {
    console.error('Error getting profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get profile' 
    };
  }
};

export const updateProfile = async (userId: string, data: Partial<ProfileData>) => {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    await updateDoc(profileRef, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update profile' 
    };
  }
};

export const uploadProfileImage = async (userId: string, base64Image: string) => {
  try {
    const profileRef = doc(db, 'profiles', userId);
    await updateDoc(profileRef, {
      profileImage: base64Image,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to upload profile image' 
    };
  }
};

export const isProfileComplete = async (userId: string): Promise<boolean> => {
  try {
    const { success, data } = await getProfile(userId);
    if (!success || !data) return false;

    const profile = data as ProfileData;
    return Boolean(
      profile.firstName &&
      profile.lastName &&
      profile.phone &&
      profile.address
    );
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return false;
  }
}; 