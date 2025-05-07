"use client"

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, ChevronUp, AlertCircle, SlidersHorizontal } from 'lucide-react';
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'area-asc' | 'area-desc' | 'newest'>('newest');

  // Handle scroll event to update navbar styling and hide mobile filters
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      if (showMobileFilters) setShowMobileFilters(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showMobileFilters]);

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

  // Filter and sort houses
  const filterAndSortHouses = useCallback(() => {
    const filtered = houses.filter(house => {
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
    });

    // Sort the filtered houses
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.harga - b.harga;
        case 'price-desc':
          return b.harga - a.harga;
        case 'area-asc':
          return a.luas - b.luas;
        case 'area-desc':
          return b.luas - a.luas;
        case 'newest':
        default:
          // Handle Timestamp type safely
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
      }
    });
  }, [houses, searchTerm, selectedType, priceFilter, areaFilter, sortBy]);

  const filteredAndSortedHouses = filterAndSortHouses();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-amber-50">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? 'Loading houses...' : 
               error ? 'Error loading houses' :
               `${filteredAndSortedHouses.length} ${filteredAndSortedHouses.length === 1 ? 'House' : 'Houses'} Available`}
            </h2>
            {selectedType !== 'all' && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                {houseTypes.find(t => t.value === selectedType)?.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="area-asc">Area: Small to Large</option>
              <option value="area-desc">Area: Large to Small</option>
            </select>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="sm:hidden px-4 py-2 bg-amber-500 text-white rounded-lg flex items-center gap-2 hover:bg-amber-600 transition-colors"
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedType !== 'all' || priceFilter !== 'all' || areaFilter !== 'all') && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {selectedType !== 'all' && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm flex items-center gap-2">
                Type: {houseTypes.find(t => t.value === selectedType)?.label}
                <button 
                  onClick={() => setSelectedType('all')}
                  className="hover:text-amber-950"
                >
                  ×
                </button>
              </span>
            )}
            {priceFilter !== 'all' && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm flex items-center gap-2">
                Price: {priceFilter}M
                <button 
                  onClick={() => setPriceFilter('all')}
                  className="hover:text-amber-950"
                >
                  ×
                </button>
              </span>
            )}
            {areaFilter !== 'all' && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm flex items-center gap-2">
                Area: {areaFilter}m²
                <button 
                  onClick={() => setAreaFilter('all')}
                  className="hover:text-amber-950"
                >
                  ×
                </button>
              </span>
            )}
          </motion.div>
        )}
                
        {/* Houses Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-amber-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-amber-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="text-gray-500">Loading available houses...</p>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-red-500 mb-4">
              <AlertCircle size={48} className="mx-auto" />
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">{error}</p>
            <p className="text-gray-500">Please try again later</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Retry
            </button>
          </motion.div>
        ) : filteredAndSortedHouses.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No houses found</p>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search term</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setPriceFilter('all');
                setAreaFilter('all');
              }}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredAndSortedHouses.map((house, index) => (
              <motion.div
                key={house.id}
                variants={itemVariants}
                className="h-full"
              >
                <HouseCard
                  house={house}
                  index={index}
                  formatPrice={formatPrice}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:hidden"
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white rounded-t-3xl p-6 w-full space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>×</button>
              </div>
              
              {/* Mobile filter controls go here */}
              <div className="space-y-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">House Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200"
                  >
                    <option value="all">All Types</option>
                    {houseTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200"
                  >
                    <option value="all">Any Price</option>
                    <option value="100-300">IDR 100M - 300M</option>
                    <option value="300-500">IDR 300M - 500M</option>
                    <option value="500-1000">IDR 500M - 1B</option>
                    <option value="1000">IDR 1B+</option>
                  </select>
                </div>

                {/* Area Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area Range</label>
                  <select
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200"
                  >
                    <option value="all">Any Size</option>
                    <option value="21-36">21 - 36 m²</option>
                    <option value="36-45">36 - 45 m²</option>
                    <option value="45-54">45 - 54 m²</option>
                    <option value="54">54+ m²</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setShowMobileFilters(false);
                  }}
                  className="w-full py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Top Button */}
      <AnimatePresence>
        {isScrolled && (
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-full shadow-lg z-30 transition-colors"
            whileHover={{ scale: 1.1 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
                  