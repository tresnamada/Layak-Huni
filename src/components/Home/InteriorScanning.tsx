import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Scan, Camera, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

export default function InteriorScanning() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div 
      className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"

    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5 bg-[url('/pattern-light.svg')]" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#594C1A]/5 to-transparent" />

      <motion.div 
        ref={containerRef}
        className="relative max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left Content - Text */}
          <motion.div 
            className="w-full lg:w-1/2 space-y-8"
            variants={itemVariants}
          >
            <div className="space-y-4">
              <motion.div 
                className="flex items-center gap-2 text-[#594C1A]/70 uppercase tracking-wider text-sm font-medium"
                variants={itemVariants}
              >
                <div className="w-4 h-px bg-[#594C1A]/50" />
                SiapHuni Interior
              </motion.div>
              
              <motion.h2 
                className="text-4xl sm:text-5xl font-bold text-[#594C1A] leading-tight"
                variants={itemVariants}
              >
                Ubah Ruangan Anda <br />
                <span className="text-[#938656]">dengan Desain Cerdas</span>
              </motion.h2>
              
              <motion.p 
                className="text-lg text-[#594C1A]/80"
                variants={itemVariants}
              >
                AI kami menganalisis dimensi, pencahayaan, dan arsitektur ruangan Anda untuk menciptakan tata letak furnitur yang sempurna.
              </motion.p>
            </div>

            <motion.div 
              className="grid grid-cols-2 gap-4 "
              variants={containerVariants}
            >
              {[
                { icon: <Zap className="w-5 h-5" />, text: "Tata Letak Instan" },
                { icon: <Camera className="w-5 h-5" />, text: "Pratinjau 3D" },
                { icon: <Sparkles className="w-5 h-5" />, text: "Kesesuaian Gaya" },
                { icon: <Scan className="w-5 h-5" />, text: "Pemindaian Presisi" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-[#E8E8DE]"
                  variants={itemVariants}
                  whileHover={{ y: -5, boxShadow: "0 5px 15px rgba(139, 69, 19, 0.1)" }}
                >
                  <div className="p-2 bg-[#594C1A]/10 rounded-full text-[#8B4513]">
                    {item.icon}
                  </div>
                  <span className="font-medium text-[#594C1A]">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 pt-4 "
              variants={itemVariants}
            >
              <motion.button
                className="flex-1 bg-[#594C1A] text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-opacity-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/interior-scanning" className="flex items-center gap-2">
                  <Scan className="w-5 h-5" />
                  Mulai Scanning
                </Link>
              </motion.button>
              
            </motion.div>
          </motion.div>

          {/* Right Content - Visual Grid */}
          <motion.div 
            className="w-full lg:w-1/2 grid grid-cols-2 gap-6 hidden lg:block"
            variants={containerVariants}
          >


            {/* Analysis Card */}
            <motion.div
              className="bg-white rounded-xl p-6 border border-[#E8E8DE] overflow-hidden relative"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="absolute top-6 right-6 bg-[#594C1A] text-white p-2 rounded-full animate-spin-slow">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#594C1A]/10 rounded-full text-[#8B4513]">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-medium text-[#594C1A]">Analisis AI</h3>
                </div>
                <div className="flex-1 bg-[#FAF9F5] rounded-lg relative overflow-hidden">
                  {/* Room visualization */}
                  <div className="absolute inset-4 flex items-center justify-center">
                    <div className="w-full h-full relative">
                      <div className="absolute top-2 left-2 w-8 h-6 bg-[#8B4513]/20 rounded"></div>
                      <div className="absolute bottom-2 right-2 w-6 h-8 bg-[#8B4513]/20 rounded"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#8B4513]/30 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recommendations Card */}
            <motion.div
              className="bg-white rounded-xl p-6 border border-[#E8E8DE] overflow-hidden"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#594C1A]/10 rounded-full text-[#8B4513]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-medium text-[#594C1A]">Rekomendasi</h3>
                </div>
                <div className="space-y-3 flex-1">
                  {[
                    { name: "Sofa Modern", price: "2.5JT", color: "bg-[#8B4513]/80" },
                    { name: "Meja Kopi", price: "1.2JT", color: "bg-[#A0522D]/80" },
                    { name: "Rak Buku", price: "800RB", color: "bg-[#8B4513]/60" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#FAF9F5] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm font-medium text-[#594C1A]">{item.name}</span>
                      </div>
                      <span className="text-sm text-[#8B4513] font-medium">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}