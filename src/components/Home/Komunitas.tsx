import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

export default function Komunitas() {
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
      className="p-4 sm:p-6 md:p-8 rounded-3xl max-w-7xl mx-auto my-8 min-h-screen flex items-center justify-center bg-[#F6F6EC] mt-[300px] md:mt-[100px] md:mb-[100px]"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={{
        background: "linear-gradient(145deg, #F6F6EC 0%, #E8E8DE 100%)",
        boxShadow: "0 25px 50px -12px rgba(89, 76, 26, 0.15)"
      }}
    >
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full">
        <motion.div 
          className="w-full md:w-1/2 space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div className="flex flex-col gap-2">
            <motion.span 
              className="text-[#594C1A]/80 text-sm sm:text-base font-medium tracking-wider"
              variants={containerVariants}
            >
              KOMUNITAS SIAP HUNI
            </motion.span>
            <motion.h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#594C1A] leading-tight"
              whileHover={{ 
                scale: 1.02,
                textShadow: "2px 2px 4px rgba(89, 76, 26, 0.2)"
              }}
            >
              Bergabung dengan
              <br />
              <span className="text-[#938656]">Komunitas Pecinta Rumah</span>
            </motion.h2>
          </motion.div>

          <motion.div className="space-y-4">
            <motion.p 
              className="text-[#594C1A] text-base sm:text-lg md:text-xl font-light leading-relaxed"
              whileHover={{ 
                x: 10,
                color: "#938656",
                transition: { duration: 0.2 }
              }}
            >
              Temukan inspirasi dan berbagi pengalaman dengan sesama pecinta rumah modern
            </motion.p>
            <motion.p 
              className="text-[#594C1A] text-base sm:text-lg md:text-xl font-light leading-relaxed"
              whileHover={{ 
                x: 10,
                color: "#938656",
                transition: { duration: 0.2 }
              }}
            >
              Dapatkan tips dan trik dari para ahli dalam komunitas eksklusif kami
            </motion.p>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 w-full"
            variants={containerVariants}
          >
            <motion.button 
              className="bg-[#594C1A] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-[#938656] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 20px rgba(89, 76, 26, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center justify-center gap-2">
                Bergabung Sekarang
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  →
                </motion.span>
              </span>
            </motion.button>
            <motion.button 
              className="bg-transparent border-2 border-[#594C1A] text-[#594C1A] px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-[#594C1A]/5 transition-all w-full sm:w-auto"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 20px rgba(89, 76, 26, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Lihat Aktivitas
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="w-full md:w-1/2 grid grid-cols-2 gap-4"
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div 
            className="relative h-[200px] sm:h-[250px] md:h-[300px] rounded-xl overflow-hidden group"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 30px rgba(89, 76, 26, 0.2)",
            }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/komunitas/Discuss.jpeg"
              alt="Diskusi Desain"
              fill
              className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <motion.div
              className="absolute bottom-0 left-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <h3 className="text-sm sm:text-base font-medium">Diskusi Desain</h3>
              <p className="text-xs sm:text-sm text-white/80">Berbagi ide dan inspirasi</p>
            </motion.div>
          </motion.div>

          <motion.div 
            className="relative h-[200px] sm:h-[250px] md:h-[300px] rounded-xl overflow-hidden group mt-8"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 30px rgba(89, 76, 26, 0.2)",
            }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/komunitas/Community.jpeg"
              alt="Meetup Komunitas"
              fill
              className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <motion.div
              className="absolute bottom-0 left-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <h3 className="text-sm sm:text-base font-medium">Meetup Komunitas</h3>
              <p className="text-xs sm:text-sm text-white/80">Bertemu dan berbagi pengalaman</p>
            </motion.div>
          </motion.div>

          <motion.div 
            className="relative h-[200px] sm:h-[250px] md:h-[300px] rounded-xl overflow-hidden group"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 30px rgba(89, 76, 26, 0.2)",
            }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/komunitas/Workshop.jpeg"
              alt="Workshop"
              fill
              className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <motion.div
              className="absolute bottom-0 left-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <h3 className="text-sm sm:text-base font-medium">Workshop</h3>
              <p className="text-xs sm:text-sm text-white/80">Belajar dari para ahli</p>
            </motion.div>
          </motion.div>

          <motion.div 
            className="relative h-[200px] sm:h-[250px] md:h-[300px] rounded-xl overflow-hidden group mt-8"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 30px rgba(89, 76, 26, 0.2)",
            }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/komunitas/Collab.jpeg"
              alt="Proyek Kolaborasi"
              fill
              className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <motion.div
              className="absolute bottom-0 left-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <h3 className="text-sm sm:text-base font-medium">Proyek Kolaborasi</h3>
              <p className="text-xs sm:text-sm text-white/80">Berkreasi bersama</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}