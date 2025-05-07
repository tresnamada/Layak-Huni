"use client";

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { isAdmin } from '@/services/adminService';
import { useRouter } from 'next/navigation';
import { app } from '@/firebase';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Users, 
  Home, 
  Settings, 
  BarChart2, 
  MessageSquare, 
  FileText,
  Shield,
  Bell,
  Package,
  Truck
} from 'lucide-react';

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
    return null;
  }

  const adminFeatures = [
    {
      title: "Manajemen Pengguna",
      description: "Kelola pengguna dan hak akses",
      icon: Users,
      href: "/Admin/Users",
      color: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Manajemen Rumah",
      description: "Kelola rumah prebuilt",
      icon: Home,
      href: "/Admin/Houses",
      color: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Tracking Material",
      description: "Kelola status pengiriman material",
      icon: Package,
      href: "/Admin/MaterialTracking",
      color: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      title: "Analitik",
      description: "Lihat statistik dan laporan",
      icon: BarChart2,
      href: "/Admin/Analytics",
      color: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      title: "Pesan & Feedback",
      description: "Kelola pesan dan feedback pengguna",
      icon: MessageSquare,
      href: "/Admin/Messages",
      color: "bg-pink-50",
      iconColor: "text-pink-600"
    },
    {
      title: "Dokumentasi",
      description: "Kelola dokumentasi dan panduan",
      icon: FileText,
      href: "/Admin/Documentation",
      color: "bg-amber-50",
      iconColor: "text-amber-600"
    },
    {
      title: "Keamanan",
      description: "Pengaturan keamanan dan privasi",
      icon: Shield,
      href: "/Admin/Security",
      color: "bg-red-50",
      iconColor: "text-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6F6EC]">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="inline-flex items-center text-amber-800 hover:text-amber-700">
              <ChevronLeft size={20} />
              <span>Kembali ke Halaman Utama</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-amber-800 relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-600 hover:text-amber-800">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel Admin</h1>
          <p className="mt-2 text-gray-600">Kelola dan pantau aktivitas sistem</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pengguna</p>
                <p className="text-2xl font-semibold text-gray-900">1,234</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Rumah</p>
                <p className="text-2xl font-semibold text-gray-900">567</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Home className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Material Dikirim</p>
                <p className="text-2xl font-semibold text-gray-900">328</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Truck className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Aktivitas Hari Ini</p>
                <p className="text-2xl font-semibold text-gray-900">89</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <BarChart2 className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminFeatures.map((feature, index) => (
            <Link key={index} href={feature.href}>
              <div className={`${feature.color} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{feature.description}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${feature.color}`}>
                    <feature.icon className={feature.iconColor} size={24} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 