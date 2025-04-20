import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function InterioCommunityBanner() {
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
      className="p-6 rounded-3xl max-w-7xl mx-auto my-8 min-h-screen flex items-center justify-center bg-[#504B38]"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={{
        background: "linear-gradient(145deg, #504B38 0%, #38352A 100%)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        <motion.div 
          className="w-full md:w-1/2 overflow-hidden rounded-3xl"
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 1, ease: "easeOut" }}
          whileHover={{ 
            scale: 1.02, 
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            transition: { duration: 0.3 } 
          }}
        >
          <motion.img
            src="Komunitas.png" 
            alt="Tim desainer interior sedang berdiskusi"
            width={500}
            height={400}
            className="w-full h-auto object-cover rounded-3xl"
            whileHover={{ 
              scale: 1.05,
              filter: "brightness(1.1)"
            }}
            transition={{ 
              duration: 0.5,
              ease: "easeOut"
            }}
          />
        </motion.div>
        
        <motion.div 
          className="w-full md:w-1/2 space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.h2 
            className="text-4xl font-bold text-white"
            whileHover={{ scale: 1.02, color: "#938656" }}
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="inline-block cursor-pointer"
              whileHover={{ 
                scale: 1.05,
                textShadow: "0 0 8px rgba(147, 134, 86, 0.5)"
              }}
            >
              Diskusi Interior
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="inline-block cursor-pointer"
              whileHover={{ 
                scale: 1.05,
                textShadow: "0 0 8px rgba(147, 134, 86, 0.5)"
              }}
            >
              DI Komunitas Kami
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-stone-300 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            whileHover={{ 
              scale: 1.01, 
              color: "#938656",
              textShadow: "0 0 8px rgba(147, 134, 86, 0.3)"
            }}
          >
            Komunitas bukan sekadar ruang diskusi, tapi tempat kolaborasi bagi para pecinta desain interior modern
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.9 }}
          >
            <motion.button 
              className="mt-4 bg-[#938656] text-white py-3 px-6 rounded-lg transition-all"
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "#594C1A",
                boxShadow: "0 5px 15px rgba(147, 134, 86, 0.3)",
                textShadow: "0 0 8px rgba(255, 255, 255, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ boxShadow: "0 0 0 rgba(147, 134, 86, 0)" }}
            >
              Coba Komunitas
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}