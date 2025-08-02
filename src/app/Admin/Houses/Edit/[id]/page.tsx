"use client";
import Image from 'next/image';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, AlertTriangle, Plus, Upload, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageUploader from '@/components/Admin/ImageUploader';
import { HouseFormData, Blueprint, Material, Room, ConstructionStage } from '@/services/houseService';
import { getHouseForEdit, updateHouse, validateHouseData } from '@/services/houseEditService';
import { useAdmin } from '@/hooks/useAdmin';
import { compressImage } from '@/utils/imageCompression';

interface FormError {
  [key: string]: string;
}

interface BlueprintUploaderProps {
  onBlueprintChange: (blueprint: Blueprint) => void;
}

const BlueprintUploader: React.FC<BlueprintUploaderProps> = ({ onBlueprintChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUrlInput, setIsUrlInput] = useState(false);
  const [url, setUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [blueprintName, setBlueprintName] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await handleImageUpload(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsCompressing(true);
      const compressedImage = await compressImage(file, 100); // Compress to under 100KB
      const base64String = compressedImage;
      setPreviewUrl(base64String);
      onBlueprintChange({
        url: base64String,
        description: file.name,
        type: 'floor',
        imageUrl: base64String,
        name: blueprintName || file.name
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      // Fallback to original image if compression fails
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewUrl(base64String);
        onBlueprintChange({
          url: base64String,
          description: file.name,
          type: 'floor',
          imageUrl: base64String,
          name: blueprintName || file.name
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleUrlSubmit = () => {
    if (url) {
      setPreviewUrl(url);
      onBlueprintChange({
        url: url,
        description: 'Blueprint URL',
        type: 'floor',
        imageUrl: url,
        name: blueprintName || 'Blueprint from URL'
      });
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={blueprintName}
        onChange={(e) => setBlueprintName(e.target.value)}
        placeholder="Enter blueprint name (e.g., Ground Floor Plan)"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
      />
      {!isUrlInput ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="blueprint-upload"
          />
          <label
            htmlFor="blueprint-upload"
            className="cursor-pointer block"
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isCompressing ? 'Compressing image...' : 'Drag and drop a blueprint image, or click to select'}
            </p>
          </label>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter blueprint URL"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleUrlSubmit}
            className="w-full px-4 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-700"
          >
            Add URL
          </button>
        </div>
      )}
      <button
        onClick={() => setIsUrlInput(!isUrlInput)}
        className="text-sm text-amber-800 hover:text-amber-700"
      >
        {isUrlInput ? 'Upload file instead' : 'Enter URL instead'}
      </button>
      {previewUrl && (
        <div className="mt-4">
          <Image
            src={previewUrl}
            alt="Blueprint preview"
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default function EditHousePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAdminUser, loading: checkingAdmin } = useAdmin();
  const [formData, setFormData] = useState<HouseFormData>({
    name: '',
    harga: '',
    luas: '',
    tipe: '',
    material: '',
    durasi: '',
    description: '',
    materials: [] as Material[],
    rooms: [] as Room[],
    blueprints: [] as Blueprint[],
    features: [] as string[],
    constructionStages: [] as ConstructionStage[],
    specifications: {
      floorCount: 0,
      bedroomCount: 0,
      bathroomCount: 0,
      carportCount: 0,
      buildingArea: 0,
      landArea: 0
    },
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
  const [newMaterial, setNewMaterial] = useState<{
    name: string;
    quantity: string | number;
    unit: string;
    price: string | number;
  }>({ name: '', quantity: '', unit: '', price: '' });
  const [newRoom, setNewRoom] = useState<{
    name: string;
    area: string | number;
    description: string;
  }>({ name: '', area: '', description: '' });
  const [newFeature, setNewFeature] = useState('');
  const [newStage, setNewStage] = useState<{
    name: string;
    duration: string | number;
    description: string;
  }>({ name: '', duration: '', description: '' });

  // Load house data
  useEffect(() => {
    const loadHouse = async () => {
      try {
        const house = await getHouseForEdit(resolvedParams.id);
        if (house) {
          setFormData({
            name: house.name,
            harga: house.harga,
            luas: house.luas,
            tipe: house.tipe,
            material: house.material,
            durasi: house.durasi,
            description: house.description,
            materials: house.materials || [],
            rooms: house.rooms || [],
            blueprints: house.blueprints || [],
            features: house.features || [],
            constructionStages: house.constructionStages || [],
            specifications: house.specifications,
            estimatedCost: house.estimatedCost
          });
          setImage(house.imageUrl);
        }
      } catch (error) {
        console.error('Error loading house:', error);
        setSubmitError('Failed to load house data');
      }
    };

    loadHouse();
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
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value === '' ? '' : Number(value)
        }
      }));
    } else if (name.startsWith('estimatedCost.')) {
      const costField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        estimatedCost: {
          ...prev.estimatedCost,
          [costField]: value === '' ? '' : Number(value)
        }
      }));
    } else if (name === 'durasi' || name === 'harga' || name === 'luas') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
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
    const quantity = Number(newMaterial.quantity);
    const price = Number(newMaterial.price);
    if (newMaterial.name && !isNaN(quantity) && quantity > 0 && !isNaN(price)) {
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, {
          ...newMaterial,
          quantity: quantity,
          price: price
        }]
      }));
      setNewMaterial({ name: '', quantity: '', unit: '', price: '' });
    }
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const addRoom = () => {
    const area = Number(newRoom.area);
    if (newRoom.name && !isNaN(area) && area > 0) {
      setFormData(prev => ({
        ...prev,
        rooms: [...prev.rooms, {
          ...newRoom,
          area: area
        }]
      }));
      setNewRoom({ name: '', area: '', description: '' });
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
    const duration = Number(newStage.duration);
    if (newStage.name && !isNaN(duration) && duration > 0) {
      setFormData(prev => ({
        ...prev,
        constructionStages: [...prev.constructionStages, {
          ...newStage,
          duration: duration,
          status: 'pending'
        }]
      }));
      setNewStage({ name: '', duration: '', description: '' });
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
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate form data
      const validation = validateHouseData(formData);
      if (!validation.isValid) {
        setSubmitError(Object.values(validation.errors).join(', '));
        return;
      }

      // Format the data for submission
      const formattedData = {
        name: formData.name,
        harga: Number(formData.harga),
        luas: Number(formData.luas),
        tipe: formData.tipe,
        material: formData.material,
        durasi: Number(formData.durasi),
        description: formData.description,
        materials: formData.materials.map(m => ({
          name: m.name,
          quantity: Number(m.quantity),
          unit: m.unit,
          price: Number(m.price),
          imageUrl: m.imageUrl
        })),
        rooms: formData.rooms.map(r => ({
          name: r.name,
          area: Number(r.area),
          description: r.description,
          imageUrl: r.imageUrl
        })),
        blueprints: formData.blueprints.map(b => ({
          url: b.url,
          description: b.description,
          type: b.type,
          imageUrl: b.imageUrl,
          name: b.name
        })),
        features: formData.features,
        constructionStages: formData.constructionStages.map(s => ({
          name: s.name,
          duration: Number(s.duration),
          description: s.description,
          imageUrl: s.imageUrl,
          status: s.status
        })),
        specifications: {
          floorCount: Number(formData.specifications.floorCount),
          bedroomCount: Number(formData.specifications.bedroomCount),
          bathroomCount: Number(formData.specifications.bathroomCount),
          carportCount: Number(formData.specifications.carportCount),
          buildingArea: Number(formData.specifications.buildingArea),
          landArea: Number(formData.specifications.landArea)
        },
        estimatedCost: {
          materialCost: Number(formData.estimatedCost.materialCost),
          laborCost: Number(formData.estimatedCost.laborCost),
          otherCost: Number(formData.estimatedCost.otherCost),
          totalCost: Number(formData.estimatedCost.totalCost)
        }
      };

      // Update the house
      await updateHouse(resolvedParams.id, formattedData, image || undefined);
      router.push('/Admin/Houses');
    } catch (error) {
      console.error('Error updating house:', error);
      setSubmitError('Gagal memperbarui data rumah');
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

  // Function to handle name change for existing blueprints
  const handleBlueprintNameChange = (index: number, newName: string) => {
    setFormData(prev => {
      const updatedBlueprints = [...prev.blueprints];
      updatedBlueprints[index] = { ...updatedBlueprints[index], name: newName };
      return { ...prev, blueprints: updatedBlueprints };
    });
  };

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
                {formData.materials.map((material, index) => (
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
                      onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })}
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
                      onChange={(e) => setNewMaterial({ ...newMaterial, price: e.target.value })}
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
                {formData.rooms.map((room, index) => (
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
                      onChange={(e) => setNewRoom({ ...newRoom, area: e.target.value })}
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
                {formData.blueprints.map((blueprint, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={blueprint.name || ''}
                        onChange={(e) => handleBlueprintNameChange(index, e.target.value)}
                        placeholder="Blueprint Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 mb-2"
                      />
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                        <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 truncate z-10">
                          {blueprint.name || 'Untitled Blueprint'}
                        </div>
                        <Image
                          src={blueprint.url}
                          alt={blueprint.description || 'Blueprint'}
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
                {formData.features.map((feature, index) => (
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
                {formData.constructionStages.map((stage, index) => (
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
                      onChange={(e) => setNewStage({ ...newStage, duration: e.target.value })}
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