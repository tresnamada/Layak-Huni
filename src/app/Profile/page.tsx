"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Tab } from '@headlessui/react';
import { FiMail, FiPhone, FiMapPin, FiEdit, FiMessageSquare, FiCamera, FiBookmark, FiHome, FiLogOut } from 'react-icons/fi';
import { getProfile, isProfileComplete, updateProfile } from '@/services/profileService';
import { getAuth, signOut } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getUserPurchases, PurchaseData } from '@/services/purchaseService';
import Link from 'next/link';
import { getUserGeneratedDesigns, GeneratedDesign } from '@/services/designService';
import { getUserConsultations, Consultation } from '@/services/consultationService';
import { useAdmin } from '@/hooks/useAdmin';
import { useArchitect } from '@/hooks/useArchitect';
import { uploadProfileImage } from '@/services/storageService';

const auth = getAuth();

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  profileImage?: string;
  joinDate: string;
}

function ProfilePageContent() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editedUser, setEditedUser] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    joinDate: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }),
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<PurchaseData[]>([]);
  const [savedDesigns, setSavedDesigns] = useState<GeneratedDesign[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const { isAdminUser } = useAdmin();
  const { isArchitectUser } = useArchitect();
  
  // Handle tab selection from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'purchases') {
      setSelectedTab(0); // Assuming purchases is the first tab
    } else if (tab === 'designs') {
      setSelectedTab(1);
    } else if (tab === 'consultations') {
      setSelectedTab(2);
    }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isComplete = await isProfileComplete(user.uid);
        if (!isComplete) {
          router.push('/CompleteProfile');
          return;
        }

        const { success, data, error: profileError } = await getProfile(user.uid);
        if (success && data) {
          setEditedUser(data as ProfileData);
          setPreviewImage(data.profileImage || null);
        } else {
          setError(profileError || 'Failed to load profile');
        }

        try {
          const purchaseData = await getUserPurchases(user.uid);
          setPurchases(purchaseData);

          // Fetch saved designs
          const savedDesignsResult = await getUserGeneratedDesigns(user.uid);
          if (savedDesignsResult.success) {
            setSavedDesigns(savedDesignsResult.designs);
          } else {
            console.error('Error loading saved designs:', savedDesignsResult.error);
          }

          // Fetch user consultations
          const consultationsResult = await getUserConsultations(user.uid);
          if (consultationsResult.success) {
            setConsultations(consultationsResult.consultations);
          } else {
            console.error('Error loading consultations:', consultationsResult.error);
          }

        } catch (err) {
          console.error('Error loading data:', err);
          setError('Failed to load profile data or purchases');
        }
      } else {
        router.push('/Login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/Login');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Gagal logout. Silakan coba lagi.');
    }
  };

  // Loading animation variants
  const loadingVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  // Hover animation variants
  const hoverVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // Helper function to get status badge color (can be reused from consultation page)
  const getStatusBadge = (status: Consultation['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Helper function to format date (can be reused)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-[#F6F6EC]">
          <Navbar />
          <div className="pt-24 pb-12 px-4">
            {/* Enhanced Background Pattern */}
            <div className="fixed inset-0 z-0">
              <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] bg-repeat opacity-5" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#594C1A]/10 via-transparent to-[#938656]/10" />
              <motion.div
                className="absolute inset-0"
                initial={{ backgroundPosition: "0% 0%" }}
                animate={{ backgroundPosition: "100% 100%" }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                style={{
                  background: "radial-gradient(circle at center, rgba(89, 76, 26, 0.03) 0%, transparent 50%)",
                  backgroundSize: "100% 100%"
                }}
              />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
              <div className="relative">
                <motion.div
                  className="w-20 h-20 border-4 border-[#594C1A]/20 border-t-[#594C1A] rounded-full"
                  variants={loadingVariants}
                  animate="animate"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-10 h-10 border-4 border-[#938656]/20 border-t-[#938656] rounded-full"
                      variants={loadingVariants}
                      animate="animate"
                    />
                  </div>
                </motion.div>
                <motion.div
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-[#594C1A] font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Loading...
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-[#F6F6EC]">
          <Navbar />
          <div className="pt-24 pb-12 px-4">
            {/* Enhanced Background Pattern */}
            <div className="fixed inset-0 z-0">
              <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] bg-repeat opacity-5" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#594C1A]/10 via-transparent to-[#938656]/10" />
              <motion.div
                className="absolute inset-0"
                initial={{ backgroundPosition: "0% 0%" }}
                animate={{ backgroundPosition: "100% 100%" }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                style={{
                  background: "radial-gradient(circle at center, rgba(89, 76, 26, 0.03) 0%, transparent 50%)",
                  backgroundSize: "100% 100%"
                }}
              />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
              <motion.div 
                className="bg-red-50 text-red-500 p-6 rounded-xl shadow-lg max-w-md mx-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-semibold mb-2">Error Loading Profile</h3>
                <p>{error}</p>
              </motion.div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F6F6EC]">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          {/* Enhanced Background Pattern */}
          <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] bg-repeat opacity-5" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#594C1A]/10 via-transparent to-[#938656]/10" />
            <motion.div
              className="absolute inset-0"
              initial={{ backgroundPosition: "0% 0%" }}
              animate={{ backgroundPosition: "100% 100%" }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
              style={{
                background: "radial-gradient(circle at center, rgba(89, 76, 26, 0.03) 0%, transparent 50%)",
                backgroundSize: "100% 100%"
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Profile Header Card */}
            <motion.div 
              className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden mb-8 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#594C1A] via-[#938656] to-[#594C1A]" />
              <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] bg-repeat opacity-5" />
              
              {/* Floating Decorative Elements */}
              <motion.div
                className="absolute top-10 right-10 w-32 h-32 rounded-full bg-[#594C1A]/5"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                  opacity: [0.5, 0.3, 0.5]
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-10 left-10 w-24 h-24 rounded-full bg-[#938656]/5"
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [90, 0, 90],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />

              <div className="relative p-8 sm:p-12">
                <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
                  {/* Enhanced Profile Image Section */}
                  <motion.div 
                    className="relative group"
                    whileHover="hover"
                    variants={hoverVariants}
                  >
                    <div className="relative h-48 w-48 md:h-56 md:w-56">
                      {/* Animated Background Circle */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-[#594C1A] to-[#938656]"
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{
                          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                          scale: { duration: 2, repeat: Infinity, repeatType: "reverse" }
                        }}
                      />
                      
                      {/* Profile Image Container */}
                      <div className="absolute inset-3 rounded-full border-4 border-white overflow-hidden shadow-inner">
                        <motion.div
                          className="w-full h-full relative"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {previewImage ? (
                            <Image 
                              src={previewImage}
                              alt={`${editedUser.firstName} ${editedUser.lastName}`}
                              fill
                              className="object-cover"
                              priority
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#594C1A]/10 to-[#938656]/10 flex items-center justify-center">
                              <FiCamera className="w-16 h-16 text-[#594C1A]/40" />
                            </div>
                          )}
                        </motion.div>
                      </div>

                      {/* Enhanced Edit Button */}
                      <motion.button
                        className="absolute -bottom-2 right-2 bg-[#594C1A] text-white p-4 rounded-full shadow-lg"
                        whileHover={{ 
                          scale: 1.1,
                          backgroundColor: "#938656",
                          boxShadow: "0 0 20px rgba(89, 76, 26, 0.3)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(true)}
                      >
                        <FiEdit size={24} />
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Enhanced User Info Section */}
                  <div className="flex-1 text-center md:text-left">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h1 className="text-5xl md:text-6xl font-bold text-[#594C1A]">
                            {editedUser.firstName} {editedUser.lastName}
                          </h1>
                          <div className="flex gap-2 mt-2">
                            {isAdminUser && (
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                Admin
                              </span>
                            )}
                            {isArchitectUser && (
                              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                Arsitek
                              </span>
                            )}
                          </div>
                        </div>
                        <motion.button
                          onClick={handleLogout}
                          className="px-6 py-3 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-colors flex items-center space-x-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <FiLogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Enhanced Info Cards */}
                    <motion.div 
                      className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {[
                        { icon: FiMail, label: 'Email', value: editedUser.email },
                        { icon: FiPhone, label: 'Phone', value: editedUser.phone },
                        { icon: FiMapPin, label: 'Location', value: editedUser.address },
                      ].map((item) => (
                        <motion.div
                          key={item.label}
                          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm p-6 hover:from-[#594C1A]/10 hover:to-[#938656]/10 transition-all duration-300"
                          whileHover={{ y: -5 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.8 }}
                          />
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-[#594C1A]/10 group-hover:bg-[#594C1A]/20 transition-colors">
                              <item.icon className="w-6 h-6 text-[#594C1A]" />
                            </div>
                            <div>
                              <p className="text-sm text-[#594C1A]/60 mb-1">{item.label}</p>
                              <p className="text-[#594C1A] font-medium">{item.value}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Tabs Section */}
            <motion.div
              className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                <Tab.List className="flex p-3 space-x-3 bg-gradient-to-r from-[#594C1A]/5 to-[#938656]/5">
                  {[
                    { name: 'Rumah Dibeli', icon: FiHome },
                    { name: 'Konsultasi', icon: FiMessageSquare },
                    { name: 'Disimpan', icon: FiBookmark }
                  ].map((tab) => (
                    <Tab
                      key={tab.name}
                      className={({ selected }) =>
                        `flex-1 py-4 px-6 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden
                        ${selected 
                          ? 'bg-gradient-to-r from-[#594C1A] to-[#938656] text-white shadow-lg transform -translate-y-1' 
                          : 'text-[#594C1A]/60 hover:text-[#594C1A] hover:bg-white/80'}`
                      }
                    >
                      <motion.div 
                        className="flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <tab.icon className="w-5 h-5" />
                        <span>{tab.name}</span>
                      </motion.div>
                    </Tab>
                  ))}
                </Tab.List>

                <Tab.Panels className="p-8">
                  <Tab.Panel>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {purchases.filter((purchase, index, self) => 
                        index === self.findIndex((p) => p.id === purchase.id)
                      ).map((purchase) => (
                        <motion.div
                          key={purchase.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                          whileHover={{ y: -5 }}
                        >
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={purchase.houseImage}
                              alt={purchase.houseName}
                              fill
                              className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                              <h3 className="text-lg font-semibold text-white mb-1">{purchase.houseName}</h3>
                              <p className="text-sm text-white/90">
                                {new Date(purchase.purchaseDate.seconds * 1000).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                purchase.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : purchase.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {purchase.status === 'completed' ? 'Selesai' : 
                                 purchase.status === 'pending' ? 'Menunggu' : 'Dibatalkan'}
                              </span>
                              <span className="text-gray-600 font-medium">
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR'
                                }).format(purchase.totalAmount)}
                              </span>
                            </div>
                            <Link 
                              href={`/Profile/Purchase/${purchase.id}`}
                              className="block w-full py-3 text-center bg-gradient-to-r from-[#594C1A] to-[#938656] text-white rounded-xl font-medium hover:from-[#938656] hover:to-[#594C1A] transition-all duration-300 transform hover:scale-[1.02]"
                            >
                              Lihat Detail
                            </Link>
                          </div>
                        </motion.div>
                      ))}

                      {purchases.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="col-span-full text-center py-12"
                        >
                          <div className="bg-white/50 rounded-2xl p-8 max-w-md mx-auto">
                            <FiHome className="w-16 h-16 text-[#594C1A]/20 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Rumah Dibeli</h3>
                            <p className="text-gray-600 mb-6">
                              Anda belum memiliki rumah yang dibeli. Mulai jelajahi koleksi rumah kami.
                            </p>
                            <Link
                              href="/Houses"
                              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#594C1A] to-[#938656] text-white rounded-xl font-medium hover:from-[#938656] hover:to-[#594C1A] transition-all duration-300"
                            >
                              Jelajahi Rumah
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </Tab.Panel>
                  <Tab.Panel>
                    {/* Consultation Content */}
                    <div className="space-y-6">
                      {consultations.map((consultation) => (
                        <motion.div
                          key={consultation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                          whileHover={{ y: -5 }}
                          onClick={() => router.push(`/Profile/consultations/${consultation.id}`)}
                        >
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-semibold text-gray-900">{consultation.designData.name}</h3>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(consultation.status)}`}>
                                    {consultation.status === 'active' ? 'Aktif' : 
                                     consultation.status === 'completed' ? 'Selesai' : 
                                     consultation.status === 'cancelled' ? 'Dibatalkan' : 'Menunggu'}
                                  </span>
                                </div>
                                <p className="text-gray-600 line-clamp-2 mb-4">{consultation.designData.description}</p>
                              </div>
                              <motion.div
                                className="p-3 rounded-full bg-[#594C1A]/5 group-hover:bg-[#594C1A]/10 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <FiMessageSquare className="w-6 h-6 text-[#594C1A]" />
                              </motion.div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600 font-medium">Status Arsitek:</span>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    consultation.architectId 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {consultation.architectId ? 'Tersedia' : 'Menunggu Penugasan'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600 font-medium">Dibuat pada:</span>
                                  <span className="text-gray-800 font-medium">
                                    {formatDate(consultation.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600 font-medium">Estimasi Harga:</span>
                                  <span className="text-gray-800 font-semibold">
                                    {new Intl.NumberFormat('id-ID', {
                                      style: 'currency',
                                      currency: 'IDR'
                                    }).format(Number(consultation.designData.estimatedPrice) || 0)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600 font-medium">Gaya Desain:</span>
                                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#594C1A]/10 text-[#594C1A]">
                                    {consultation.designData.style || 'Belum ditentukan'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiMessageSquare className="w-4 h-4" />
                                <span>Klik untuk melihat detail konsultasi</span>
                              </div>
                              <motion.button
                                className="px-4 py-2 bg-gradient-to-r from-[#594C1A] to-[#938656] text-white rounded-lg text-sm font-medium hover:from-[#938656] hover:to-[#594C1A] transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Lihat Detail
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {consultations.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="col-span-full text-center py-12"
                        >
                          <div className="bg-white/50 rounded-2xl p-8 max-w-md mx-auto">
                            <div className="relative w-20 h-20 mx-auto mb-6">
                              <motion.div
                                className="absolute inset-0 rounded-full bg-[#594C1A]/10"
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.5, 0.3, 0.5]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                              <FiMessageSquare className="w-16 h-16 text-[#594C1A]/40 relative z-10 mx-auto" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Belum Ada Konsultasi</h3>
                            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                              Anda belum memiliki riwayat konsultasi. Mulai konsultasi dengan tim ahli kami untuk mendapatkan desain rumah impian Anda.
                            </p>
                            <Link
                              href="/Consultation"
                              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#594C1A] to-[#938656] text-white rounded-xl font-medium hover:from-[#938656] hover:to-[#594C1A] transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                              <FiMessageSquare className="w-5 h-5 mr-2" />
                              Mulai Konsultasi
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </Tab.Panel>
                  <Tab.Panel>
                    {/* Saved Designs Content */}
                    <div className="mb-6">
                        <Link href="/Profile/saved-designs">
                            <motion.button
                                className="px-4 py-2 bg-amber-800 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiBookmark className="w-4 h-4 mr-1" />
                                Pergi ke Halaman Desain Tersimpan
                            </motion.button>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedDesigns.map((design) => (
                        <motion.div
                          key={design.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                          whileHover={{ y: -5 }}
                        >
                          <div className="p-5">
                            <div className="mb-4">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{design.name}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">{design.description}</p>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                               <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium text-sm">Gaya:</span>
                                <span className="text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium">
                                  {design.style}
                                </span>
                              </div>
                               <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium text-sm">Estimasi Harga:</span>
                                <span className="text-gray-800 font-semibold text-sm">{design.estimatedPrice}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium text-sm">Disimpan pada:</span>
                                <span className="text-gray-800 text-sm">
                                  {new Date(design.createdAt).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>

                            <Link 
                              href={`/Profile/saved-designs/${design.id}`}
                              className="block w-full py-3 text-center bg-gradient-to-r from-[#594C1A] to-[#938656] text-white rounded-xl font-medium hover:from-[#938656] hover:to-[#594C1A] transition-all duration-300 transform hover:scale-[1.02]"
                            >
                              Lihat Detail
                            </Link>
                          </div>
                        </motion.div>
                      ))}

                      {savedDesigns.length === 0 && (
                         <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="col-span-full text-center py-12"
                        >
                          <div className="bg-white/50 rounded-2xl p-8 max-w-md mx-auto">
                            <FiBookmark className="w-16 h-16 text-[#594C1A]/20 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Desain Tersimpan</h3>
                            <p className="text-gray-600 mb-6">
                              Anda belum menyimpan rumah favorit. Mulai jelajahi dan simpan rumah impian Anda.
                            </p>
                             <Link
                              href="/custom-design"
                              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#594C1A] to-[#938656] text-white rounded-xl font-medium hover:from-[#938656] hover:to-[#938656] transition-all duration-300"
                            >
                              Buat Desain Baru
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                  <motion.button
                    onClick={() => setIsEditing(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  setError(null);

                  try {
                    if (!auth.currentUser) {
                      setError('User not authenticated');
                      return;
                    }
                    const { success, error: updateError } = await updateProfile(auth.currentUser.uid, editedUser);
                    if (success) {
                      setIsEditing(false);
                    } else {
                      setError(updateError || 'Failed to update profile');
                    }
                  } catch (err) {
                    console.error('Error updating profile:', err);
                    setError('An unexpected error occurred');
                  } finally {
                    setLoading(false);
                  }
                }} className="space-y-6">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 rounded-xl text-red-600 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={editedUser.firstName}
                        onChange={(e) => setEditedUser(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#594C1A] focus:border-[#594C1A]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={editedUser.lastName}
                        onChange={(e) => setEditedUser(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#594C1A] focus:border-[#594C1A]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={editedUser.phone}
                        onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#594C1A] focus:border-[#594C1A]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        id="address"
                        value={editedUser.address}
                        onChange={(e) => setEditedUser(prev => ({ ...prev, address: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#594C1A] focus:border-[#594C1A]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Image
                      </label>
                      <div className="mt-1 flex items-center space-x-4">
                        <div className="relative h-20 w-20">
                          {previewImage ? (
                            <Image
                              src={previewImage}
                              alt="Profile preview"
                              fill
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center">
                              <FiCamera className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            id="profileImage"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const { success, data, error: uploadError } = await uploadProfileImage(file);
                                  if (success && data) {
                                    setEditedUser(prev => ({ ...prev, profileImage: data.url }));
                                    setPreviewImage(data.url);
                                  } else {
                                    setError(uploadError || 'Failed to upload image');
                                  }
                                } catch (err) {
                                  console.error('Error uploading image:', err);
                                  setError('Failed to upload image');
                                }
                              }
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="profileImage"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            <FiCamera className="w-4 h-4 mr-2" />
                            Change Photo
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <motion.button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-[#594C1A] to-[#938656] text-white rounded-xl font-medium hover:from-[#938656] hover:to-[#594C1A] disabled:opacity-70 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <motion.div
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="ml-2">Saving...</span>
                        </div>
                      ) : (
                        'Save Changes'
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
