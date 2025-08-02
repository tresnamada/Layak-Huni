import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { isAdmin } from '@/services/adminService';
import { app } from '@/lib/firebase';

const auth = getAuth(app);

/**
 * Custom hook to check if the current user has admin privileges
 * @returns Object with loading status and admin status
 */
export function useAdmin() {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);

  useEffect(() => {
    const checkAdminStatus = async (userId: string) => {
      try {
        const adminStatus = await isAdmin(userId);
        setIsAdminUser(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdminUser(false);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkAdminStatus(user.uid);
      } else {
        setIsAdminUser(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { loading, isAdminUser };
} 