"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Tab } from '@headlessui/react';
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit, FiImage, FiMessageSquare, FiX, FiCamera } from 'react-icons/fi';

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

export default function ProfilePage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(userData);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setPreviewImage(null);
    setEditedUser(userData); // Reset to original data
  };

  const handleSaveProfile = () => {
    // Here you would typically send the data to your backend
    console.log('Saving profile:', editedUser);
    // For this example, we'll just update our local userData
    // In a real app, you'd make an API call here
    setIsEditing(false);
    setPreviewImage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      // In a real app, you'd upload this file to your server
      // and get back a URL to store in the user data
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Section */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Profile Image */}
            <motion.div 
              className="relative h-28 w-28 md:h-32 md:w-32 rounded-full border-4 border-white shadow-md overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Image 
                src={userData.profileImage}
                alt={userData.name}
                fill
                style={{ objectFit: 'cover' }}
              />
            </motion.div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <motion.h1 
                className="text-2xl md:text-3xl font-bold text-[#594C1A]"
                {...fadeIn}
                transition={{ delay: 0.3 }}
              >
                {userData.name}
              </motion.h1>
              
              <div className="mt-4 space-y-2">
                <motion.div 
                  className="flex items-center justify-center md:justify-start text-gray-600"
                  {...fadeIn}
                  transition={{ delay: 0.4 }}
                >
                  <FiMail className="mr-2" />
                  <span>{userData.email}</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center justify-center md:justify-start text-gray-600"
                  {...fadeIn}
                  transition={{ delay: 0.5 }}
                >
                  <FiPhone className="mr-2" />
                  <span>{userData.phone}</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center justify-center md:justify-start text-gray-600"
                  {...fadeIn}
                  transition={{ delay: 0.6 }}
                >
                  <FiMapPin className="mr-2" />
                  <span>{userData.address}</span>
                </motion.div>
              </div>
            </div>
            
            {/* Edit Profile Button */}
            <motion.button
              className="px-4 py-2 bg-[#938656] text-white rounded-md flex items-center hover:bg-[#594C1A] transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEditProfile}
            >
              <FiEdit className="mr-2" />
              Edit Profile
            </motion.button>
          </div>
        </motion.div>
          
        {/* Tabs */}
        <motion.div
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <Tab.List className="flex border-b border-gray-200">
              <Tab className={({ selected }) => 
                `flex-1 py-4 px-6 text-center font-medium text-sm focus:outline-none transition-colors
                 ${selected 
                  ? 'text-[#594C1A] border-b-2 border-[#594C1A]' 
                  : 'text-gray-500 hover:text-[#938656]'}`
              }>
                <div className="flex items-center justify-center">
                  <FiImage className="mr-2" />
                  Community Posts
                </div>
              </Tab>
              <Tab className={({ selected }) => 
                `flex-1 py-4 px-6 text-center font-medium text-sm focus:outline-none transition-colors
                 ${selected 
                  ? 'text-[#594C1A] border-b-2 border-[#594C1A]' 
                  : 'text-gray-500 hover:text-[#938656]'}`
              }>
                <div className="flex items-center justify-center">
                  <FiMessageSquare className="mr-2" />
                  Consultation History
                </div>
              </Tab>
            </Tab.List>
            
            <Tab.Panels className="p-6">
              {/* Community Posts Panel */}
              <Tab.Panel>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {communityPosts.map((post, index) => (
                    <motion.div 
                      key={post.id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="relative h-40 w-full">
                        <Image 
                          src={post.image}
                          alt={post.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-[#594C1A]">{post.title}</h3>
                        <p className="text-gray-500 text-sm mt-1">{post.date}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm text-gray-600">{post.likes} likes</span>
                          <span className="text-sm text-gray-600">{post.comments} comments</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Tab.Panel>
              
              {/* Consultation History Panel */}
              <Tab.Panel>
                <div className="space-y-4">
                  {consultationHistory.map((consultation, index) => (
                    <motion.div 
                      key={consultation.id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 p-4 hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <div className="flex items-center">
                        <div className="relative h-14 w-14 rounded-full overflow-hidden">
                          <Image 
                            src={consultation.image}
                            alt={consultation.name}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg text-[#594C1A]">{consultation.name}</h3>
                              <p className="text-gray-600 text-sm">{consultation.type}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              consultation.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              consultation.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {consultation.status}
                            </span>
                          </div>
                          <div className="mt-2">
                            <p className="text-gray-700">{consultation.topic}</p>
                            <p className="text-gray-500 text-sm mt-1">{consultation.date}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-semibold text-[#594C1A]">Edit Profile</h2>
              <button 
                onClick={handleCloseEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center">
                <div className="relative h-28 w-28 rounded-full border-4 border-white shadow-md overflow-hidden mb-2">
                  <Image 
                    src={previewImage || userData.profileImage}
                    alt={userData.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <label 
                    htmlFor="profile-image" 
                    className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <FiCamera className="text-white" size={24} />
                  </label>
                  <input 
                    type="file" 
                    id="profile-image" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <p className="text-sm text-gray-500">Click to change profile picture</p>
              </div>
              
              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editedUser.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#938656]"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editedUser.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#938656]"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={editedUser.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#938656]"
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={editedUser.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#938656]"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t flex justify-end space-x-3">
              <button
                onClick={handleCloseEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-[#938656] text-white rounded-md hover:bg-[#594C1A] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}