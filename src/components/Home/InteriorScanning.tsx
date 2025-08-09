import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Scan, Camera, Sparkles, Zap, Upload } from 
'lucide-react';
import Link from 'next/link';
export default function InteriorScanning() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  return (
    <motion.div 
      ref={containerRef}
      className="p-4 sm:p-6 md:p-8 rounded-3xl max-w-7xl mx-auto my-8 min-h-screen flex items-center justify-center bg-[#F6F6EC] mt-[100px] mb-[100px]"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={{
        background: "linear-gradient(145deg, #F6F6EC 0%, #E8E8DE 100%)",
        boxShadow: "0 25px 50px -12px rgba(139, 69, 19, 0.15)"
      }}
    >
      <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 w-full">
        
        {/* Left Content */}
        <motion.div 
          className="w-full lg:w-1/2 space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div className="flex flex-col gap-2">
            <motion.span 
              className="text-[#594C1A]/80 text-sm sm:text-base font-medium tracking-wider"
              variants={containerVariants}
              
            >
              INTERIOR SCANNING AI
            </motion.span>
            <motion.h2 
              className="text-3xl text-[#594C1A]/80 sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              whileHover={{ 
                scale: 1.02,
              
              }}
            >
              Transform Ruangan
              <br />
              <span className="text-[#594C1A]/80">dengan AI Smart</span>
            </motion.h2>
          </motion.div>

          <motion.div className="space-y-4">
            <motion.p 
              className="text-[#594C1A]/80 text-base sm:text-lg md:text-xl font-light leading-relaxed"
              whileHover={{ 
                x: 10,
                color: "#A0522D",
                transition: { duration: 0.2 }
              }}
            >
              Upload foto ruangan dan dapatkan rekomendasi furnitur pintar dengan analisis AI
            </motion.p>
            <motion.p 
              className="text-[#8B4513] text-base sm:text-lg md:text-xl font-light leading-relaxed"
              whileHover={{ 
                x: 10,
                color: "#A0522D",
                transition: { duration: 0.2 }
              }}
            >
              Estimasi budget real-time dan penempatan furnitur yang optimal untuk ruang Anda
            </motion.p>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 w-full"
            variants={containerVariants}
          >
            <motion.button 
              className="bg-[#594C1A]/80 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg  transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 20px rgba(139, 69, 19, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/interior-scanning">
              <span className="flex items-center justify-center gap-2">
                <Scan className="w-5 h-5" />
                Mulai Scanning
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  →
                </motion.span>
              </span>
              </Link>
            </motion.button>
            <motion.button 
              className="bg-transparent border-2 border-[#8B4513] text-[#8B4513] px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-[#8B4513]/5 transition-all w-full sm:w-auto"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 20px rgba(139, 69, 19, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Lihat Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Visual Grid */}
        <motion.div 
          className="w-full lg:w-1/2 grid grid-cols-2 gap-4"
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Upload Area */}
          <motion.div 
            className="relative h-[200px] sm:h-[250px] md:h-[300px] rounded-xl overflow-hidden group bg-white shadow-lg"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 30px rgba(139, 69, 19, 0.2)",
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#8B4513]/30 rounded-xl">
              <Upload className="w-16 h-16 text-[#8B4513]/60 mb-4" />
              <p className="text-[#8B4513] font-medium text-center">Upload Foto</p>
              <p className="text-[#8B4513]/60 text-sm text-center mt-2">Drag & drop ruangan</p>
            </div>
            <motion.div
              className="absolute top-4 right-4 bg-[#8B4513] text-white p-2 rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Camera className="w-4 h-4" />
            </motion.div>
          </motion.div>

          {/* AI Analysis */}
          <motion.div 
            className="relative h-[200px] sm:h-[250px] md:h-[300px] rounded-xl overflow-hidden group bg-white shadow-lg mt-8"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 30px rgba(139, 69, 19, 0.2)",
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-full p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-[#8B4513]" />
                <span className="text-[#8B4513] font-medium">AI Analysis</span>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg relative overflow-hidden">
                {/* Simulated room layout */}
                <div className="absolute inset-4">
                  <div className="w-full h-full relative">
                    <div className="absolute top-2 left-2 w-8 h-6 bg-[#8B4513] rounded opacity-70"></div>
                    <div className="absolute bottom-2 right-2 w-6 h-8 bg-[#A0522D] rounded opacity-70"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#8B4513] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <motion.div
              className="absolute top-4 right-4 bg-[#8B4513] text-white p-2 rounded-full"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </motion.div>

          {/* Smart Recommendations */}
          <motion.div 
            className="relative h-[200px] sm:h-[250px] md:h-[300px] rounded-xl overflow-hidden group bg-white shadow-lg"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 30px rgba(139, 69, 19, 0.2)",
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-full p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#8B4513]" />
                <span className="text-[#8B4513] font-medium">Smart Tips</span>
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#8B4513] rounded"></div>
                    <span className="text-xs font-medium">Sofa</span>
                  </div>
                  <span className="text-xs text-[#8B4513]">2.5M</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#A0522D] rounded"></div>
                    <span className="text-xs font-medium">Table</span>
                  </div>
                  <span className="text-xs text-[#8B4513]">800K</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#8B4513] rounded"></div>
                    <span className="text-xs font-medium">Shelf</span>
                  </div>
                  <span className="text-xs text-[#8B4513]">1.2M</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Budget Optimization */}
          <motion.div 
            className="relative h-[200px] sm:h-[250px] md:h-[300px] rounded-xl overflow-hidden group bg-white shadow-lg mt-8"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 30px rgba(139, 69, 19, 0.2)",
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-full p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#8B4513]/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-[#8B4513]">4.5M</span>
              </div>
              <p className="text-[#8B4513] font-medium">Total Budget</p>
              <p className="text-[#8B4513]/60 text-sm mt-1">Optimized for you</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <motion.div 
                  className="bg-[#8B4513] h-2 rounded-full"
                  initial={{ width: "0%" }}
                  animate={isInView ? { width: "75%" } : { width: "0%" }}
                  transition={{ duration: 1.5, delay: 1 }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </motion.div>
  );
}