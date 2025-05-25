// Footer.jsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const footerLinks = {
    'Proyek': ['Rumah Modern', 'Apartemen', 'Townhouse', 'Villa'],
    'Layanan': ['Konsultasi', 'Desain Interior', 'Renovasi', 'Pembiayaan'],
    'Tentang': ['Tentang Kami', 'Tim', 'Karir', 'Kontak']
  };

  const socialMedia = [
    { name: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
    { name: 'Facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
    { name: 'Twitter', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
    { name: 'LinkedIn', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z' }
  ];

  return (
    <footer className="relative bg-[#F6F6EC] text-[#594C1A] overflow-hidden">
      {/* Newsletter Section */}
      <div className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#594C1A]/5 to-[#938656]/5" />
        <div className="relative max-w-7xl mx-auto">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tetap Terhubung dengan SiapHuni
            </h2>
            <p className="text-lg text-[#594C1A]/80 max-w-2xl mx-auto mb-8">
              Dapatkan informasi terbaru tentang proyek, tips desain, dan penawaran eksklusif
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <input
                type="email"
                placeholder="Masukkan email Anda"
                className="flex-1 px-6 py-3 rounded-lg border-2 border-[#594C1A]/20 focus:border-[#594C1A] focus:outline-none bg-white/50 backdrop-blur-sm"
              />
              <motion.button
                className="bg-[#594C1A] text-white px-8 py-3 rounded-lg hover:bg-[#938656] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Berlangganan
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/" className="block mb-6">
                <img src="/icon/Logo.svg" alt="SiapHuni Logo" className="h-12" />
              </Link>
              <p className="text-[#594C1A]/80 mb-6">
                Platform terpercaya untuk menemukan rumah siap huni berkualitas premium dengan proses yang mudah dan transparan.
              </p>
              <div className="flex gap-4">
                {socialMedia.map((social) => (
                  <motion.a
                    key={social.name}
                    href="#"
                    className="w-10 h-10 rounded-full bg-[#594C1A]/10 flex items-center justify-center hover:bg-[#594C1A] hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d={social.icon} />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Footer Links */}
            {Object.entries(footerLinks).map(([title, items]) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <motion.li
                      key={item}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Link
                        href="#"
                        className="text-[#594C1A]/80 hover:text-[#594C1A] transition-colors"
                      >
                        {item}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="relative py-6 px-4 sm:px-6 lg:px-8 border-t border-[#594C1A]/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#594C1A]/60 text-sm">
            © {new Date().getFullYear()} SiapHuni. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-[#594C1A]/60 hover:text-[#594C1A] text-sm transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="#" className="text-[#594C1A]/60 hover:text-[#594C1A] text-sm transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        className={`fixed bottom-6 right-6 bg-[#594C1A] text-white p-3 rounded-full shadow-lg z-50 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } transition-opacity duration-300`}
        onClick={scrollToTop}
        whileHover={{ scale: 1.1, backgroundColor: "#938656" }}
        whileTap={{ scale: 0.9 }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7" />
        </svg>
      </motion.button>
    </footer>
  );
};

export default Footer;