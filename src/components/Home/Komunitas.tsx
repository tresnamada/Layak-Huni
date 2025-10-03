import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import Link from "next/link"
export default function Komunitas() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const galleryItems = [
    { 
      image: "/komunitas/Discuss.jpeg",
      title: "Diskusi Desain",
      desc: "Berbagi ide dan inspirasi",
      delay: 0.2
    },
    { 
      image: "/komunitas/Community.jpeg",
      title: "Meetup Komunitas", 
      desc: "Bertemu dan berbagi pengalaman",
      delay: 0.3
    },
    { 
      image: "/komunitas/Workshop.jpeg",
      title: "Workshop",
      desc: "Belajar dari para ahli",
      delay: 0.4
    },
    { 
      image: "/komunitas/Collab.jpeg",
      title: "Proyek Kolaborasi",
      desc: "Berkreasi bersama",
      delay: 0.5
    }
  ];

  return (
    <div 
      className="relative py-20 px-4 sm:px-6 lg:px-8"
      style={{
        background: "#F6F6EC"
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-5 bg-[url('/pattern-light.svg')]" />
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#594C1A]/5 to-transparent" />

      <motion.div
        ref={containerRef}
        className="relative max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left Content - Text */}
          <motion.div 
            className="w-full lg:w-1/2 space-y-8"
            variants={itemVariants}
          >
            <div className="space-y-4">
              <motion.div 
                className="flex items-center gap-2 text-[#594C1A]/70 uppercase tracking-wider text-sm font-medium"
                variants={itemVariants}
              >
                <div className="w-4 h-px bg-[#594C1A]/50" />
                Komunitas Layak Huni
              </motion.div>
              
              <motion.h2 
                className="text-4xl sm:text-5xl font-bold text-[#594C1A] leading-tight"
                variants={itemVariants}
              >
                Bergabung dengan <br />
                <span className="text-[#938656]">Komunitas Rumah dan Interior</span>
              </motion.h2>
              
              <motion.p 
                className="text-lg text-[#594C1A]/80"
                variants={itemVariants}
              >
                Temukan inspirasi dan berbagi pengalaman dengan sesama pecinta rumah modern.
              </motion.p>
            </div>

            <motion.div 
              className="grid grid-cols-2 gap-4"
              variants={containerVariants}
            >
              {[
                { icon: "💬", text: "Forum Diskusi" },
                { icon: "👥", text: "Jaringan Profesional" },
                { icon: "📚", text: "Sumber Belajar" },
                { icon: "🏆", text: "Proyek Kolaborasi" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-[#E8E8DE]"
                  variants={itemVariants}
                  whileHover={{ y: -5, boxShadow: "0 5px 15px rgba(89, 76, 26, 0.1)" }}
                >
                  <div className="text-xl">{item.icon}</div>
                  <span className="font-medium text-[#594C1A]">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 pt-4"
              variants={itemVariants}
            >
              <motion.button
                className="flex-1 bg-[#594C1A] text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#938656] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/Komunitas">
                Bergabung Sekarang
                </Link>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </motion.button>
              
            </motion.div>
          </motion.div>

          {/* Right Content - Gallery */}
          <motion.div 
            className="w-full lg:w-1/2 grid grid-cols-2 gap-6 hidden lg:grid"
            variants={containerVariants}
          >
            {galleryItems.map((item, i) => (
              <motion.div
                key={i}
                className={`relative h-[200px] sm:h-[250px] md:h-[300px] rounded-xl overflow-hidden group ${i % 2 === 1 ? 'mt-8' : ''}`}
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: item.delay }}
                whileHover={{ y: -5 }}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-sm sm:text-base font-medium">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-white/80">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}