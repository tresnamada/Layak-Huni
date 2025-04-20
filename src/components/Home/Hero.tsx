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

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <main className="relative w-full h-screen bg-[#F6F6EC] overflow-hidden" ref={containerRef}>
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-t to-transparent">
        <motion.img
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 0.90, opacity: 1 }}
          transition={{ 
            duration: 5, 
            ease: "easeOut",
            opacity: { duration: 1.5 }
          }}
          style={{ y }}
          className="object-cover w-full h-full"
          src="/HeroHome.png"
          alt="Modern luxury house"
        />
      </div>

      {/* Logo */}
      <motion.div
        className="absolute top-20 left-40 z-30 w-32 md:w-40"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <Image
          src="LogoPutih.svg"
          alt="SiapHuni Logo"
          width={247}
          height={106}
          className="w-full h-auto"
          priority
        />
      </motion.div>

      {/* Navigation */}
      <div className="relative z-20">
        <Navbar />
      </div>

      {/* Hero Content - Positioned at bottom */}
      <motion.div 
        className="absolute inset-x-0 bottom-0 z-20"
        style={{ opacity }}
      >
        <div className="container mx-auto px-10 md:px-20 pb-20">
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-end gap-6 md:gap-2"
            variants={stagger}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            {/* Left side - Main heading */}
            <motion.div 
              className="max-w-xl"
              variants={fadeInUp}
            >
              <h1 className="text-5xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                <motion.span 
                  className="block"
                  variants={fadeInUp}
                >
                  Jadikan rumah
                </motion.span>
                <motion.span 
                  className="block"
                  variants={fadeInUp}
                >
                  impian kamu
                </motion.span>
                <motion.span 
                  className="block"
                  variants={fadeInUp}
                >
                  dengan SiapHuni
                </motion.span>
              </h1>
            </motion.div>

            {/* Right side - Subtext and CTA */}
            <motion.div 
              className="text-right flex flex-col items-end gap-4"
              variants={fadeInUp}
            >
              <motion.p 
                className="text-white text-base md:text-lg text-right max-w-sm"
                variants={fadeInUp}
              >
                Berikan rasa nyaman dalam rumah
                <br />
                kamu bersama keluarga tercinta
              </motion.p>
              <motion.button 
                className="bg-white px-8 py-3 rounded-full text-red-800 font-medium text-base hover:bg-red-50 transition-all duration-300 shadow-lg relative overflow-hidden group"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Jelajahi Sekarang!</span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-white via-red-50 to-white"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <motion.div 
          className="w-1 h-12 rounded-full bg-white/30 relative overflow-hidden"
          animate={{ 
            boxShadow: ["0 0 10px rgba(255,255,255,0.3)", "0 0 20px rgba(255,255,255,0.5)", "0 0 10px rgba(255,255,255,0.3)"] 
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div 
            className="w-full bg-white absolute top-0 bottom-0"
            initial={{ y: '-100%' }}
            animate={{ y: '100%' }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </main>
  );
};

export default HomePage;