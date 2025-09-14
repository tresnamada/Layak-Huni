"use client";

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Upload, Camera, Home, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
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
  const [showHelp, setShowHelp] = useState(false); // New state for help modal

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
      {/* Help Button */}
      <motion.button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-8 right-8 z-[100] bg-[#594C1A] text-white p-4 rounded-full shadow-lg hover:bg-[#6B5B1F] transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <HelpCircle className="w-6 h-6" />
      </motion.button>

      {/* Help Modal */}
      {showHelp && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowHelp(false)}
        >
          <motion.div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-[#594C1A] hover:text-[#6B5B1F]"
            >
              ✕
            </button>

            <div className="p-6 h-[80vh]">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="w-8 h-8 text-[#594C1A]" />
                <h2 className="text-3xl font-bold text-[#594C1A]">Petunjuk Penggunaan</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-[#594C1A]/5 p-6 rounded-xl">
                  <h3 className="font-bold text-lg text-[#594C1A] mb-3 flex items-center gap-2">
                    <span className="bg-[#594C1A] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                    Unggah Foto Ruangan
                  </h3>
                  <p className="text-[#594C1A]/80">
                    - Klik area unggah atau seret dan lepas foto ruangan Anda<br />
                    - Pastikan foto jelas dan mencakup seluruh area yang ingin dianalisis<br />
                    - Format yang didukung: JPG, PNG, WebP (maks. 10MB)
                  </p>
                </div>

                <div className="bg-[#594C1A]/5 p-6 rounded-xl">
                  <h3 className="font-bold text-lg text-[#594C1A] mb-3 flex items-center gap-2">
                    <span className="bg-[#594C1A] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                    Tentukan Anggaran
                  </h3>
                  <p className="text-[#594C1A]/80">
                    - Masukkan jumlah anggaran Anda dalam Rupiah<br />
                    - Anda bisa menggunakan tombol cepat untuk anggaran umum<br />
                    - Sistem akan memberikan rekomendasi sesuai budget
                  </p>
                </div>

                <div className="bg-[#594C1A]/5 p-6 rounded-xl">
                  <h3 className="font-bold text-lg text-[#594C1A] mb-3 flex items-center gap-2">
                    <span className="bg-[#594C1A] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                    Analisis Ruangan
                  </h3>
                  <p className="text-[#594C1A]/80">
                    - Klik tombol Analisis Sekarang setelah mengunggah foto dan menentukan anggaran<br />
                    - Tunggu beberapa saat saat sistem menganalisis ruangan Anda<br />
                    - Hasil akan muncul dalam beberapa detik
                  </p>
                </div>

                <div className="bg-[#594C1A]/5 p-6 rounded-xl">
                  <h3 className="font-bold text-lg text-[#594C1A] mb-3 flex items-center gap-2">
                    <span className="bg-[#594C1A] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                    Hasil & Rekomendasi
                  </h3>
                  <p className="text-[#594C1A]/80">
                    - Sistem akan memberikan analisis jenis ruangan<br />
                    - Rekomendasi furnitur dan dekorasi yang sesuai<br />
                    - Estimasi harga dan saran penempatan<br />
                    - Anda bisa mengulang proses dengan foto baru
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="mt-8 w-full py-3 bg-[#594C1A] text-white rounded-xl font-medium hover:bg-[#6B5B1F] transition-colors"
              >
                Mengerti, Tutup Panduan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}


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
          {/* Hero Section - Enhanced */}
          <motion.div
            className="mb-20 relative overflow-hidden"
            variants={fadeInUp}
          >
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-10 right-20 w-40 h-40 bg-gradient-to-br from-[#594C1A]/10 to-[#6B5B1F]/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-[#6B5B1F]/10 to-[#594C1A]/10 rounded-full blur-2xl"></div>
            </div>

            {/* Hero Content with Creative Layout */}
            <div className="grid lg:grid-cols-3 gap-8 items-center max-w-7xl mx-auto px-4">
              {/* Left Side - Decorative Element */}
              <motion.div
                className="hidden lg:block"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative">
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#594C1A]/20 shadow-lg transform rotate-3">
                  <div className="text-2xl font-bold text-[#594C1A]">AI-Powered</div>
                  <div className="text-sm text-[#594C1A]/60">Technology</div>
                </div>
                </div>
              </motion.div>

              {/* Center - Main Title */}
              <motion.div className="text-center lg:col-span-1" variants={fadeInUp}>
                <div className="relative inline-block">
                  <motion.h1
                    className="text-5xl md:text-6xl font-bold mb-6 tracking-tight"
                    variants={fadeInUp}
                  >
                    <span className="block text-[#4A443A] transform -rotate-1">
                      Analisis
                    </span>
                    <span className="block bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent transform rotate-1 -mt-2">
                      Interior
                    </span>
                    <span className="block text-[#594C1A] transform -rotate-1 -mt-2">
                      SiHuni
                    </span>
                  </motion.h1>
                </div>

                <motion.p
                  className="text-lg text-[#594C1A]/80 max-w-md mx-auto leading-relaxed"
                  variants={fadeInUp}
                >
                  Transformasi ruangan Anda dengan
                  <span className="font-semibold text-[#594C1A]"> teknologi AI terdepan</span>.
                  Unggah foto, tentukan anggaran.
                </motion.p>
              </motion.div>

              {/* Right Side - Stats */}
              <motion.div
                className="hidden lg:flex flex-col gap-4"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#6B5B1F]/20 shadow-lg transform -rotate-2">
                  <div className="text-2xl font-bold text-[#6B5B1F]">Instant</div>
                  <div className="text-sm text-[#6B5B1F]/60">Analysis</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Upload and Budget Section - Creative Asymmetric Layout */}
          <motion.div
            className="mb-24 max-w-7xl mx-auto px-4"
            variants={fadeInUp}
          >
            <div className="grid lg:grid-cols-5 gap-8 items-start">

              {/* Upload Card - Takes 3 columns with creative positioning */}
              <motion.div
                className="lg:col-span-3 order-2 lg:order-1"
                variants={scaleIn}
                whileHover={{ y: -5 }}
              >
                <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl border border-white/60 shadow-2xl overflow-hidden transform lg:-rotate-1 hover:rotate-0 transition-transform duration-300">
                  {/* Card Header with Creative Design */}
                  <div className="relative bg-gradient-to-r from-[#594C1A] to-[#6B5B1F] p-6 text-white">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                    <div className="relative flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                        <Camera className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Upload Foto Ruangan</h2>
                        <p className="text-white/80 text-sm">Drag & drop atau klik untuk memilih</p>
                      </div>
                    </div>
                    {/* Decorative wave */}
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-white rounded-t-3xl"></div>
                  </div>

                  {/* Upload Area */}
                  <div className="p-8 pt-4">
                    <div
                      className={`relative border-2 border-dashed rounded-3xl transition-all ${dragActive
                          ? 'border-[#594C1A] bg-gradient-to-br from-[#594C1A]/10 to-[#6B5B1F]/5 scale-105'
                          : 'border-[#594C1A]/30 hover:border-[#594C1A]/60 hover:bg-[#594C1A]/5'
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
                        <div className="p-6">
                          <div className="relative h-64 rounded-2xl overflow-hidden group">
                            <Image
                              src={previewUrl}
                              alt="Preview"
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-[#594C1A]">
                              Foto Siap Dianalisis
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-16">
                          <div className="relative inline-block mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#594C1A]/20 to-[#6B5B1F]/20 rounded-full flex items-center justify-center">
                              <Upload className="w-10 h-10 text-[#594C1A]" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#6B5B1F] to-[#594C1A] rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">+</span>
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-[#594C1A] mb-2">
                            Unggah Foto Ruangan Anda
                          </h3>
                          <p className="text-[#594C1A]/60 mb-4">
                            Seret & lepas atau klik untuk memilih file
                          </p>
                          <div className="inline-flex items-center gap-2 bg-[#594C1A]/5 px-4 py-2 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-[#594C1A]/80">JPG, PNG, WebP (maks. 10MB)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Budget Card - Takes 2 columns with offset positioning */}
              <motion.div
                className="lg:col-span-2 order-1 lg:order-2"
                variants={scaleIn}
                whileHover={{ y: -5 }}
              >
                <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl border border-white/60 shadow-2xl overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-transform duration-300 lg:mt-16">
                  {/* Decorative top border */}
                  <div className="h-2 bg-gradient-to-r from-[#594C1A] to-[#6B5B1F]"></div>

                  <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#594C1A] to-[#6B5B1F] rounded-2xl flex items-center justify-center transform -rotate-12">
                          <HelpCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#594C1A]">Anggaran</h2>
                        <p className="text-[#594C1A]/60 text-sm">Tentukan budget Anda</p>
                      </div>
                    </div>

                    {/* Budget Input with Creative Design */}
                    <div className="space-y-6">
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#594C1A] to-[#6B5B1F] rounded-l-xl flex items-center justify-center">
                          <span className="text-white font-bold">Rp</span>
                        </div>
                        <input
                          type="number"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          placeholder="5.000.000"
                          className="w-full pl-20 pr-4 py-4 border-2 border-[#594C1A]/20 rounded-xl focus:ring-4 focus:ring-[#594C1A]/20 focus:border-[#594C1A] font-medium text-lg"
                        />
                      </div>

                      {/* Quick Select Buttons - Creative Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { amount: 2000000, label: '2 Juta', popular: false },
                          { amount: 5000000, label: '5 Juta', popular: true },
                          { amount: 10000000, label: '10 Juta', popular: false },
                          { amount: 20000000, label: '20 Juta', popular: false }
                        ].map((item) => (
                          <button
                            key={item.amount}
                            onClick={() => setBudget(item.amount.toString())}
                            className={`relative py-3 px-4 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 ${budget === item.amount.toString()
                                ? 'bg-gradient-to-r from-[#594C1A] to-[#6B5B1F] text-white shadow-lg'
                                : 'bg-[#594C1A]/5 text-[#594C1A] hover:bg-[#594C1A]/10 border border-[#594C1A]/20'
                              }`}
                          >
                            {item.popular && (
                              <div className="absolute -top-2 -right-2 bg-amber-400 text-white text-xs px-2 py-1 rounded-full font-bold">
                                Popular
                              </div>
                            )}
                            {item.label}
                          </button>
                        ))}
                      </div>

                      {/* Analysis Button - Enhanced */}
                      <button
                        onClick={analyzeRoom}
                        disabled={isLoading || !imageFile || !budget}
                        className={`group relative w-full py-4 px-8 rounded-xl font-bold text-lg text-white overflow-hidden transition-all transform hover:scale-105 ${isLoading || !imageFile || !budget
                            ? 'bg-gray-400 cursor-not-allowed scale-100'
                            : 'bg-gradient-to-r from-[#594C1A] via-[#6B5B1F] to-[#594C1A] shadow-xl hover:shadow-2xl'
                          }`}
                      >
                        {/* Button shine effect */}
                        {!isLoading && imageFile && budget && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                        )}

                        <div className="relative flex items-center justify-center gap-3">
                          {isLoading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                              />
                              <span>Menganalisis Ruangan...</span>
                            </>
                          ) : (
                            <>
                              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-sm">✨</span>
                              </div>
                              <span>Mulai Analisis AI</span>
                              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                <span className="text-sm">→</span>
                              </div>
                            </>
                          )}
                        </div>
                      </button>

                      {/* Helper Text */}
                      <p className="text-center text-xs text-[#594C1A]/60">
                        💡 Analisis akan memberikan rekomendasi furniture dan dekorasi sesuai budget
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Decorative Wave */}
            <div className="relative mt-16">
              <div className="absolute inset-0 bg-gradient-to-r from-[#594C1A]/5 via-[#6B5B1F]/5 to-[#594C1A]/5 transform -skew-y-1 h-12"></div>
            </div>
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
                  <p className="text-green-900 leading-relaxed">
                    {analysisResult.summary}
                  </p>
                </motion.div>
              </div>

              Recommendations
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
                          <p className="font-medium text-[#9A3F3F] mb-1">Saran Penempatan</p>
                          <p className="text-[#B87C4C] text-sm">{item.placement_suggestion}</p>
                        </div>

                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}