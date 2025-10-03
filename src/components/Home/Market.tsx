"use client"
import { motion, useInView } from 'framer-motion';
import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Market = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div 
      id="market-section"
      ref={containerRef}
      className="mt-28 min-h-screen p-4 sm:p-6 md:p-8 bg-[#F6F6EC]"
    >
      <motion.div 
        className="flex flex-col mx-auto max-w-7xl md:flex-row items-center justify-between gap-8 md:gap-12"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.2
            }
          }
        }}
      >
        {/* Left side images */}
        <motion.div 
          className="flex flex-col md:flex-row gap-6 w-full md:w-1/2"
          variants={fadeInUp}
        >
          {/* First image */}
          <motion.div 
            className="relative w-full h-[150px] sm:h-[400px] md:h-[500px] rounded-xl rounded-tl-[120px] overflow-hidden shadow-lg group"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 30px rgba(89, 76, 26, 0.2)",
            }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/Market.jpeg"
              alt="Rumah Modern Minimalis"
              fill
              className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <motion.div
              className="absolute bottom-0 left-0 p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <h3 className="text-lg sm:text-xl font-medium">Rumah Modern Minimalis</h3>
              <p className="text-sm sm:text-base text-white/80">Desain kontemporer dengan sentuhan modern</p>
            </motion.div>
          </motion.div>

          {/* Second image */}
          <motion.div 
            className="relative w-full md:w-3/4 h-[150px] sm:h-[300px] md:h-[400px] ml-auto mt-4 md:mt-16 rounded-xl rounded-tr-[120px] overflow-hidden shadow-lg group"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 30px rgba(89, 76, 26, 0.2)",
            }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/Market2.jpeg"
              alt="Rumah Modern Minimalis"
              fill
              className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <motion.div
              className="absolute bottom-0 left-0 p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <h3 className="text-lg sm:text-xl font-medium">Rumah Modern Minimalis</h3>
              <p className="text-sm sm:text-base text-white/80">Desain kontemporer dengan sentuhan modern</p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right side content */}
        <motion.div 
          className="w-full md:w-1/2 flex flex-col items-start justify-center gap-6 md:gap-8"
          variants={fadeInUp}
        >
          <motion.div 
            className="flex flex-col gap-2"
            variants={fadeInUp}
          >
            <motion.span 
              className="text-[#594C1A]/80 text-sm sm:text-base font-medium tracking-wider"
              variants={fadeInUp}
            >
              KATALOG PROYEK
            </motion.span>
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#594C1A] leading-tight"
              whileHover={{ 
                scale: 1.02,
                textShadow: "2px 2px 4px rgba(89, 76, 26, 0.2)"
              }}
            >
              Rumah Layak Huni
              <br />
              <span className="text-[#938656]">Berkualitas Premium</span>
            </motion.h1>
          </motion.div>
          
          <motion.div
            className="text-[#594C1A] text-base sm:text-lg md:text-xl font-light leading-relaxed"
            variants={fadeInUp}
          >
            <motion.p
              className="mb-4"
              whileHover={{ 
                x: 10,
                color: "#938656",
                transition: { duration: 0.2 }
              }}
            >
              Temukan rumah impian Anda dengan desain modern dan kualitas premium
            </motion.p>
            <motion.p
              whileHover={{ 
                x: 10,
                color: "#938656",
                transition: { duration: 0.2 }
              }}
            >
              Proses pembelian yang mudah dan transparan
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 w-full"
            variants={fadeInUp}
          >
            <motion.button 
              className="bg-[#594C1A] text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg hover:bg-[#938656] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 20px rgba(89, 76, 26, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center justify-center gap-2">
                <Link href="/PreBuild">
                Lihat Katalog
                </Link>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  →
                </motion.span>
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Market