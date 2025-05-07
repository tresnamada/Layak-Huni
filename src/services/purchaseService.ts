import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { HouseData } from './houseService';

export interface PurchaseData {
  id?: string;
  userId: string;
  houseId: string;
  houseName: string;
  houseImage: string;
  purchaseDate: Timestamp;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentId: string;
  userDetails: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
}

/**
 * Create a new purchase record
 */
export const createPurchase = async (
  userId: string,
  house: HouseData,
  userDetails: PurchaseData['userDetails'],
  paymentId: string
): Promise<string> => {
  try {
    const purchaseData: Omit<PurchaseData, 'id'> = {
      userId,
      houseId: house.id!,
      houseName: house.name,
      houseImage: house.imageUrl,
      purchaseDate: serverTimestamp() as Timestamp,
      totalAmount: house.estimatedCost.totalCost,
      status: 'pending',
      paymentId,
      userDetails
    };

    const docRef = await addDoc(collection(db, 'purchases'), purchaseData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating purchase:', error);
    throw error;
  }
};

/**
 * Get all purchases for a user
 */
export const getUserPurchases = async (userId: string): Promise<PurchaseData[]> => {
  try {
    const purchasesRef = collection(db, 'purchases');
    const q = query(purchasesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PurchaseData));
  } catch (error) {
    console.error('Error getting user purchases:', error);
    throw error;
  }
};

/**
 * Update purchase status
 */
export const updatePurchaseStatus = async (
  purchaseId: string,
  status: PurchaseData['status']
): Promise<void> => {
  try {
    const purchaseRef = doc(db, 'purchases', purchaseId);
    await updateDoc(purchaseRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating purchase status:', error);
    throw error;
  }
}; 