"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { isAdmin } from '@/services/adminService';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Menu,
  Users,
  Home,
  Package,
  HelpCircle
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface UserStats {
  total: number;
  customers: number;
  admins: number;
}

interface HouseStats {
  total: number;
  minimalis: number;
  modern: number;
  tradisional: number;
}

interface MaterialStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
}

export default function AdminDashboard() {
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    customers: 0,
    admins: 0
  });
  const [houseStats, setHouseStats] = useState<HouseStats>({
    total: 0,
    minimalis: 0,
    modern: 0,
    tradisional: 0
  });
  const [materialStats, setMaterialStats] = useState<MaterialStats>({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/Login');
        return;
      }

      try {
        const adminStatus = await isAdmin(user.uid);
        if (!adminStatus) {
          setError('You do not have admin privileges. Visit /setup-admin to grant yourself admin access.');
          setLoading(false);
          setIsCheckingAuth(false);
          return;
        }

        // Load user statistics
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const users = usersSnapshot.docs.map(doc => doc.data());
        
        setUserStats({
          total: users.length,
          customers: users.filter(user => user.role === 'customer').length,
          admins: users.filter(user => user.role === 'admin').length
        });

        // Load house statistics
        const housesRef = collection(db, 'houses');
        const housesSnapshot = await getDocs(housesRef);
        const houses = housesSnapshot.docs.map(doc => doc.data());
        
        setHouseStats({
          total: houses.length,
          minimalis: houses.filter(house => house.tipe === 'minimalis').length,
          modern: houses.filter(house => house.tipe === 'modern').length,
          tradisional: houses.filter(house => house.tipe === 'tradisional').length
        });

        // Load material statistics
        const purchasesRef = collection(db, 'purchases');
        const purchasesQuery = query(purchasesRef, where('status', '!=', 'cancelled'));
        const purchasesSnapshot = await getDocs(purchasesQuery);
        const purchases = purchasesSnapshot.docs.map(doc => doc.data());
        
        const materials = purchases.flatMap(purchase => purchase.materials || []);
        setMaterialStats({
          total: materials.length,
          pending: materials.filter(m => m.status === 'pending').length,
          processing: materials.filter(m => m.status === 'processing').length,
          shipped: materials.filter(m => m.status === 'shipped').length,
          delivered: materials.filter(m => m.status === 'delivered').length
        });

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        
        if (errorMessage.includes('Missing or insufficient permissions')) {
          setError('Permission denied. Your account may not have admin privileges set in the database. Visit /setup-admin to grant yourself admin access.');
        } else {
          setError('Failed to load dashboard data: ' + errorMessage);
        }
      } finally {
        setLoading(false);
        setIsCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [router, auth]);

  const chartData = {
    labels: ['Minimalis', 'Modern', 'Tradisional'],
    datasets: [
      {
        label: 'Jumlah Rumah',
        data: [houseStats.minimalis, houseStats.modern, houseStats.tradisional],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribusi Tipe Rumah'
      }
    }
  };

  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-screen bg-[#F6F6EC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#594C1A] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F6F6EC] flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center text-[#594C1A] hover:text-[#938656]"
        >
          <span>Kembali</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6EC] flex">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 transition-all duration-300 lg:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="px-3 sm:px-4 md:px-6">
            <div className="flex justify-between items-center py-2 sm:py-3 md:py-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 sm:p-2 text-gray-600 hover:text-gray-900"
              >
                <Menu size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6">
          <div className="mb-3 sm:mb-4 md:mb-6">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-600">Selamat datang di panel admin</p>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Akses Cepat</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              <Link href="/Admin/Users" className="block p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Users size={18} className="mr-2 text-blue-600 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Manajemen Pengguna</span>
                </div>
              </Link>
              <Link href="/Admin/Houses" className="block p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <Home size={18} className="mr-2 text-green-600 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Manajemen Rumah</span>
                  </div>
              </Link>
               <Link href="/Admin/support" className="block p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <HelpCircle size={18} className="mr-2 text-purple-600 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Dukungan Pengguna</span>
                  </div>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            {/* User Stats Card */}
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 sm:text-sm">Total Pengguna</p>
                  <p className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">{userStats.total}</p>
                </div>
                <div className="p-1.5 sm:p-2 md:p-3 bg-blue-50 rounded-lg">
                  <Users className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
              </div>
              <div className="mt-2 border-t pt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:gap-3 sm:pt-3 md:gap-4 md:pt-4">
                <div>
                  <p className="text-xs text-gray-500">Pelanggan</p>
                  <p className="text-sm font-semibold text-gray-900">{userStats.customers}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Admin</p>
                  <p className="text-sm font-semibold text-gray-900">{userStats.admins}</p>
                </div>
              </div>
            </div>

            {/* House Stats Card */}
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 sm:text-sm">Total Rumah</p>
                  <p className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">{houseStats.total}</p>
                </div>
                <div className="p-1.5 sm:p-2 md:p-3 bg-green-50 rounded-lg">
                  <Home className="text-green-600 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
              </div>
              <div className="mt-2 border-t pt-2 grid grid-cols-3 gap-1 sm:mt-3 sm:gap-2 sm:pt-3 md:gap-3 md:pt-4">
                <div>
                  <p className="text-xs text-gray-500">Minimalis</p>
                  <p className="text-sm font-semibold text-gray-900">{houseStats.minimalis}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Modern</p>
                  <p className="text-sm font-semibold text-gray-900">{houseStats.modern}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tradisional</p>
                  <p className="text-sm font-semibold text-gray-900">{houseStats.tradisional}</p>
                </div>
              </div>
            </div>

            {/* Material Stats Card */}
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 sm:text-sm">Total Material</p>
                  <p className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">{materialStats.total}</p>
                </div>
                <div className="p-1.5 sm:p-2 md:p-3 bg-orange-50 rounded-lg">
                  <Package className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
              </div>
              <div className="mt-2 border-t pt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:gap-3 sm:pt-3 md:gap-4 md:pt-4">
                <div>
                  <p className="text-xs text-gray-500">Menunggu</p>
                  <p className="text-sm font-semibold text-gray-900">{materialStats.pending}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Diproses</p>
                  <p className="text-sm font-semibold text-gray-900">{materialStats.processing}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Dikirim</p>
                  <p className="text-sm font-semibold text-gray-900">{materialStats.shipped}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Terkirim</p>
                  <p className="text-sm font-semibold text-gray-900">{materialStats.delivered}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm mb-3 sm:mb-4 md:mb-6">
             <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Distribusi Tipe Rumah</h2>
            <div className="w-full overflow-x-auto">
              <div className="min-w-[280px]">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Recent Activities (Placeholder)*/}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
             <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Aktivitas Terbaru</h2>
             <div className="text-center py-4 text-gray-500 text-sm sm:text-base">
                Fitur aktivitas terbaru akan segera hadir.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
} 