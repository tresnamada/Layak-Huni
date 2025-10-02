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

  Navigation,
  CloudRain,
  Wind,
  BarChart3,
  Calendar,

  Home,
  Leaf,
  Wrench,
} from "lucide-react"
import Navbar from "@/components/Navbar"

interface RiskAnalysis {
  analisis_risiko?: Record<string, {
    level?: string;
    faktor?: string[];
    frekuensi?: string;
    musim?: string;
  }>;
  data_geografis?: Record<string, string>;
  rekomendasi_kawasan?: {
    zona_teraman?: string;
    zona_berisiko?: string;
    arah_pembangunan?: string;
  };
  rekomendasi_desain?: {
    fondasi?: string;
    struktur?: string;
    material?: Record<string, string>;
    fitur_keamanan?: string[];
    teknologi_mitigasi?: string[];
  };
  rekomendasi_lingkungan?: Record<string, string>;
  daftar_material?: Array<{
    nama: string;
    jenis: string;
    keunggulan: string[];
    sumber: string;
  }>;
  skor_risiko?: {
    total?: number;
    kategori?: string;
    trend?: string;
  };
}

export default function SimulasiKawasan() {
  const [location, setLocation] = useState("")
  const [riskData, setRiskData] = useState<RiskAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanPhase, setScanPhase] = useState("")
  const [showHelp, setShowHelp] = useState(false)
  const [activeTab, setActiveTab] = useState("risiko")

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
      case "banjir":
        return <Droplets className="w-5 h-5" />
      case "longsor":
        return <Mountain className="w-5 h-5" />
      case "kebakaran":
        return <Flame className="w-5 h-5" />
      case "gempa":
        return <AlertTriangle className="w-5 h-5" />
      case "tsunami":
        return <Wind className="w-5 h-5" />
      default:
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getRiskColor = (level: string | undefined) => {
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

  const getRiskPercentage = (level: string | undefined) => {
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

          {/* Hero Section - Unique Layout */}
          <motion.div className="mb-16 mt-8 relative" variants={fadeInUp}>
            {/* Split Layout Container */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-8 items-start max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-12 pb-16 lg:pt-24">

              {/* Left Side - Content */}
              <motion.div
                className="w-full order-1 lg:order-1 space-y-6 lg:space-y-8 lg:pr-4"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >

                {/* Main Heading - Diagonal Style */}
                <div className="relative">
                  <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                    <span className="block text-[#4A443A] transform -rotate-1 mb-4">Cek</span>
                    <span className="block bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent transform rotate-1 ">Kawasan</span>
                    <span className="block text-[#6B5B4F] transform -rotate-1 -mt-2">Risiko</span>
                  </h1>
                </div>

                {/* Description */}
                <p className="text-lg md:text-xl text-[#6B5B4F] max-w-md leading-relaxed">
                  Analisis risiko bencana berbasis AI untuk konstruksi yang
                  <span className="font-semibold text-amber-700"> aman dan terpercaya</span>
                </p>

                {/* Stats Cards */}
                <div className="flex gap-4 pt-4">
                  <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-amber-200 shadow-sm">
                    <div className="text-2xl font-bold text-amber-600">99%</div>
                    <div className="text-xs text-gray-600">Akurasi</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-blue-200 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">1000+</div>
                    <div className="text-xs text-gray-600">Lokasi</div>
                  </div>
                </div>
              </motion.div>

              {/* Right Side - Interactive Form & Visual */}
              <motion.div
                className="w-full order-2 lg:order-2 relative -mx-4 px-4 lg:mx-0 lg:px-0"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* AI Avatar - Positioned Creatively */}
                <div className="absolute -top-6 -right-4 lg:-top-8 lg:-right-8 z-10">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="w-32 h-32 flex items-center justify-center"
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1">
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="object-cover w-full h-full rounded-full"
                      >
                        <source src="/animation.mp4" type="video/mp4" />
                      </video>
                    </div>
                  </motion.div>
                </div>

                {/* Main Form Card - Tilted Design */}
                <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/60 shadow-xl sm:shadow-2xl transform lg:rotate-2 hover:lg:rotate-0 transition-transform duration-300">
                  <div className="transform -rotate-2">
                    {/* Form Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl lg:rounded-2xl flex items-center justify-center transform -rotate-12">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#4A443A]">Lokasi Target</h2>
                        <p className="text-sm text-gray-500">Pilih area untuk dianalisis</p>
                      </div>
                    </div>

                    {/* Input Field with Creative Design */}
                    <div className="space-y-6">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Masukkan nama kota atau kawasan..."
                          className="w-full p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl sm:rounded-2xl text-[#4A443A] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-amber-400/30 focus:border-amber-400 transition-all duration-300 pr-12 text-sm sm:text-base"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Action Button - Creative Design */}
                      <button
                        onClick={handleAnalyze}
                        disabled={!location || isLoading}
                        className="group w-full bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 hover:from-amber-500 hover:via-orange-400 hover:to-red-400 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl sm:hover:shadow-2xl disabled:scale-100 relative overflow-hidden text-sm sm:text-base"
                      >
                        {/* Button Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                        <div className="relative flex items-center justify-center gap-3">
                          {isLoading ? (
                            <>
                              <Scan className="w-6 h-6 animate-spin" />
                              <span className="text-lg">Memindai Area...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-6 h-6 group-hover:animate-pulse" />
                              <span className="text-lg">Mulai Analisis AI</span>
                              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </div>
                      </button>

                      {/* Quick Action Pills */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm rounded-full transition-colors">
                          Jakarta
                        </button>
                        <button className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm rounded-full transition-colors">
                          Bandung
                        </button>
                        <button className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 text-sm rounded-full transition-colors">
                          Surabaya
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-cyan-200/30 to-blue-300/30 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 -right-8 w-16 h-16 bg-gradient-to-br from-green-200/30 to-emerald-300/30 rounded-full blur-lg"></div>
              </motion.div>
            </div>

            {/* Bottom Wave Decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-amber-100/50 via-orange-100/30 to-red-100/50 transform -skew-y-1 -z-10"></div>
          </motion.div>


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
              className="max-w-6xl mx-auto space-y-8"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Location Header - Simplified */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#4A443A] mb-2">Hasil Analisis: {location}</h2>
                <div className="flex items-center justify-center gap-2 text-[#6B5B4F]">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Dianalisis menggunakan AI Si Huni</span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {[
                  { id: "risiko", label: "Analisis Risiko", icon: <BarChart3 className="w-4 h-4" /> },
                  { id: "geografis", label: "Data Geografis", icon: <Navigation className="w-4 h-4" /> },
                  { id: "rekomendasi", label: "Rekomendasi", icon: <Lightbulb className="w-4 h-4" /> },
                  { id: "material", label: "Material", icon: <Wrench className="w-4 h-4" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id ? "bg-[#4A443A] text-white" : "bg-white/80 text-[#4A443A] hover:bg-white"}`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Risk Analysis Tab */}
              {activeTab === "risiko" && (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                >
                  {riskData.analisis_risiko && Object.entries(riskData.analisis_risiko).map(([riskType, data]) => (
                    <motion.div
                      key={riskType}
                      className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 hover:bg-white hover:shadow-xl transition-all duration-300"
                      variants={scaleIn}
                      whileHover={{ y: -3 }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-gradient-to-br ${getRiskColor(data.level)} rounded-lg text-white`}>
                            {getRiskIcon(riskType)}
                          </div>
                          <h3 className="font-bold text-[#4A443A] capitalize">{riskType}</h3>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${data.level?.toLowerCase() === "tinggi"
                              ? "bg-red-100 text-red-700"
                              : data.level?.toLowerCase() === "sedang"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                        >
                          {data.level?.toUpperCase()}
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
                            stroke={`url(#gradient-${riskType})`}
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - getRiskPercentage(data.level) / 100) }}
                            transition={{ duration: 1.5 }}
                          />
                          <defs>
                            <linearGradient id={`gradient-${riskType}`}>
                              <stop offset="0%" stopColor={
                                data.level?.toLowerCase() === "tinggi" ? "#EF4444" :
                                  data.level?.toLowerCase() === "sedang" ? "#F59E0B" : "#10B981"
                              } />
                              <stop offset="100%" stopColor={
                                data.level?.toLowerCase() === "tinggi" ? "#DC2626" :
                                  data.level?.toLowerCase() === "sedang" ? "#D97706" : "#059669"
                              } />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-[#4A443A]">{getRiskPercentage(data.level)}%</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm">
                        {data.frekuensi && (
                          <div className="flex items-center gap-2 text-[#6B5B4F]">
                            <Calendar className="w-4 h-4" />
                            <span>{data.frekuensi}</span>
                          </div>
                        )}
                        {data.musim && (
                          <div className="flex items-center gap-2 text-[#6B5B4F]">
                            <CloudRain className="w-4 h-4" />
                            <span>Musim: {data.musim}</span>
                          </div>
                        )}
                        {data.faktor && data.faktor.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-[#4A443A] mb-1">Faktor Risiko:</p>
                            <ul className="list-disc list-inside text-[#6B5B4F] pl-2">
                              {data.faktor.slice(0, 3).map((faktor: string, i: number) => (
                                <li key={i}>{faktor}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Geographical Data Tab */}
              {activeTab === "geografis" && riskData.data_geografis && (
                <motion.div
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/60"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                      <Navigation className="w-6 h-6 text-blue-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#4A443A]">Data Geografis</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(riskData.data_geografis).map(([key, value]) => (
                      <div key={key} className="bg-stone-50/50 rounded-xl p-4">
                        <h4 className="font-semibold text-[#4A443A] mb-2 capitalize">{key.replace(/_/g, ' ')}</h4>
                        <p className="text-[#4A443A]/90">{value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Recommendations Tab */}
              {activeTab === "rekomendasi" && (
                <motion.div
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/60"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                      <Lightbulb className="w-6 h-6 text-emerald-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#4A443A]">Rekomendasi Konstruksi</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Kawasan Analysis */}
                    {riskData.rekomendasi_kawasan && (
                      <div className="bg-blue-50/50 rounded-xl p-5 border-l-4 border-blue-400">
                        <h4 className="font-semibold text-[#4A443A] mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          Analisis Kawasan
                        </h4>
                        <p className="text-[#4A443A]/90 leading-relaxed">{riskData.rekomendasi_kawasan.zona_teraman}</p>
                        {riskData.rekomendasi_kawasan.zona_berisiko && (
                          <div className="mt-3">
                            <p className="font-medium text-[#4A443A]">Zona Berisiko:</p>
                            <p className="text-[#4A443A]/90">{riskData.rekomendasi_kawasan.zona_berisiko}</p>
                          </div>
                        )}
                        {riskData.rekomendasi_kawasan.arah_pembangunan && (
                          <div className="mt-3">
                            <p className="font-medium text-[#4A443A]">Arah Pembangunan:</p>
                            <p className="text-[#4A443A]/90">{riskData.rekomendasi_kawasan.arah_pembangunan}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Design Recommendations */}
                    {riskData.rekomendasi_desain && (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-amber-50/50 rounded-xl p-5 border-l-4 border-amber-400">
                          <h4 className="font-semibold text-[#4A443A] mb-2 flex items-center gap-2">
                            <Home className="w-4 h-4 text-amber-600" />
                            Desain Bangunan
                          </h4>
                          {riskData.rekomendasi_desain.fondasi && (
                            <div className="mb-3">
                              <p className="font-medium text-[#4A443A]">Fondasi:</p>
                              <p className="text-[#4A443A]/90 text-sm">{riskData.rekomendasi_desain.fondasi}</p>
                            </div>
                          )}
                          {riskData.rekomendasi_desain.struktur && (
                            <div className="mb-3">
                              <p className="font-medium text-[#4A443A]">Struktur:</p>
                              <p className="text-[#4A443A]/90 text-sm">{riskData.rekomendasi_desain.struktur}</p>
                            </div>
                          )}
                          {riskData.rekomendasi_desain.material && (
                            <div>
                              <p className="font-medium text-[#4A443A]">Material:</p>
                              <div className="text-[#4A443A]/90 text-sm">
                                {Object.entries(riskData.rekomendasi_desain.material).map(([key, value]) => (
                                  <p key={key}><span className="capitalize">{key}</span>: {value}</p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-emerald-50/50 rounded-xl p-5 border-l-4 border-emerald-400">
                          <h4 className="font-semibold text-[#4A443A] mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-600" />
                            Fitur Keamanan
                          </h4>
                          {riskData.rekomendasi_desain.fitur_keamanan && (
                            <div className="mb-3">
                              <p className="font-medium text-[#4A443A]">Fitur:</p>
                              <ul className="text-[#4A443A]/90 text-sm list-disc list-inside pl-2">
                                {riskData.rekomendasi_desain.fitur_keamanan.map((fitur, i) => (
                                  <li key={i}>{fitur}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {riskData.rekomendasi_desain.teknologi_mitigasi && (
                            <div>
                              <p className="font-medium text-[#4A443A]">Teknologi:</p>
                              <ul className="text-[#4A443A]/90 text-sm list-disc list-inside pl-2">
                                {riskData.rekomendasi_desain.teknologi_mitigasi.map((tech, i) => (
                                  <li key={i}>{tech}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Environmental Recommendations */}
                    {riskData.rekomendasi_lingkungan && (
                      <div className="bg-green-50/50 rounded-xl p-5 border-l-4 border-green-400">
                        <h4 className="font-semibold text-[#4A443A] mb-2 flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-green-600" />
                          Rekomendasi Lingkungan
                        </h4>
                        {Object.entries(riskData.rekomendasi_lingkungan).map(([key, value]) => (
                          <div key={key} className="mb-3 last:mb-0">
                            <p className="font-medium text-[#4A443A] capitalize">{key.replace(/_/g, ' ')}:</p>
                            <p className="text-[#4A443A]/90 text-sm">{value}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Materials Tab */}
              {activeTab === "material" && riskData.daftar_material && riskData.daftar_material.length > 0 && (
                <motion.div
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/60"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                      <Wrench className="w-6 h-6 text-amber-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#4A443A]">Material Rekomendasi</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {riskData.daftar_material?.map((material, index) => (
                      <div key={index} className="bg-stone-50/50 rounded-xl p-5 border border-stone-200">
                        <h4 className="font-semibold text-[#4A443A] mb-2">{material.nama}</h4>
                        <p className="text-sm text-[#6B5B4F] mb-3 capitalize">Jenis: {material.jenis}</p>

                        {material.keunggulan && material.keunggulan.length > 0 && (
                          <div className="mb-3">
                            <p className="font-medium text-[#4A443A] text-sm">Keunggulan:</p>
                            <ul className="text-[#6B5B4F] text-sm list-disc list-inside pl-2">
                              {material.keunggulan.map((keunggulan: string, i: number) => (
                                <li key={i}>{keunggulan}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {material.sumber && (
                          <p className="text-sm text-[#6B5B4F]">
                            <span className="font-medium">Sumber:</span> {material.sumber}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}


              {/* Risk Score */}
              {riskData.skor_risiko && (
                <motion.div
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/60"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl">
                        <BarChart3 className="w-6 h-6 text-purple-700" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#4A443A]">Skor Risiko Keseluruhan</h3>
                    </div>
                    <div className={`text-2xl font-bold ${riskData.skor_risiko.kategori?.includes('tinggi') ? 'text-red-600' :
                        riskData.skor_risiko.kategori?.includes('sedang') ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                      {riskData.skor_risiko.total}/10
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-stone-50/50 rounded-xl p-4 text-center">
                      <p className="text-sm text-[#6B5B4F] mb-1">Kategori</p>
                      <p className="font-semibold text-[#4A443A] capitalize">{riskData.skor_risiko.kategori}</p>
                    </div>

                    <div className="bg-stone-50/50 rounded-xl p-4 text-center">
                      <p className="text-sm text-[#6B5B4F] mb-1">Tren</p>
                      <p className="font-semibold text-[#4A443A] capitalize">{riskData.skor_risiko.trend}</p>
                    </div>

                    <div className="bg-stone-50/50 rounded-xl p-4 text-center">
                      <p className="text-sm text-[#6B5B4F] mb-1">Status</p>
                      <p className="font-semibold text-[#4A443A]">
                        {riskData.skor_risiko.kategori?.includes('tinggi') ? 'Perlu Perhatian Khusus' :
                          riskData.skor_risiko.kategori?.includes('sedang') ? 'Perlu Persiapan' : 'Relatif Aman'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}