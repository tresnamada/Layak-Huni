"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { setUserAsAdmin } from '@/services/adminService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<string>('');
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/Login');
        return;
      }
      
      setUser(user);
      
      // Check current role
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setCurrentRole(userSnap.data().role || 'user');
        } else {
          setCurrentRole('No role set');
        }
      } catch (error) {
        console.error('Error checking role:', error);
        setCurrentRole('Error checking role');
      }
    });

    return () => unsubscribe();
  }, [router, auth]);

  const handleSetupAdmin = async () => {
    if (!user) {
      setMessage('No user logged in');
      return;
    }

    setLoading(true);
    setMessage('Setting up admin role...');

    try {
      const success = await setUserAsAdmin(user.uid);
      
      if (success) {
        setMessage('✅ Admin role set successfully! You can now access the admin panel.');
        setCurrentRole('admin');
        
        // Redirect to admin panel after 2 seconds
        setTimeout(() => {
          router.push('/Admin');
        }, 2000);
      } else {
        setMessage('❌ Failed to set admin role. Check console for errors.');
      }
    } catch (error) {
      console.error('Setup error:', error);
      setMessage('❌ Error setting up admin role: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6EC] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Setup</h1>
        
        {user && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>User ID:</strong> {user.uid}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Current Role:</strong> <span className={currentRole === 'admin' ? 'text-green-600 font-semibold' : 'text-gray-900'}>{currentRole}</span>
            </p>
          </div>
        )}

        {currentRole === 'admin' ? (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              ✅ You already have admin privileges!
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ Click the button below to grant yourself admin privileges. This is needed to access the admin dashboard.
            </p>
          </div>
        )}

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('✅') ? 'bg-green-50 text-green-800' : 
            message.includes('❌') ? 'bg-red-50 text-red-800' : 
            'bg-blue-50 text-blue-800'
          }`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        <button
          onClick={handleSetupAdmin}
          disabled={loading || currentRole === 'admin'}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            loading || currentRole === 'admin'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#594C1A] text-white hover:bg-[#938656]'
          }`}
        >
          {loading ? 'Setting up...' : currentRole === 'admin' ? 'Already Admin' : 'Grant Admin Access'}
        </button>

        <button
          onClick={() => router.push('/')}
          className="w-full mt-3 py-2 px-4 text-gray-600 hover:text-gray-900 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
