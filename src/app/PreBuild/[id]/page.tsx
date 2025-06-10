"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getHouseById, HouseData } from '@/services/houseService';
import { initializeMidtransPayment } from '@/services/midtransService';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { 
  Home as HomeIcon, 
  Bed, 
  Bath, 
  Car, 
  ChevronLeft,
  MapPin,
  CheckCircle,
  X 
} from 'lucide-react';
import { createPurchase } from '@/services/purchaseService';

interface UserDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

export default function HouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [house, setHouse] = useState<HouseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    fullName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<UserDetails>>({});

  useEffect(() => {
    // Add Midtrans Snap library
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    document.head.appendChild(script);

    const loadHouse = async () => {
      try {
        const houseData = await getHouseById(resolvedParams.id);
        setHouse(houseData);
      } catch (err) {
        console.error('Error loading house:', err);
        setError('Failed to load house details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadHouse();

    // Cleanup
    return () => {
      document.head.removeChild(script);
    };
  }, [resolvedParams.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const features = [
    { icon: Bed, label: 'Kamar Tidur', value: house?.specifications.bedroomCount },
    { icon: Bath, label: 'Kamar Mandi', value: house?.specifications.bathroomCount },
    { icon: Car, label: 'Carport', value: house?.specifications.carportCount },
    { icon: HomeIcon, label: 'Lantai', value: house?.specifications.floorCount },
  ];

  const validateForm = (): boolean => {
    const errors: Partial<UserDetails> = {};
    
    if (!userDetails.fullName.trim()) {
      errors.fullName = 'Nama lengkap harus diisi';
    }
    if (!userDetails.email.trim()) {
      errors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(userDetails.email)) {
      errors.email = 'Format email tidak valid';
    }
    if (!userDetails.phone.trim()) {
      errors.phone = 'Nomor telepon harus diisi';
    } else if (!/^[0-9]{10,13}$/.test(userDetails.phone.replace(/[^0-9]/g, ''))) {
      errors.phone = 'Nomor telepon tidak valid (10-13 digit)';
    }
    if (!userDetails.address.trim()) {
      errors.address = 'Alamat harus diisi';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUserDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setPaymentLoading(true);
      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      // Check if user and house data are available
      if (!user || !house) {
        throw new Error('User or house data not available');
      }

      // Create purchase record
      const purchaseId = await createPurchase(
        user.uid,
        house,
        {
          fullName: userDetails.fullName,
          email: userDetails.email,
          phone: userDetails.phone,
          address: userDetails.address
        },
        orderId
      );

      // Store purchase ID in localStorage for payment callback
      localStorage.setItem('currentPurchaseId', purchaseId);

      // Initialize payment
      await initializeMidtransPayment({
        orderId,
        amount: house.estimatedCost.totalCost,
        itemName: house.name,
        firstName: userDetails.fullName.split(' ')[0],
        lastName: userDetails.fullName.split(' ').slice(1).join(' '),
        email: userDetails.email,
        phone: userDetails.phone
      });
      
      // Close the form modal
      setShowUserForm(false);
    } catch (error) {
      console.error('Payment error:', error);
      setError('Gagal memulai pembayaran. Silakan coba lagi.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (formErrors[name as keyof UserDetails]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6EC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="min-h-screen bg-[#F6F6EC] flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error || 'House not found'}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center text-amber-600 hover:text-amber-700"
        >
          <ChevronLeft size={20} />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F6EC] to-white font-jakarta">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center hover:text-amber-600 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Kembali ke Daftar Rumah</span>
          </button>
          <span>/</span>
          <span className="text-amber-600">{house?.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={house?.imageUrl}
                alt={house?.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
                  <h1 className="text-2xl font-bold text-gray-800">{house?.name}</h1>
                  <div className="flex items-center mt-2 text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    <span>Location details will be provided after payment</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-6 right-6">
                <span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  {house?.tipe}
                </span>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <feature.icon className="text-amber-500 mb-2" size={24} />
                  <p className="text-sm text-gray-600">{feature.label}</p>
                  <p className="text-xl font-bold text-gray-800">{feature.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Price Section */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-3xl font-bold text-amber-600">
                {house && formatPrice(house.harga)}
              </h2>
              <p className="text-gray-600 mt-2">Total estimasi biaya termasuk material dan tenaga kerja</p>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Deskripsi</h2>
              <p className="text-gray-600 leading-relaxed">{house?.description}</p>
            </div>

            {/* Materials */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Material</h2>
              <div className="space-y-4">
                {house?.materials.map((material, index) => (
                  <div key={index} className="flex items-center text-gray-600">
                    <CheckCircle size={20} className="text-amber-500 mr-2" />
                    <span className="flex-1">{material.name}</span>
                    <span className="font-medium">{material.quantity} {material.unit}</span>
                  </div>
                ))}
                <div className="text-right">
                  <span className="text-sm text-gray-500">Total Biaya Material</span>
                  <p className="text-lg font-semibold text-gray-800">
                    {house && formatPrice(house.estimatedCost.materialCost)}
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            {house?.features && house.features.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Fitur</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {house.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-600">
                      <CheckCircle size={20} className="text-amber-500 mr-2" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estimated Costs */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Rincian Biaya</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Biaya Material</span>
                  <span className="font-medium">{house && formatPrice(house.estimatedCost.materialCost)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Biaya Tenaga Kerja</span>
                  <span className="font-medium">{house && formatPrice(house.estimatedCost.laborCost)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Biaya Lainnya</span>
                  <span className="font-medium">{house && formatPrice(house.estimatedCost.otherCost)}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Total Biaya</span>
                    <span className="text-xl font-bold text-amber-600">
                      {house && formatPrice(house.estimatedCost.totalCost)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button 
                onClick={() => setShowUserForm(true)}
                className="w-full py-4 rounded-xl font-medium transition-all duration-300 shadow-lg
                  bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
              >
                Lanjutkan Pembelian
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* User Details Modal */}
        <AnimatePresence>
          {showUserForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Data Pembeli</h2>
                  <button
                    onClick={() => setShowUserForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleUserDetailsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={userDetails.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        formErrors.fullName ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                      placeholder="Masukkan nama lengkap"
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={userDetails.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                      placeholder="Masukkan alamat email"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={userDetails.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        formErrors.phone ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                      placeholder="Contoh: 08123456789"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat Lengkap
                    </label>
                    <textarea
                      name="address"
                      value={userDetails.address}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        formErrors.address ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                      placeholder="Masukkan alamat lengkap"
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-300
                      ${paymentLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
                      }`}
                  >
                    {paymentLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                      </span>
                    ) : (
                      'Lanjutkan ke Pembayaran'
                    )}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 