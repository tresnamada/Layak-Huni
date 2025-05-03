"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Tab } from '@headlessui/react';
import { FiMail, FiPhone, FiMapPin, FiEdit, FiMessageSquare, FiCamera, FiGrid, FiBookmark, FiAward, FiHome, FiStar, FiLogOut } from 'react-icons/fi';
import { getProfile, updateProfile, uploadProfileImage } from '@/services/profileService';
import { getAuth, signOut } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { isProfileComplete } from '@/services/profileService';
import Navbar from '@/components/Navbar';

const auth = getAuth();

// Mock data - replace with actual data fetching in production
const userData = {
  name: "Sayang Elang",
  email: "alex.johnson@example.com",
  phone: "+62 812-3456-7890",
  address: "Jakarta Selatan, Indonesia",
  joinDate: "January 2023",
  profileImage: "/pacarelang.jpg"
};

const communityPosts = [
  {
    id: 1,
    title: "My New Living Room Design",
    image: "/post-1.jpg",
    date: "March 15, 2023",
    likes: 24,
    comments: 8
  },
  {
    id: 2,
    title: "Kitchen Renovation Progress",
    image: "/post-2.jpg",
    date: "April 2, 2023",
    likes: 42,
    comments: 15
  },
  {
    id: 3,
    title: "Backyard Transformation",
    image: "/post-3.jpg",
    date: "May 10, 2023",
    likes: 36,
    comments: 12
  }
];

const consultationHistory = [
  {
    id: 1,
    type: "Architect",
    name: "Budi Santoso",
    image: "/architect-1.jpg",
    date: "February 10, 2023",
    topic: "House Extension Design",
    status: "Completed"
  },
  {
    id: 2,
    type: "Construction Worker",
    name: "Darmawan",
    image: "/worker-1.jpg",
    date: "April 5, 2023",
    topic: "Bathroom Renovation",
    status: "In Progress"
  },
  {
    id: 3,
    type: "Architect",
    name: "Siti Rahayu",
    image: "/architect-2.jpg",
    date: "June 20, 2023",
    topic: "Interior Design Consultation",
    status: "Scheduled"
  }
];

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  profileImage?: string;
  joinDate: string;
}

export default function ProfilePage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
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
  const router = useRouter();
  
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
      } else {
        router.push('/Login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleEditProfile = () => setIsEditing(true);
  const handleCloseEdit = () => {
    setIsEditing(false);
    setPreviewImage(null);
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      const { success, error: updateError } = await updateProfile(auth.currentUser.uid, editedUser);
      if (success) {
        setIsEditing(false);
        setPreviewImage(null);
      } else {
        setError(updateError || 'Failed to update profile');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!auth.currentUser) return;
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        
        const { success, error: uploadError } = await uploadProfileImage(auth.currentUser!.uid, base64String);
        if (!success) {
          setError(uploadError || 'Failed to upload image');
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Add logout function
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#F6F6EC]">
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
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#F6F6EC]">
          <motion.div 
            className="bg-red-50 text-red-500 p-6 rounded-xl shadow-lg max-w-md mx-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold mb-2">Error Loading Profile</h3>
            <p>{error}</p>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F6F6EC] pt-24 pb-12 px-4">
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
                      <h1 className="text-5xl md:text-6xl font-bold text-[#594C1A]">
                        {editedUser.firstName} {editedUser.lastName}
                      </h1>
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
                    <div className="flex items-center justify-center md:justify-start gap-3 text-[#938656] text-lg">
                      <FiStar className="w-5 h-5" />
                      <span>Premium Member since {editedUser.joinDate}</span>
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
                      { icon: FiHome, label: 'Projects', value: '12 Completed' }
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
              <Tab.List className="flex p-3 space-x-3 bg-[#594C1A]/5">
                {[
                  { name: 'Projects', icon: FiGrid },
                  { name: 'Consultations', icon: FiMessageSquare },
                  { name: 'Saved', icon: FiBookmark }
                ].map((tab) => (
                  <Tab
                    key={tab.name}
                    className={({ selected }) =>
                      `flex-1 py-4 px-6 rounded-xl text-sm font-medium transition-all duration-300
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Project Cards */}
                  </div>
                </Tab.Panel>
                <Tab.Panel>
                  <div className="space-y-6">
                    {/* Consultation Cards */}
                  </div>
                </Tab.Panel>
                <Tab.Panel>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Saved Items */}
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </motion.div>
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
              {/* Modal content will be added in the next iteration */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}