"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Search, Users, User, Menu, Settings, X, ChevronDown } from 'lucide-react';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
// Assuming these are correctly implemented and available
import { isProfileComplete } from '@/services/profileService';
import { app } from '@/lib/firebase';
import { useAdmin } from '@/hooks/useAdmin';
import { useArchitect } from '@/hooks/useArchitect';

// Initialize Firebase Auth
const auth = getAuth(app);

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSiHuniDropdownOpen, setIsSiHuniDropdownOpen] = useState(false); // State for desktop Si Huni dropdown
  const [isSiHuniMobileDropdownOpen, setIsSiHuniMobileDropdownOpen] = useState(false); // State for mobile Si Huni dropdown
  const [isScrolled, setIsScrolled] = useState(false); // State for scroll detection

  const router = useRouter();
  const pathname = usePathname();
  const { isAdminUser } = useAdmin();
  const { isArchitectUser } = useArchitect();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      setIsLoggedIn(!!user);
      if (user) {
        // This line might cause issues if isProfileComplete is not a client-side function or if it's not awaited properly.
        // Ensure it's safe to call on the client or move to a server action if it involves sensitive data.
        // For now, assuming it's a client-safe function.
        await isProfileComplete(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Scroll effect for mobile navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    // Also close Si Huni mobile dropdown when route changes
    setIsSiHuniMobileDropdownOpen(false);
  }, [pathname]);

  const handleProfileClick = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const complete = await isProfileComplete(currentUser.uid);
    if (!complete) {
      router.push('/CompleteProfile');
    } else {
      router.push('/Profile');
    }
  };

  // Get navigation items, including Admin if user is admin
  const getNavigationItems = () => {
    const items = [
      { href: "/", label: "Home", icon: Home },
      { href: "/sihuni", label: "Si Huni", icon: Search }, // This will now be a dropdown trigger
      { href: "/PreBuild", label: "PreBuild", icon: Menu },
      { href: "/Komunitas", label: "Komunitas", icon: Users },
    ];
    return items;
  };

  const navigationItems = getNavigationItems();

  const AuthButtons = () => (
    <div className="flex items-center gap-2">
      <Link href="/Login">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 text-gray-800 font-medium hover:text-amber-800 transition-colors duration-300"
        >
          Masuk
        </motion.button>
      </Link>
      <Link href="/Register">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 text-white font-medium bg-amber-800 rounded-full hover:bg-amber-700 transition-colors duration-300"
        >
          Daftar
        </motion.button>
      </Link>
    </div>
  );

  const ProfileButton = () => (
    <div className="relative group">
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="p-2 text-amber-800 cursor-pointer bg-amber-100/50 rounded-full flex items-center gap-2"
        onClick={handleProfileClick}
      >
        <User size={24} />
        <ChevronDown size={16} className="transform group-hover:rotate-180 transition-transform duration-200" />
      </motion.div>
      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
        <div
          className="px-4 py-2 hover:bg-amber-50 cursor-pointer text-gray-700 flex items-center gap-2"
          onClick={handleProfileClick}
        >
          <User size={16} />
          <span>Profile</span>
        </div>
        {isAdminUser && (
          <Link href="/Admin">
            <div className="px-4 py-2 hover:bg-amber-50 cursor-pointer text-gray-700 flex items-center gap-2">
              <Settings size={16} />
              <span>Admin Panel</span>
            </div>
          </Link>
        )}
        {isArchitectUser && (
          <Link href="/Architect/dashboard">
            <div className="px-4 py-2 hover:bg-amber-50 cursor-pointer text-gray-700 flex items-center gap-2">
              <Settings size={16} />
              <span>Arsitek Panel</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );

  // Update the mobile profile section to include architect option
  const MobileProfileSection = () => (
    <div className="pt-4 mt-4 border-t border-gray-100">
      {isLoggedIn ? (
        <div className="flex flex-col space-y-2">
          <motion.div
            whileHover={{ x: 10 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleProfileClick}
            className="flex items-center space-x-4 p-3 rounded-xl text-gray-600 hover:bg-gray-50"
          >
            <User size={20} />
            <span className="font-medium">Profile</span>
          </motion.div>
          {isAdminUser && (
            <Link href="/Admin">
              <motion.div
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-4 p-3 rounded-xl text-gray-600 hover:bg-gray-50"
              >
                <Settings size={20} />
                <span className="font-medium">Admin Panel</span>
              </motion.div>
            </Link>
          )}
          {isArchitectUser && (
            <Link href="/Architect">
              <motion.div
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-4 p-3 rounded-xl text-gray-600 hover:bg-gray-50"
              >
                <Settings size={20} />
                <span className="font-medium">Arsitek Panel</span>
              </motion.div>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          <Link href="/Login">
            <motion.div
              whileHover={{ x: 10 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-3 text-center font-medium text-amber-800 border-2 border-amber-800 rounded-xl hover:bg-amber-50"
            >
              Masuk
            </motion.div>
          </Link>
          <Link href="/Register">
            <motion.div
              whileHover={{ x: 10 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-3 text-center font-medium text-white bg-amber-800 rounded-xl hover:bg-amber-700"
            >
              Daftar
            </motion.div>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-center py-4 px-8 bg-gradient-to-br from-[#F6F8F3] to-[#EAF4DE] backdrop-blur-lg rounded-b-2xl shadow-lg"
      >
        <div className="flex items-center gap-6">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            if (item.href === "/sihuni") {
              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setIsSiHuniDropdownOpen(true)}
                  onMouseLeave={() => setIsSiHuniDropdownOpen(false)}
                >
                  <Link
                    href={item.href}
                    className={`px-4 py-2 font-medium ${
                      pathname.startsWith('/sihuni') ? 'text-amber-800' : 'text-gray-800'
                    } hover:text-amber-800 hover:scale-105 transition-all duration-300 relative group`}
                  >
                    {item.label}
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-amber-800 group-hover:w-2/3 transition-all duration-300 ${pathname.startsWith('/sihuni') ? 'w-2/3' : ''}`}></span>
                  </Link>
                  <AnimatePresence>
                    {isSiHuniDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 py-2 bg-white rounded-xl shadow-lg z-10"
                      >
                        <Link href="/sihuni">
                          <div className="px-4 py-2 hover:bg-amber-50 cursor-pointer text-gray-700 flex items-center gap-2">
                            <span>Konsultasi Si Huni</span>
                          </div>
                        </Link>
                        <Link href="/interior-scanning">
                          <div className="px-4 py-2 hover:bg-amber-50 cursor-pointer text-gray-700 flex items-center gap-2">
                            <span>Scanning Interior</span>
                          </div>
                        </Link>
                        <Link href="/kawasan">
                          <div className="px-4 py-2 hover:bg-amber-50 cursor-pointer text-gray-700 flex items-center gap-2">
                            <span>Preview Kawasan</span>
                          </div>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 font-medium ${
                  isActive ? 'text-amber-800' : 'text-gray-800'
                } hover:text-amber-800 hover:scale-105 transition-all duration-300 relative group`}
              >
                {item.label}
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-amber-800 group-hover:w-2/3 transition-all duration-300 ${isActive ? 'w-2/3' : ''}`}></span>
              </Link>
            );
          })}
          <div className="ml-4">
            {isLoggedIn ? <ProfileButton /> : <AuthButtons />}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        {/* Mobile Header */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`transition-all duration-300 ${
            isMobileMenuOpen 
              ? 'bg-white border-b border-white' 
              : isScrolled 
                ? 'bg-white/90 backdrop-blur-lg border-b border-white/20 shadow-sm' 
                : 'bg-transparent'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="font-bold text-xl text-amber-800">
              <Image 
                src={isScrolled || isMobileMenuOpen ? "/icon/Logo.svg" : "/icon/LogoPutih.svg"} 
                alt="SiapHuni Logo" 
                width={60} 
                height={60} 
              />
            </Link>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-amber-800 hover:text-amber-800 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </motion.div>
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed inset-0 top-[57px] bg-white/95 backdrop-blur-lg"
            >
              <div className="flex flex-col p-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  if (item.href === "/sihuni") {
                    return (
                      <div key={item.href}>
                        <motion.div
                          whileHover={{ x: 10 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsSiHuniMobileDropdownOpen(!isSiHuniMobileDropdownOpen)}
                          className={`flex items-center justify-between space-x-4 p-3 rounded-xl cursor-pointer ${
                            pathname.startsWith('/sihuni') ? 'bg-amber-50 text-amber-800' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <ChevronDown size={16} className={`transform transition-transform duration-200 ${isSiHuniMobileDropdownOpen ? 'rotate-180' : ''}`} />
                        </motion.div>
                        <AnimatePresence>
                          {isSiHuniMobileDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden pl-8 pt-2 pb-1 space-y-2"
                            >
                              <Link href="/sihuni">
                                <motion.div
                                  whileHover={{ x: 5 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="flex items-center space-x-4 p-3 rounded-xl text-gray-600 hover:bg-gray-50"
                                >
                                  <span>Konsultasi Si Huni</span>
                                </motion.div>
                              </Link>
                              <Link href="/interior-scanning">
                                <motion.div
                                  whileHover={{ x: 5 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="flex items-center space-x-4 p-3 rounded-xl text-gray-600 hover:bg-gray-50"
                                >
                                  <span>Scanning Interior</span>
                                </motion.div>
                              </Link>
                              <Link href="/kawasan">
                                <motion.div
                                  whileHover={{ x: 5 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="flex items-center space-x-4 p-3 rounded-xl text-gray-600 hover:bg-gray-50"
                                >
                                  <span>Preview Kawasan</span>
                                </motion.div>
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  return (
                    <Link key={item.href} href={item.href}>
                      <motion.div
                        whileHover={{ x: 10 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center space-x-4 p-3 rounded-xl ${
                          isActive ? 'bg-amber-50 text-amber-800' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-800"
                          />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
                <MobileProfileSection />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
