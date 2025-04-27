"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import Link from 'next/link';
import { ChevronLeft, Save, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageUploader from '@/components/Admin/ImageUploader';
import { addHouse, HouseFormData } from '@/services/houseService';
import { isAdmin } from '@/services/adminService';
import { useAdmin } from '@/hooks/useAdmin';

interface FormError {
  [key: string]: string;
}

export default function AddHousePage() {
  const router = useRouter();
  const { isAdminUser, loading: checkingAdmin } = useAdmin();
  const [formData, setFormData] = useState<HouseFormData>({
    name: '',
    durasi: 30,
    harga: 0,
    luas: 0,
    material: '',
    tipe: 'modern',
    description: '',
  });
  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const auth = getAuth();

  // Redirect non-admin users
  if (!checkingAdmin && !isAdminUser) {
    router.push('/');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric values
    if (name === 'durasi' || name === 'harga' || name === 'luas') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Clear error if field was corrected
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormError = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama rumah wajib diisi';
    }
    
    if (formData.durasi <= 0) {
      newErrors.durasi = 'Durasi harus lebih dari 0';
    }
    
    if (formData.harga <= 0) {
      newErrors.harga = 'Harga harus lebih dari 0';
    }
    
    if (formData.luas <= 0) {
      newErrors.luas = 'Luas harus lebih dari 0';
    }
    
    if (!formData.material.trim()) {
      newErrors.material = 'Material wajib diisi';
    }
    
    if (!formData.tipe.trim()) {
      newErrors.tipe = 'Tipe rumah wajib diisi';
    }
    
    if (!image) {
      newErrors.image = 'Foto rumah wajib diunggah';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return;
    }
    
    const user = auth.currentUser;
    if (!user) {
      setSubmitError('Anda harus login untuk menambahkan rumah');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Verify user is admin again as a security measure
      const adminStatus = await isAdmin(user.uid);
      if (!adminStatus) {
        throw new Error('Unauthorized: Only admins can add houses');
      }
      
      // Add house to Firestore - image is already a base64 string from ImageUploader
      await addHouse(formData, image!, user.uid);
      
      // Redirect to houses list page
      router.push('/Admin/Houses');
    } catch (error) {
      console.error('Error adding house:', error);
      setSubmitError(error instanceof Error ? error.message : 'Terjadi kesalahan saat menambahkan rumah');
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // House type options
  const houseTypes = [
    { value: 'modern', label: 'Modern' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'traditional', label: 'Traditional' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'colonial', label: 'Colonial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'scandinavian', label: 'Scandinavian' },
  ];
  
  // Material options
  const materialOptions = [
    { value: 'kayu', label: 'Kayu' },
    { value: 'beton', label: 'Beton' },
    { value: 'bata', label: 'Bata' },
    { value: 'baja', label: 'Baja' },
    { value: 'kaca', label: 'Kaca' },
    { value: 'bambu', label: 'Bambu' },
    { value: 'campuran', label: 'Campuran' },
  ];

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6EC]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Memeriksa izin akses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6EC] pt-16 pb-24">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/Admin/Houses" className="inline-flex items-center text-amber-800 hover:text-amber-700">
            <ChevronLeft size={20} />
            <span>Kembali ke Daftar Rumah</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-amber-800 mb-8">Tambah Rumah Prebuilt Baru</h1>
          
          {submitError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Gagal menambahkan rumah</p>
                <p className="text-sm">{submitError}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">Foto Rumah</label>
              <ImageUploader 
                onImageChange={setImage} 
              />
              {errors.image && (
                <p className="text-red-500 text-sm">{errors.image}</p>
              )}
              <p className="text-gray-500 text-sm">Unggah foto dengan rasio 16:9 untuk tampilan terbaik.</p>
            </div>
            
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-gray-700 font-medium">Nama Rumah</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contoh: Rumah Modern Minimalis"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
            
            {/* House Type */}
            <div className="space-y-2">
              <label htmlFor="tipe" className="block text-gray-700 font-medium">Tipe Rumah</label>
              <select
                id="tipe"
                name="tipe"
                value={formData.tipe}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.tipe ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {houseTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.tipe && (
                <p className="text-red-500 text-sm">{errors.tipe}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price */}
              <div className="space-y-2">
                <label htmlFor="harga" className="block text-gray-700 font-medium">Harga (Juta)</label>
                <div className="relative">
                  <input
                    type="number"
                    id="harga"
                    name="harga"
                    value={formData.harga === 0 ? '' : formData.harga}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.harga ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="450"
                    min="0"
                    step="any"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                    Juta
                  </div>
                </div>
                {errors.harga && (
                  <p className="text-red-500 text-sm">{errors.harga}</p>
                )}
              </div>
              
              {/* Duration */}
              <div className="space-y-2">
                <label htmlFor="durasi" className="block text-gray-700 font-medium">Durasi Pembangunan (Hari)</label>
                <div className="relative">
                  <input
                    type="number"
                    id="durasi"
                    name="durasi"
                    value={formData.durasi === 0 ? '' : formData.durasi}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.durasi ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="30"
                    min="1"
                    step="1"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                    Hari
                  </div>
                </div>
                {errors.durasi && (
                  <p className="text-red-500 text-sm">{errors.durasi}</p>
                )}
              </div>
              
              {/* Area */}
              <div className="space-y-2">
                <label htmlFor="luas" className="block text-gray-700 font-medium">Luas Bangunan (m²)</label>
                <div className="relative">
                  <input
                    type="number"
                    id="luas"
                    name="luas"
                    value={formData.luas === 0 ? '' : formData.luas}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.luas ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="100"
                    min="0"
                    step="any"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                    m²
                  </div>
                </div>
                {errors.luas && (
                  <p className="text-red-500 text-sm">{errors.luas}</p>
                )}
              </div>
            </div>
            
            {/* Material */}
            <div className="space-y-2">
              <label htmlFor="material" className="block text-gray-700 font-medium">Material Utama</label>
              <select
                id="material"
                name="material"
                value={formData.material}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.material ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="" disabled>Pilih material utama</option>
                {materialOptions.map(material => (
                  <option key={material.value} value={material.value}>{material.label}</option>
                ))}
              </select>
              {errors.material && (
                <p className="text-red-500 text-sm">{errors.material}</p>
              )}
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-gray-700 font-medium">Deskripsi</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Deskripsi lengkap tentang rumah ini..."
              />
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-amber-800 text-white rounded-lg shadow-md hover:bg-amber-700 transition-colors flex items-center justify-center w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    <span>Simpan Rumah</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 