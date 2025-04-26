"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, Users, User, Menu } from "lucide-react";
import { getAuth } from 'firebase/auth';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { isProfileComplete } from '@/services/profileService';
import { useRouter, usePathname } from 'next/navigation';
import { app } from '@/firebase';

// Initialize Firebase Auth
const auth = getAuth(app);

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      setIsLoggedIn(!!user);
      if (user) {
        await isProfileComplete(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

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

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/sihuni", label: "Si Huni", icon: Search },
    { href: "/prebuild", label: "PreBuild", icon: Menu },
    { href: "/komunitas", label: "Komunitas", icon: Users },
  ];

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
    <motion.div
      whileHover={{ scale: 1.1 }}
      className="p-2 text-amber-800 cursor-pointer bg-amber-100/50 rounded-full"
      onClick={handleProfileClick}
    >
      <User size={24} />
    </motion.div>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <div className="relative z-10 w-full hidden md:block bg-[#F6F6EC]">
        <nav className="flex items-center justify-between py-8 md:justify-center ">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex absolute mx-auto mt-12 transform -translate-x-1/2 bg-gradient-to-br from-[#F6F8F3] to-[#EAF4DE] backdrop-blur-sm rounded-[16px] shadow-lg items-center px-8 py-4 hover:shadow-xl transition-shadow duration-300"
          >
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 font-medium text-gray-800 hover:text-amber-800 hover:scale-105 transition-all duration-300 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-amber-800 group-hover:w-2/3 transition-all duration-300"></span>
              </Link>
            ))}
            <div className="ml-4">
              {isLoggedIn ? <ProfileButton /> : <AuthButtons />}
            </div>
          </motion.div>
        </nav>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 bg-[#F6F6EC] border-t border-gray-200 md:hidden z-50"
      >
        <div className="flex items-center justify-around px-4 py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className="flex flex-col items-center py-2 px-3"
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    className={`p-2 rounded-full ${
                      isActive 
                        ? 'bg-amber-800 text-white' 
                        : 'text-gray-600 hover:bg-amber-50'
                    } transition-colors duration-300`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon size={20} />
                  </motion.div>
                  <span className={`text-xs mt-1 ${
                    isActive ? 'text-amber-800 font-medium' : 'text-gray-600'
                  }`}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
          {isLoggedIn ? (
            <motion.div
              className="flex flex-col items-center py-2 px-3"
              whileTap={{ scale: 0.9 }}
              onClick={handleProfileClick}
            >
              <motion.div
                className="p-2 rounded-full text-gray-600 hover:bg-amber-50 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
              >
                <User size={20} />
              </motion.div>
              <span className="text-xs mt-1 text-gray-600">Profil</span>
            </motion.div>
          ) : (
            <Link href="/Login">
              <motion.div
                className="flex flex-col items-center py-2 px-3"
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  className="p-2 rounded-full text-gray-600 hover:bg-amber-50 transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  <User size={20} />
                </motion.div>
                <span className="text-xs mt-1 text-gray-600">Masuk</span>
              </motion.div>
            </Link>
          )}
        </div>
      </motion.div>
    </>
  );
}
