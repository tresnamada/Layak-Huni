"use client";

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Upload, Camera, Home, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';

type AnalysisResult = {
  analysis: {
    room_type: string;
    description: string;
  };
  recommendations: {
    item_name: string;
    description: string;
    estimated_price: number;
    placement_suggestion: string;
  }[];
  summary: string;
};

export default function InteriorScanningPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [budget, setBudget] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  // Event handlers remain the same as your original code
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setAnalysisResult(null);
        setError(null);
      }
    }
  };

  const analyzeRoom = async () => {
    if (!imageFile || !budget) {
      setError('Harap unggah gambar dan masukkan anggaran terlebih dahulu.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('budget', budget);

    try {
      const response = await fetch('/api/interior', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menganalisis ruangan.');
      }

      if (result && Array.isArray(result.recommendations)) {
        setAnalysisResult(result);
      } else {
        console.error("Respons tidak valid dari API:", result);
        setError('AI tidak dapat memberikan rekomendasi. Coba lagi dengan gambar atau prompt yang berbeda.');
        setAnalysisResult(null);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.');
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-[#F6F6EC] to-[#E8E8DE] text-[#4A443A] relative overflow-hidden"
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#594C1A]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-[#594C1A]/3 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-[#594C1A]/4 rounded-full blur-xl"></div>
      </div>
      <Navbar />
      {/* AI Avatar with Animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 2, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center pt-24"
      >
        <div className="relative">
          <div className="w-100 h-100 flex items-center justify-center animate-pulse-slow overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="object-contain w-32 h-32"
            >
              <source src="/animation.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </motion.div>
      <div className="relative z-10 px-4 sm:px-8 pt-32 pb-16">
        <motion.div
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
        >
          {/* Hero Section */}
          <motion.div
            className="text-center mb-20"
            variants={fadeInUp}
          >

            <motion.h1
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#594C1A] to-[#6B5B1F] bg-clip-text text-transparent mb-6 tracking-tight"
              variants={fadeInUp}
            >
              Analisis Interior SiHuni
            </motion.h1>

            <motion.p
              className="text-xl text-[#594C1A]/80 max-w-2xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Transformasi ruangan Anda dengan teknologi AI terdepan. Unggah foto, tentukan anggaran, dan dapatkan rekomendasi yang dipersonalisasi.
            </motion.p>
          </motion.div>

          {/* Upload and Budget Section */}
          <motion.div
            className="grid lg:grid-cols-3 gap-8 mb-16"
            variants={fadeInUp}
          >
            {/* Upload Card */}
            <motion.div
              className="lg:col-span-2"
              variants={scaleIn}
              whileHover={{ y: -5 }}
            >
              <div className="relative bg-white/95 backdrop-blur-lg p-8 rounded-3xl border border-white/60 shadow-lg h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-[#594C1A] to-[#6B5B1F] rounded-2xl text-white">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#594C1A]">Upload Foto Ruangan</h2>
                </div>

                <div
                  className={`relative border-2 border-dashed rounded-2xl transition-all ${dragActive ? 'border-[#594C1A] bg-[#594C1A]/5' : 'border-[#594C1A]/20 hover:border-[#594C1A]/40'
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {previewUrl ? (
                    <div className="p-4">
                      <div className="relative h-64 rounded-xl overflow-hidden">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-12">
                      <Upload className="w-12 h-12 mx-auto text-[#594C1A] mb-4" />
                      <h3 className="text-xl font-medium text-[#594C1A] mb-2">
                        Seret & Lepas Foto atau Klik untuk Memilih
                      </h3>
                      <p className="text-[#594C1A]/60">Format: JPG, PNG, WebP (maks. 10MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Budget Card */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -5 }}
            >
              <div className="relative bg-white/95 backdrop-blur-lg p-8 rounded-3xl border border-white/60 shadow-lg h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-[#594C1A] to-[#6B5B1F] rounded-2xl text-white">

                  </div>
                  <h2 className="text-2xl font-bold text-[#594C1A]">Tentukan Anggaran</h2>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#594C1A] font-medium">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="Contoh: 5000000"
                      className="w-full pl-12 pr-4 py-3 border border-[#594C1A]/20 rounded-xl focus:ring-2 focus:ring-[#594C1A]/30 focus:border-[#594C1A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[2000000, 5000000, 10000000, 20000000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setBudget(amount.toString())}
                        className={`py-2 rounded-lg text-sm font-medium ${budget === amount.toString()
                            ? 'bg-[#594C1A] text-white'
                            : 'bg-[#594C1A]/5 text-[#594C1A] hover:bg-[#594C1A]/10'
                          }`}
                      >
                        {amount.toLocaleString('id-ID')}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={analyzeRoom}
                    disabled={isLoading || !imageFile || !budget}
                    className={`w-full py-3 px-6 rounded-xl font-medium text-white flex items-center justify-center gap-2 ${isLoading || !imageFile || !budget
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#594C1A] to-[#6B5B1F] hover:from-[#6B5B1F] hover:to-[#594C1A]'
                      }`}
                  >
                    {isLoading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >

                        </motion.span>
                        Menganalisis...
                      </>
                    ) : (
                      <>

                        Analisis Sekarang
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Error Display */}
          {error && (
            <motion.div
              className="mb-8 bg-red-50/90 backdrop-blur-sm border-l-4 border-red-400 p-6 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-red-800 mb-1">Terjadi Kesalahan</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results Section */}
          {analysisResult && (
            <motion.div
              className="bg-white/95 backdrop-blur-lg rounded-3xl border border-white/60 shadow-xl p-8 md:p-12"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Results Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-br from-[#594C1A] to-[#6B5B1F] rounded-2xl text-white">

                  </div>
                  <div className="h-px w-16 bg-gradient-to-r from-[#594C1A]/40 via-[#594C1A]/20 to-transparent"></div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#594C1A] mb-4">
                  Hasil Analisis AI
                </h2>
                <p className="text-[#594C1A]/70 max-w-2xl mx-auto">
                  Berdasarkan analisis mendalam terhadap ruangan Anda
                </p>
              </div>

              {/* Analysis Summary */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <motion.div
                  className="bg-gradient-to-br from-[#594C1A]/5 to-[#594C1A]/10 rounded-2xl p-8 border border-[#594C1A]/20"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <Home className="w-8 h-8 text-[#594C1A]" />
                    <h3 className="text-xl font-bold text-[#594C1A]">Analisis Ruangan</h3>
                  </div>
                  <p className="text-[#594C1A]/80 leading-relaxed">
                    {analysisResult.analysis.description}
                  </p>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <h3 className="text-xl font-bold text-green-800">Ringkasan</h3>
                  </div>
                  <p className="text-green-700 leading-relaxed">
                    {analysisResult.summary}
                  </p>
                </motion.div>
              </div>

              {/* Recommendations */}
              <div className="mb-12">
                <div className="text-center mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#594C1A] mb-4">
                    Rekomendasi Interior
                  </h3>
                  <div className="w-16 h-1 bg-gradient-to-r from-[#594C1A] to-[#6B5B1F] rounded-full mx-auto"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analysisResult.recommendations.map((item, index) => (
                    <motion.div
                      key={index}
                      className="bg-white rounded-xl border border-[#594C1A]/10 overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-bold text-lg text-[#594C1A]">{item.item_name}</h4>
                          <span className="bg-[#594C1A]/10 text-[#594C1A] px-3 py-1 rounded-full text-sm font-medium">
                            Rp {item.estimated_price.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <p className="text-[#594C1A]/70 mb-4">{item.description}</p>

                        <div className="bg-blue-50/50 border-l-4 border-blue-400 p-4 rounded-r">
                          <p className="font-medium text-blue-800 mb-1">Saran Penempatan</p>
                          <p className="text-blue-700 text-sm">{item.placement_suggestion}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <div className="inline-block bg-gradient-to-r from-[#594C1A]/5 to-[#6B5B1F]/5 rounded-2xl p-8 border border-[#594C1A]/20">
                  <h4 className="text-xl font-bold text-[#594C1A] mb-2">
                    Siap Mentransformasi Ruangan Anda?
                  </h4>
                  <p className="text-[#594C1A]/70 mb-6 max-w-md mx-auto">
                    Implementasikan rekomendasi ini untuk menciptakan ruangan impian Anda
                  </p>
                  <button className="bg-gradient-to-r from-[#594C1A] to-[#6B5B1F] text-white py-3 px-8 rounded-xl font-medium hover:from-[#6B5B1F] hover:to-[#594C1A] transition-all">
                    Mulai Sekarang
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}