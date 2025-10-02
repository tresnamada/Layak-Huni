"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiHome, FiDollarSign, FiMapPin, FiLayers, FiCheck, FiArrowRight, FiMessageSquare, FiLoader, FiDownload, FiImage, FiFileText, FiAlertTriangle } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { saveGeneratedDesign, } from '@/services/designService';
import Image from 'next/image';

interface DesignStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface AIDesignSuggestion {
  id: string;
  name: string;
  description: string;
  style: string;
  keyFeatures: string[];
  estimatedPrice: string;
  imagePrompt: string;
  characteristics: {
    exterior: string[];
    interior: string[];
    materials: string[];
    sustainability: string[];
  };
  suitability: string[];
}

interface BudgetOption {
  id: string;
  range: string;
  min: number;
  max: number;
  description: string;
  features: string[];
  considerations: string[];
}

interface LocationOption {
  id: string;
  name: string;
  description: string;
  terrainType: string;
  landType: string;
  considerations: string[];
  suitability: string;
}

interface FinalResult {
  design?: {
    name: string;
    style: string;
    description: string;
  };
  location?: {
    name: string;
    terrainType: string;
    considerations: string[];
  };
  budget?: string;
  features: string[];
  recommendations: string[];
  nextSteps: string[];
}

interface FloorPlan {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  specifications: {
    totalArea: string;
    rooms: Array<{
      name: string;
      size: string;
      description: string;
    }>;
    features: string[];
  };
  downloadUrl: string;
}

interface DesignFeature {
  id: string;
  name: string;
  description: string;
  category: 'exterior' | 'interior' | 'material' | 'sustainability';
  compatibleStyles: string[];
}

const locationOptions: LocationOption[] = [
  {
    id: 'mendatar',
    name: 'Mendatar',
    description: 'Lahan dengan permukaan yang relatif datar dan rata',
    terrainType: 'Mendatar',
    landType: 'Datar',
    considerations: [
      'Drainase yang baik',
      'Pengelolaan air hujan',
      'Fondasi standar',
      'Kemudahan konstruksi',
      'Biaya konstruksi lebih rendah'
    ],
    suitability: 'Cocok untuk berbagai jenis desain rumah'
  },
  {
    id: 'landai',
    name: 'Landai',
    description: 'Lahan dengan kemiringan gradual',
    terrainType: 'Landai',
    landType: 'Miring',
    considerations: [
      'Sistem drainase khusus',
      'Fondasi bertingkat',
      'Potensi pemandangan lebih baik',
      'Pencegahan erosi tanah',
      'Desain rumah bertingkat'
    ],
    suitability: 'Cocok untuk rumah split-level atau bertingkat'
  },
  {
    id: 'bergerak',
    name: 'Bergerak',
    description: 'Lahan dengan tanah yang tidak stabil atau bergerak',
    terrainType: 'Bergerak',
    landType: 'Dinamis',
    considerations: [
      'Fondasi khusus yang dalam',
      'Struktur yang fleksibel',
      'Penanganan tanah sebelum konstruksi',
      'Stabilisasi tanah',
      'Biaya konstruksi lebih tinggi'
    ],
    suitability: 'Memerlukan desain khusus dengan fondasi yang kuat'
  }
];

export default function CustomDesignPage() {
  const { user } = useAuth({ redirectToLogin: true });
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDesign, setSelectedDesign] = useState<AIDesignSuggestion | null>(null);
  const [userDescription, setUserDescription] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<AIDesignSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<DesignFeature[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<BudgetOption | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [finalResult, setFinalResult] = useState<FinalResult>({
    features: [],
    recommendations: [],
    nextSteps: []
  });
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetAnalysis, setBudgetAnalysis] = useState<{
    range: string;
    description: string;
    features: string[];
    considerations: string[];
  } | null>(null);
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);
  const [, setIsGeneratingFloorPlan] = useState(false);
  const [showFloorPlanStep] = useState(false);
  const [isSaving, setIsSaving] = useState(false);


  const designSteps: DesignStep[] = [
    {
      id: 'description',
      title: 'Deskripsi Rumah Impian',
      description: 'Ceritakan rumah impian Anda dengan detail',
      icon: <FiMessageSquare className="w-6 h-6" />
    },
    {
      id: 'design-selection',
      title: 'Pilih Desain AI',
      description: 'Pilih dari berbagai opsi desain yang dihasilkan AI',
      icon: <FiHome className="w-6 h-6" />
    },
    {
      id: 'budget',
      title: 'Budget & Anggaran',
      description: 'Tentukan budget untuk proyek rumah Anda',
      icon: <FiDollarSign className="w-6 h-6" />
    },
    {
      id: 'location',
      title: 'Lokasi & Lahan',
      description: 'Pilih jenis lokasi dan kondisi lahan',
      icon: <FiMapPin className="w-6 h-6" />
    },
    {
      id: 'features',
      title: 'Fitur Tambahan',
      description: 'Pilih fitur dan karakteristik khusus',
      icon: <FiLayers className="w-6 h-6" />
    }
  ];

  const handleGenerateDesign = async () => {
    if (!userDescription.trim()) {
      alert('Silakan masukkan deskripsi rumah terlebih dahulu');
      return;
    }

    if (!user) {
      alert('Anda harus login untuk menggunakan fitur ini');
      router.push('/Login');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userDescription,
          stage: 'design',
          type: 'suggestions',
          userId: user.uid
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi server. Silakan coba lagi.');
      }

      const data = await response.json();
      
      if (!data.success) {
        // Handle authentication error
        if (data.requiresAuth) {
          alert('Anda harus login untuk menggunakan fitur ini');
          router.push('/Login');
          return;
        }
        throw new Error(data.error || 'Gagal menghasilkan desain');
      }

      try {
        const parsedResponse = JSON.parse(data.response);
        if (!parsedResponse.suggestions || !Array.isArray(parsedResponse.suggestions)) {
          throw new Error('Format respons tidak valid');
        }

        // Validate and normalize each suggestion
        const validatedSuggestions = parsedResponse.suggestions.map((suggestion: AIDesignSuggestion) => ({
          ...suggestion,
          characteristics: {
            exterior: suggestion.characteristics?.exterior || [],
            interior: suggestion.characteristics?.interior || [],
            materials: suggestion.characteristics?.materials || [],
            sustainability: suggestion.characteristics?.sustainability || []
          },
          suitability: suggestion.suitability || []
        }));

        setAiSuggestions(validatedSuggestions);
        // After generating house styles, move to the next step
        setCurrentStep(1);
      } catch (parseError) {
        console.error('Error parsing suggestions:', parseError);
        throw new Error('Gagal memproses desain yang dihasilkan');
      }
    } catch (error) {
      console.error('Error generating design suggestions:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      // From description to style selection - handled by handleGenerateDesign
    } else if (currentStep === 1) {
      // From style selection to feature selection
      if (!selectedDesign) {
        alert('Silakan pilih gaya rumah terlebih dahulu');
        return;
      }
      generateFeatures();
    } else if (currentStep === 2) {
      // From feature selection to budget input
      if (selectedFeatures.length === 0) {
        alert('Silakan pilih minimal satu fitur');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // From budget input to terrain selection
      if (!selectedBudget && !budgetInput) {
        alert('Silakan masukkan budget Anda');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // From terrain selection to final result
      if (!selectedLocation) {
        alert('Silakan pilih jenis medan tanah');
        return;
      }
      handleComplete();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Function to update compatible styles based on selected features
  const updateCompatibleStyles = (features: DesignFeature[]) => {
    if (features.length === 0) {
      // This should be updated to use AI-generated suggestions
      // For now, we'll use a placeholder
      setAiSuggestions([
        {
          id: 'placeholder',
          name: 'Placeholder',
          description: 'This is a placeholder suggestion',
          style: 'Placeholder',
          keyFeatures: [],
          estimatedPrice: 'Rp 0',
          imagePrompt: '',
          characteristics: {
            exterior: [],
            interior: [],
            materials: [],
            sustainability: []
          },
          suitability: []
        }
      ]);
      return;
    }

    const styleCompatibility: { [key: string]: number } = {};
    features.forEach(feature => {
      feature.compatibleStyles.forEach(style => {
        styleCompatibility[style] = (styleCompatibility[style] || 0) + 1;
      });
    });

    const sortedStyles = Object.entries(styleCompatibility)
      .sort(([, a], [, b]) => b - a)
      .map(([styleId]) => aiSuggestions.find(option => option.id === styleId))
      .filter(Boolean) as AIDesignSuggestion[];

    setAiSuggestions(sortedStyles);
  };

  const handleFeatureToggle = (feature: DesignFeature) => {
    setSelectedFeatures(prev => {
      const isSelected = prev.some(f => f.id === feature.id);
      const newFeatures = isSelected
        ? prev.filter(f => f.id !== feature.id)
        : [...prev, feature];
      updateCompatibleStyles(newFeatures);
      return newFeatures;
    });
  };

  const handleComplete = async () => {
    // Check if all required selections have been made
    if (selectedDesign && selectedLocation && (selectedBudget || budgetInput) && selectedFeatures.length > 0) {
      const budget = selectedBudget?.range || budgetInput;
      
      const result: FinalResult = {
        design: {
          name: selectedDesign.name,
          style: selectedDesign.style,
          description: selectedDesign.description
        },
        location: {
          name: selectedLocation.name,
          terrainType: selectedLocation.terrainType,
          considerations: selectedLocation.considerations
        },
        budget: budget,
        features: selectedFeatures.map(f => f.name),
        recommendations: [
          'Gunakan material yang sesuai dengan kondisi lahan',
          'Pertimbangkan sistem drainase yang baik',
          'Optimalkan pencahayaan alami',
          'Sesuaikan dengan peraturan setempat'
        ],
        nextSteps: [
          '🎯 Konsultasi dengan Arsitek Berlisensi (WAJIB)',
          '📐 Pembuatan Gambar Kerja Sesuai SNI',
          '🔬 Analisis Struktur & Perhitungan Engineer',
          '🏗️ Survey Kondisi Tanah & Topografi',
          '📋 Perhitungan RAB (Rencana Anggaran Biaya) Detail',
          '📄 Pengurusan IMB & Dokumen Legal',
          '👷 Pelaksanaan Konstruksi dengan Pengawasan'
        ]
      };
      
      setFinalResult(result);
      setCurrentStep(5);
      
      // Auto-generate floor plan based on user's selections
      generateFloorPlan();
    } else {
      // Identify which selections are missing
      const missing = [];
      if (!selectedDesign) missing.push('gaya rumah');
      if (!selectedLocation) missing.push('jenis medan tanah');
      if (!selectedBudget && !budgetInput) missing.push('budget');
      if (selectedFeatures.length === 0) missing.push('fitur');
      
      alert(`Silakan lengkapi semua pilihan berikut sebelum menyelesaikan: ${missing.join(', ')}`);
    }
  };

  const analyzeBudget = async () => {
    if (!budgetInput) {
      alert('Silakan masukkan budget terlebih dahulu');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: `Analisis budget untuk rumah dengan budget ${budgetInput}. Pertimbangkan lokasi ${selectedLocation?.name} dan fitur yang dipilih: ${selectedFeatures.map(f => f.name).join(', ')}`,
          stage: 'budget',
          type: 'analysis'
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Gagal menganalisis budget');
      }

      try {
        const analysis = JSON.parse(data.response);
        setBudgetAnalysis(analysis);
        setSelectedBudget({
          id: 'custom',
          range: budgetInput,
          min: parseInt(budgetInput.replace(/[^0-9]/g, '')),
          max: parseInt(budgetInput.replace(/[^0-9]/g, '')),
          description: analysis.description,
          features: analysis.features,
          considerations: analysis.considerations
        });
      } catch (parseError) {
        console.error('Error parsing budget analysis:', parseError);
        throw new Error('Gagal memproses analisis budget');
      }
    } catch (error) {
      console.error('Error analyzing budget:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };



  // const goToSavedDesigns = () => {
  //   router.push('/Profile/saved-designs');
  // };

  // Update the generateFeatures function to process AI-generated features
  const generateFeatures = async () => {
    if (!selectedDesign) {
      alert('Silakan pilih gaya rumah terlebih dahulu');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: `Berdasarkan gaya ${selectedDesign.style} dengan nama ${selectedDesign.name}, berikan fitur-fitur yang sesuai`,
          stage: 'features',
          type: 'suggestions',
          userId: user?.uid
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi server. Silakan coba lagi.');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Gagal menghasilkan fitur');
      }

      try {
        const parsedResponse = JSON.parse(data.response);
        if (!parsedResponse.features || !Array.isArray(parsedResponse.features)) {
          throw new Error('Format respons fitur tidak valid');
        }

        type AIFeature = {
          id?: string;
          name: string;
          description: string;
          category: 'exterior' | 'interior' | 'material' | 'sustainability';
          compatibility?: string[];
          estimatedPrice: number;
        };
        
        // Convert AI-generated features to the app's DesignFeature format
        const aiFeatures = parsedResponse.features.map((feature: AIFeature) => ({
          id: feature.id || `feature-${Math.random().toString(36).substr(2, 9)}`,
          name: feature.name,
          description: feature.description,
          category: feature.category,
          compatibleStyles: feature.compatibility || [selectedDesign.style],
          estimatedPrice: feature.estimatedPrice,
        }));
        

        // Replace static features with AI-generated ones for this session
        setSelectedFeatures([]); // Reset any previously selected features
        setDesignFeatures(aiFeatures); // Need to add this state variable
        
        // Move to the features selection step
        setCurrentStep(2);
      } catch (parseError) {
        console.error('Error parsing features:', parseError);
        throw new Error('Gagal memproses fitur yang dihasilkan');
      }
    } catch (error) {
      console.error('Error generating features:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFloorPlan = async () => {
    if (!selectedDesign || !selectedBudget || !selectedLocation) {
      console.log('Data desain tidak lengkap untuk generate denah');
      return;
    }

    setIsGeneratingFloorPlan(true);
    try {
      const budget = selectedBudget?.range || budgetInput;
      const response = await fetch('/api/generate-floorplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designStyle: selectedDesign.style,
          budget: budget,
          location: selectedLocation.name,
          features: selectedFeatures.map(f => f.name),
          rooms: ['Ruang Tamu', 'Kamar Tidur', 'Dapur', 'Kamar Mandi'],
          size: budget.includes('500') ? '6x8m' : '8x10m'
        })
      });

      const data = await response.json();
      
      if (data.success && data.floorPlan) {
        setFloorPlan(data.floorPlan);
        console.log('Floor plan generated:', data.floorPlan.name);
        if (data.fallback) {
          console.warn('Using fallback mock data for floor plan');
        }
      } else {
        throw new Error(data.error || 'Gagal generate denah rumah');
      }
    } catch (error) {
      console.error('Error generating floor plan:', error);
      // Don't alert user, just log the error - floor plan is optional
    } finally {
      setIsGeneratingFloorPlan(false);
    }
  };

  const handleDownloadDesign = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu');
      return;
    }

    setIsSaving(true);
    try {
      const designData = {
        name: selectedDesign?.name || 'Custom Design',
        description: selectedDesign?.description || 'Custom generated design',
        style: selectedDesign?.style || 'Modern',
        keyFeatures: selectedFeatures.map(f => f.name),
        estimatedPrice: selectedBudget?.range || budgetInput,
        characteristics: {
          exterior: selectedDesign?.characteristics?.exterior || [],
          interior: selectedDesign?.characteristics?.interior || [],
          materials: selectedDesign?.characteristics?.materials || [],
          sustainability: selectedDesign?.characteristics?.sustainability || []
        },
        suitability: selectedDesign?.suitability || [],
        prompt: userDescription
      };

      const result = await saveGeneratedDesign(user.uid, designData);
      
      if (result.success) {
        alert('Desain berhasil disimpan!');
      } else {
        throw new Error(result.error || 'Gagal menyimpan desain');
      }
    } catch (error) {
      console.error('Error saving design:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan desain');
    } finally {
      setIsSaving(false);
    }
  };



  const [designFeatures, setDesignFeatures] = useState<DesignFeature[]>([
    // Initial static features that will be replaced with AI-generated ones
    {
      id: 'open-plan',
      name: 'Open Plan Living',
      description: 'Ruang terbuka yang menghubungkan area dapur, ruang makan, dan ruang keluarga',
      category: 'interior',
      compatibleStyles: ['modern-minimalist', 'tropical-contemporary', 'japanese-minimalist']
    },
    {
      id: 'indoor-outdoor',
      name: 'Indoor-Outdoor Living',
      description: 'Konsep ruang yang menyatu dengan alam melalui teras dan taman',
      category: 'exterior',
      compatibleStyles: ['tropical-contemporary', 'japanese-minimalist']
    },
    {
      id: 'natural-light',
      name: 'Pencahayaan Alami',
      description: 'Desain yang mengoptimalkan pencahayaan alami melalui jendela besar dan skylight',
      category: 'interior',
      compatibleStyles: ['modern-minimalist', 'tropical-contemporary', 'japanese-minimalist']
    },
    {
      id: 'solar-panel',
      name: 'Panel Surya',
      description: 'Sistem panel surya untuk energi terbarukan',
      category: 'sustainability',
      compatibleStyles: ['modern-minimalist', 'tropical-contemporary']
    },
    {
      id: 'rainwater',
      name: 'Sistem Air Hujan',
      description: 'Pengumpulan dan penggunaan air hujan untuk kebutuhan rumah',
      category: 'sustainability',
      compatibleStyles: ['tropical-contemporary', 'japanese-minimalist']
    },
    {
      id: 'smart-home',
      name: 'Smart Home System',
      description: 'Sistem otomatisasi rumah untuk kenyamanan dan efisiensi',
      category: 'interior',
      compatibleStyles: ['modern-minimalist']
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F6EC] to-[#F0F4E8]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 md:pt-20">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {designSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    index <= currentStep ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.icon}
                  </div>
                  <span className="mt-2 text-sm font-medium text-gray-700">{step.title}</span>
                </div>
                {index < designSteps.length - 1 && (
                  <div className="flex-1 h-1 bg-gray-200 mx-4">
                    <div 
                      className={`h-full bg-amber-600 transition-all duration-300`}
                      style={{ width: `${(currentStep / (designSteps.length - 1)) * 100}%` }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {currentStep < designSteps.length ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{designSteps[currentStep].title}</h2>
              <p className="text-gray-600 mb-6">{designSteps[currentStep].description}</p>
            </>
          ) : (
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Hasil Desain</h2>
          )}

          {/* Step content */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="bg-amber-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Contoh Deskripsi yang Baik:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <FiCheck className="w-5 h-5 text-amber-600 mr-2 mt-1 flex-shrink-0" />
                    &quot;Saya ingin rumah minimalis 2 lantai dengan 3 kamar tidur, 2 kamar mandi, dan ruang keluarga yang luas. Saya suka konsep indoor-outdoor living dengan taman kecil di depan dan belakang.&quot;
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="w-5 h-5 text-amber-600 mr-2 mt-1 flex-shrink-0" />
                    &quot;Rumah modern dengan sentuhan tropis, 1 lantai, 2 kamar tidur, dapur terbuka, dan carport untuk 2 mobil. Saya ingin banyak jendela untuk pencahayaan alami.&quot;
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <textarea
                  value={userDescription}
                  onChange={(e) => setUserDescription(e.target.value)}
                  placeholder="Deskripsikan rumah impian Anda..."
                  className="w-full h-48 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none"
                />
                <button
                  onClick={handleGenerateDesign}
                  disabled={!userDescription.trim() || isGenerating}
                  className="w-full px-6 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Menghasilkan Desain...
                    </>
                  ) : (
                    'Generate Desain'
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-amber-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pilih Fitur yang Diinginkan</h3>
                <p className="text-gray-600 mb-4">
                  Berdasarkan deskripsi Anda, berikut adalah fitur-fitur yang tersedia. Pilih fitur yang sesuai dengan kebutuhan Anda.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {designFeatures.map((feature) => (
                    <motion.div
                      key={feature.id}
                      whileHover={{ y: -2 }}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                        selectedFeatures.some(f => f.id === feature.id)
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-400'
                      }`}
                      onClick={() => handleFeatureToggle(feature)}
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{feature.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          selectedFeatures.some(f => f.id === feature.id)
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          <FiCheck className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-amber-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Gaya Rumah yang Direkomendasikan</h3>
                <p className="text-gray-600 mb-4">
                  Berdasarkan deskripsi dan fitur yang Anda pilih, berikut adalah gaya rumah yang direkomendasikan:
                </p>
                {isGenerating ? (
                  <div className="flex items-center justify-center py-8">
                    <FiLoader className="animate-spin w-8 h-8 text-amber-600" />
                    <span className="ml-3 text-gray-600">Menghasilkan rekomendasi...</span>
                  </div>
                ) : aiSuggestions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {aiSuggestions.map((suggestion) => (
                      <motion.div
                        key={suggestion.id}
                        whileHover={{ y: -5 }}
                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                          selectedDesign?.id === suggestion.id
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-gray-200 hover:border-amber-400'
                        }`}
                        onClick={() => setSelectedDesign(suggestion)}
                      >
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{suggestion.name}</h3>
                        <p className="text-gray-600 mb-4">{suggestion.description}</p>
                        
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-700">Gaya Arsitektur:</span>
                          <p className="text-gray-600">{suggestion.style}</p>
                        </div>

                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-700">Estimasi Harga:</span>
                          <p className="text-gray-600">{suggestion.estimatedPrice}</p>
                        </div>

                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-700">Fitur Utama:</span>
                          <ul className="mt-2 space-y-2">
                            {(suggestion.keyFeatures || []).map((feature, index) => (
                              <li key={index} className="flex items-center text-gray-600">
                                <FiCheck className="w-4 h-4 text-amber-600 mr-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {suggestion.characteristics && (
                          <>
                            <div className="mb-4">
                              <span className="text-sm font-medium text-gray-700 mb-2 block">Karakteristik:</span>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-xs font-medium text-gray-500">Eksterior</span>
                                  <ul className="mt-1 space-y-1">
                                    {(suggestion.characteristics.exterior || []).map((item, index) => (
                                      <li key={index} className="text-xs text-gray-600">• {item}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-gray-500">Interior</span>
                                  <ul className="mt-1 space-y-1">
                                    {(suggestion.characteristics.interior || []).map((item, index) => (
                                      <li key={index} className="text-xs text-gray-600">• {item}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <span className="text-sm font-medium text-gray-700 mb-2 block">Material:</span>
                              <ul className="space-y-1">
                                {(suggestion.characteristics.materials || []).map((material, index) => (
                                  <li key={index} className="text-xs text-gray-600">• {material}</li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}

                        <div>
                          <span className="text-sm font-medium text-gray-700 mb-2 block">Tingkat Kesesuaian:</span>
                          <ul className="space-y-1">
                            {(suggestion.suitability || []).map((item, index) => (
                              <li key={index} className="text-xs text-gray-600">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Silakan pilih fitur yang diinginkan untuk melihat rekomendasi gaya rumah.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-amber-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tentukan Budget</h3>
                <p className="text-gray-600 mb-4">
                  Masukkan budget yang Anda miliki untuk membangun rumah impian Anda. Kami akan menganalisis apa yang bisa Anda dapatkan dengan budget tersebut.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      placeholder="Contoh: Rp 500 juta"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    />
                    <button
                      onClick={analyzeBudget}
                      disabled={!budgetInput || isGenerating}
                      className="px-6 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <FiLoader className="animate-spin mr-2 inline" />
                          Menganalisis...
                        </>
                      ) : (
                        'Analisis Budget'
                      )}
                    </button>
                  </div>

                  {budgetAnalysis && (
                    <div className="mt-6 space-y-4">
                      <div className="bg-white p-6 rounded-xl border border-amber-200">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Analisis Budget</h4>
                        <p className="text-gray-600 mb-4">{budgetAnalysis.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Fitur yang Dapat Diraih:</h5>
                            <ul className="space-y-2">
                              {budgetAnalysis.features.map((feature, index) => (
                                <li key={index} className="flex items-center text-gray-600">
                                  <FiCheck className="w-4 h-4 text-amber-600 mr-2" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Pertimbangan:</h5>
                            <ul className="space-y-2">
                              {budgetAnalysis.considerations.map((consideration, index) => (
                                <li key={index} className="flex items-center text-gray-600">
                                  <FiCheck className="w-4 h-4 text-amber-600 mr-2" />
                                  {consideration}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-100 p-4 rounded-xl">
                        <p className="text-amber-800">
                          <span className="font-medium">Catatan:</span> Analisis ini berdasarkan estimasi umum. Harga aktual dapat bervariasi tergantung pada lokasi, material, dan kondisi spesifik proyek.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-amber-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pilih Lokasi</h3>
                <p className="text-gray-600 mb-4">
                  Pilih lokasi yang sesuai dengan kebutuhan dan preferensi Anda. Setiap lokasi memiliki karakteristik dan pertimbangan yang berbeda.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {locationOptions.map((option) => (
                    <motion.div
                      key={option.id}
                      whileHover={{ y: -5 }}
                      className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                        selectedLocation?.id === option.id
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-400'
                      }`}
                      onClick={() => setSelectedLocation(option)}
                    >
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{option.name}</h3>
                      <p className="text-gray-600 mb-4">{option.description}</p>
                      
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700">Tipe Tanah:</span>
                        <p className="text-gray-600">{option.landType}</p>
                      </div>

                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700">Kondisi Terrain:</span>
                        <p className="text-gray-600">{option.terrainType}</p>
                      </div>

                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700">Tingkat Kesesuaian:</span>
                        <p className="text-gray-600">{option.suitability}</p>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-700 mb-2 block">Pertimbangan Penting:</span>
                        <ul className="space-y-2">
                          {option.considerations.map((consideration, index) => (
                            <li key={index} className="flex items-center text-gray-600">
                              <FiCheck className="w-4 h-4 text-amber-600 mr-2" />
                              {consideration}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-8">
              {/* Disclaimer Section */}
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <div className="flex items-start">
                  <FiAlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-800 mb-2">
                      ⚠️ Penting: Desain AI Adalah Konsep Awal
                    </h3>
                    <p className="text-red-700 mb-3">
                      Desain dan denah yang dihasilkan AI ini adalah <strong>konsep awal</strong> dan <strong>BELUM memenuhi standar konstruksi sipil</strong> yang diperlukan untuk pembangunan rumah.
                    </p>
                    <div className="bg-white p-4 rounded-lg mb-3">
                      <p className="text-sm font-semibold text-gray-800 mb-2">
                        Yang BELUM termasuk dalam desain AI:
                      </p>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-start">
                          <span className="mr-2">❌</span>
                          <span>Perhitungan struktur (balok, kolom, fondasi) sesuai SNI</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">❌</span>
                          <span>Analisis beban gempa (penting untuk Indonesia!)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">❌</span>
                          <span>Detail konstruksi dan gambar kerja</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">❌</span>
                          <span>Rencana instalasi MEP (listrik, plumbing, AC)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">❌</span>
                          <span>Analisis kondisi tanah dan fondasi yang sesuai</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">❌</span>
                          <span>Dokumen untuk IMB (Izin Mendirikan Bangunan)</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-green-800 mb-2">
                        ✅ Langkah Wajib Selanjutnya:
                      </p>
                      <p className="text-sm text-green-700">
                        Konsultasikan desain ini dengan <strong>arsitek berlisensi</strong> dan <strong>engineer sipil</strong> untuk mendapatkan gambar kerja yang sesuai standar konstruksi dan aman untuk dibangun.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Desain Rumah Impian Anda</h2>
                    <p className="text-gray-600">Berikut adalah ringkasan desain rumah yang telah Anda pilih</p>
                  </div>
                  <div className="bg-amber-100 px-6 py-3 rounded-full">
                    <span className="text-amber-800 font-medium">Selesai</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Design Summary */}
                  <div className="space-y-6">
                    <div className="bg-amber-50 p-6 rounded-xl">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Gaya Rumah</h3>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Nama Desain:</span>
                          <p className="text-gray-800 font-medium">{finalResult.design?.name || 'Belum dipilih'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Gaya Arsitektur:</span>
                          <p className="text-gray-800">{finalResult.design?.style || 'Belum dipilih'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Deskripsi:</span>
                          <p className="text-gray-600">{finalResult.design?.description || 'Belum ada deskripsi'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-6 rounded-xl">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Lokasi</h3>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Tipe Lahan:</span>
                          <p className="text-gray-800">{finalResult.location?.name || 'Belum dipilih'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Kondisi Terrain:</span>
                          <p className="text-gray-800">{finalResult.location?.terrainType || 'Belum dipilih'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Pertimbangan:</span>
                          <ul className="mt-2 space-y-2">
                            {(finalResult.location?.considerations || []).map((item, index) => (
                              <li key={index} className="flex items-center text-gray-600">
                                <FiCheck className="w-4 h-4 text-amber-600 mr-2" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features and Next Steps */}
                  <div className="space-y-6">
                    <div className="bg-amber-50 p-6 rounded-xl">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Fitur dan Spesifikasi</h3>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Estimasi Budget:</span>
                          <p className="text-gray-800 font-medium">{finalResult.budget || 'Belum ditentukan'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Fitur Utama:</span>
                          <ul className="mt-2 space-y-2">
                            {finalResult.features.map((feature, index) => (
                              <li key={index} className="flex items-center text-gray-600">
                                <FiCheck className="w-4 h-4 text-amber-600 mr-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-6 rounded-xl">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Rekomendasi</h3>
                      <ul className="space-y-2">
                        {finalResult.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center text-gray-600">
                            <FiCheck className="w-4 h-4 text-amber-600 mr-2" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50 p-6 rounded-xl">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Langkah Selanjutnya</h3>
                      <ul className="space-y-2">
                        {finalResult.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-center text-gray-600">
                            <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center mr-3 text-sm font-medium">
                              {index + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(0)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                  >
                    Mulai Ulang
                  </button>
                  <div className="flex space-x-4">
                    <a
                      href={`/api/generate-floorplan/download-image/${floorPlan?.id}`}
                      download
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <FiImage className="mr-2" />
                      Download Gambar
                    </a>
                    <a
                      href={floorPlan?.downloadUrl}
                      download
                      className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center"
                    >
                      <FiFileText className="mr-2" />
                      Download HTML
                    </a>
                    <button
                      onClick={handleDownloadDesign}
                      disabled={isSaving}
                      className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center ${
                        isSaving
                          ? 'bg-amber-400 text-white cursor-not-allowed'
                          : 'bg-amber-600 text-white hover:bg-amber-700'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <FiLoader className="mr-2 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <FiDownload className="mr-2" />
                          Simpan Semua
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Floor Plan Preview Section */}
              {floorPlan && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Preview Denah Rumah</h2>
                      <p className="text-gray-600">Denah otomatis berdasarkan pilihan Anda</p>
                    </div>
                    <div className="bg-blue-100 px-4 py-2 rounded-full">
                      <span className="text-blue-800 font-medium text-sm">AI Generated</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Floor Plan Image */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <Image
                        src={floorPlan.imageUrl} 
                        alt={floorPlan.name}
                        width={800}
                        height={600}
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                      <div className="mt-4 flex justify-center space-x-3">
                        <a
                          href={`/api/generate-floorplan/download-image/${floorPlan.id}`}
                          download
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <FiImage className="mr-2" />
                          Download Gambar
                        </a>
                        <a
                          href={floorPlan.downloadUrl}
                          download
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
                        >
                          <FiFileText className="mr-2" />
                          Download HTML
                        </a>
                      </div>
                    </div>

                    {/* Floor Plan Details */}
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-2">{floorPlan.name}</h4>
                        <p className="text-sm text-gray-600">{floorPlan.description}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-3">Spesifikasi</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Luas Total:</span>
                            <span className="font-medium text-gray-800">{floorPlan.specifications.totalArea}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Jumlah Ruangan:</span>
                            <span className="font-medium text-gray-800">{floorPlan.specifications.rooms.length} ruangan</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-3">Ruangan</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {floorPlan.specifications.rooms.map((room, index) => (
                            <div key={index} className="flex justify-between items-start text-sm border-b border-gray-200 pb-2">
                              <div className="flex-1">
                                <span className="font-medium text-gray-800">{room.name}</span>
                                <p className="text-xs text-gray-500">{room.description}</p>
                              </div>
                              <span className="text-gray-600 ml-2">{room.size}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-amber-50 p-4 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-2">Fitur Denah</h4>
                        <ul className="space-y-1">
                          {floorPlan.specifications.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                              <FiCheck className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State for Floor Plan */}
              {!floorPlan && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex flex-col items-center justify-center py-12">
                    <FiLoader className="w-12 h-12 text-amber-600 animate-spin mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Membuat Denah Rumah...</h3>
                    <p className="text-gray-600 text-center">
                      AI sedang membuat denah rumah berdasarkan pilihan Anda.<br />
                      Mohon tunggu sebentar...
                    </p>
                  </div>
                </div>
              )}

              {/* CTA Konsultasi Section */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex-1 mb-6 md:mb-0">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3">
                      Siap Wujudkan Rumah Impian Anda?
                    </h3>
                    <p className="text-amber-50 mb-4 text-sm md:text-base">
                      Konsultasikan desain AI Anda dengan arsitek profesional kami untuk mendapatkan gambar kerja yang siap dibangun sesuai standar konstruksi.
                    </p>
                    <ul className="space-y-2 text-sm text-amber-50">
                      <li className="flex items-center">
                        <FiCheck className="mr-2 flex-shrink-0" />
                        <span>Arsitek berlisensi IAI (Ikatan Arsitek Indonesia)</span>
                      </li>
                      <li className="flex items-center">
                        <FiCheck className="mr-2 flex-shrink-0" />
                        <span>Engineer sipil berpengalaman</span>
                      </li>
                      <li className="flex items-center">
                        <FiCheck className="mr-2 flex-shrink-0" />
                        <span>Garansi sesuai standar SNI & building code</span>
                      </li>
                      <li className="flex items-center">
                        <FiCheck className="mr-2 flex-shrink-0" />
                        <span>Bantuan pengurusan IMB</span>
                      </li>
                    </ul>
                  </div>
                  <div className="md:ml-8">
                    <button
                      onClick={() => router.push('/consultation')}
                      className="px-8 py-4 bg-white text-amber-600 rounded-xl font-bold text-lg hover:bg-amber-50 transition-all transform hover:scale-105 shadow-lg flex items-center"
                    >
                      Konsultasi Sekarang
                      <FiArrowRight className="ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < designSteps.length && !showFloorPlanStep && (
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevStep}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  currentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={currentStep === 0}
              >
                Kembali
              </button>
              <button
                onClick={currentStep === 4 ? handleComplete : handleNextStep}
                className="px-6 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors flex items-center"
                disabled={currentStep === 1 && !selectedDesign}
              >
                {currentStep === 4 ? 'Selesai' : 'Lanjut'}
                {currentStep < 4 && <FiArrowRight className="ml-2" />}
              </button>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Informasi Tambahan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Proses Desain AI</h4>
              <p className="text-gray-600">
                AI kami akan menganalisis deskripsi Anda dan menghasilkan beberapa opsi desain yang sesuai dengan preferensi Anda.
              </p>
            </div>
            <div className="bg-amber-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Estimasi Waktu</h4>
              <p className="text-gray-600">
                Proses desain AI memakan waktu sekitar 1-2 menit untuk menghasilkan opsi desain yang sesuai dengan kebutuhan Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 