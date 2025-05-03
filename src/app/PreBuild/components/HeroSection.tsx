import { motion } from 'framer-motion';
import Image from 'next/image';
import { Search, ChevronDown } from 'lucide-react';
import { heroContent, houseTypes, priceRanges, areaRanges } from '../config';
import { HomeIcon, Tag, MapPin } from 'lucide-react';

interface HeroSectionProps {
  searchTerm: string;
  selectedType: string;
  priceFilter: string;
  areaFilter: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onAreaChange: (value: string) => void;
}

export default function HeroSection({
  searchTerm,
  selectedType,
  priceFilter,
  areaFilter,
  onSearchChange,
  onTypeChange,
  onPriceChange,
  onAreaChange,
}: HeroSectionProps) {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/house.jpeg"
          alt="Modern House"
          fill
          className="object-cover w-full h-full"
          priority
          quality={100}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-16">
        <div className="max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            {heroContent.title} <span className="text-amber-400">{heroContent.highlightedWord}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-200 mb-12"
          >
            {heroContent.description}
          </motion.p>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 space-y-6"
          >
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* House Type Filter */}
              <div className="relative">
                <label className="block text-white text-sm mb-2">House Type</label>
                <div className="relative">
                  <HomeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={selectedType}
                    onChange={(e) => onTypeChange(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-white rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {houseTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="relative">
                <label className="block text-white text-sm mb-2">Price Range</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={priceFilter}
                    onChange={(e) => onPriceChange(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-white rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {priceRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              {/* Area Filter */}
              <div className="relative">
                <label className="block text-white text-sm mb-2">Area Size</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={areaFilter}
                    onChange={(e) => onAreaChange(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-white rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {areaRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-end">
              <button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-xl font-medium transition-colors">
                Search
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 