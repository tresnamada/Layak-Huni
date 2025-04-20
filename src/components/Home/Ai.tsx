// components/SiHuniHomeDesign.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SiHuniHomeDesign() {
  const [isHovered, setIsHovered] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [typingComplete, setTypingComplete] = useState(false);
  
  // Full text to be typed
  const fullText = "Bingung mau design rumah seperti apa? Biarkan aku, SiHuni, membantumu! Cukup tanyakan gaya dan kebutuhan rumah impianmu, dan aku akan mencarikan inspirasi terbaik untukmu.";
  
  // Typing effect
  useEffect(() => {
    if (isTyping && typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, Math.random() * 50 + 20); // Random typing speed for natural effect
      
      return () => clearTimeout(timeout);
    } else if (typedText.length === fullText.length) {
      setIsTyping(false);
      setTypingComplete(true);
    }
  }, [typedText, isTyping, fullText]);
  
  // Sophisticated earthy color palette for elegance and comfort
  const colors = {
    primary: '#5A5342',    // Deep taupe
    secondary: '#8C7B6C',  // Warm greige
    background: '#F9F7F3', // Soft ivory
    accent: '#A69788',     // Muted clay
    lightAccent: '#E0DAD2',// Warm light gray
    text: '#3D3A35',       // Soft black
    highlight: '#C4B6A6'   // Warm beige
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 md:p-8"
         style={{ 
           backgroundColor: colors.background,
           fontFamily: "'Inter', sans-serif",
           backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(228, 222, 210, 0.2) 0%, transparent 50%)'
         }}>
      
      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-0 w-full h-32 opacity-5 pointer-events-none"
           style={{ 
             backgroundImage: 'linear-gradient(to bottom, #5A5342, transparent)',
           }} />
      
      {/* Header with refined typography */}
      <div className="relative w-full max-w-5xl mb-16">
        <motion.div 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '100%' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-px mb-8 bg-gradient-to-r from-transparent via-current to-transparent"
          style={{ color: colors.primary }}
        />
        
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-5xl font-normal text-center tracking-tight leading-tight"
          style={{ color: colors.text }}
        >
          <span className="font-medium" style={{ color: colors.primary }}>Kenalan</span> dengan{' '}
          <span className="font-medium" style={{ color: colors.primary }}>SiHuni</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-4 text-center text-lg font-light max-w-2xl mx-auto"
          style={{ color: colors.secondary }}
        >
          Asisten desain rumah yang memahami gaya dan kebutuhan Anda
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '100%' }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="h-px mt-8 bg-gradient-to-r from-transparent via-current to-transparent"
          style={{ color: colors.primary }}
        />
      </div>
      
      {/* Main content with improved layout */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl gap-12 mb-16">
        {/* Speech bubble with refined styling and typing animation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl p-8 max-w-md order-2 md:order-1"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${colors.lightAccent}`,
            backdropFilter: 'blur(8px)'
          }}
        >
          {/* Speech bubble tip */}
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-0 h-0 
                          border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent"
               style={{ borderLeftColor: 'rgba(255, 255, 255, 0.8)' }} />
               
          <div className="text-lg font-light leading-relaxed" style={{ color: colors.text }}>
            {/* Typed text with cursor */}
            <span>
              {typedText.split('SiHuni').map((part, i, arr) => {
                // If this is not the last part and there are more parts coming
                if (i < arr.length - 1) {
                  return (
                    <span key={i}>
                      {part}
                      <span className="font-medium" style={{ color: colors.primary }}>SiHuni</span>
                    </span>
                  );
                }
                return <span key={i}>{part}</span>;
              })}
            </span>
            
            {/* Blinking cursor */}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-2 h-4 ml-1 bg-current"
                style={{ verticalAlign: 'middle' }}
              />
            )}
          </div>
          
          {/* Animated emoji with enhanced animation */}
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              y: [0, -3, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "reverse",
              duration: 4,
            }}
            className="absolute -bottom-6 right-8 text-3xl"
          >
            🏡
          </motion.div>
          
          {/* Typing indicator dots (visible only when typing) */}
          {isTyping && (
            <div className="absolute bottom-3 left-8 flex space-x-1">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                className="w-2 h-2 rounded-full bg-gray-400"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-gray-400"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-gray-400"
              />
            </div>
          )}
        </motion.div>
        
        {/* SiHuni character with refined design and enhanced animation */}
        <motion.img
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ 
            scale: 1.03,
            transition: { duration: 0.3 }
          }}
          src="pacarelang.jpg"
          alt="SiHuni character"
          className="w-full max-w-md order-1 md:order-2"
          style={{ filter: 'drop-shadow(0 15px 10px rgba(0, 0, 0, 0.05))' }}
        />
      </div>
      
      {/* Primary CTA button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: 0.9, 
          duration: 0.5,
          type: "spring",
          stiffness: 200
        }}
        whileHover={{ 
          scale: 1.05,
          backgroundColor: colors.secondary,
          boxShadow: `0 15px 35px ${colors.accent}60`,
          y: -3
        }}
        whileTap={{ 
          scale: 0.95,
          boxShadow: `0 5px 15px ${colors.accent}40`
        }}
        onClick={() => {
          setShowOptions(!showOptions);
          // Add subtle vibration effect on click
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }}
        className="relative mt-4 px-12 py-4 font-medium tracking-wide text-lg cursor-pointer rounded-lg overflow-hidden group"
        style={{ 
          backgroundColor: colors.primary,
          color: colors.background,
          boxShadow: `0 10px 25px ${colors.accent}30`,
        }}
      >
        <motion.span
          className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent"
          style={{ opacity: 0.1 }}
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        <motion.span
          className="relative z-10 flex items-center justify-center gap-2"
          whileHover={{ gap: 4 }}
        >
          Mulai Desain dengan SiHuni
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            →
          </motion.span>
        </motion.span>
      </motion.button>
    </div>
  );
}