"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Trash2, PenSquare, Building, X, AlertTriangle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllHouses, deleteHouse, HouseData } from '@/services/houseService';
import { useAdmin } from '@/hooks/useAdmin';

interface House {
  id: string;
  name: string;
  harga: number;
  luas: number;
  tipe: string;
  material: string;
  durasi: number;
  imageUrl: string;
  createdAt: any;
}

export default function HousesPage() {
  const router = useRouter();
  const { isAdminUser, loading: checkingAdmin } = useAdmin();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteHouseId, setDeleteHouseId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Redirect non-admin users
  if (!checkingAdmin && !isAdminUser) {
    router.push('/');
    return null;
  }

  useEffect(() => {
    async function loadHouses() {
      try {
        setLoading(true);
        setError(null);
        const housesData = await getAllHouses();
        // Make sure all houses have an id
        const validHousesData = housesData.filter(house => house.id !== undefined) as House[];
        setHouses(validHousesData);
      } catch (err) {
        console.error('Error loading houses:', err);
        setError('Gagal memuat data rumah. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    }

    if (isAdminUser) {
      loadHouses();
    }
  }, [isAdminUser]);

  const handleDeleteClick = (houseId: string) => {
    setDeleteHouseId(houseId);
  };

  const confirmDelete = async () => {
    if (!deleteHouseId) return;
    
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await deleteHouse(deleteHouseId);
      
      // Remove from local state
      setHouses(prevHouses => prevHouses.filter(house => house.id !== deleteHouseId));
      setDeleteHouseId(null);
    } catch (err) {
      console.error('Error deleting house:', err);
      setDeleteError('Gagal menghapus rumah. Silakan coba lagi nanti.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteHouseId(null);
    setDeleteError(null);
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6EC]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Memeriksa izin akses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6EC] pt-16 pb-24">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/Admin" className="inline-flex items-center text-amber-800 hover:text-amber-700">
            <ChevronLeft size={20} />
            <span>Kembali ke Panel Admin</span>
          </Link>
        </div>
      
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-amber-800">Manajemen Rumah Prebuilt</h1>
          
          <Link href="/Admin/Houses/New">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-5 py-2.5 bg-amber-800 text-white rounded-lg shadow-md hover:bg-amber-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              <span>Tambah Rumah Baru</span>
            </motion.div>
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Terjadi Kesalahan</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data rumah...</p>
            </div>
          </div>
        ) : houses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Rumah</h2>
            <p className="text-gray-500 mb-6">Anda belum menambahkan rumah prebuilt. Tambahkan rumah pertama Anda sekarang.</p>
            <Link href="/Admin/Houses/New">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center px-5 py-2.5 bg-amber-800 text-white rounded-lg shadow-md hover:bg-amber-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                <span>Tambah Rumah Baru</span>
              </motion.div>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rumah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga (Juta)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Luas (m²)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi (Hari)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {houses.map((house) => (
                    <tr key={house.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-16 flex-shrink-0 mr-4 relative rounded overflow-hidden">
                            <Image
                              src={house.imageUrl.startsWith('data:') ? house.imageUrl : '/placeholder-house.jpg'}
                              alt={house.name}
                              fill
                              className="object-cover"
                              unoptimized={house.imageUrl.startsWith('data:')}
                            />
                          </div>
                          <div className="text-sm font-medium text-gray-900">{house.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {house.tipe}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {house.harga.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {house.luas.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {house.material}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {house.durasi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/Admin/Houses/Edit/${house.id}`} className="text-amber-800 hover:text-amber-700">
                            <PenSquare className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(house.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteHouseId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
            >
              <div className="flex justify-end">
                <button onClick={cancelDelete} className="text-gray-400 hover:text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Hapus Rumah</h3>
                <p className="text-sm text-gray-500">
                  Apakah Anda yakin ingin menghapus rumah ini? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              
              {deleteError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {deleteError}
                </div>
              )}
              
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  onClick={cancelDelete}
                  disabled={isDeleting}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <span>Ya, Hapus</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 