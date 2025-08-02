"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getArchitectConsultations, updateConsultationStatus, Consultation, ConsultationStatus } from '@/services/consultationService';
import { getUserData, setArchitectAvailability } from '@/services/userService';
import { useRouter } from 'next/navigation';
import { FiMessageSquare, FiLoader, FiUser, FiToggleLeft, FiToggleRight, FiClock, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

export default function ArchitectDashboard() {
  const { user, loading: authLoading } = useAuth({ redirectToLogin: true });
  const router = useRouter();
  
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const checkArchitectRole = useCallback(async () => {
    if (!user) return;
    
    try {
      const result = await getUserData(user.uid);
      
      if (result.success && result.userData) {
        if (result.userData.role !== 'architect') {
          // Redirect non-architects
          alert('Halaman ini hanya untuk arsitek');
          router.push('/Profile');
          return;
        }
        
        // Set availability state
        setIsAvailable(result.userData.isAvailable || false);
        
        // Fetch consultations
        const fetchData = async () => {
          if (!user) return;
      
          setLoading(true);
          setError(null);
      
          try {
            const result = await getArchitectConsultations(user.uid);
      
            if (result.success) {
              setConsultations(result.consultations);
            } else {
              setError(result.error || 'Gagal mengambil data konsultasi');
            }
          } catch (err) {
            console.error('Error fetching consultations:', err);
            setError('Terjadi kesalahan saat mengambil data konsultasi');
          } finally {
            setLoading(false);
          }
        };
        fetchData();
      } else {
        setError('Gagal memuat data pengguna');
      }
    } catch (err) {
      console.error('Error checking architect role:', err);
      setError('Terjadi kesalahan saat memeriksa peran pengguna');
    }
  }, [user, router]);

  // Check if the user is an architect
  useEffect(() => {
    if (authLoading) return;
    
    if (user) {
      checkArchitectRole();
    }
  }, [user, authLoading, checkArchitectRole]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
  
      setLoading(true);
      setError(null);
  
      try {
        const result = await getArchitectConsultations(user.uid);
  
        if (result.success) {
          setConsultations(result.consultations);
        } else {
          setError(result.error || 'Gagal mengambil data konsultasi');
        }
      } catch (err) {
        console.error('Error fetching consultations:', err);
        setError('Terjadi kesalahan saat mengambil data konsultasi');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [user]);
  

  const toggleAvailability = async () => {
    if (!user) return;
    
    setUpdatingAvailability(true);
    
    try {
      const newAvailability = !isAvailable;
      const result = await setArchitectAvailability(user.uid, newAvailability);
      
      if (result.success) {
        setIsAvailable(newAvailability);
      } else {
        throw new Error(result.error || 'Gagal mengubah status ketersediaan');
      }
    } catch (err) {
      console.error('Error updating availability:', err);
      alert('Gagal mengubah status ketersediaan. Silakan coba lagi.');
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const updateStatus = async (consultationId: string, status: ConsultationStatus) => {
    if (!user) return;
    
    setUpdatingStatus(consultationId);
    
    try {
      const result = await updateConsultationStatus(consultationId, status);
      
      if (result.success) {
        // Update local state
        setConsultations(consultations.map(c => 
          c.id === consultationId ? { ...c, status } : c
        ));
      } else {
        throw new Error(result.error || 'Gagal mengubah status konsultasi');
      }
    } catch (err) {
      console.error('Error updating consultation status:', err);
      alert('Gagal mengubah status konsultasi. Silakan coba lagi.');
    } finally {
      setUpdatingStatus(null);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-sm">
            <FiClock className="mr-1" />
            Menunggu Arsitek
          </span>
        );
      case 'active':
        return (
          <span className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded text-sm">
            <FiCheckCircle className="mr-1" />
            Aktif
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center text-blue-600 bg-blue-100 px-2 py-1 rounded text-sm">
            <FiCheckCircle className="mr-1" />
            Selesai
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center text-red-600 bg-red-100 px-2 py-1 rounded text-sm">
            <FiXCircle className="mr-1" />
            Dibatalkan
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F6EC] font-sans">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-[#594C1A] mb-2">Dashboard Arsitek</h1>
            <p className="text-[#594C1A]/80 text-lg">Kelola konsultasi desain pengguna yang ditugaskan kepada Anda</p>
          </div>
          
          <motion.button 
            onClick={toggleAvailability}
            disabled={updatingAvailability}
            className={`flex items-center px-6 py-3 rounded-xl text-white text-lg font-medium shadow-md transition-all duration-300 ${
              isAvailable ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {updatingAvailability ? (
              <FiLoader className="animate-spin mr-3" size={20} />
            ) : isAvailable ? (
              <FiToggleRight className="mr-3" size={20} />
            ) : (
              <FiToggleLeft className="mr-3" size={20} />
            )}
            {isAvailable ? 'Status: Tersedia' : 'Status: Tidak Tersedia'}
          </motion.button>
        </div>
        
        {authLoading || loading ? (
          <div className="flex items-center justify-center h-96">
            <FiLoader className="animate-spin text-[#594C1A] w-16 h-16" />
          </div>
        ) : error ? (
          <motion.div 
            className="bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-xl shadow-sm text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-semibold text-lg mb-2">Error Loading Data</h3>
            <p>{error}</p>
          </motion.div>
        ) : consultations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.7 }}
            className="bg-white shadow-xl rounded-[2rem] p-12 text-center border border-[#EAE0D0]"
          >
            <FiMessageSquare className="mx-auto text-[#594C1A]/30 w-20 h-20 mb-6" />
            <h3 className="text-2xl font-bold text-[#594C1A] mb-4">Tidak Ada Konsultasi Aktif</h3>
            <p className="text-[#594C1A]/80 max-w-lg mx-auto mb-6">
              Anda belum memiliki permintaan konsultasi yang ditugaskan atau aktif saat ini. Pastikan status ketersediaan Anda aktif untuk menerima permintaan baru.
            </p>
            <motion.button 
              onClick={toggleAvailability}
              disabled={updatingAvailability || isAvailable}
              className={`inline-flex items-center px-8 py-4 rounded-xl text-white text-lg font-medium shadow-md transition-all duration-300 ${
                !isAvailable ? 'bg-gradient-to-r from-[#594C1A] to-[#938656] hover:from-[#938656] hover:to-[#594C1A]' : 'bg-gray-400 cursor-not-allowed'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
               {updatingAvailability ? (
                <FiLoader className="animate-spin mr-3" size={20} />
              ) : (
                <FiToggleRight className="mr-3" size={20} />
              )}
              Set Status Tersedia
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {consultations.map(consultation => (
              <motion.div 
                key={consultation.id} 
                className="bg-white shadow-xl rounded-[2rem] overflow-hidden border border-[#EAE0D0]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              >
                <div className="p-6 sm:p-8">
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-[#594C1A] mb-2">{consultation.designData.name}</h2>
                      <p className="text-[#594C1A]/80 text-sm">{consultation.designData.description}</p>
                    </div>
                    {getStatusBadge(consultation.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#594C1A]/90 text-sm mt-6">
                     <div className="flex items-center">
                      <FiInfo className="mr-2 w-4 h-4" />
                      <span>Gaya: {consultation.designData.style || 'Belum ditentukan'}</span>
                    </div>
                    <div className="flex items-center">
                      <FiUser className="mr-2 w-4 h-4" />
                      <span>Pengguna ID: {consultation.userId}</span>
                    </div>
                     <div className="flex items-center">
                      <FiClock className="mr-2 w-4 h-4" />
                      <span>Dibuat pada: {formatDate(consultation.createdAt)}</span>
                    </div>
                     <div className="flex items-center">
                      <span className="font-semibold">Estimasi Harga:</span>
                       <span className="ml-2">{new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                      }).format(Number(consultation.designData.estimatedPrice) || 0)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end mt-8 flex-wrap gap-3">
                     {consultation.status === 'pending' && (
                      <motion.button
                        onClick={() => updateStatus(consultation.id!, 'active')}
                        disabled={updatingStatus === consultation.id}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl text-lg font-medium shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {updatingStatus === consultation.id ? (
                          <FiLoader className="animate-spin mr-3" size={20} />
                        ) : (
                          <FiCheckCircle className="mr-3" size={20} />
                        )}
                        Konfirmasi Mulai Konsultasi
                      </motion.button>
                    )}

                     {consultation.status === 'active' && (
                       <motion.button
                        onClick={() => router.push(`/Profile/consultations/${consultation.id}`)}
                         className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-lg font-medium shadow-md transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                         <FiMessageSquare className="mr-3" size={20} />
                        Lihat Percakapan
                      </motion.button>
                    )}

                    {(consultation.status === 'active' || consultation.status === 'pending') && (
                      <motion.button
                        onClick={() => updateStatus(consultation.id!, 'cancelled')}
                        disabled={updatingStatus === consultation.id}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl text-lg font-medium shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {updatingStatus === consultation.id ? (
                          <FiLoader className="animate-spin mr-3" size={20} />
                        ) : (
                          <FiXCircle className="mr-3" size={20} />
                        )}
                        Batalkan Konsultasi
                      </motion.button>
                    )}

                     {consultation.status === 'completed' && (
                       <motion.button
                        onClick={() => router.push(`/Profile/consultations/${consultation.id}`)}
                         className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl text-lg font-medium shadow-md transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                         <FiInfo className="mr-3" size={20} />
                        Lihat Detail (Selesai)
                      </motion.button>
                    )}

                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 