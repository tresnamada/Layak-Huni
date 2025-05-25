import { db } from '../firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

export interface AdminStats {
  totalUsers: number;
  totalHouses: number;
  totalMaterials: number;
  todayActivity: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    // Get total users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnapshot.size;

    // Get total houses
    const housesSnapshot = await getDocs(collection(db, 'houses'));
    const totalHouses = housesSnapshot.size;

    // Get total materials from purchases
    const purchasesSnapshot = await getDocs(collection(db, 'purchases'));
    const totalMaterials = purchasesSnapshot.docs.reduce((acc, doc) => {
      const materials = doc.data().materials || [];
      return acc + materials.length;
    }, 0);

    // Get today's activity (purchases created today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);
    
    const todayPurchasesQuery = query(
      collection(db, 'purchases'),
      where('purchaseDate', '>=', todayTimestamp)
    );
    const todayPurchasesSnapshot = await getDocs(todayPurchasesQuery);
    const todayActivity = todayPurchasesSnapshot.size;

    return {
      totalUsers,
      totalHouses,
      totalMaterials,
      todayActivity
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
} 