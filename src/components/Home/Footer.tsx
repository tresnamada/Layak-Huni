// Footer.jsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Show scroll-to-top button when scrolling down
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

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const socialMedia = [
    { name: 'facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
    { name: 'twitter', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
    { name: 'instagram', icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 19.5h11a3 3 0 003-3v-11a3 3 0 00-3-3h-11a3 3 0 00-3 3v11a3 3 0 003 3z' },
    { name: 'linkedin', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z' }
  ];

  const footerLinks = [
    { title: 'AI', items: ['Desain AI', 'Konsultasi', 'Inspirasi'] },
    { title: 'Komunitas', items: ['Forum', 'Event', 'Testimoni'] },
    { title: 'Marketplace', items: ['Furnitur', 'Material', 'Jasa Desain'] }
  ];

  const floatingShapes = [
    { top: '10%', left: '5%', size: 'w-16 h-16', rotate: 45, delay: 0 },
    { top: '30%', left: '80%', size: 'w-12 h-12', rotate: 120, delay: 0.3 },
    { top: '70%', left: '15%', size: 'w-20 h-20', rotate: 0, delay: 0.6 },
    { top: '85%', left: '75%', size: 'w-10 h-10', rotate: 90, delay: 0.9 }
  ];

  return (
    <footer className="relative bg-[#504B38] text-white overflow-hidden">
      {/* Floating decorative elements */}
      {floatingShapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`absolute ${shape.size} rounded-full bg-[#F8F3D9] opacity-10`}
          initial={{ y: 50, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 0.1,
            rotate: shape.rotate
          }}
          transition={{ 
            delay: shape.delay,
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          style={{ top: shape.top, left: shape.left }}
        />
      ))}

      {/* Top banner with enhanced interaction */}
      <motion.div 
        className="bg-gradient-to-r from-[#F8F3D9] to-[#E8E3C9] text-stone-800 p-8 text-center relative overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
      >
        {/* Animated floating elements */}
        {isHovering && (
          <>
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-[#594C1A] opacity-20"
              initial={{ x: -50, y: -50 }}
              animate={{ 
                x: [0, 100, 0],
                y: [0, 50, 0],
                opacity: [0.2, 0.1, 0.2]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ top: '20%', left: '10%' }}
            />
            <motion.div
              className="absolute w-24 h-24 rounded-lg bg-[#B9B28A] opacity-15"
              initial={{ x: 100, y: 50 }}
              animate={{ 
                x: [0, -80, 0],
                y: [0, -30, 0],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ top: '60%', left: '80%' }}
            />
          </>
        )}

        <motion.p 
          className="text-3xl font-light italic relative z-10 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          Di balik desain yang rapi, ada ruang yang siap kau huni dengan hati.
        </motion.p>
        
        <motion.div
          className="mt-8 relative inline-block"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="absolute inset-0 bg-[#594C1A] rounded-2xl"
            initial={{ opacity: 0.5, scale: 0.9 }}
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [0.9, 1, 0.9]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <button 
            className="relative z-10 bg-[#594C1A] text-white py-6 px-12 rounded-2xl text-2xl
              shadow-[0_8px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_12px_0_0_rgba(0,0,0,0.2)]
              hover:bg-[#B9B28A] active:shadow-[0_4px_0_0_rgba(0,0,0,0.2)]
              transition-all duration-150 transform hover:-translate-y-1 active:translate-y-1"
          >
            <motion.span
              className="inline-block"
              animate={{
                rotate: isHovering ? [0, -3, 3, 0] : 0,
                x: isHovering ? [0, 2, -2, 0] : 0
              }}
              transition={{ duration: 0.5 }}
            >
              Coba Siap Huni!
            </motion.span>
          </button>
        </motion.div>
      </motion.div>

      {/* Main footer content */}
      <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row justify-between items-start">
        {/* Logo section with animated border */}
        <motion.div 
          className="mb-8 md:mb-0 relative p-6 rounded-xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          whileHover={{ 
            boxShadow: "0 0 0 2px rgba(249, 243, 217, 0.5)"
          }}
        >
          <motion.div
            className="absolute inset-0 border-2 border-[#F8F3D9] rounded-xl opacity-0"
            animate={{ 
              opacity: isHovering ? [0, 0.3, 0] : 0,
              scale: isHovering ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 1.5 }}
          />
          <Link href="/">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.03 }}
            >
              <img src="LogoPutih.svg" alt="Logo" className="h-32" />
            </motion.div>
          </Link>
          <motion.p 
            className="text-gray-300 mt-4 max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Mewujudkan hunian impian Anda dengan sentuhan modern dan nyaman
          </motion.p>
        </motion.div>

        {/* Navigation sections with staggered animation */}
        <div className="flex flex-wrap md:flex-nowrap gap-8 md:gap-16 mb-8 md:mb-0">
          {footerLinks.map((section, sectionIndex) => (
            <motion.div
              key={sectionIndex}
              className="md:mx-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + sectionIndex * 0.1, duration: 0.5 }}
            >
              <h2 className="text-xl font-bold mb-4 text-white border-b-2 border-[#B9B28A] pb-2 inline-block">
                {section.title}
              </h2>
              <ul className="space-y-3 mt-4">
                {section.items.map((item, itemIndex) => (
                  <motion.li 
                    key={itemIndex}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link 
                      href={`/${section.title.toLowerCase()}/${item.toLowerCase().replace(' ', '-')}`} 
                      className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center"
                      onMouseEnter={() => setHoveredItem(`${section.title}-${item}`)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <motion.span
                        animate={{
                          color: hoveredItem === `${section.title}-${item}` ? '#F8F3D9' : '#D1D5DB'
                        }}
                        className="flex items-center"
                      >
                        {hoveredItem === `${section.title}-${item}` && (
                          <motion.span 
                            className="mr-2"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                          >
                            →
                          </motion.span>
                        )}
                        {item}
                      </motion.span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Contact section with interactive form */}
        <motion.div
          className="mb-6 md:mb-0 relative"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h2 className="text-xl font-bold mb-6 text-white border-b-2 border-[#B9B28A] pb-2 inline-block">
            Contact Us
          </h2>
          
          <motion.div 
            className="flex items-center mb-4 group"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3 group-hover:bg-[#B9B28A] transition-colors"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </motion.div>
            <span className="text-gray-300 group-hover:text-white transition-colors">+62 81 654 236</span>
          </motion.div>
          
          <motion.div 
            className="bg-gray-700 rounded-lg p-4 mt-4 w-full max-w-xs"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.01 }}
          >
            <form onSubmit={(e) => {
              e.preventDefault();
              if (message.trim()) {
                // Here you would typically send the message
                setMessage(''); // Clear input after sending
                
                // Add success animation
                const button = e.currentTarget.querySelector('button');
                if (button) {
                  button.classList.add('success');
                  setTimeout(() => button.classList.remove('success'), 2000);
                }
              }
            }}>
              <motion.input
                type="text"
                placeholder="Kirim Pesan"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 bg-transparent text-white placeholder-gray-400 border-b border-gray-600 focus:border-gray-400 outline-none"
                whileFocus={{ borderBottomColor: "#B9B28A" }}
              />
              <motion.button 
                type="submit"
                className="mt-4 w-full bg-[#B9B28A] text-stone-800 py-2 px-4 rounded-lg font-medium
                  hover:bg-[#F8F3D9] transition-all duration-200 flex items-center justify-center
                  relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!message.trim()}
              >
                <motion.span
                  className="flex items-center"
                  animate={{
                    x: message.trim() ? 0 : -10,
                    opacity: message.trim() ? 1 : 0.5
                  }}
                >
                  Kirim Pesan
                  <motion.svg 
                    className="w-4 h-4 ml-2"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{ 
                      x: message.trim() ? [0, 5, 0] : 0,
                      rotate: message.trim() ? [0, 15, 0] : 0
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </motion.svg>
                </motion.span>
                
                {/* Success animation overlay */}
                <motion.div
                  className="absolute inset-0 bg-green-500 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              </motion.button>
            </form>
          </motion.div>

          {/* Animated Social Media Icons */}
          <div className="flex gap-4 mt-6">
            {socialMedia.map((social, index) => (
              <motion.a
                key={social.name}
                href={`#${social.name}`}
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-[#B9B28A] transition-colors duration-200 relative"
                whileHover={{ 
                  scale: 1.1,
                  backgroundColor: "#F8F3D9",
                  color: "#504B38"
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={social.icon} />
                </svg>
                <motion.span 
                  className="absolute -bottom-6 text-xs text-gray-300 opacity-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredItem === social.name ? 1 : 0 }}
                >
                  {social.name}
                </motion.span>
              </motion.a>
            ))}
          </div>

          <style jsx>{`
            .success {
              animation: success 0.5s ease-in-out;
            }
            
            @keyframes success {
              0% { transform: scale(1); }
              50% { transform: scale(0.95); background: #22c55e; }
              100% { transform: scale(1); }
            }
          `}</style>
        </motion.div>
      </div>

      {/* Copyright section with animated divider */}
      <motion.div 
        className="container mx-auto px-4 py-6 border-t border-gray-600 flex flex-col md:flex-row justify-between items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <motion.div
          className="w-full h-px bg-gradient-to-r from-transparent via-[#B9B28A] to-transparent absolute top-0 left-0"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1 }}
        />
        <p className="text-gray-400 text-sm mb-4 md:mb-0">
          © {new Date().getFullYear()} Siap Huni. All rights reserved.
        </p>
        <div className="flex space-x-6">
          <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
            Terms of Service
          </Link>
        </div>
      </motion.div>

      {/* Enhanced Scroll to top button with floating animation */}
      <motion.button
        className={`fixed bottom-6 right-6 bg-[#B9B28A] text-stone-800 p-4 rounded-full shadow-lg z-50 flex items-center justify-center ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } transition-opacity duration-300 hover:shadow-xl`}
        onClick={scrollToTop}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : 20,
          scale: isHovering ? 1.1 : 1
        }}
        whileHover={{ 
          scale: 1.1,
          backgroundColor: "#F8F3D9"
        }}
        whileTap={{ scale: 0.9 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
      >
        <motion.div
          animate={{ 
            y: [0, -5, 0],
            rotate: isHovering ? 360 : 0
          }}
          transition={{ 
            y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 0.5 }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7" />
          </svg>
        </motion.div>
      </motion.button>
    </footer>
  );
};

export default Footer;