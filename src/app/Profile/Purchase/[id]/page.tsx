"use client";

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import {
  FileText,
  Package,
  CheckCircle,
  Download,
  ChevronLeft,
  Home as HomeIcon,
  Ruler,
  Users,
  Clock,
  AlertCircle,
  Eye,
  X,
  Image as ImageIcon,
  Hammer,
  PackageOpen,
  Send,
  Calendar
} from 'lucide-react';

interface FirestoreMaterial {
  name: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  estimatedArrival?: string;
  quantity: number;
  unit: string;
  lastUpdated: Timestamp;
  notes?: string;
}

interface Material extends Omit<FirestoreMaterial, 'lastUpdated'> {
  lastUpdated: Date;
}

interface Blueprint {
  name: string;
  fileUrl?: string;
  url?: string;
  imageUrl?: string;
  description?: string;
}

interface Room {
  name: string;
  area: number;
  description?: string;
  imageUrl?: string;
}

interface ConstructionStage {
  name: string;
  duration: number;
  description?: string;
  imageUrl?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
}

interface EstimatedCost {
  materialCost: number;
  laborCost: number;
  otherCost: number;
  totalCost: number;
}

interface PurchaseDetails {
  id: string;
  status: 'pending' | 'completed' | 'cancelled';
  purchaseDate: Timestamp;
  totalAmount: number;
  houseId: string;
  houseName: string;
  houseImage: string;
  userDetails: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  materials: Material[];
  constructionGuide?: {
    title: string;
    fileUrl: string;
  };
  blueprints: Blueprint[];
  houseDetails?: {
    type: string;
    area: string;
    capacity: string;
    buildTime: string;
  };
  features?: string[];
  rooms?: Room[];
  constructionStages?: ConstructionStage[];
  estimatedCost?: EstimatedCost;
}

const DEFAULT_HOUSE_IMAGE = '/images/default-house.jpg';
const DEFAULT_BLUEPRINT_IMAGE = '/images/default-blueprint.jpg';

export default function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [purchase, setPurchase] = useState<PurchaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    const loadPurchaseDetails = async () => {
      if (authLoading) return; // Wait for auth to initialize

      if (!user) {
        router.push('/Login');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get purchase details initially
        const purchaseRef = doc(db, 'purchases', resolvedParams.id);
        const purchaseDoc = await getDoc(purchaseRef);

        if (!purchaseDoc.exists()) {
          setError('Purchase not found');
          setLoading(false);
          return;
        }

        const initialPurchaseData = purchaseDoc.data();

        // Get house details to fetch blueprints (assuming house details are static)
        const houseRef = doc(db, 'houses', initialPurchaseData.houseId);
        const houseDoc = await getDoc(houseRef);

        if (!houseDoc.exists()) {
          setError('House details not found');
          setLoading(false);
          return;
        }

        const houseData = houseDoc.data();

        // Set up real-time listener for purchase details (especially materials)
        unsubscribe = onSnapshot(purchaseRef, (snapshot) => {
          if (!snapshot.exists()) {
            setError('Purchase not found');
            setPurchase(null);
            return;
          }

          const liveData = snapshot.data();

          // Convert Firestore Timestamp to Date for materials
          const liveMaterials = liveData.materials?.map((material: FirestoreMaterial) => ({
            ...material,
            lastUpdated: material.lastUpdated?.toDate() || new Date()
          })) || [];

          // Update state with live data, preserving initial house and blueprint data
          setPurchase(prevPurchase => {
            if (!prevPurchase) {
              // This case should ideally not happen if initial fetch is successful
              // but as a fallback, create the full purchase object
              return {
                ...liveData as PurchaseDetails,
                id: snapshot.id,
                materials: liveMaterials,
                blueprints: houseData.blueprints?.map((blueprint: Blueprint) => ({
                  name: blueprint.name || 'Untitled Blueprint',
                  fileUrl: blueprint.url || blueprint.imageUrl || '',
                  description: blueprint.description
                })) || [],
                houseDetails: {
                  type: houseData.tipe || 'Modern',
                  area: `${houseData.luas || 0} m²`,
                  capacity: `${houseData.specifications?.bedroomCount || 0} Kamar`,
                  buildTime: `${houseData.durasi || 0} Hari`
                },
                features: houseData.features || [],
                rooms: houseData.rooms || [],
                constructionStages: houseData.constructionStages || [],
                estimatedCost: houseData.estimatedCost,
              };
            }

            // Update existing purchase state with live material data and status
            return {
              ...prevPurchase,
              materials: liveMaterials,
              status: liveData.status,
              purchaseDate: liveData.purchaseDate,
              totalAmount: liveData.totalAmount,
              // Keep house details, blueprints, features, rooms, stages, cost
              // from initial fetch as they are part of the house data, not purchase data
            };
          });

          setLoading(false);
        }, (err) => {
          console.error('Error listening to purchase changes:', err);
          setError('Failed to load live purchase updates');
          setLoading(false);
        });

      } catch (err) {
        console.error('Error loading initial purchase data:', err);
        setError('Failed to load purchase details');
        setLoading(false);
      }
    };

    loadPurchaseDetails();

    // Cleanup function to unsubscribe from the listener
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [resolvedParams.id, router, user, authLoading]);

  const getStatusColor = (status: FirestoreMaterial['status']) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'shipped':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: FirestoreMaterial['status']) => {
    switch (status) {
      case 'delivered':
        return 'Terkirim';
      case 'shipped':
        return 'Dalam Pengiriman';
      case 'processing':
        return 'Diproses';
      default:
        return 'Menunggu';
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleContactSupport = () => {
    router.push('/support?purchaseId=' + resolvedParams.id);
  };

  const getValidImageUrl = (url: string | undefined | null, defaultImage: string) => {
    if (!url || url.trim() === '') {
      return defaultImage;
    }
    // Check if the URL is a base64 string
    if (url.startsWith('data:image')) {
      return url;
    }
    // If it's a regular URL, ensure it's using HTTPS
    return url.startsWith('http') ? url : `https://${url}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F6F6EC]">
        <Navbar />
        <div className="min-h-screen bg-[#F6F6EC] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#594C1A] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="min-h-screen bg-[#F6F6EC]">
        <Navbar />
        <div className="min-h-screen bg-[#F6F6EC] flex flex-col items-center justify-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-red-600 mb-4">{error || 'Purchase not found'}</p>
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#594C1A] hover:text-[#938656]"
          >
            <ChevronLeft size={20} className="mr-2" />
            <span>Kembali</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6EC]">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={20} className="mr-2" />
              <span>Kembali ke Profil</span>
            </button>
            <div className="flex items-center">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                purchase.status === 'completed' 
                  ? 'bg-green-500 text-white' 
                  : purchase.status === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {purchase.status === 'completed' ? 'Selesai' : 
                 purchase.status === 'pending' ? 'Menunggu' : 'Dibatalkan'}
              </span>
            </div>
          </div>

          {/* Change main grid to 2 columns on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="space-y-8">
              {/* House Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="relative h-64 md:h-80">
                  <Image
                    src={getValidImageUrl(purchase.houseImage, DEFAULT_HOUSE_IMAGE)}
                    alt={purchase.houseName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                    unoptimized={purchase.houseImage?.startsWith('data:image')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{purchase.houseName}</h1>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-center text-gray-600 text-sm md:text-base">
                      <HomeIcon className="w-5 h-5 text-[#594C1A] mr-2 flex-shrink-0" />
                      <span>Type {purchase.houseDetails?.type}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm md:text-base">
                      <Ruler className="w-5 h-5 text-[#594C1A] mr-2 flex-shrink-0" />
                      <span>{purchase.houseDetails?.area}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm md:text-base">
                      <Users className="w-5 h-5 text-[#594C1A] mr-2 flex-shrink-0" />
                      <span>{purchase.houseDetails?.capacity}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm md:text-base">
                      <Clock className="w-5 h-5 text-[#594C1A] mr-2 flex-shrink-0" />
                      <span>{purchase.houseDetails?.buildTime}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Blueprints Preview */}
              {purchase.blueprints && purchase.blueprints.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
                >
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">Blueprint</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {purchase.blueprints.map((blueprint, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer transform transition-transform hover:scale-105"
                        onClick={() => setSelectedBlueprint(blueprint)}
                      >
                        <p className="text-sm font-medium text-gray-800 mb-1 truncate">{blueprint.name || 'Untitled Blueprint'}</p>
                        <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden relative">
                          {blueprint.fileUrl ? (
                            <Image
                              src={getValidImageUrl(blueprint.fileUrl, DEFAULT_BLUEPRINT_IMAGE)}
                              alt={blueprint.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              unoptimized={blueprint.fileUrl?.startsWith('data:image')}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <ImageIcon className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <h3 className="font-medium text-gray-800 text-sm md:text-base truncate">{blueprint.name}</h3>
                          {blueprint.description && (
                            <p className="text-sm text-gray-500 mt-1 truncate">{blueprint.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Features */}
              {purchase.features && purchase.features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
                >
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">Fitur Rumah</h2>
                  <div className="flex flex-wrap gap-3">
                    {purchase.features.map((feature, index) => (
                      <span key={index} className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium flex items-center">
                         <CheckCircle size={16} className="mr-2 flex-shrink-0"/> {feature}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Rooms */}
              {purchase.rooms && purchase.rooms.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
                >
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">Ruangan</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {purchase.rooms.map((room, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        {room.imageUrl && (
                           <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                             <Image
                               src={getValidImageUrl(room.imageUrl, '')}
                               alt={room.name}
                               fill
                               className="object-cover"
                               sizes="64px"
                               unoptimized={room.imageUrl?.startsWith('data:image')}
                             />
                           </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 text-base md:text-lg">{room.name}</h3>
                          {room.area > 0 && (
                            <p className="text-sm text-gray-600 mt-0.5">Luas: {room.area} m²</p>
                          )}
                          {room.description && (
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{room.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Material Tracking */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
              >
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">Status Material</h2>
                <div className="space-y-6">
                  {purchase.materials?.map((material, index) => (
                    <div key={index} className="border-b pb-6 last:border-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center">
                          <Package className="w-6 h-6 text-[#594C1A] mr-3 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium text-gray-800 text-base md:text-lg">{material.name}</h3>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {material.quantity} {material.unit}
                            </p>
                          </div>
                        </div>
                        <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(material.status)}`}>
                           {material.status === 'delivered' && <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />} 
                           {material.status === 'shipped' && <Send className="w-4 h-4 mr-2 flex-shrink-0" />} 
                           {material.status === 'processing' && <PackageOpen className="w-4 h-4 mr-2 flex-shrink-0" />} 
                           {material.status === 'pending' && <Package className="w-4 h-4 mr-2 flex-shrink-0" />} 
                          {getStatusText(material.status)}
                        </span>
                      </div>
                      {material.estimatedArrival && (
                        <p className="text-sm text-gray-600 mt-3">
                          <Calendar size={16} className="inline-block mr-2 text-gray-500" />
                          Estimasi tiba: {new Date(material.estimatedArrival).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      )}
                      {material.notes && (
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                           <FileText size={16} className="inline-block mr-2 text-gray-500" />
                          Catatan: {material.notes}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Terakhir diupdate: {new Date(material.lastUpdated).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ))}

                  {(!purchase.materials || purchase.materials.length === 0) && (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Belum ada material yang ditambahkan</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Construction Stages */}
              {purchase.constructionStages && purchase.constructionStages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
                >
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">Tahap Konstruksi</h2>
                  <ol className="relative border-s-2 border-gray-200 dark:border-gray-700 ml-3 pl-6">
                    {purchase.constructionStages.map((stage, index) => (
                      <li key={index} className="mb-10 ">
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -start-4 ring-8 ring-white dark:ring-gray-800 dark:bg-blue-900">
                           {stage.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-blue-800 dark:text-blue-300" />
                           ) : (
                              <Hammer className="w-4 h-4 text-blue-800 dark:text-blue-300" />
                           )}
                         </span>
                        <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">{stage.name}</h3>
                       {stage.duration > 0 && (
                         <time className="block mb-2 text-sm font-normal leading-none text-gray-500 dark:text-gray-400">Estimasi: {stage.duration} hari</time>
                       )}
                      {stage.description && (
                         <p className="mb-4 text-base font-normal text-gray-700 dark:text-gray-400 leading-relaxed">{stage.description}</p>
                      )}
                       {stage.imageUrl && (
                         <div className="relative w-full h-48 md:h-64 mb-4 rounded-lg overflow-hidden">
                           <Image
                             src={getValidImageUrl(stage.imageUrl, '')}
                             alt={stage.name}
                             fill
                             className="object-cover"
                             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                             unoptimized={stage.imageUrl?.startsWith('data:image')}
                           />
                         </div>
                       )}
                    </li>
                  ))}
                </ol>
                {purchase.constructionStages.length === 0 && (
                   <p className="text-gray-500 text-center">No construction stages available.</p>
                )}
              </motion.div>
            )}

               {/* Estimated Cost */}
            {purchase.estimatedCost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
              >
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">Estimasi Biaya</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-700 text-base">
                    <span>Biaya Material:</span>
                    <span>Rp {Number(purchase.estimatedCost.materialCost).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 text-base">
                    <span>Biaya Tenaga Kerja:</span>
                    <span>Rp {Number(purchase.estimatedCost.laborCost).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 text-base">
                    <span>Biaya Lain-lain:</span>
                    <span>Rp {Number(purchase.estimatedCost.otherCost).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-gray-900 text-lg">
                    <span>Total Estimasi Biaya:</span>
                    <span>Rp {Number(purchase.estimatedCost.totalCost).toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            )}

              {/* Construction Guide */}
              {purchase.constructionGuide && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }} // Adjust delay as needed
                  className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
                >
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">Panduan Konstruksi</h2>
                  {/* Existing Construction Guide Content */}
                  <div className="p-4 bg-[#594C1A]/5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-[#594C1A] flex-shrink-0" />
                        <span className="text-gray-700 font-medium text-base">{purchase.constructionGuide.title}</span>
                      </div>
                      <button
                        onClick={() => handleDownload(purchase.constructionGuide!.fileUrl, 'panduan-konstruksi.pdf')}
                        className="p-2 text-[#594C1A] hover:text-[#938656] transition-colors flex-shrink-0"
                        aria-label="Download Construction Guide"
                      >
                        <Download className="w-6 h-6" />
                      </button>
                    </div>
                </motion.div>
              )}

              {/* Contact Support */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }} // Adjust delay as needed
                className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
              >
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">Butuh Bantuan?</h2>
                {/* Existing Contact Support Content */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Tim support kami siap membantu Anda dengan pertanyaan seputar material dan konstruksi.
                </p>
                <button
                  onClick={handleContactSupport}
                  className="w-full py-3 bg-[#594C1A] text-white rounded-xl font-medium hover:bg-[#938656] transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                >
                  Hubungi Support
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Blueprint Modal */}
      {selectedBlueprint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">{selectedBlueprint.name || 'Untitled Blueprint'}</h3>
              <div className="flex items-center gap-2">
                {selectedBlueprint.fileUrl && (
                  <button
                    onClick={() => handleDownload(selectedBlueprint.fileUrl!, `${selectedBlueprint.name.toLowerCase().replace(/\s+/g, '-')}.pdf`)}
                    className="p-2 text-[#594C1A] hover:text-[#938656]"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedBlueprint(null)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
              {selectedBlueprint.fileUrl ? (
                <div className="relative w-full aspect-[4/3]">
                  <Image
                    src={getValidImageUrl(selectedBlueprint.fileUrl, DEFAULT_BLUEPRINT_IMAGE)}
                    alt={selectedBlueprint.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized={selectedBlueprint.fileUrl?.startsWith('data:image')}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-xl">
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No blueprint image available</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 