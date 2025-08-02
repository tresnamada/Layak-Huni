import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const auth = getAuth(app);

interface UseAuthOptions {
  redirectToLogin?: boolean;
  redirectPath?: string;
}

/**
 * Custom hook to handle authentication state
 * @param options Configuration options
 * @returns Object with user and loading status
 */
export function useAuth(options: UseAuthOptions = {}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { redirectToLogin = false, redirectPath = '/Login' } = options;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (redirectToLogin && !currentUser) {
        router.push(redirectPath);
      }
    });

    return () => unsubscribe();
  }, [redirectToLogin, redirectPath, router]);

  return { user, loading };
} 