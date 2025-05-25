"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAllOpenSupportThreads, SupportThread } from '@/services/supportService';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { 
  MessageSquare,
  Loader2,
  Clock,
  User,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Menu
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function AdminSupportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'closed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/Login');
      return;
    }
      
    const loadThreads = async () => {
      try {
        const { success, threads: threadData } = await getAllOpenSupportThreads();
        if (success && threadData) {
          setThreads(threadData);
        }
      } catch (err) {
        console.error('Error loading threads:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadThreads();

    // Subscribe to real-time updates
    const threadsRef = collection(db, 'supportThreads');
    const q = query(threadsRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newThreads: SupportThread[] = [];
      snapshot.forEach((doc) => {
        newThreads.push({
          id: doc.id,
          ...doc.data()
        } as SupportThread);
      });
      setThreads(newThreads);
    });

    return () => unsubscribe();
  }, [router, user]);

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = 
      thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || thread.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || thread.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6EC]">
        <div className="pt-24 pb-12 px-4 flex items-center justify-center h-[calc(100vh-6rem)]">
          <Loader2 className="w-8 h-8 text-[#594C1A] animate-spin" />
        </div>
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
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 sm:py-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Daftar Permintaan Bantuan</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
              Kelola dan respons permintaan bantuan dari pengguna
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan subjek, nama pengguna, atau email..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#594C1A] focus:border-[#594C1A]"
                  />
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 w-full md:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full md:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#594C1A] focus:border-[#594C1A]"
                >
                  <Filter size={16} className="mr-2" />
                  Filter
                  {showFilters ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
                </button>
              </div>
            </div>
            {showFilters && (
              <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Status</label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as 'all' | 'open' | 'in-progress' | 'closed')}
                    className="block w-full px-3 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-[#594C1A] focus:border-[#594C1A] rounded-lg"
                  >
                    <option value="all">Semua Status</option>
                    <option value="open">Terbuka</option>
                    <option value="in-progress">Dalam Proses</option>
                    <option value="closed">Ditutup</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="priorityFilter" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Prioritas</label>
                  <select
                    id="priorityFilter"
                    value={priorityFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriorityFilter(e.target.value as 'all' | 'low' | 'medium' | 'high')}
                    className="block w-full px-3 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-[#594C1A] focus:border-[#594C1A] rounded-lg"
                  >
                    <option value="all">Semua Prioritas</option>
                    <option value="high">Tinggi</option>
                    <option value="medium">Sedang</option>
                    <option value="low">Rendah</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Threads List */}
          <div className="space-y-3 sm:space-y-4">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/Admin/support/${thread.id}`)}
              >
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{thread.subject}</h3>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                          thread.status === 'open' 
                            ? 'bg-green-100 text-green-800'
                            : thread.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {thread.status === 'open' ? 'Terbuka' : 
                           thread.status === 'in-progress' ? 'Dalam Proses' : 'Ditutup'}
                        </span>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                          thread.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : thread.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {thread.priority.charAt(0).toUpperCase() + thread.priority.slice(1)} Prioritas
                        </span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                        <User className="w-4 h-4 mr-2" />
                        <span>{thread.userName}</span>
                        <span className="mx-2">•</span>
                        <span>{thread.userEmail}</span>
                        <span className="mx-2">•</span>
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {thread.createdAt.toDate().toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 line-clamp-2">{thread.lastMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredThreads.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
                <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Tidak Ada Permintaan Bantuan Ditemukan</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Coba sesuaikan pencarian atau filter Anda'
                    : 'Saat ini belum ada permintaan bantuan'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 