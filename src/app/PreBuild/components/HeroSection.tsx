import { motion } from 'framer-motion';
import { Search, ChevronDown, ArrowRight } from 'lucide-react';
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
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-[90vh] lg:h-screen w-full overflow-hidden">

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-24 pb-12">
        <motion.div 
          className="max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/40 to-orange-500/40 text-amber-300 backdrop-blur-sm mb-6 border border-amber-500/20"
          >
            <span className="flex items-center text-amber-500 font-medium gap-2">
              <HomeIcon size={16} className="text-amber-500" />
              Temukan Rumah Impian Anda
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-6"
          >
            Rumah Siap{' '}
            <span className="text-amber-500 relative">
              Bangun
              <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full" />
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl"
          >
            Temukan koleksi rumah yang dirancang dengan cermat dan siap untuk dibangun. Setiap desain dibuat dengan memperhatikan detail dan standar kehidupan modern.
          </motion.p>

          {/* Search and Filters */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-gray-100 shadow-xl hover:shadow-2xl transition-shadow"
          >
            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau deskripsi..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all hover:bg-gray-100"
              />
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* House Type Filter */}
              <div className="relative">
                <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">Tipe Rumah</label>
                <div className="relative group">
                  <HomeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors" size={20} />
                  <select
                    value={selectedType}
                    onChange={(e) => onTypeChange(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-gray-50 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all hover:bg-gray-100 cursor-pointer text-gray-700"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="type1">Tipe 36</option>
                    <option value="type2">Tipe 45</option>
                    <option value="type3">Tipe 54</option>
                    <option value="type4">Tipe 60</option>
                    <option value="type5">Tipe 70</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors pointer-events-none" size={20} />
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="relative">
                <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">Rentang Harga</label>
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors" size={20} />
                  <select
                    value={priceFilter}
                    onChange={(e) => onPriceChange(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-gray-50 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all hover:bg-gray-100 cursor-pointer text-gray-700"
                  >
                    <option value="">Semua Harga</option>
                    <option value="range1">Dibawah 300 Juta</option>
                    <option value="range2">300 Juta - 500 Juta</option>
                    <option value="range3">500 Juta - 800 Juta</option>
                    <option value="range4">800 Juta - 1 Miliar</option>
                    <option value="range5">Diatas 1 Miliar</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors pointer-events-none" size={20} />
                </div>
              </div>

              {/* Area Filter */}
              <div className="relative">
                <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">Luas Area</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors" size={20} />
                  <select
                    value={areaFilter}
                    onChange={(e) => onAreaChange(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-gray-50 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all hover:bg-gray-100 cursor-pointer text-gray-700"
                  >
                    <option value="">Semua Area</option>
                    <option value="area1">Dibawah 100 m²</option>
                    <option value="area2">100 - 150 m²</option>
                    <option value="area3">150 - 200 m²</option>
                    <option value="area4">200 - 300 m²</option>
                    <option value="area5">Diatas 300 m²</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors pointer-events-none" size={20} />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-end pt-2">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-medium transition-all flex items-center gap-2 group shadow-lg hover:shadow-xl"
              >
                <span>Cari Sekarang</span>
                <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-12 mt-12"
          >
            {[
              { label: 'Rumah Tersedia', value: '500+' },
              { label: 'Pelanggan Puas', value: '1000+' },
              { label: 'Kota Terjangkau', value: '25+' }
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="flex flex-col"
              >
                <span className="text-4xl font-bold text-amber-500">{stat.value}</span>
                <span className="text-gray-600 font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 