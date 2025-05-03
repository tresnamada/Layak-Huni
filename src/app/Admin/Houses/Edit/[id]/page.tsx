"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageUploader from '@/components/Admin/ImageUploader';
import BlueprintUploader from '@/components/Admin/BlueprintUploader';
import { HouseFormData, Material, Room } from '@/services/houseService';
import { getHouseForEdit, updateHouse, validateHouseData } from '@/services/houseEditService';
import { useAdmin } from '@/hooks/useAdmin';

interface FormError {
  [key: string]: string;
}

export default function EditHousePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { isAdminUser, loading: checkingAdmin } = useAdmin();
  const resolvedParams = use(params);
  const [formData, setFormData] = useState<HouseFormData>({
    name: '',
    durasi: 30,
    harga: 0,
    luas: 0,
    material: '',
    tipe: 'modern',
    description: '',
    materials: [],
    rooms: [],
    blueprints: [],
    specifications: {
      floorCount: 1,
      bedroomCount: 2,
      bathroomCount: 1,
      carportCount: 1,
      buildingArea: 0,
      landArea: 0
    },
    features: [],
    constructionStages: [],
    estimatedCost: {
      materialCost: 0,
      laborCost: 0,
      otherCost: 0,
      totalCost: 0
    }
  });
  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newMaterial, setNewMaterial] = useState<Material>({ name: '', quantity: 0, unit: '', price: 0 });
  const [newRoom, setNewRoom] = useState<Room>({ name: '', area: 0, description: '' });
  const [newFeature, setNewFeature] = useState('');
  const [newStage, setNewStage] = useState({ name: '', duration: 0, description: '' });

  // Load house data
  useEffect(() => {
    const loadHouseData = async () => {
      try {
        const houseData = await getHouseForEdit(resolvedParams.id);
        if (houseData) {
          // Ensure all required properties exist with default values
          const updatedHouseData = {
            ...houseData,
            materials: houseData.materials || [],
            rooms: houseData.rooms || [],
            blueprints: houseData.blueprints || [],
            features: houseData.features || [],
            constructionStages: houseData.constructionStages || [],
            specifications: houseData.specifications || {
              floorCount: 1,
              bedroomCount: 2,
              bathroomCount: 1,
              carportCount: 1,
              buildingArea: 0,
              landArea: 0
            },
            estimatedCost: houseData.estimatedCost || {
              materialCost: 0,
              laborCost: 0,
              otherCost: 0,
              totalCost: 0
            }
          };
          setFormData(updatedHouseData);
          setImage(houseData.imageUrl);
        }
      } catch (error) {
        console.error('Error loading house data:', error);
        setSubmitError('Gagal memuat data rumah');
      }
    };

    loadHouseData();
  }, [resolvedParams.id]);

  // Redirect non-admin users
  if (!checkingAdmin && !isAdminUser) {
    router.push('/');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('specifications.')) {
      const specField = name.split('.')[1];
      const numValue = value === '' ? 0 : Number(value);
      if (!isNaN(numValue)) {
        setFormData(prev => ({
          ...prev,
          specifications: {
            ...prev.specifications,
            [specField]: numValue
          }
        }));
      }
    } else if (name.startsWith('estimatedCost.')) {
      const costField = name.split('.')[1];
      const numValue = value === '' ? 0 : Number(value);
      if (!isNaN(numValue)) {
        setFormData(prev => ({
          ...prev,
          estimatedCost: {
            ...prev.estimatedCost,
            [costField]: numValue
          }
        }));
      }
    } else if (name === 'durasi' || name === 'harga' || name === 'luas') {
      const numValue = value === '' ? 0 : Number(value);
      if (!isNaN(numValue)) {
        setFormData(prev => ({
          ...prev,
          [name]: numValue
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addMaterial = () => {
    if (newMaterial.name && newMaterial.quantity > 0) {
      const material = {
        ...newMaterial,
        quantity: Number(newMaterial.quantity) || 0,
        price: Number(newMaterial.price) || 0
      };
      setFormData(prev => ({
        ...prev,
        materials: [...(prev.materials || []), material]
      }));
      setNewMaterial({ name: '', quantity: 0, unit: '', price: 0 });
    }
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const addRoom = () => {
    if (newRoom.name && newRoom.area > 0) {
      const room = {
        ...newRoom,
        area: Number(newRoom.area) || 0
      };
      setFormData(prev => ({
        ...prev,
        rooms: [...(prev.rooms || []), room]
      }));
      setNewRoom({ name: '', area: 0, description: '' });
    }
  };

  const removeRoom = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== index)
    }));
  };

  const removeBlueprint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      blueprints: prev.blueprints.filter((_, i) => i !== index)
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addConstructionStage = () => {
    if (newStage.name && newStage.duration > 0) {
      const stage = {
        ...newStage,
        duration: Number(newStage.duration) || 0
      };
      setFormData(prev => ({
        ...prev,
        constructionStages: [...(prev.constructionStages || []), stage]
      }));
      setNewStage({ name: '', duration: 0, description: '' });
    }
  };

  const removeConstructionStage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      constructionStages: prev.constructionStages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate and format all data before submission
    const validatedFormData = {
      ...formData,
      // Format materials array
      materials: (formData.materials || []).map(material => ({
        name: material.name || '',
        quantity: Number(material.quantity) || 0,
        unit: material.unit || '',
        price: Number(material.price) || 0
      })),
      // Format rooms array
      rooms: (formData.rooms || []).map(room => ({
        name: room.name || '',
        area: Number(room.area) || 0,
        description: room.description || ''
      })),
      // Format blueprints array
      blueprints: (formData.blueprints || []).map(blueprint => ({
        url: blueprint.url || '',
        description: blueprint.description || ''
      })),
      // Format features array
      features: (formData.features || []).map(feature => feature || ''),
      // Format construction stages array
      constructionStages: (formData.constructionStages || []).map(stage => ({
        name: stage.name || '',
        duration: Number(stage.duration) || 0,
        description: stage.description || ''
      })),
      // Format specifications object
      specifications: {
        floorCount: Number(formData.specifications.floorCount) || 0,
        bedroomCount: Number(formData.specifications.bedroomCount) || 0,
        bathroomCount: Number(formData.specifications.bathroomCount) || 0,
        carportCount: Number(formData.specifications.carportCount) || 0,
        buildingArea: Number(formData.specifications.buildingArea) || 0,
        landArea: Number(formData.specifications.landArea) || 0
      },
      // Format estimated cost object
      estimatedCost: {
        materialCost: Number(formData.estimatedCost.materialCost) || 0,
        laborCost: Number(formData.estimatedCost.laborCost) || 0,
        otherCost: Number(formData.estimatedCost.otherCost) || 0,
        totalCost: Number(formData.estimatedCost.totalCost) || 0
      }
    };
    
    const { isValid, errors: validationErrors } = validateHouseData(validatedFormData);
    if (!isValid) {
      setErrors(validationErrors);
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Ensure all nested arrays and objects are properly formatted
      const firebaseData = {
        ...validatedFormData,
        materials: validatedFormData.materials || [],
        rooms: validatedFormData.rooms || [],
        blueprints: validatedFormData.blueprints || [],
        features: validatedFormData.features || [],
        constructionStages: validatedFormData.constructionStages || [],
        specifications: validatedFormData.specifications || {
          floorCount: 0,
          bedroomCount: 0,
          bathroomCount: 0,
          carportCount: 0,
          buildingArea: 0,
          landArea: 0
        },
        estimatedCost: validatedFormData.estimatedCost || {
          materialCost: 0,
          laborCost: 0,
          otherCost: 0,
          totalCost: 0
        }
      };
      
      await updateHouse(resolvedParams.id, firebaseData, image || undefined);
      
      // Redirect to houses list page
      router.push('/Admin/Houses');
    } catch (error) {
      console.error('Error updating house:', error);
      setSubmitError(error instanceof Error ? error.message : 'Terjadi kesalahan saat memperbarui rumah');
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
          <h1 className="text-3xl font-bold text-amber-800 mb-8">Edit Rumah Prebuilt</h1>
          
          {submitError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Gagal memperbarui rumah</p>
                <p className="text-sm">{submitError}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Informasi Dasar</h2>
              
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">Foto Rumah</label>
                <ImageUploader onImageChange={setImage} initialImage={image} />
                {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Contoh: Rumah Modern Minimalis"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              {/* House Type */}
              <div className="space-y-2">
                <label htmlFor="tipe" className="block text-gray-700 font-medium">Tipe Rumah</label>
                <select
                  id="tipe"
                  name="tipe"
                  value={formData.tipe}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  {houseTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.tipe && <p className="text-red-500 text-sm">{errors.tipe}</p>}
              </div>

              {/* Price, Duration, Area */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="harga" className="block text-gray-700 font-medium">Harga (Juta)</label>
                  <input
                    type="number"
                    id="harga"
                    name="harga"
                    value={formData.harga}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="450"
                  />
                  {errors.harga && <p className="text-red-500 text-sm">{errors.harga}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="durasi" className="block text-gray-700 font-medium">Durasi (Hari)</label>
                  <input
                    type="number"
                    id="durasi"
                    name="durasi"
                    value={formData.durasi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="30"
                  />
                  {errors.durasi && <p className="text-red-500 text-sm">{errors.durasi}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="luas" className="block text-gray-700 font-medium">Luas (m²)</label>
                  <input
                    type="number"
                    id="luas"
                    name="luas"
                    value={formData.luas}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="100"
                  />
                  {errors.luas && <p className="text-red-500 text-sm">{errors.luas}</p>}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-gray-700 font-medium">Deskripsi</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Deskripsi lengkap tentang rumah ini..."
                />
              </div>
            </div>

            {/* Specifications Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Spesifikasi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="floorCount" className="block text-gray-700 font-medium">Jumlah Lantai</label>
                  <input
                    type="number"
                    id="floorCount"
                    name="specifications.floorCount"
                    value={formData.specifications.floorCount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  {errors['specifications.floorCount'] && <p className="text-red-500 text-sm">{errors['specifications.floorCount']}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="bedroomCount" className="block text-gray-700 font-medium">Jumlah Kamar Tidur</label>
                  <input
                    type="number"
                    id="bedroomCount"
                    name="specifications.bedroomCount"
                    value={formData.specifications.bedroomCount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  {errors['specifications.bedroomCount'] && <p className="text-red-500 text-sm">{errors['specifications.bedroomCount']}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="bathroomCount" className="block text-gray-700 font-medium">Jumlah Kamar Mandi</label>
                  <input
                    type="number"
                    id="bathroomCount"
                    name="specifications.bathroomCount"
                    value={formData.specifications.bathroomCount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  {errors['specifications.bathroomCount'] && <p className="text-red-500 text-sm">{errors['specifications.bathroomCount']}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="carportCount" className="block text-gray-700 font-medium">Jumlah Carport</label>
                  <input
                    type="number"
                    id="carportCount"
                    name="specifications.carportCount"
                    value={formData.specifications.carportCount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="buildingArea" className="block text-gray-700 font-medium">Luas Bangunan (m²)</label>
                  <input
                    type="number"
                    id="buildingArea"
                    name="specifications.buildingArea"
                    value={formData.specifications.buildingArea}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  {errors['specifications.buildingArea'] && <p className="text-red-500 text-sm">{errors['specifications.buildingArea']}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="landArea" className="block text-gray-700 font-medium">Luas Tanah (m²)</label>
                  <input
                    type="number"
                    id="landArea"
                    name="specifications.landArea"
                    value={formData.specifications.landArea}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  {errors['specifications.landArea'] && <p className="text-red-500 text-sm">{errors['specifications.landArea']}</p>}
                </div>
              </div>
            </div>

            {/* Materials Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Material</h2>
              <div className="space-y-4">
                {(formData.materials || []).map((material, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={material.name}
                        readOnly
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Nama Material"
                      />
                      <input
                        type="number"
                        value={material.quantity}
                        readOnly
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Jumlah"
                      />
                      <input
                        type="text"
                        value={material.unit}
                        readOnly
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Satuan"
                      />
                      <input
                        type="number"
                        value={material.price}
                        readOnly
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Harga"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMaterial(index)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Nama Material"
                    />
                    <input
                      type="number"
                      value={newMaterial.quantity}
                      onChange={(e) => setNewMaterial({ ...newMaterial, quantity: parseFloat(e.target.value) })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Jumlah"
                    />
                    <input
                      type="text"
                      value={newMaterial.unit}
                      onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Satuan"
                    />
                    <input
                      type="number"
                      value={newMaterial.price}
                      onChange={(e) => setNewMaterial({ ...newMaterial, price: parseFloat(e.target.value) })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Harga"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addMaterial}
                    className="p-2 text-amber-800 hover:text-amber-700"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Rooms Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Ruangan</h2>
              <div className="space-y-4">
                {(formData.rooms || []).map((room, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={room.name}
                        readOnly
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Nama Ruangan"
                      />
                      <input
                        type="number"
                        value={room.area}
                        readOnly
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Luas (m²)"
                      />
                      <input
                        type="text"
                        value={room.description}
                        readOnly
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Deskripsi"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRoom(index)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newRoom.name}
                      onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Nama Ruangan"
                    />
                    <input
                      type="number"
                      value={newRoom.area}
                      onChange={(e) => setNewRoom({ ...newRoom, area: parseFloat(e.target.value) })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Luas (m²)"
                    />
                    <input
                      type="text"
                      value={newRoom.description}
                      onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Deskripsi"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addRoom}
                    className="p-2 text-amber-800 hover:text-amber-700"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Blueprints Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Blueprint</h2>
              <div className="space-y-4">
                {(formData.blueprints || []).map((blueprint, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={blueprint.url}
                          alt={blueprint.description}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{blueprint.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBlueprint(index)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <BlueprintUploader
                    onBlueprintChange={(blueprint) => {
                      setFormData(prev => ({
                        ...prev,
                        blueprints: [...prev.blueprints, blueprint]
                      }));
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Fitur</h2>
              <div className="space-y-4">
                {(formData.features || []).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feature}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Tambah fitur baru"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="p-2 text-amber-800 hover:text-amber-700"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Construction Stages Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Tahap Konstruksi</h2>
              <div className="space-y-4">
                {(formData.constructionStages || []).map((stage, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={stage.name}
                        readOnly
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Nama Tahap"
                      />
                      <input
                        type="number"
                        value={stage.duration}
                        readOnly
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Durasi (hari)"
                      />
                      <input
                        type="text"
                        value={stage.description}
                        readOnly
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Deskripsi"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeConstructionStage(index)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newStage.name}
                      onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Nama Tahap"
                    />
                    <input
                      type="number"
                      value={newStage.duration}
                      onChange={(e) => setNewStage({ ...newStage, duration: parseFloat(e.target.value) })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Durasi (hari)"
                    />
                    <input
                      type="text"
                      value={newStage.description}
                      onChange={(e) => setNewStage({ ...newStage, description: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Deskripsi"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addConstructionStage}
                    className="p-2 text-amber-800 hover:text-amber-700"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Estimated Cost Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Perkiraan Biaya</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="materialCost" className="block text-gray-700 font-medium">Biaya Material</label>
                  <input
                    type="number"
                    id="materialCost"
                    name="estimatedCost.materialCost"
                    value={formData.estimatedCost.materialCost}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  {errors['estimatedCost.materialCost'] && <p className="text-red-500 text-sm">{errors['estimatedCost.materialCost']}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="laborCost" className="block text-gray-700 font-medium">Biaya Tenaga Kerja</label>
                  <input
                    type="number"
                    id="laborCost"
                    name="estimatedCost.laborCost"
                    value={formData.estimatedCost.laborCost}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  {errors['estimatedCost.laborCost'] && <p className="text-red-500 text-sm">{errors['estimatedCost.laborCost']}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="otherCost" className="block text-gray-700 font-medium">Biaya Lainnya</label>
                  <input
                    type="number"
                    id="otherCost"
                    name="estimatedCost.otherCost"
                    value={formData.estimatedCost.otherCost}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  {errors['estimatedCost.otherCost'] && <p className="text-red-500 text-sm">{errors['estimatedCost.otherCost']}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="totalCost" className="block text-gray-700 font-medium">Total Biaya</label>
                  <input
                    type="number"
                    id="totalCost"
                    name="estimatedCost.totalCost"
                    value={formData.estimatedCost.totalCost}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  {errors['estimatedCost.totalCost'] && <p className="text-red-500 text-sm">{errors['estimatedCost.totalCost']}</p>}
                </div>
              </div>
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
                    <span>Simpan Perubahan</span>
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