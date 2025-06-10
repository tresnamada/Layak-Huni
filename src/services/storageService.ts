import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

interface UploadResult {
  success: boolean;
  data?: {
    url: string;
  };
  error?: string;
}

export const uploadProfileImage = async (file: File): Promise<UploadResult> => {
  try {
    const storage = getStorage();
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile-images/${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    return {
      success: true,
      data: {
        url: downloadURL
      }
    };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return {
      success: false,
      error: 'Failed to upload profile image'
    };
  }
}; 