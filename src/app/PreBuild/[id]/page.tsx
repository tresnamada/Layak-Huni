"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getHouseById, HouseData } from '@/services/houseService';
import Navbar from '@/components/Navbar';
import { 
  Home as HomeIcon, 
  Calendar, 
  DollarSign, 
  Ruler, 
  Bed, 
  Bath, 
  Car, 
  ChevronLeft 
} from 'lucide-react';

export default function HouseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [house, setHouse] = useState<HouseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHouse = async () => {
      try {
        const houseData = await getHouseById(params.id);
        setHouse(houseData);
      } catch (err) {
        console.error('Error loading house:', err);
        setError('Failed to load house details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadHouse();
  }, [params.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6EC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="min-h-screen bg-[#F6F6EC] flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error || 'House not found'}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center text-amber-600 hover:text-amber-700"
        >
          <ChevronLeft size={20} />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6EC]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-amber-600 hover:text-amber-700 mb-8"
        >
          <ChevronLeft size={20} />
          <span>Back to Houses</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative h-[400px] rounded-xl overflow-hidden"
          >
            <img
              src={house.imageUrl}
              alt={house.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {house.tipe}
            </div>
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h1 className="text-3xl font-bold text-gray-800">{house.name}</h1>
            <p className="text-2xl font-semibold text-amber-600">
              {formatPrice(house.harga)}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Ruler className="mr-2" size={20} />
                <span>Area: {house.luas} m²</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="mr-2" size={20} />
                <span>Duration: {house.durasi} months</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Bed className="mr-2" size={20} />
                <span>Bedrooms: {house.specifications.bedroomCount}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Bath className="mr-2" size={20} />
                <span>Bathrooms: {house.specifications.bathroomCount}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Car className="mr-2" size={20} />
                <span>Carport: {house.specifications.carportCount}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <HomeIcon className="mr-2" size={20} />
                <span>Floors: {house.specifications.floorCount}</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Description</h2>
              <p className="text-gray-600">{house.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Main Material</h2>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600">Name: {house.mainMaterial.name}</p>
                <p className="text-gray-600">Quantity: {house.mainMaterial.quantity} {house.mainMaterial.unit}</p>
                <p className="text-gray-600">Price: {formatPrice(house.mainMaterial.price)}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Estimated Costs</h2>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-2 gap-4">
                  <p className="text-gray-600">Material Cost: {formatPrice(house.estimatedCost.materialCost)}</p>
                  <p className="text-gray-600">Labor Cost: {formatPrice(house.estimatedCost.laborCost)}</p>
                  <p className="text-gray-600">Other Cost: {formatPrice(house.estimatedCost.otherCost)}</p>
                  <p className="text-gray-600 font-semibold">Total Cost: {formatPrice(house.estimatedCost.totalCost)}</p>
                </div>
              </div>
            </div>

            <button className="w-full bg-amber-500 text-white py-3 rounded-lg hover:bg-amber-600 transition-colors duration-300 font-medium">
              Contact Us for This Design
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 