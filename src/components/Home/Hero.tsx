"use client"

import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from "../Navbar";
import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

const HomePage = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.99] }
    }
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <main className="relative w-full h-screen bg-[#F6F6EC] overflow-hidden" ref={containerRef}>
      {/* Background Image with Enhanced Overlay */}
      <div className="absolute inset-0 w-full h-full">
        <motion.div 
          className="w-full h-full rounded-2xl"
          animate={{ scale: 0.9, opacity: 1 }} 
          transition={{ 
            duration: 1.5, 
            ease: "easeOut",
            opacity: { duration: 1.5 }
          }}
          style={{ y }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40 z-10 rounded-2xl" />
          <Image
            className="object-cover w-full h-full rounded-2xl"
            src="/House.jpeg"
            alt="Modern luxury house"
            layout="fill"
            objectFit="cover"
            priority
          />
          {/* Logo inside background image */}
          <motion.div
            className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 lg:top-10 lg:left-10 z-20 w-16 sm:w-20 md:w-24 lg:w-28"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Image
              src="icon/LogoPutih.svg"
              alt="SiapHuni Logo"
              width={247}
              height={106}
              className="w-full h-auto drop-shadow-lg rounded"
              priority
            />
          </motion.div>

          {/* Hero Content inside background image */}
          <motion.div 
            className="absolute inset-x-0 bottom-0 z-20"
            style={{ opacity }}
          >
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-20 pb-4 sm:pb-8 md:pb-12 lg:pb-20">
              <motion.div 
                className="flex flex-col gap-4 sm:gap-5 md:gap-6 lg:gap-8"
                variants={stagger}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
              >
                {/* Top Section - Project Info */}
                <motion.div 
                  className="flex flex-col gap-1 sm:gap-2"
                  variants={fadeInUp}
                >
                  <motion.span 
                    className="text-white/80 text-[10px] sm:text-xs md:text-sm font-medium tracking-wider drop-shadow-sm"
                    variants={fadeInUp}
                  >
                    SELAMAT DATANG DI
                  </motion.span>
                  <motion.h2 
                    className="text-white/90 text-xs sm:text-sm md:text-base font-light drop-shadow-sm"
                    variants={fadeInUp}
                  >
                    SiapHuni - Solusi Hunian Modern
                  </motion.h2>
                </motion.div>

                {/* Main Content */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                  {/* Left side - Main heading */}
                  <motion.div 
                    className="max-w-[85%] sm:max-w-[75%] md:max-w-xl lg:max-w-2xl"
                    variants={fadeInUp}
                  >
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-md">
                      <motion.span className="block" variants={fadeInUp}>Rumah Impian</motion.span>
                      <motion.span className="block text-amber-100/90" variants={fadeInUp}>Tanpa Proses Ribet</motion.span>
                    </h1>
                  </motion.div>

                  {/* Right side - Subtext and CTA */}
                  <motion.div 
                    className="flex flex-col items-start gap-3 sm:gap-4 w-full md:w-auto"
                    variants={fadeInUp}
                  >
                    <motion.p 
                      className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg max-w-full md:max-w-sm font-light leading-relaxed drop-shadow-sm"
                      variants={fadeInUp}
                    >
                      Platform terpercaya untuk menemukan
                      <br />
                      rumah siap huni berkualitas premium
                    </motion.p>
                    <motion.div 
                      className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full"
                      variants={fadeInUp}
                    >
                      <motion.button 
                        className="bg-white/95 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-red-800 font-medium text-xs sm:text-sm hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto backdrop-blur-sm"
                        variants={fadeInUp}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Lihat Proyek
                      </motion.button>
                      <motion.button 
                        className="bg-transparent border-2 border-white/80 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-white font-medium text-xs sm:text-sm hover:bg-white/10 focus:outline-none transition-all duration-300 w-full sm:w-auto backdrop-blur-sm"
                        variants={fadeInUp}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Pelajari Lebih Lanjut
                      </motion.button>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <motion.div 
              className="w-4 h-6 sm:w-5 sm:h-8 md:w-6 md:h-10 border-2 border-white/50 rounded-full flex justify-center items-start pt-0.5 sm:pt-1 md:pt-1.5 backdrop-blur-sm"
              initial={{ y: 0 }}
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div 
                className="w-1 h-1.5 sm:h-2 bg-white rounded-full"
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="relative z-20">
        <Navbar />
      </div>
    </main>
  );
};

export default HomePage;