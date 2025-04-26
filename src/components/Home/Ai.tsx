// components/SiHuniHomeDesign.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function SiHuniHomeDesign() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [isHovered, setIsHovered] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [showFeatures, setShowFeatures] = useState(false);
  
  const fullText = "Bingung mau design rumah seperti apa? Biarkan aku, SiHuni, membantumu! Cukup tanyakan gaya dan kebutuhan rumah impianmu, dan aku akan mencarikan inspirasi terbaik untukmu.";
  
  useEffect(() => {
    if (isTyping && typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, Math.random() * 30 + 15);
      return () => clearTimeout(timeout);
    } else if (typedText.length === fullText.length) {
      setIsTyping(false);
      setTimeout(() => setShowFeatures(true), 500);
    }
  }, [typedText, isTyping, fullText]);

  const styles = [
    { 
      id: 'modern', 
      name: 'Modern Minimalis', 
      icon: '🏠',
      description: 'Desain simpel dengan garis-garis bersih dan ruang terbuka'
    },
    { 
      id: 'traditional', 
      name: 'Tradisional Modern', 
      icon: '🏡',
      description: 'Perpaduan unsur tradisional dengan sentuhan modern'
    },
    { 
      id: 'industrial', 
      name: 'Industrial', 
      icon: '🏢',
      description: 'Gaya urban dengan material ekspos dan detail metal'
    },
    { 
      id: 'scandinavian', 
      name: 'Scandinavian', 
      icon: '🏘️',
      description: 'Desain minimalis dengan kehangatan natural'
    },
  ];

  const features = [
    { icon: '🎨', title: 'Desain Kustom', desc: 'Sesuaikan dengan kebutuhan' },
    { icon: '💡', title: 'AI Powered', desc: 'Rekomendasi cerdas' },
    { icon: '🏗️', title: 'Detail Lengkap', desc: 'Spesifikasi terperinci' },
    { icon: '💰', title: 'Estimasi Biaya', desc: 'Perhitungan akurat' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      ref={containerRef}
      className="relative min-h-screen bg-[#F6F6EC] overflow-hidden py-20 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {/* Enhanced Background Patterns */}
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-[#594C1A]/5 via-transparent to-[#938656]/5"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </motion.div>

      {/* Main Content Container */}
      <div className="relative max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
        >
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#594C1A] mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Desain Rumah Impianmu
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl text-[#594C1A]/80 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Bersama SiHuni, asisten AI yang memahami selera dan kebutuhanmu
          </motion.p>
        </motion.div>

        {/* Enhanced Interactive Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Enhanced Character and Chat */}
          <motion.div 
            className="relative"
            variants={itemVariants}
          >
            {/* Enhanced SiHuni Character */}
            <motion.div
              className="relative w-64 h-64 mx-auto mb-8"
              animate={{
                y: [0, -10, 0],
                rotate: isHovered ? [0, -5, 5, 0] : 0
              }}
              transition={{
                y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                rotate: { duration: 0.5 }
              }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              <div className="absolute inset-0 bg-[#594C1A]/5 rounded-full filter blur-xl transform scale-90" />
              <Image
                src="/SiHuni.svg"
                alt="SiHuni Character"
                layout="fill"
                className="object-contain drop-shadow-2xl"
                priority
              />
              {isHovered && (
                <motion.div
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <p className="text-[#594C1A] text-sm font-medium">Hai! 👋</p>
                </motion.div>
              )}
            </motion.div>

            {/* Enhanced Chat Bubble */}
            <motion.div
              className="relative bg-white rounded-2xl p-6 shadow-xl"
              variants={itemVariants}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white to-[#F6F6EC]/50 rounded-2xl" />
              <div className="relative text-[#594C1A] text-lg">
                {typedText}
                {isTyping && (
                  <motion.span
                    className="inline-block w-2 h-5 bg-[#594C1A] ml-1"
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  />
                )}
              </div>
              
              {/* Enhanced Decorative Elements */}
              <motion.div
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-lg"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [45, 45, 45]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Feature Cards */}
            <AnimatePresence>
              {showFeatures && (
                <motion.div
                  className="grid grid-cols-2 gap-4 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg"
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="text-2xl mb-2 block">{feature.icon}</span>
                      <h4 className="font-medium text-[#594C1A]">{feature.title}</h4>
                      <p className="text-sm text-[#594C1A]/70">{feature.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Column - Enhanced Style Selection */}
          <motion.div 
            className="space-y-6"
            variants={itemVariants}
          >
            <h3 className="text-2xl font-semibold text-[#594C1A] mb-8">
              Pilih Gaya Rumah Impianmu
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {styles.map((style) => (
                <motion.button
                  key={style.id}
                  className={`p-6 rounded-xl text-left transition-all relative overflow-hidden ${
                    selectedStyle === style.id
                      ? 'bg-[#594C1A] text-white'
                      : 'bg-white/80 text-[#594C1A] hover:bg-[#594C1A]/10'
                  }`}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 10px 30px rgba(89, 76, 26, 0.1)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedStyle(style.id)}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                    initial={{ x: '-100%', opacity: 0.5 }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.8 }}
                  />
                  <span className="text-2xl mb-2 block">{style.icon}</span>
                  <h4 className="font-medium text-lg mb-1">{style.name}</h4>
                  <p className={`text-sm ${
                    selectedStyle === style.id ? 'text-white/80' : 'text-[#594C1A]/60'
                  }`}>
                    {style.description}
                  </p>
                  {selectedStyle === style.id && (
                    <motion.div
                      className="absolute top-2 right-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Enhanced CTA Button */}
            <motion.button
              className="w-full mt-8 bg-[#594C1A] text-white py-4 px-8 rounded-xl font-medium text-lg
                       hover:bg-[#938656] transition-colors relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent"
                style={{ opacity: 0.1 }}
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.8 }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Mulai Konsultasi
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </span>
            </motion.button>

            {/* Progress Indicator */}
            {selectedStyle && (
              <motion.div
                className="mt-6 flex justify-center items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-2 h-2 rounded-full bg-[#594C1A]" />
                <div className="w-20 h-1 bg-[#594C1A]/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#594C1A]"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <span className="text-sm text-[#594C1A]/60">1/3</span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}