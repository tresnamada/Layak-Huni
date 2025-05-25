import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { isArchitect } from '@/services/architectService';

export const useArchitect = () => {
  const [isArchitectUser, setIsArchitectUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const architectStatus = await isArchitect(user.uid);
        setIsArchitectUser(architectStatus);
      } else {
        setIsArchitectUser(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { isArchitectUser, loading };
}; 