"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X, User } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu
  return (
    <div className="relative z-10 w-full">
      {/* Adjusted nav for responsiveness */}
      <nav className="flex items-center justify-between py-8  md:justify-center">
        {/* Desktop Navigation (visible on medium screens and up) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden md:flex absolute mx-auto mt-12 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg items-center px-8 py-4 hover:shadow-xl transition-shadow duration-300"
        >
          <Link
            href="/"
            className="px-4 py-2 font-medium text-gray-800 hover:text-amber-800 hover:scale-105 transition-all duration-300 relative group"
          >
            Home
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-amber-800 group-hover:w-2/3 transition-all duration-300"></span>
          </Link>
          <Link
            href="/sihuni"
            className="px-4 py-2 font-medium text-gray-800 hover:text-amber-800 hover:scale-105 transition-all duration-300 relative group"
          >
            Si Huni
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-amber-800 group-hover:w-2/3 transition-all duration-300"></span>
          </Link>
          <Link
            href="/prebuild"
            className="px-4 py-2 font-medium text-gray-800 hover:text-amber-800 hover:scale-105 transition-all duration-300 relative group"
          >
            PreBuild
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-amber-800 group-hover:w-2/3 transition-all duration-300"></span>
          </Link>
          <Link
            href="/komunitas"
            className="px-4 py-2 font-medium text-gray-800 hover:text-amber-800 hover:scale-105 transition-all duration-300 relative group"
          >
            Komunitas
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-amber-800 group-hover:w-2/3 transition-all duration-300"></span>
          </Link>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="ml-4 p-2 text-amber-800 cursor-pointer bg-amber-100/50 rounded-full"
          >
            <User size={24} />
          </motion.div>
        </motion.div>

        {/* Mobile Menu Button (visible on small screens) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:hidden z-20"
        >
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none p-2 bg-gray-700/70 rounded-full hover:bg-gray-700/90 transition-colors duration-300"
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </motion.div>
      </nav>

      {/* Mobile Menu Panel (conditionally rendered) */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute top-0 left-0 right-0 pt-20 pb-4 bg-white/95 backdrop-blur-sm shadow-lg md:hidden z-10 flex flex-col items-center space-y-3"
        >
          {[
            { href: "/", label: "Home" },
            { href: "/sihuni", label: "Si Huni" },
            { href: "/prebuild", label: "PreBuild" },
            { href: "/komunitas", label: "Komunitas" },
          ].map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={link.href}
                className="px-6 py-3 font-medium text-gray-800 hover:text-amber-800 hover:bg-amber-50 rounded-full transition-all duration-300 block"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 p-3 text-amber-800 cursor-pointer bg-amber-100/50 rounded-full hover:bg-amber-100 transition-colors duration-300"
          ><Link href="/login">
            <User size={24} />
          </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
