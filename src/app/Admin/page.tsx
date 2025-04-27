"use client";

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { isAdmin } from '@/services/adminService';
import { useRouter } from 'next/navigation';
import { app } from '@/firebase';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const auth = getAuth(app);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async (userId: string) => {
      const adminStatus = await isAdmin(userId);
      setAuthorized(adminStatus);
      setLoading(false);

      if (!adminStatus) {
        // Redirect non-admin users to home page
        router.push('/');
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkAdminStatus(user.uid);
      } else {
        setLoading(false);
        setAuthorized(false);
        router.push('/Login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6EC]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Memeriksa izin akses...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null; // This will never show as we redirect unauthorized users
  }

  return (
    <div className="min-h-screen bg-[#F6F6EC] pt-16 pb-24">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-amber-800 hover:text-amber-700">
            <ChevronLeft size={20} />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-amber-800 mb-8">Panel Admin</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Management Card */}
            <div className="bg-amber-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-4">Manajemen Pengguna</h2>
              <p className="text-gray-600">Kelola pengguna dan hak akses</p>
              <Link href="/Admin/Users">
                <button className="mt-4 px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors">
                  Kelola Pengguna
                </button>
              </Link>
            </div>
            
            {/* House Management Card */}
            <div className="bg-amber-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-4">Manajemen Rumah</h2>
              <p className="text-gray-600">Kelola rumah prebuilt</p>
              <Link href="/Admin/Houses">
                <button className="mt-4 px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors">
                  Kelola Rumah
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 