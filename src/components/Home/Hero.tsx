"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Navbar from "../Navbar"
import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"

const HomePage = () => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  // Enhanced Parallax Effects
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])
  const overlayY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2])
  const blur = useTransform(scrollYProgress, [0, 1], [0, 4])
  
  // Additional layer parallax effects
  const layer1Y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"])
  const layer2Y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"])
  const layer3Y = useTransform(scrollYProgress, [0, 1], ["0%", "60%"])

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.99] },
    },
  }

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  return (
    <main className="relative w-full h-screen bg-[#F6F6EC] overflow-hidden" ref={containerRef}>
      {/* Multi-Layer Parallax Background */}
      <div className="absolute inset-0 w-full h-full">
        {/* Background Layer 3 - Slowest movement */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{ y: layer3Y }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-amber-900/20 z-5" />
        </motion.div>

        {/* Background Layer 2 - Medium movement */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{ y: layer2Y }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-6" />
        </motion.div>

        {/* Main Background Image with Enhanced Parallax */}
        <motion.div
          className="w-full h-full rounded-2xl relative overflow-hidden"
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            opacity: { duration: 1.5 },
          }}
          style={{ 
            y: backgroundY,
            scale: scale,
          }}
        >
          {/* Dynamic Gradient Overlay with Parallax */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50 z-10 rounded-2xl"
            style={{ y: overlayY }}
          />
          
          {/* Floating Particles Effect */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl"
            animate={{ 
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ y: layer1Y }}
          />
          
          <motion.div
            className="absolute top-3/4 right-1/4 w-40 h-40 bg-amber-300/10 rounded-full blur-2xl"
            animate={{ 
              y: [0, 25, 0],
              x: [0, -15, 0],
              scale: [1, 0.8, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            style={{ y: layer2Y }}
          />

          <motion.div
            className="absolute top-1/2 right-1/3 w-24 h-24 bg-blue-300/8 rounded-full blur-xl"
            animate={{ 
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
            style={{ y: layer3Y }}
          />

          {/* Main Image with Blur Effect on Scroll */}
          <motion.div
            style={{ filter: `blur(${blur}px)` }}
            className="w-full h-full"
          >
            <Image
              className="object-cover w-full h-full rounded-2xl"
              src="/house.jpeg"
              alt="Modern luxury house"
              fill
              priority
            />
          </motion.div>

          {/* Logo with Enhanced Parallax */}
          <motion.div
            className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 lg:top-10 lg:left-10 z-20 w-16 sm:w-20 md:w-24 lg:w-28"
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ y: contentY }}
          >
          </motion.div>

          {/* Hero Content with Multi-layer Parallax */}
          <motion.div
            className="absolute inset-x-0 bottom-0 z-20"
            style={{ 
              opacity: opacity,
              y: contentY
            }}
          >
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-20 pb-4 sm:pb-8 md:pb-12 lg:pb-20">
              <motion.div
                className="flex flex-col gap-4 sm:gap-5 md:gap-6 lg:gap-8"
                variants={stagger}
                initial="hidden"
                animate="visible"
              >
                {/* Top Section - Project Info with Parallax */}
                <motion.div 
                  className="flex flex-col gap-1 sm:gap-2" 
                  variants={fadeInUp}
                  style={{ y: layer1Y }}
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
                    LayakHuni - Solusi Hunian Modern
                  </motion.h2>
                </motion.div>

                {/* Main Content with Enhanced Parallax */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                  {/* Left side - Main heading with Parallax */}
                  <motion.div 
                    className="max-w-[85%] sm:max-w-[75%] md:max-w-xl lg:max-w-2xl" 
                    variants={fadeInUp}
                    style={{ y: layer2Y }}
                  >
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-md">
                      <motion.span 
                        className="block" 
                        variants={fadeInUp}
                        style={{ y: layer1Y }}
                      >
                        Rumah Impian
                      </motion.span>
                      <motion.span 
                        className="block text-amber-100/90" 
                        variants={fadeInUp}
                        style={{ y: layer2Y }}
                      >
                        Tanpa Proses Ribet
                      </motion.span>
                    </h1>
                  </motion.div>

                  {/* Right side - Subtext and CTA with Parallax */}
                  <motion.div 
                    className="flex flex-col items-start gap-3 sm:gap-4 w-full md:w-auto" 
                    variants={fadeInUp}
                    style={{ y: layer1Y }}
                  >
                    <motion.p
                      className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg max-w-full md:max-w-sm font-light leading-relaxed drop-shadow-sm"
                      variants={fadeInUp}
                    >
                      Platform terpercaya untuk menemukan
                      <br />
                      rumah siap huni berkualitas premium
                    </motion.p>
                    <motion.div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full" variants={fadeInUp}>
                      <motion.button
                        className="bg-white/95 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-red-800 font-medium text-xs sm:text-sm hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto backdrop-blur-sm"
                        variants={fadeInUp}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        aria-label="Lihat Proyek"
                      >
                        <Link href="/PreBuild">Lihat Proyek</Link>
                      </motion.button>
                      <motion.button
                        className="bg-transparent border-2 border-white/80 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-white font-medium text-xs sm:text-sm hover:bg-white/10 focus:outline-none transition-all duration-300 w-full sm:w-auto backdrop-blur-sm"
                        variants={fadeInUp}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          const marketSection = document.getElementById("market-section")
                          if (marketSection) {
                            marketSection.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            })
                          }
                        }}
                        aria-label="Pelajari Lebih Lanjut"
                      >
                        Pelajari Lebih Lanjut
                      </motion.button>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Scroll Indicator with Parallax */}
          <motion.div
            className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            style={{ y: layer3Y }}
          >
            <motion.div
              className="w-4 h-6 sm:w-5 sm:h-8 md:w-6 md:h-10 border-2 border-white/50 rounded-full flex justify-center items-start pt-0.5 sm:pt-1 md:pt-1.5 backdrop-blur-sm"
              initial={{ y: 0 }}
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <motion.div
                className="w-1 h-1.5 sm:h-2 bg-white rounded-full"
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation with Subtle Parallax */}
      <motion.div 
      >
        <Navbar />
      </motion.div>
    </main>
  )
}

export default HomePage