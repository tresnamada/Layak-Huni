"use client"
import { motion, useInView } from 'framer-motion';
import React, { useRef } from 'react';

const Market = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div 
      ref={containerRef}
      className="mt-28 min-h-screen p-4 bg-[#F6F6EC] rounded-lg"
      style={{
        background: "linear-gradient(145deg, #F6F6EC 0%, #E8E8DE 100%)",
        boxShadow: "0 25px 50px -12px rgba(89, 76, 26, 0.15)"
      }}
    >
      <motion.div 
        className="flex flex-col mx-auto max-w-6xl md:flex-row items-center justify-between gap-6"
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
          className="flex flex-col md:flex-row gap-4 w-full md:w-1/2"
          variants={fadeInUp}
        >
          {/* First image */}
          <motion.div 
            className="relative w-full h-full rounded-xl overflow-hidden shadow-lg"
            whileHover={{ 
              scale: 1.03,
              boxShadow: "0 20px 30px rgba(89, 76, 26, 0.2)",
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.img
              src="Market.png"
              alt="Modern living room with sofa"
              className="rounded-xl"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              className="absolute inset-0 bg-[#594C1A] opacity-0 transition-opacity"
              whileHover={{ opacity: 0.1 }}
            />
          </motion.div>

          {/* Second image */}
          <motion.div 
            className="relative w-full md:w-3/4 h-full ml-auto mt-4 md:mt-16 rounded-xl overflow-hidden shadow-lg"
            whileHover={{ 
              scale: 1.03,
              boxShadow: "0 20px 30px rgba(89, 76, 26, 0.2)",
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.img
              src="Market2.png"
              alt="Bright living room with plants"
              className="rounded-xl"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              className="absolute inset-0 bg-[#594C1A] opacity-0 transition-opacity"
              whileHover={{ opacity: 0.1 }}
            />
          </motion.div>
        </motion.div>

        {/* Right side content */}
        <motion.div 
          className="w-full md:w-1/2 flex flex-col items-center justify-center"
          variants={fadeInUp}
        >
          <motion.h1 
            className="text-3xl md:text-6xl font-bold text-[#594C1A] italic text-center"
            whileHover={{ 
              scale: 1.02,
              textShadow: "2px 2px 4px rgba(89, 76, 26, 0.2)"
            }}
          >
            Coba MarketPlace
          </motion.h1>
          
          <motion.div 
            className="flex items-center mb-6"
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <img src="Logo.svg" alt="" className='h-24'/>
          </motion.div>
          
          <motion.div
            className="text-olive-800 text-xl mb-6 font-medium text-start mt-20"
            variants={fadeInUp}
          >
            <motion.span
              className="block"
              whileHover={{ 
                x: 10,
                color: "#938656",
                transition: { duration: 0.2 }
              }}
            >
              Lengkapi hunian impianmu dengan sentuhan modern
            </motion.span>
            <motion.span
              className="block mt-2"
              whileHover={{ 
                x: 10,
                color: "#938656",
                transition: { duration: 0.2 }
              }}
            >
              Yuk jelajahi fitur Marketplace kami sekarang!
            </motion.span>
          </motion.div>
          
          <motion.button 
            className="bg-[#594C1A] text-white px-8 py-3 rounded-lg hover:bg-[#938656] transition-all"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 20px rgba(89, 76, 26, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span className="inline-block">
              Coba Marketplace
              <motion.span
                className="inline-block ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                →
              </motion.span>
            </motion.span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Market