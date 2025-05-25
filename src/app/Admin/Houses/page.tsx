"use client";

import { useState, useEffect } from 'react';
import { getAllHouses, deleteHouse, HouseData } from '@/services/houseService';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Home,
  Ruler,
  DollarSign,
  Calendar,
  Layers,
  FileText,
  Hammer,
  Menu,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '@/hooks/useAdmin';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';

export default function HousesManagement() {
  const router = useRouter();
  const { isAdminUser, loading: checkingAdmin } = useAdmin();
  const [houses, setHouses] = useState<HouseData[]>([]);
  const [deleteHouseId, setDeleteHouseId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (!checkingAdmin && !isAdminUser) {
      router.push('/');
    }
  }, [checkingAdmin, isAdminUser, router]);

  useEffect(() => {
    const loadHouses = async () => {
      try {
        const housesData = await getAllHouses();
        const validHousesData = housesData.filter(house => house.id !== undefined) as HouseData[];
        setHouses(validHousesData);
      } catch (err) {
        console.error('Error loading houses:', err);
      }
    };

    loadHouses();
  }, []);

  const handleDeleteClick = (id: string) => {
    setDeleteHouseId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteHouseId) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteHouse(deleteHouseId);
      setHouses(houses.filter(house => house.id !== deleteHouseId));
      setDeleteHouseId(null);
    } catch (err) {
      setDeleteError('Failed to delete house');
      console.error('Error deleting house:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteHouseId(null);
    setDeleteError(null);
  };

  const filteredHouses = houses
    .filter(house => {
      const matchesSearch = house.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          house.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || house.tipe === selectedType;
      return matchesSearch && matchesType;
    });

  const houseStats = {
    total: houses.length,
    minimalis: houses.filter(house => house.tipe === 'minimalis').length,
    modern: houses.filter(house => house.tipe === 'modern').length,
    tradisional: houses.filter(house => house.tipe === 'tradisional').length,
    totalMaterials: houses.reduce((acc, house) => acc + (house.materials?.length || 0), 0),
    totalBlueprints: houses.reduce((acc, house) => acc + (house.blueprints?.length || 0), 0),
    totalStages: houses.reduce((acc, house) => acc + (house.constructionStages?.length || 0), 0)
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6EC]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking admin status...</p>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return null;
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
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Manajemen Rumah</h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-600">Kelola dan pantau rumah yang tersedia</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mb-2 sm:mb-3 md:mb-4 lg:mb-6">
            <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 lg:p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs md:text-sm font-medium text-gray-500">Total Rumah</p>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900">{houseStats.total}</p>
                </div>
                <div className="p-1 sm:p-1.5 md:p-2 lg:p-2.5 bg-blue-50 rounded-lg">
                  <Home className="text-blue-600 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 lg:p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs md:text-sm font-medium text-gray-500">Total Material</p>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900">{houseStats.totalMaterials}</p>
                </div>
                <div className="p-1 sm:p-1.5 md:p-2 lg:p-2.5 bg-green-50 rounded-lg">
                  <Layers className="text-green-600 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 lg:p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs md:text-sm font-medium text-gray-500">Total Blueprint</p>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900">{houseStats.totalBlueprints}</p>
                </div>
                <div className="p-1 sm:p-1.5 md:p-2 lg:p-2.5 bg-purple-50 rounded-lg">
                  <FileText className="text-purple-600 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 lg:p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs md:text-sm font-medium text-gray-500">Total Tahap</p>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900">{houseStats.totalStages}</p>
                </div>
                <div className="p-1 sm:p-1.5 md:p-2 lg:p-2.5 bg-amber-50 rounded-lg">
                  <Hammer className="text-amber-600 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-2 sm:p-2.5 md:p-3 lg:p-4 mb-2 sm:mb-3 md:mb-4 lg:mb-6">
            <div className="flex flex-col lg:flex-row gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-2.5 flex items-center pointer-events-none">
                    <Search size={12} className="text-gray-400 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari rumah..."
                    className="block w-full pl-6 sm:pl-7 pr-2 sm:pr-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm lg:text-base border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 border border-gray-300 rounded-lg text-[11px] sm:text-xs md:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <Filter size={12} className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  Filter
                  {showFilters ? <ChevronUp size={12} className="ml-1 sm:ml-1.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" /> : <ChevronDown size={12} className="ml-1 sm:ml-1.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />}
                </button>
                <Link href="/Admin/Houses/New">
                  <button className="inline-flex items-center px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 border border-transparent rounded-lg text-[11px] sm:text-xs md:text-sm font-medium text-white bg-amber-800 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                    <Plus size={12} className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                    Tambah
                  </button>
                </Link>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-1.5 sm:mt-2 md:mt-3 lg:mt-4 p-1.5 sm:p-2 md:p-3 lg:p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
                  <div>
                    <label className="block text-[11px] sm:text-xs md:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Tipe Rumah</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="block w-full pl-1.5 sm:pl-2 pr-6 sm:pr-8 py-1 sm:py-1.5 text-[11px] sm:text-xs md:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 rounded-lg"
                    >
                      <option value="all">Semua Tipe</option>
                      <option value="minimalis">Minimalis</option>
                      <option value="modern">Modern</option>
                      <option value="tradisional">Tradisional</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Houses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
            {filteredHouses.map((house) => (
              <div key={house.id} className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-2 sm:p-2.5 md:p-3 lg:p-4">
                  {/* House Image */}
                  <div className="relative h-28 sm:h-32 md:h-40 lg:h-48 mb-2 sm:mb-2.5 md:mb-3 lg:mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={house.imageUrl}
                      alt={house.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>

                  {/* House Info */}
                  <div className="space-y-2 sm:space-y-2.5 md:space-y-3 lg:space-y-4">
                    <div>
                      <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-900">{house.name}</h3>
                      <p className="text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-600 mt-0.5 sm:mt-1">{house.description}</p>
                    </div>

                    {/* Specifications */}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
                      <div className="flex items-center text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-600">
                        <Home size={12} className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                        <span>{house.specifications?.bedroomCount || 0} Kamar</span>
                      </div>
                      <div className="flex items-center text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-600">
                        <Ruler size={12} className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                        <span>{house.luas} m²</span>
                      </div>
                      <div className="flex items-center text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-600">
                        <DollarSign size={12} className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                        <span>Rp {Number(house.harga).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-600">
                        <Calendar size={12} className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                        <span>{house.durasi} hari</span>
                      </div>
                    </div>

                    {/* Additional Specifications */}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
                      <div className="flex items-center text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-600">
                        <Layers size={12} className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                        <span>{house.specifications?.floorCount || 0} Lantai</span>
                      </div>
                      <div className="flex items-center text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-600">
                        <Home size={12} className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                        <span>{house.specifications?.bathroomCount || 0} Kamar Mandi</span>
                      </div>
                      <div className="flex items-center text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-600">
                        <Home size={12} className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                        <span>{house.specifications?.carportCount || 0} Carport</span>
                      </div>
                      <div className="flex items-center text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-600">
                        <Ruler size={12} className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                        <span>{house.specifications?.buildingArea || 0} m² Bangunan</span>
                      </div>
                    </div>

                    {/* Materials Summary */}
                    <div className="border-t pt-2 sm:pt-2.5 md:pt-3 lg:pt-4">
                      <div className="flex items-center text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-600 mb-0.5 sm:mb-1">
                        <Layers size={12} className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                        <span className="font-medium">Material</span>
                      </div>
                      <div className="text-[11px] sm:text-xs md:text-sm text-gray-500">
                        {house.materials?.length ? `${house.materials.length} material tersedia` : 'Tidak ada material'}
                      </div>
                    </div>

                    {/* Blueprints */}
                    <div className="border-t pt-2 sm:pt-2.5 md:pt-3 lg:pt-4">
                      <div className="flex items-center text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-600 mb-0.5 sm:mb-1">
                        <FileText size={12} className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                        <span className="font-medium">Blueprint</span>
                      </div>
                      <div className="text-[11px] sm:text-xs md:text-sm text-gray-500">
                        {house.blueprints?.length ? `${house.blueprints.length} blueprint tersedia` : 'Tidak ada blueprint'}
                      </div>
                    </div>

                    {/* Construction Stages */}
                    <div className="border-t pt-2 sm:pt-2.5 md:pt-3 lg:pt-4">
                      <div className="flex items-center text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-600 mb-0.5 sm:mb-1">
                        <Hammer size={12} className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                        <span className="font-medium">Konstruksi</span>
                      </div>
                      <div className="text-[11px] sm:text-xs md:text-sm text-gray-500">
                        {house.constructionStages?.length ? `${house.constructionStages.length} tahap` : 'Tidak ada tahap'}
                      </div>
                    </div>

                    {/* Features */}
                    {house.features?.length > 0 && (
                      <div className="border-t pt-2 sm:pt-2.5 md:pt-3 lg:pt-4">
                        <div className="flex items-center text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-600 mb-0.5 sm:mb-1">
                          <Home size={12} className="mr-1 sm:mr-1.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                          <span className="font-medium">Fitur</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {house.features.map((feature, index) => (
                            <span key={index} className="text-[10px] sm:text-xs px-2 py-1 bg-amber-50 text-amber-800 rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-1.5 sm:gap-2 pt-2 sm:pt-2.5 md:pt-3 lg:pt-4 border-t">
                      <Link href={`/Admin/Houses/Edit/${house.id}`}>
                        <button className="p-1 sm:p-1.5 text-gray-600 hover:text-amber-800">
                          <Edit size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        </button>
                      </Link>
                      <button
                        className="p-1 sm:p-1.5 text-gray-600 hover:text-red-600"
                        onClick={() => handleDeleteClick(house.id!)}
                      >
                        <Trash2 size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredHouses.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-sm">
                <Home size={32} className="mx-auto text-gray-400 sm:w-12 sm:h-12" />
                <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900">Tidak ada rumah ditemukan</h3>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">Coba sesuaikan pencarian atau filter Anda</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteHouseId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-md w-full"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Hapus Rumah</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Apakah Anda yakin ingin menghapus rumah ini? Tindakan ini tidak dapat dibatalkan.</p>
              
              {deleteError && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm">
                  {deleteError}
                </div>
              )}
              
              <div className="flex justify-end gap-3 sm:gap-4">
                <button
                  onClick={handleDeleteCancel}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm text-gray-600 hover:text-gray-900"
                  disabled={isDeleting}
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 