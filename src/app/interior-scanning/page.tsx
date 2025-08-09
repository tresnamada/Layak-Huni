"use client";

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Upload, Camera, Sparkles, Zap, Home, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#F6F6EC] text-[#4A443A] p-4 sm:p-8" // Softer text color
      style={{
        background: "linear-gradient(145deg, #F6F6EC 0%, #E8E8DE 100%)"
      }}
    >
      <Navbar />
      <motion.div
        className="max-w-6xl mx-auto mt-20"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={stagger}
      >
        {/* Header Section */}
        <motion.div
          className="text-center mb-12"
          variants={fadeInUp}
          transition={{ duration: 0.8 }}
        >
              <div className="relative">
                <div className="w-100 h-100 flex items-center justify-center animate-pulse-slow overflow-hidden">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-contain w-64 h-64"
                  >
                    <source src="/animation.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
          <motion.div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-[#594C1A]/10 rounded-2xl">
              <Sparkles className="w-8 h-8 text-[#594C1A]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#594C1A]">Analisis Interior SiHuni</h1>
          </motion.div>
          <p className="text-lg text-[#594C1A]/70 max-w-2xl mx-auto leading-relaxed">
            Transformasi ruangan Anda dengan teknologi AI terdepan. Unggah foto, tentukan anggaran,
            dan dapatkan rekomendasi interior yang dipersonalisasi.
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-xl mb-8 border border-white/50" // Slightly more opaque white, softer shadow, more prominent border
          variants={fadeInUp}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            boxShadow: "0 20px 40px -10px rgba(139, 69, 19, 0.1)" // Softer, more diffused shadow
          }}
        >
          <div className="grid md:grid-cols-2 gap-12">
            {/* Upload Section */}
            <motion.div
              className="space-y-6"
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#594C1A]/10 rounded-xl">
                  <Camera className="w-6 h-6 text-[#594C1A]" />
                </div>
                <h2 className="text-2xl font-bold text-[#594C1A]">Upload Foto Ruangan</h2>
              </div>

              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                  dragActive
                    ? 'border-[#594C1A] bg-[#594C1A]/5 scale-[1.02]' // Subtle scale on drag
                    : 'border-[#594C1A]/20 hover:border-[#594C1A]/40 hover:bg-[#594C1A]/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {!previewUrl ? (
                  <div className="text-center">
                    <motion.div
                      className="mx-auto w-16 h-16 bg-[#594C1A]/10 rounded-2xl flex items-center justify-center mb-4"
                      whileHover={{ scale: 1.05 }} // Slightly less aggressive hover
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Upload className="w-8 h-8 text-[#594C1A]" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-[#594C1A] mb-2">
                      Drag & Drop atau Klik untuk Upload
                    </h3>
                    <p className="text-[#594C1A]/60 text-sm">
                      Mendukung format JPG, PNG, WebP (Max 10MB)
                    </p>
                  </div>
                ) : (
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, scale: 0.95 }} // Slightly smaller initial scale
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Image
                      src={previewUrl || "/placeholder.svg"}
                      alt="Pratinjau Ruangan"
                      className="w-full h-64 object-cover rounded-xl shadow-md" // Softer shadow
                    />
                    <motion.div
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-lg"
                      whileHover={{ scale: 1.05 }} // Slightly less aggressive hover
                    >
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Budget Section */}
            <motion.div
              className="space-y-6"
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#594C1A]/10 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-[#594C1A]" />
                </div>
                <h2 className="text-2xl font-bold text-[#594C1A]">Tentukan Anggaran</h2>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#594C1A] font-semibold">
                    Rp
                  </span>
                  <input
                    id="budget"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="5.000.000"
                    className="w-full pl-12 pr-4 py-4 border-2 border-[#594C1A]/20 rounded-2xl focus:ring-4 focus:ring-[#594C1A]/10 focus:border-[#594C1A] transition-all duration-300 text-lg font-medium bg-white/70 backdrop-blur-sm" // Slightly more opaque input background
                  />
                </div>

                {/* Quick Budget Options */}
                <div className="grid grid-cols-2 gap-3">
                  {[2000000, 5000000, 10000000, 20000000].map((amount) => (
                    <motion.button
                      key={amount}
                      onClick={() => setBudget(amount.toString())}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 text-sm font-medium ${
                        budget === amount.toString()
                          ? 'border-[#594C1A] bg-[#594C1A]/10 text-[#594C1A]'
                          : 'border-[#594C1A]/20 hover:border-[#594C1A]/40 text-[#594C1A]/70 hover:bg-[#594C1A]/5'
                      }`}
                      whileHover={{ scale: 1.01 }} // Subtle hover
                      whileTap={{ scale: 0.99 }} // Subtle tap
                    >
                      Rp {(amount / 1000000)}M
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Analysis Button */}
              <motion.button
                onClick={analyzeRoom}
                disabled={isLoading || !imageFile || !budget}
                className="w-full bg-gradient-to-r from-[#594C1A] to-[#6B5B1F] text-white font-bold py-4 px-6 rounded-2xl hover:from-[#6B5B1F] hover:to-[#594C1A] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none" // Softer hover translate
                whileHover={{ scale: isLoading || !imageFile || !budget ? 1 : 1.01 }} // Subtle hover
                whileTap={{ scale: isLoading || !imageFile || !budget ? 1 : 0.99 }} // Subtle tap
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-3"
                    >
                      <Zap className="w-5 h-5" />
                    </motion.div>
                    Menganalisis Ruangan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3" />
                    Analisis dengan AI
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            className="mt-8 bg-red-100 border-l-4 border-red-300 text-red-800 p-6 rounded-2xl flex items-start gap-3" // Softer red tones
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">Terjadi Kesalahan</p>
              <p className="mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        {analysisResult && (
          <motion.div
            className="bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-xl border border-white/50" // Consistent styling with main content
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              boxShadow: "0 20px 40px -10px rgba(139, 69, 19, 0.1)" // Consistent softer shadow
            }}
          >
            <motion.div
              className="flex items-center gap-3 mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="p-3 bg-gradient-to-r from-[#594C1A] to-[#6B5B1F] rounded-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[#594C1A]">Hasil Analisis AI</h2>
            </motion.div>

            <div className="space-y-8">
              {/* Analysis Summary */}
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  className="p-6 bg-gradient-to-br from-[#594C1A]/5 to-[#594C1A]/10 rounded-2xl border border-[#594C1A]/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Home className="w-6 h-6 text-[#594C1A]" />
                    <h3 className="font-bold text-xl text-[#594C1A]">Analisis Ruangan</h3>
                  </div>
                  <p className="text-[#594C1A]/80 leading-relaxed">{analysisResult.analysis.description}</p>
                </motion.div>

                <motion.div
                  className="p-6 bg-green-100 rounded-2xl border border-green-300" // Softer green tones
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-xl text-green-800">Ringkasan Rekomendasi</h3>
                  </div>
                  <p className="text-green-700 leading-relaxed">{analysisResult.summary}</p>
                </motion.div>
              </div>

              {/* Recommendations Grid */}
              <div>
                <motion.h3
                  className="text-2xl font-bold text-[#594C1A] mb-6 flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <TrendingUp className="w-7 h-7" />
                  Rekomendasi Item Interior
                </motion.h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analysisResult.recommendations.map((item, index) => (
                    <motion.div
                      key={index}
                      className="group bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300" // Softer shadows
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                      whileHover={{
                        y: -4, // Subtle lift on hover
                        boxShadow: "0 15px 30px -8px rgba(139, 69, 19, 0.15)" // Softer hover shadow
                      }}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-bold text-lg text-[#594C1A] group-hover:text-[#6B5B1F] transition-colors">
                            {item.item_name}
                          </h4>
                          <div className="p-2 bg-[#594C1A]/10 rounded-xl group-hover:bg-[#594C1A]/20 transition-colors">
                            <Home className="w-4 h-4 text-[#594C1A]" />
                          </div>
                        </div>

                        <div className="mb-4">
                          <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#6B5B1F] to-[#8B7B3F] text-white font-bold rounded-xl text-sm shadow-md"> {/* Muted gold/brown gradient for price */}
                            Rp {item.estimated_price.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
                          </div>

                          <div className="p-4 bg-blue-100 rounded-xl border-l-4 border-blue-300"> {/* Softer blue tones */}
                            <p className="text-sm text-blue-800">
                              <span className="font-semibold">💡 Saran Penempatan:</span>
                              <br />
                              {item.placement_suggestion}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
