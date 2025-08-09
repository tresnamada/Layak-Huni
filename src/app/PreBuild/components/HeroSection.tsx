"use client"

import { motion } from "framer-motion"
import { Search, ChevronDown, ArrowRight } from "lucide-react"
import { HomeIcon, Tag, MapPin } from "lucide-react"

interface HeroSectionProps {
  searchTerm: string
  selectedType: string
  priceFilter: string
  areaFilter: string
  onSearchChange: (value: string) => void
  onTypeChange: (value: string) => void
  onPriceChange: (value: string) => void
  onAreaChange: (value: string) => void
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
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  }


  const slideInVariants = {
    hidden: { x: -60, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 80,
      },
    },
  }

  const searchBoxVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 90,
        delay: 0.6,
      },
    },
  }

  return (
    <div className="relative min-h-[100vh] lg:h-screen w-full overflow-hidden mt-20">
      {/* Add this right after the opening div of the component */}
      {/* Right side visual elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block overflow-hidden">
        {/* Background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-100/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Floating house cards */}
        <motion.div
          className="absolute top-20 right-8 w-64 h-40 bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, x: 100, rotate: 5 }}
          animate={{ opacity: 1, x: 0, rotate: 5 }}
          transition={{ delay: 1, duration: 0.8, type: "spring", damping: 15 }}
        >
          <div className="h-24 bg-gradient-to-br from-amber-400 to-orange-500"></div>
          <div className="p-4">
            <div className="h-2 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="flex justify-between items-center">
              <div className="h-3 bg-amber-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute top-40 right-24 w-56 h-36 bg-white rounded-2xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, x: 80, rotate: -3 }}
          animate={{ opacity: 1, x: 0, rotate: -3 }}
          transition={{ delay: 1.3, duration: 0.8, type: "spring", damping: 15 }}
        >
          <div className="h-20 bg-gradient-to-br from-blue-400 to-blue-600"></div>
          <div className="p-3">
            <div className="h-2 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="flex justify-between items-center">
              <div className="h-2 bg-blue-200 rounded w-14"></div>
              <div className="h-2 bg-gray-200 rounded w-10"></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute top-64 right-12 w-60 h-38 bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, x: 120, rotate: 2 }}
          animate={{ opacity: 1, x: 0, rotate: 2 }}
          transition={{ delay: 1.6, duration: 0.8, type: "spring", damping: 15 }}
        >
          <div className="h-22 bg-gradient-to-br from-green-400 to-emerald-500"></div>
          <div className="p-4">
            <div className="h-2 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-4/5 mb-2"></div>
            <div className="flex justify-between items-center">
              <div className="h-3 bg-green-200 rounded w-18"></div>
              <div className="h-3 bg-gray-200 rounded w-14"></div>
            </div>
          </div>
        </motion.div>

        {/* Decorative geometric shapes */}
        <motion.div
          className="absolute top-32 right-4 w-16 h-16 bg-amber-200/40 rounded-full"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ delay: 2, duration: 1, ease: "easeOut" }}
        />

        <motion.div
          className="absolute top-80 right-32 w-12 h-12 bg-orange-300/30 rounded-lg rotate-45"
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: 45 }}
          transition={{ delay: 2.2, duration: 0.8, ease: "easeOut" }}
        />

        <motion.div
          className="absolute bottom-40 right-8 w-20 h-20 bg-gradient-to-br from-amber-300/20 to-orange-400/20 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2.4, duration: 0.6, ease: "easeOut" }}
        />

        {/* Floating statistics */}
        <motion.div
          className="absolute bottom-32 right-16 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6, type: "spring", damping: 15 }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">99%</div>
            <div className="text-xs text-gray-600">Customer Satisfaction</div>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-16 right-32 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.6, type: "spring", damping: 15 }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">24/7</div>
            <div className="text-xs text-gray-600">Support Available</div>
          </div>
        </motion.div>

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f59e0b' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-24 pb-12">
        <motion.div
          className="max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          // This ensures the animation only plays once
          transition={{ staggerChildren: 0.15 }}
        >
          <motion.div
            variants={slideInVariants}
            className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/40 to-orange-500/40 text-amber-300 backdrop-blur-sm mb-6 border border-amber-500/20"
          >
            <span className="flex items-center text-slate-900 font-medium gap-2">
              <HomeIcon size={16} className="text-amber-500" />
              Temukan Rumah Impian Anda
            </span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Rumah Siap{" "}
            <motion.span
              className="text-amber-500 relative inline-block"
              initial={{ backgroundSize: "0% 100%" }}
              animate={{ backgroundSize: "100% 100%" }}
              transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
            >
              Bangun
              <motion.span
                className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.4, duration: 0.6, ease: "easeOut" }}
              />
            </motion.span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl"
          >
            Temukan koleksi rumah yang dirancang dengan cermat dan siap untuk dibangun. Setiap desain dibuat dengan
            memperhatikan detail dan standar kehidupan modern.
          </motion.p>

          {/* Search and Filters */}
          <motion.div
            variants={searchBoxVariants}
            className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-gray-100 shadow-xl hover:shadow-2xl transition-shadow"
          >
            {/* Search Bar */}
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors"
                size={20}
              />
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
                  <HomeIcon
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors"
                    size={20}
                  />
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
                  <ChevronDown
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors pointer-events-none"
                    size={20}
                  />
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="relative">
                <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">Rentang Harga</label>
                <div className="relative group">
                  <Tag
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors"
                    size={20}
                  />
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
                  <ChevronDown
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors pointer-events-none"
                    size={20}
                  />
                </div>
              </div>

              {/* Area Filter */}
              <div className="relative">
                <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">Luas Area</label>
                <div className="relative group">
                  <MapPin
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors"
                    size={20}
                  />
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
                  <ChevronDown
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors pointer-events-none"
                    size={20}
                  />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-start pt-2">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
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
              { label: "Rumah Tersedia", value: "500+" },
              { label: "Pelanggan Puas", value: "1000+" },
              { label: "Kota Terjangkau", value: "25+" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                custom={index}
                transition={{ delay: 1.5 + index * 0.2 }}
                className="flex flex-col"
              >
                <motion.span
                  className="text-4xl font-bold text-amber-500"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8 + index * 0.2, duration: 0.5 }}
                >
                  {stat.value}
                </motion.span>
                <span className="text-gray-600 font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
