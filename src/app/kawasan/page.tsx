"use client"
import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import {
  MapPin,
  Shield,
  AlertTriangle,
  Flame,
  Droplets,
  Mountain,
  Lightbulb,
  ChevronRight,
  Scan,
  Zap,
  HelpCircle,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react"
import Navbar from "@/components/Navbar"


export default function SimulasiKawasan() {
  const [location, setLocation] = useState("")
  const [riskData, setRiskData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanPhase, setScanPhase] = useState("")
  const [showHelp, setShowHelp] = useState(false)

  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  const handleAnalyze = async () => {
    setIsLoading(true)
    setScanProgress(0)
    setRiskData(null)

    // Simulate scanning phases with progress
    const phases = [
      "Memindai koordinat geografis...",
      "Menganalisis data topografi...",
      "Mengevaluasi pola cuaca historis...",
      "Memproses risiko bencana...",
      "Menyusun rekomendasi konstruksi...",
    ]

    try {
      // Simulate scanning progress
      for (let i = 0; i < phases.length; i++) {
        setScanPhase(phases[i])
        setScanProgress((i + 1) * 20)
        await new Promise((resolve) => setTimeout(resolve, 800))
      }

      // Call API route
      const response = await fetch("/api/kawasan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Server returned an invalid error response" }))
        console.error("API Error:", errorData)
        throw new Error(errorData.error || "Failed to analyze risk")
      }

      const analysis = await response.json()
      setScanProgress(100)
      setScanPhase("Analisis selesai!")

      // Small delay before showing results
      await new Promise((resolve) => setTimeout(resolve, 500))
      setRiskData(analysis)
    } catch (error) {
      console.error("Error:", error)
      alert("Terjadi kesalahan saat menganalisis risiko. Pastikan API key sudah dikonfigurasi dengan benar.")
    } finally {
      setIsLoading(false)
      setScanProgress(0)
      setScanPhase("")
    }
  }

  const getRiskIcon = (type: string) => {
    switch (type) {
      case "Banjir":
        return <Droplets className="w-5 h-5" />
      case "Longsor":
        return <Mountain className="w-5 h-5" />
      case "Kebakaran":
        return <Flame className="w-5 h-5" />
      default:
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "tinggi":
        return "from-red-400 to-red-500"
      case "sedang":
        return "from-amber-400 to-orange-400"
      case "rendah":
        return "from-emerald-400 to-green-500"
      default:
        return "from-stone-400 to-stone-500"
    }
  }

  const getRiskPercentage = (level: string) => {
    switch (level?.toLowerCase()) {
      case "tinggi": return 85
      case "sedang": return 60
      case "rendah": return 30
      default: return 0
    }
  }


  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-[#F6F6EC] to-[#E8E8DE] text-[#4A443A] relative overflow-hidden"
    >


      {/* Help Button */}
      <motion.button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-8 right-8 z-[100] bg-[#4A443A] text-white p-3 rounded-full shadow-lg hover:bg-[#6B5B4F] transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <HelpCircle className="w-5 h-5" />
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
            className="bg-white rounded-2xl max-w-xl w-full max-h-[80vh] overflow-y-auto relative"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-[#4A443A] hover:text-[#6B5B4F] text-xl"
            >
              ✕
            </button>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="w-7 h-7 text-[#4A443A]" />
                <h2 className="text-2xl font-bold text-[#4A443A]">Panduan Singkat</h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="bg-[#4A443A] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <h3 className="font-semibold text-[#4A443A] mb-1">Masukkan Lokasi</h3>
                    <p className="text-sm text-[#4A443A]/80">Ketik nama kota atau kawasan yang ingin dianalisis</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="bg-[#4A443A] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <h3 className="font-semibold text-[#4A443A] mb-1">Mulai Analisis</h3>
                    <p className="text-sm text-[#4A443A]/80">Klik tombol analisis dan tunggu AI memproses data</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="bg-[#4A443A] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <h3 className="font-semibold text-[#4A443A] mb-1">Lihat Hasil</h3>
                    <p className="text-sm text-[#4A443A]/80">Dapatkan analisis risiko dan rekomendasi konstruksi</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="mt-6 w-full py-3 bg-[#4A443A] text-white rounded-xl font-medium hover:bg-[#6B5B4F] transition-colors"
              >
                Mengerti
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="relative z-10 px-4 sm:px-6 pt-12 pb-16">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={stagger}
        >
          <Navbar />
          
          {/* Hero Section - More Compact */}
          <motion.div className="text-center mb-16 mt-8" variants={fadeInUp}>
            {/* AI Avatar - Smaller */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center mb-8"
            >
              <div className="w-60 h-60 flex items-center justify-center animate-pulse-slow overflow-hidden">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="object-contain w-full h-full"
                >
                  <source src="/animation.mp4" type="video/mp4" />
                </video>
              </div>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#4A443A] to-[#6B5B4F] bg-clip-text text-transparent tracking-tight mb-4">
              Cek Kawasan Risiko
            </h1>
            <p className="text-lg md:text-xl text-[#6B5B4F] max-w-2xl mx-auto leading-relaxed">
              Analisis risiko bencana berbasis AI untuk konstruksi yang aman
            </p>
          </motion.div>

          {/* Input Section - Cleaner Design */}
          <motion.div className="max-w-2xl mx-auto mb-12" variants={fadeInUp}>
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-white/60 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-[#4A443A]">Lokasi Target</h2>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Masukkan nama kota atau kawasan..."
                  className="w-full p-4 bg-white border-2 border-stone-200 rounded-xl text-[#4A443A] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-300"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                <button
                  onClick={handleAnalyze}
                  disabled={!location || isLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-stone-400 disabled:to-stone-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:scale-100 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <Scan className="w-5 h-5 animate-spin" />
                      Memindai...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Mulai Analisis AI
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Loading Section - More Elegant */}
          {isLoading && (
            <motion.div
              className="max-w-xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/60">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 border-3 border-amber-200 rounded-full animate-spin border-t-amber-500"></div>
                    <span className="text-[#4A443A] font-semibold">AI Menganalisis</span>
                  </div>
                  <p className="text-amber-700 font-medium">{scanPhase}</p>
                </div>

                <div className="w-full bg-stone-200 rounded-full h-2 mb-4 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="text-center text-[#6B5B4F] font-medium">{scanProgress}%</div>
              </div>
            </motion.div>
          )}

          {/* Results Section - Redesigned for Better UX */}
          {riskData && (
            <motion.div
              className="max-w-5xl mx-auto space-y-8"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Location Header - Simplified */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#4A443A] mb-2">Hasil Analisis: {location}</h2>
                <div className="flex items-center justify-center gap-2 text-[#6B5B4F]">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Dianalisis menggunakan AI</span>
                </div>
              </div>

              {/* Risk Cards - More Compact & Visual */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                variants={stagger}
                initial="hidden"
                animate="visible"
              >
                {["Banjir", "Longsor", "Kebakaran"].map((riskType, index) => {
                  const level = riskData[riskType.toLowerCase()]
                  if (!level) return null

                  const percentage = getRiskPercentage(level)

                  return (
                    <motion.div
                      key={riskType}
                      className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 hover:bg-white hover:shadow-xl transition-all duration-300"
                      variants={scaleIn}
                      whileHover={{ y: -3 }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-gradient-to-br ${getRiskColor(level)} rounded-lg text-white`}>
                            {getRiskIcon(riskType)}
                          </div>
                          <h3 className="font-bold text-[#4A443A]">{riskType}</h3>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            level?.toLowerCase() === "tinggi"
                              ? "bg-red-100 text-red-700"
                              : level?.toLowerCase() === "sedang"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {level?.toUpperCase()}
                        </span>
                      </div>

                      {/* Progress Ring */}
                      <div className="relative flex items-center justify-center mb-4">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#E5E7EB"
                            strokeWidth="8"
                            fill="none"
                          />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke={`url(#gradient-${index})`}
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - percentage / 100) }}
                            transition={{ duration: 1.5, delay: 0.5 + index * 0.2 }}
                          />
                          <defs>
                            <linearGradient id={`gradient-${index}`}>
                              <stop offset="0%" stopColor={
                                level?.toLowerCase() === "tinggi" ? "#EF4444" : 
                                level?.toLowerCase() === "sedang" ? "#F59E0B" : "#10B981"
                              } />
                              <stop offset="100%" stopColor={
                                level?.toLowerCase() === "tinggi" ? "#DC2626" : 
                                level?.toLowerCase() === "sedang" ? "#D97706" : "#059669"
                              } />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-[#4A443A]">{percentage}%</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="text-center">
                        <span className="text-sm text-[#6B5B4F]">Tingkat Risiko</span>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>

              {/* Recommendations - Cleaner Card Design */}
              <motion.div
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/60"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                    <Lightbulb className="w-6 h-6 text-emerald-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#4A443A]">Rekomendasi Konstruksi</h3>
                </div>

                {riskData?.rekomendasi ? (
                  <div className="space-y-6">
                    {/* Kawasan Analysis */}
                    {riskData.rekomendasi.kawasan && (
                      <div className="bg-blue-50/50 rounded-xl p-5 border-l-4 border-blue-400">
                        <h4 className="font-semibold text-[#4A443A] mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          Analisis Kawasan
                        </h4>
                        <p className="text-[#4A443A]/90 leading-relaxed text-sm">{riskData.rekomendasi.kawasan}</p>
                      </div>
                    )}
                    
                    {/* Construction Recommendations */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-amber-50/50 rounded-xl p-5 border-l-4 border-amber-400">
                        <h4 className="font-semibold text-[#4A443A] mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-amber-600" />
                          Konstruksi
                        </h4>
                        <p className="text-[#4A443A]/90 leading-relaxed text-sm">{riskData.rekomendasi.konstruksi}</p>
                      </div>

                      <div className="bg-emerald-50/50 rounded-xl p-5 border-l-4 border-emerald-400">
                        <h4 className="font-semibold text-[#4A443A] mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          Penguatan Struktur
                        </h4>
                        <p className="text-[#4A443A]/90 leading-relaxed text-sm">{riskData.rekomendasi.penguatan_struktur}</p>
                      </div>
                    </div>

                    {/* Materials List */}
                    {riskData.rekomendasi.barang?.length > 0 && (
                      <div className="bg-stone-50/50 rounded-xl p-5 border-l-4 border-stone-400">
                        <h4 className="font-semibold text-[#4A443A] mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-stone-600" />
                          Material Rekomendasi
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {riskData.rekomendasi.barang.map((item: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-[#4A443A]/90">
                              <div className="w-1.5 h-1.5 bg-stone-400 rounded-full flex-shrink-0"></div>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-[#4A443A] border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-[#4A443A]/60">Memuat rekomendasi...</p>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#6B5B4F] bg-stone-100/50 rounded-lg p-3">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Powered by Gemini AI • Real-time Analysis</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}