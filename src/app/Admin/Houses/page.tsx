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
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '@/hooks/useAdmin';
import { useRouter } from 'next/navigation';

export default function HousesManagement() {
  const router = useRouter();
  const { isAdminUser, loading: checkingAdmin } = useAdmin();
  const [houses, setHouses] = useState<HouseData[]>([]);
  const [deleteHouseId, setDeleteHouseId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

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

  const filteredHouses = houses.filter(house => {
    const matchesSearch = house.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         house.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || house.tipe === selectedType;
    return matchesSearch && matchesType;
  });

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
    <div className="min-h-screen bg-[#F6F6EC] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/Admin" className="inline-flex items-center text-amber-800 hover:text-amber-700">
            <ChevronLeft size={20} className="mr-2" />
            Back to Admin Dashboard
          </Link>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">House Management</h1>
            <p className="mt-2 text-gray-600">Manage and monitor pre-built houses</p>
          </div>
          <Link href="/Admin/Houses/New">
            <button className="flex items-center px-4 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-700 transition-colors">
              <Plus size={20} className="mr-2" />
              Add New House
            </button>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search houses..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="minimalis">Minimalis</option>
                <option value="modern">Modern</option>
                <option value="tradisional">Tradisional</option>
              </select>
              <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Filter size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Houses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHouses.map((house) => (
            <div key={house.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* House Image */}
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={house.imageUrl}
                    alt={house.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* House Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{house.name}</h3>
                    <p className="text-gray-600 mt-1">{house.description}</p>
                  </div>

                  {/* Specifications */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-600">
                      <Home size={16} className="mr-2" />
                      <span>{house.specifications?.bedroomCount || 0} Beds</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Ruler size={16} className="mr-2" />
                      <span>{house.luas} m²</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign size={16} className="mr-2" />
                      <span>Rp {house.harga.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-2" />
                      <span>{house.durasi} days</span>
                    </div>
                  </div>

                  {/* Materials Summary */}
                  <div className="border-t pt-4">
                    <div className="flex items-center text-gray-600 mb-2">
                      <Layers size={16} className="mr-2" />
                      <span className="font-medium">Materials</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {house.materials?.length || 0} materials listed
                    </div>
                  </div>

                  {/* Blueprints */}
                  <div className="border-t pt-4">
                    <div className="flex items-center text-gray-600 mb-2">
                      <FileText size={16} className="mr-2" />
                      <span className="font-medium">Blueprints</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {house.blueprints?.length || 0} blueprints available
                    </div>
                  </div>

                  {/* Construction Stages */}
                  <div className="border-t pt-4">
                    <div className="flex items-center text-gray-600 mb-2">
                      <Hammer size={16} className="mr-2" />
                      <span className="font-medium">Construction</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {house.constructionStages?.length || 0} stages
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Link href={`/Admin/Houses/Edit/${house.id}`}>
                      <button className="p-2 text-gray-600 hover:text-amber-800">
                        <Edit size={20} />
                      </button>
                    </Link>
                    <button
                      className="p-2 text-gray-600 hover:text-red-600"
                      onClick={() => handleDeleteClick(house.id!)}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredHouses.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <Home size={48} className="mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No houses found</h3>
              <p className="mt-2 text-gray-600">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteHouseId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete House</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this house? This action cannot be undone.</p>
              
              {deleteError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                  {deleteError}
                </div>
              )}
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 