"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getUserGeneratedDesigns, deleteGeneratedDesign, type GeneratedDesign } from "@/services/designService"
import { createConsultation } from "@/services/consultationService"
import { useRouter } from "next/navigation"
import { FiHome, FiTrash2, FiEye, FiLoader, FiMessageSquare, FiPlus } from "react-icons/fi"
import Navbar from "@/components/Navbar"

export default function SavedDesignsPage() {
  const { user, loading: authLoading } = useAuth({ redirectToLogin: true })
  const router = useRouter()

  const [designs, setDesigns] = useState<GeneratedDesign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [consultingId, setConsultingId] = useState<string | null>(null)

  // Load saved designs when user auth state is ready
  useEffect(() => {
    const fetchDesigns = async () => {
      if (!user) return

      setLoading(true)
      setError(null)

      try {
        const result = await getUserGeneratedDesigns(user.uid)

        if (result.success) {
          setDesigns(result.designs)
        } else {
          setError(result.error || "Gagal mengambil data desain")
        }
      } catch (err) {
        console.error("Error fetching designs:", err)
        setError("Terjadi kesalahan saat mengambil data desain")
      } finally {
        setLoading(false)
      }
    }

    if (authLoading) return

    if (user) {
      fetchDesigns()
    }
  }, [user, authLoading])

  const handleDelete = async (designId: string) => {
    if (!user || !designId) return

    setDeletingId(designId)

    try {
      const result = await deleteGeneratedDesign(user.uid, designId)

      if (result.success) {
        // Remove the deleted design from the local state
        setDesigns(designs.filter((design) => design.id !== designId))
      } else {
        throw new Error(result.error || "Gagal menghapus desain")
      }
    } catch (err) {
      console.error("Error deleting design:", err)
      alert("Gagal menghapus desain. Silakan coba lagi.")
    } finally {
      setDeletingId(null)
    }
  }

  const handleViewDesign = (designId: string) => {
    router.push(`/Profile/saved-designs/${designId}`)
  }

  const handleConsultArchitect = async (design: GeneratedDesign) => {
    if (!user || !design.id) return

    setConsultingId(design.id)

    try {
      const result = await createConsultation(user.uid, design.id, design)

      if (result.success) {
        // Redirect to the consultation chat page
        router.push(`/Profile/consultations/${result.consultationId}`)
      } else {
        throw new Error(result.error || "Gagal membuat permintaan konsultasi")
      }
    } catch (err) {
      console.error("Error creating consultation:", err)
      alert("Gagal membuat permintaan konsultasi. Silakan coba lagi.")
    } finally {
      setConsultingId(null)
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

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-amber-900 mb-2">Desain Tersimpan</h1>
            <p className="text-amber-700">Kelola koleksi desain rumah impian Anda</p>
          </div>
          <button
            onClick={() => router.push("/custom-design")}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl shadow-lg transition-all duration-200 font-medium"
          >
            <FiPlus className="mr-2" />
            Buat Desain Baru
          </button>
        </div>

        {authLoading || loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FiLoader className="animate-spin text-amber-600 w-12 h-12 mx-auto mb-4" />
              <p className="text-amber-700 font-medium">Memuat desain Anda...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm">{error}</div>
        ) : designs.length === 0 ? (
          <div className="bg-white shadow-xl rounded-2xl p-12 text-center border border-amber-100">
            <div className="max-w-md mx-auto">
              <FiHome className="mx-auto text-amber-400 text-6xl mb-6" />
              <h3 className="text-2xl font-bold text-amber-900 mb-4">Belum Ada Desain Tersimpan</h3>
              <p className="text-amber-700 mb-6 leading-relaxed">
                Mulai perjalanan Anda dalam merancang rumah impian dengan membuat desain pertama Anda
              </p>
              <button
                onClick={() => router.push("/custom-design")}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl shadow-lg transition-all duration-200 font-medium"
              >
                Buat Desain Sekarang
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designs.map((design) => (
              <div
                key={design.id}
                className="bg-white shadow-xl rounded-2xl overflow-hidden border border-amber-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-amber-900 mb-3">{design.name}</h2>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-700 font-medium">Gaya:</span>
                        <span className="text-amber-800 bg-amber-50 px-3 py-1 rounded-full text-sm font-medium">
                          {design.style}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-700 font-medium">Estimasi:</span>
                        <span className="text-amber-900 font-bold">{design.estimatedPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-xl mb-4">
                    <p className="text-amber-600 text-sm font-medium">Dibuat pada: {formatDate(design.createdAt)}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => handleViewDesign(design.id!)}
                      className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all duration-200 font-medium shadow-sm"
                    >
                      <FiEye className="mr-2" />
                      Lihat Detail
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleConsultArchitect(design)}
                        disabled={consultingId === design.id}
                        className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl transition-all duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {consultingId === design.id ? (
                          <FiLoader className="animate-spin" />
                        ) : (
                          <>
                            <FiMessageSquare className="mr-1" />
                            Konsultasi
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(design.id!)}
                        disabled={deletingId === design.id}
                        className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === design.id ? (
                          <FiLoader className="animate-spin" />
                        ) : (
                          <>
                            <FiTrash2 className="mr-1" />
                            Hapus
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
