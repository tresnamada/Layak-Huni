"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { isAdmin } from '@/services/adminService';
import { collection, query, getDocs, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { 
  ChevronLeft,
  Package,
  Truck,
  CheckCircle,
  Search,
  AlertCircle,
  Menu,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  Hammer
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

interface Material {
  name: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  estimatedArrival?: string;
  quantity: number;
  unit: string;
  lastUpdated: Date;
  notes?: string;
  index?: number;
}

interface MaterialTracking {
  id: string;
  purchaseId: string;
  houseName: string;
  customerName: string;
  materials: Material[];
}

interface MaterialStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
}

export default function MaterialTrackingPage() {
  const [materialTrackings, setMaterialTrackings] = useState<MaterialTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const auth = getAuth();

  // Calculate material statistics
  const stats: MaterialStats = materialTrackings.reduce((acc, tracking) => {
    tracking.materials.forEach(material => {
      acc.total++;
      acc[material.status]++;
    });
    return acc;
  }, {
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/Login');
        return;
      }

      try {
        const adminStatus = await isAdmin(user.uid);
        if (!adminStatus) {
          router.push('/');
          return;
        }

        // Load material trackings data
        const trackingsRef = collection(db, 'purchases');
        const trackingsQuery = query(trackingsRef, where('status', '!=', 'cancelled'));
        const trackingsSnapshot = await getDocs(trackingsQuery);
        
        const trackingsData: MaterialTracking[] = [];
        trackingsSnapshot.forEach((doc) => {
          const data = doc.data();
          trackingsData.push({
            id: doc.id,
            purchaseId: doc.id,
            houseName: data.houseName,
            customerName: data.userDetails.fullName,
            materials: data.materials || []
          });
        });

        setMaterialTrackings(trackingsData);
      } catch (err) {
        console.error('Error loading material trackings:', err);
        setError('Failed to load material trackings');
      } finally {
        setLoading(false);
        setIsCheckingAuth(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [router, auth]);

  const updateMaterialStatus = async (
    trackingId: string,
    materialIndex: number,
    newStatus: Material['status']
  ) => {
    try {
      const trackingRef = doc(db, 'purchases', trackingId);
      const tracking = materialTrackings.find(t => t.id === trackingId);
      
      if (!tracking) return;

      const updatedMaterials = [...tracking.materials];
      updatedMaterials[materialIndex] = {
        ...updatedMaterials[materialIndex],
        status: newStatus,
        lastUpdated: new Date()
      };

      await updateDoc(trackingRef, {
        materials: updatedMaterials
      });

      // Update local state
      setMaterialTrackings(prev => prev.map(t => {
        if (t.id === trackingId) {
          return { ...t, materials: updatedMaterials };
        }
        return t;
      }));
    } catch (err) {
      console.error('Error updating material status:', err);
      setError('Failed to update material status');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTrackings = materialTrackings.filter(tracking => {
    const matchesSearch = 
      tracking.houseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tracking.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    
    return matchesSearch && tracking.materials.some(m => m.status === statusFilter);
  });

  const handleBatchStatusUpdate = async (newStatus: Material['status']) => {
    try {
      const updates = Array.from(selectedItems).map(async (itemKey) => {
        const [trackingId, materialIndex] = itemKey.split('-');
        await updateMaterialStatus(trackingId, parseInt(materialIndex), newStatus);
      });

      await Promise.all(updates);
      setSelectedItems(new Set());
    } catch (err) {
      console.error('Error updating batch status:', err);
      setError('Failed to update batch status');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['House Name', 'Customer Name', 'Material Name', 'Quantity', 'Unit', 'Status', 'Estimated Arrival', 'Last Updated'],
      ...filteredTrackings.flatMap(tracking => 
        tracking.materials.map(material => [
          tracking.houseName,
          tracking.customerName,
          material.name,
          material.quantity.toString(),
          material.unit,
          material.status,
          material.estimatedArrival || '',
          new Date(material.lastUpdated).toLocaleDateString('id-ID')
        ])
      )
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `material_tracking_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const sortedAndFilteredTrackings = filteredTrackings
    .map(tracking => ({
      ...tracking,
      materials: tracking.materials
        .map((material, index) => ({ ...material, index }))
        .sort((a, b) => {
          if (sortBy === 'date') {
            return sortOrder === 'desc'
              ? new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
              : new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
          } else {
            const statusOrder = { delivered: 3, shipped: 2, processing: 1, pending: 0 };
            return sortOrder === 'desc'
              ? statusOrder[b.status] - statusOrder[a.status]
              : statusOrder[a.status] - statusOrder[b.status];
          }
        })
    }))
    .sort((a, b) => {
      const aDate = new Date(a.materials[0]?.lastUpdated || 0).getTime();
      const bDate = new Date(b.materials[0]?.lastUpdated || 0).getTime();
      return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
    });

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
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center text-[#594C1A] hover:text-[#938656]"
        >
          <ChevronLeft size={20} className="mr-2" />
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
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Tracking Material</h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-600">Kelola dan pantau status pengiriman material</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Total Material</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <Package className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Menunggu</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="p-2 sm:p-3 bg-yellow-50 rounded-lg">
                  <Package className="text-yellow-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Diproses</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.processing}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <Hammer className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Dikirim</p>
                  <p className="text-xl sm:text-2xl font-bold text-indigo-600">{stats.shipped}</p>
                </div>
                <div className="p-2 sm:p-3 bg-indigo-50 rounded-lg">
                  <Truck className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Terkirim</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.delivered}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama rumah atau pelanggan..."
                    className="block w-full pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <Filter size={16} className="mr-2" />
                  Filter
                  {showFilters ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
                </button>
                <button
                  onClick={handleExport}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-amber-800 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <FileText size={16} className="mr-2" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status Material</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 rounded-lg"
                    >
                      <option value="all">Semua Status</option>
                      <option value="pending">Menunggu</option>
                      <option value="processing">Diproses</option>
                      <option value="shipped">Dikirim</option>
                      <option value="delivered">Terkirim</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Urutkan Berdasarkan</label>
                    <div className="flex gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'date' | 'status')}
                        className="flex-1 pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 rounded-lg"
                      >
                        <option value="date">Tanggal</option>
                        <option value="status">Status</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Batch Actions */}
          {selectedItems.size > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedItems.size} item dipilih
                  </span>
                  <button
                    onClick={() => setSelectedItems(new Set())}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Batalkan
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    onChange={(e) => handleBatchStatusUpdate(e.target.value as Material['status'])}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                  >
                    <option value="">Update Status</option>
                    <option value="processing">Diproses</option>
                    <option value="shipped">Dikirim</option>
                    <option value="delivered">Terkirim</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tracking List */}
          <div className="space-y-4">
            {sortedAndFilteredTrackings.map((tracking) => (
              <div
                key={tracking.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">{tracking.houseName}</h3>
                      <p className="text-sm text-gray-500">Pelanggan: {tracking.customerName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/Admin/MaterialTracking/${tracking.id}`}
                        className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                      >
                        Kelola Material
                      </Link>
                      <button
                        onClick={() => {
                          const allMaterialKeys = tracking.materials.map(
                            (_, index) => `${tracking.id}-${index}`
                          );
                          const newSelected = new Set(selectedItems);
                          allMaterialKeys.forEach(key => newSelected.add(key));
                          setSelectedItems(newSelected);
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Pilih Semua
                      </button>
                    </div>
                  </div>

                  {/* Materials List */}
                  <div className="space-y-3">
                    {tracking.materials.map((material, index) => (
                      <div 
                        key={index} 
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(`${tracking.id}-${material.index}`)}
                            onChange={(e) => {
                              const itemKey = `${tracking.id}-${material.index}`;
                              const newSelected = new Set(selectedItems);
                              if (e.target.checked) {
                                newSelected.add(itemKey);
                              } else {
                                newSelected.delete(itemKey);
                              }
                              setSelectedItems(newSelected);
                            }}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                          />
                          
                          {/* Material Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <Package className="w-5 h-5 text-amber-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">{material.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {material.quantity} {material.unit}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status Controls */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                          <select
                            value={material.status}
                            onChange={(e) => updateMaterialStatus(
                              tracking.id,
                              material.index,
                              e.target.value as Material['status']
                            )}
                            className="w-full sm:w-auto px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                          >
                            <option value="pending">Menunggu</option>
                            <option value="processing">Diproses</option>
                            <option value="shipped">Dikirim</option>
                            <option value="delivered">Terkirim</option>
                          </select>

                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(material.status)}`}>
                            {material.status === 'delivered' && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                            {material.status === 'shipped' && <Truck className="w-3.5 h-3.5 mr-1" />}
                            {material.status === 'processing' && <Package className="w-3.5 h-3.5 mr-1" />}
                            {material.status === 'delivered' ? 'Terkirim' :
                             material.status === 'shipped' ? 'Dalam Pengiriman' :
                             material.status === 'processing' ? 'Diproses' : 'Menunggu'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Material Details */}
                  {tracking.materials.some(m => m.estimatedArrival) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
                        {tracking.materials.map((material, index) => (
                          material.estimatedArrival && (
                            <div key={index} className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span>
                                {material.name}: Estimasi tiba {new Date(material.estimatedArrival).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Last Updated */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Terakhir diupdate: {new Date(tracking.materials[0]?.lastUpdated || Date.now()).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {sortedAndFilteredTrackings.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl">
                <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Tidak ada material ditemukan</h3>
                <p className="text-sm sm:text-base text-gray-500 mt-1">
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 