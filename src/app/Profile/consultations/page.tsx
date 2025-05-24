"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getUserConsultations, type Consultation } from "@/services/consultationService"
import { useRouter } from "next/navigation"
import {
  FiMessageSquare,
  FiLoader,
  FiArrowLeft,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiCalendar,
} from "react-icons/fi"
import Navbar from "@/components/Navbar"

export default function ConsultationsPage() {
  const { user, loading: authLoading } = useAuth({ redirectToLogin: true })
  const router = useRouter()

  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load consultations when user auth state is ready
  useEffect(() => {
    if (authLoading) return

    if (user) {
      fetchConsultations()
    }
  }, [user, authLoading])

  const fetchConsultations = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const result = await getUserConsultations(user.uid)

      if (result.success) {
        setConsultations(result.consultations)
      } else {
        setError(result.error || "Gagal mengambil data konsultasi")
      }
    } catch (err) {
      console.error("Error fetching consultations:", err)
      setError("Terjadi kesalahan saat mengambil data konsultasi")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <FiClock className="w-3 h-3 mr-1.5" />
            Menunggu Arsitek
          </span>
        )
      case "active":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FiCheckCircle className="w-3 h-3 mr-1.5" />
            Aktif
          </span>
        )
      case "completed":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <FiCheckCircle className="w-3 h-3 mr-1.5" />
            Selesai
          </span>
        )
      case "cancelled":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <FiXCircle className="w-3 h-3 mr-1.5" />
            Dibatalkan
          </span>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Navbar />

      <div className="container max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-3 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text text-transparent">
                Konsultasi Desain
              </h1>
              <p className="text-amber-700 text-lg max-w-2xl">
                Kelola dan pantau konsultasi desain Anda dengan arsitek profesional
              </p>
            </div>
            <button
              onClick={() => router.push("/Profile/saved-designs")}
              className="group flex items-center px-6 py-3.5 text-amber-700 hover:text-amber-800 bg-white hover:bg-amber-50 border-2 border-amber-200 hover:border-amber-300 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]"
            >
              <FiArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Kembali ke Desain Tersimpan
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-white to-amber-50 backdrop-blur-sm border border-amber-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] opacity-0 animate-[fadeInUp_0.6s_ease-out_0.3s_forwards]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-amber-800 animate-[countUp_1s_ease-out_0.8s_forwards] opacity-0">
                  {consultations.length}
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-sm font-medium text-amber-700">Total Konsultasi</div>
            </div>

            <div className="bg-gradient-to-br from-white to-yellow-50 backdrop-blur-sm border border-yellow-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-yellow-600 animate-[countUp_1s_ease-out_0.9s_forwards] opacity-0">
                  {consultations.filter((c) => c.status === "pending").length}
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-sm font-medium text-amber-700">Menunggu</div>
            </div>

            <div className="bg-gradient-to-br from-white to-emerald-50 backdrop-blur-sm border border-emerald-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] opacity-0 animate-[fadeInUp_0.6s_ease-out_0.5s_forwards]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-emerald-600 animate-[countUp_1s_ease-out_1s_forwards] opacity-0">
                  {consultations.filter((c) => c.status === "active").length}
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-sm font-medium text-amber-700">Aktif</div>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-blue-600 animate-[countUp_1s_ease-out_1.1s_forwards] opacity-0">
                  {consultations.filter((c) => c.status === "completed").length}
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="text-sm font-medium text-amber-700">Selesai</div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {authLoading || loading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white/70 backdrop-blur-sm rounded-2xl border border-amber-200 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
            <FiLoader className="animate-spin text-amber-600 w-12 h-12 mb-4" />
            <p className="text-amber-700 font-medium">Memuat konsultasi...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards]">
            <div className="flex items-center">
              <FiXCircle className="w-5 h-5 mr-3 text-red-600" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        ) : consultations.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-12 text-center border border-amber-200 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-[bounce_2s_infinite]">
              <FiMessageSquare className="w-12 h-12 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-amber-900 mb-3">Belum Ada Konsultasi</h3>
            <p className="text-amber-700 mb-6 max-w-md mx-auto leading-relaxed">
              Anda belum memiliki konsultasi aktif. Mulai konsultasi dengan arsitek profesional untuk mewujudkan desain
              impian Anda.
            </p>
            <button
              onClick={() => router.push("/Profile/saved-designs")}
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              Lihat Desain Tersimpan
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {consultations.map((consultation, index) => (
              <div
                key={consultation.id}
                className="group bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl rounded-2xl overflow-hidden border border-amber-200 hover:border-amber-300 transition-all duration-300 cursor-pointer hover:-translate-y-1 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                onClick={() => router.push(`/Profile/consultations/${consultation.id}`)}
              >
                <div className="p-8">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-2xl font-bold text-amber-900 group-hover:text-amber-800 transition-colors">
                          {consultation.designData.name}
                        </h2>
                        {getStatusBadge(consultation.status)}
                      </div>

                      <p className="text-amber-700 leading-relaxed mb-4">
                        {consultation.designData.description.length > 150
                          ? consultation.designData.description.substring(0, 150) + "..."
                          : consultation.designData.description}
                      </p>
                    </div>
                  </div>

                  {/* Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 group-hover:shadow-sm transition-all duration-300">
                      <div className="w-10 h-10 bg-amber-200 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                        <FiUser className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <div className="text-sm text-amber-600 font-medium">Status Arsitek</div>
                        {consultation.architectId ? (
                          <div className="text-emerald-700 font-semibold">Tersedia</div>
                        ) : (
                          <div className="text-yellow-700 font-semibold">Menunggu</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 group-hover:shadow-sm transition-all duration-300">
                      <div className="w-10 h-10 bg-amber-200 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                        <FiCalendar className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <div className="text-sm text-amber-600 font-medium">Tanggal Dibuat</div>
                        <div className="text-amber-800 font-semibold">{formatDate(consultation.createdAt)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end">
                    <button className="group/btn inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]">
                      <FiMessageSquare className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" />
                      {consultation.status === "pending" ? "Lihat Detail" : "Lanjutkan Chat"}
                    </button>
                  </div>
                </div>

                {/* Bottom Border Accent */}
                <div className="h-1 bg-gradient-to-r from-amber-200 via-orange-300 to-amber-200 group-hover:from-amber-300 group-hover:via-orange-400 group-hover:to-amber-300 transition-all duration-300"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes countUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
