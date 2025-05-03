"use client"

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, ChevronUp, AlertCircle } from 'lucide-react';
import { getAllHouses, HouseData } from '@/services/houseService';
import Navbar from '@/components/Navbar';
import HeroSection from './components/HeroSection';
import HouseCard from './components/HouseCard';
import { houseTypes } from './config';

export default function PreBuildPage() {
  // State management
  const [houses, setHouses] = useState<HouseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');

  // Handle scroll event to update navbar styling
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load houses data
  useEffect(() => {
    const loadHouses = async () => {
      try {
        const housesData = await getAllHouses();
        setHouses(housesData);
      } catch (err) {
        console.error('Error loading houses:', err);
        setError('Failed to load houses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadHouses();
  }, []);

  // Format price in IDR
  const formatPrice = useCallback((price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }, []);

  // Filter houses based on search and filter criteria
  const filterHouses = useCallback((house: HouseData) => {
    const matchesSearch = house.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         house.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || house.tipe === selectedType;
    
    let matchesPrice = true;
    if (priceFilter !== 'all') {
      const [min, max] = priceFilter.split('-').map(Number);
      if (max) {
        matchesPrice = house.harga >= min * 1000000 && house.harga <= max * 1000000;
      } else {
        matchesPrice = house.harga >= min * 1000000;
      }
    }

    let matchesArea = true;
    if (areaFilter !== 'all') {
      const [min, max] = areaFilter.split('-').map(Number);
      if (max) {
        matchesArea = house.luas >= min && house.luas <= max;
      } else {
        matchesArea = house.luas >= min;
      }
    }

    return matchesSearch && matchesType && matchesPrice && matchesArea;
  }, [searchTerm, selectedType, priceFilter, areaFilter]);

  const filteredHouses = houses.filter(filterHouses);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <HeroSection
        searchTerm={searchTerm}
        selectedType={selectedType}
        priceFilter={priceFilter}
        areaFilter={areaFilter}
        onSearchChange={setSearchTerm}
        onTypeChange={setSelectedType}
        onPriceChange={setPriceFilter}
        onAreaChange={setAreaFilter}
      />

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Header */}
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? 'Loading houses...' : 
               error ? 'Error loading houses' :
               `${filteredHouses.length} ${filteredHouses.length === 1 ? 'House' : 'Houses'} Available`}
            </h2>
            {selectedType !== 'all' && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                {houseTypes.find(t => t.value === selectedType)?.label}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Filter size={16} />
            <span>Filtered by: {selectedType !== 'all' ? houseTypes.find(t => t.value === selectedType)?.label : 'All Types'}</span>
          </div>
        </div>

        {/* Houses Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 mb-4">
              <AlertCircle size={48} className="mx-auto" />
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">{error}</p>
            <p className="text-gray-500">Please try again later</p>
          </div>
        ) : filteredHouses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No houses found</p>
            <p className="text-gray-500">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredHouses.map((house, index) => (
              <HouseCard
                key={house.id}
                house={house}
                index={index}
                formatPrice={formatPrice}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Back to Top Button */}
      <motion.button 
        className="fixed bottom-6 right-6 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-full shadow-lg z-30 transition-colors"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isScrolled ? 1 : 0, y: isScrolled ? 0 : 20 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ChevronUp size={24} />
      </motion.button>
    </div>
  );
}
                  