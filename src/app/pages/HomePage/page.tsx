"use client"
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react'; // Import useState
import Navbar from "../../../components/Navbar";

const Hero = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu

  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      {/* Background Image with subtle zoom effect */}
      <div className="absolute inset-0 w-full h-full">
        <motion.img
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="object-cover w-full h-full"
          src="HeroHome.png" 
          alt="Modern luxury house"
        />
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      {/* Navigation Bar */}
      <div className="relative z-10 w-full">
       
        <Navbar />


      </div>

      {/* Hero Content - Responsive adjustments */}
      <motion.div 
        className="absolute bottom-36 md:bottom-20 left-6 md:left-12 z-10 max-w-xs sm:max-w-sm md:max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.h2 
          className="text-3xl sm:text-5xl font-bold text-white leading-tight"
          whileInView={{ textShadow: "0px 2px 4px rgba(0,0,0,0.3)" }}
        >
          Jadikan rumah impian kamu dengan SiapHuni
        </motion.h2>
      </motion.div>

      {/* Right Side Content - Responsive adjustments */}
      <motion.div 
        className="absolute bottom-36 md:bottom-20 right-6 md:right-12 z-10 text-right max-w-xs sm:max-w-sm"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.p 
          className="text-white mb-4 text-sm sm:text-xl leading-tight"
          whileInView={{ textShadow: "0px 2px 4px rgba(0,0,0,0.3)" }}
        >
          Berikan rasa nyaman dalam rumah<br />
          kamu bersama keluarga tercinta
        </motion.p>
        <motion.button 
          className="bg-white px-4 sm:px-6 py-2 rounded-full font-medium text-amber-800 shadow-lg hover:bg-amber-50 transition-colors duration-300"
          whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          Jelajahi Sekarang!
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Hero;