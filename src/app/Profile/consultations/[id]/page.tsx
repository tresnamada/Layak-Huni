"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { use } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getConsultation, type Consultation } from "@/services/consultationService"
import { getMessages, sendMessage, markMessagesAsRead, type ChatMessage } from "@/services/chatService"
import { getUserData } from "@/services/userService"
import { useRouter } from "next/navigation"
import { FiArrowLeft, FiLoader, FiSend, FiInfo, FiClock, FiUser, FiMessageSquare } from "react-icons/fi"
import Navbar from "@/components/Navbar"
import { motion } from "framer-motion"
import { Timestamp } from "firebase/firestore"

// Define the correct interface for Next.js 15 async params
interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function ConsultationChatPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const { user, loading: authLoading } = useAuth({ redirectToLogin: true })
  const router = useRouter()
  const consultationId = resolvedParams.id

  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState("")
  const [otherParticipantName, setOtherParticipantName] = useState("")
  const [isCurrentUserArchitect, setIsCurrentUserArchitect] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Memoized functions using useCallback
  const fetchMessages = useCallback(async () => {
    if (!user || !consultationId) return

    try {
      const result = await getMessages(consultationId)

      if (result.success) {
        setMessages(result.messages)
      }
    } catch (err) {
      console.error("Error fetching messages:", err)
    }
  }, [user, consultationId])

  const markAllMessagesAsRead = useCallback(async () => {
    if (!user || !consultationId) return

    try {
      await markMessagesAsRead(consultationId, user.uid)
    } catch (err) {
      console.error("Error marking messages as read:", err)
    }
  }, [user, consultationId])

  const fetchUserName = useCallback(async () => {
    if (!user) return

    try {
      const result = await getUserData(user.uid)

      if (result.success && result.userData) {
        setUserName(result.userData.displayName || user.email || "Pengguna")
      }
    } catch (err) {
      console.error("Error fetching user data:", err)
    }
  }, [user])

  const fetchConsultationAndMessages = useCallback(async () => {
    if (!user || !consultationId) return

    setLoading(true)
    setError(null)

    try {
      // Fetch consultation details
      const consultResult = await getConsultation(consultationId)

      if (consultResult.success && consultResult.consultation) {
        setConsultation(consultResult.consultation)

        // Determine current user's role in this consultation
        const currentUserIsArchitect = user.uid === consultResult.consultation.architectId
        setIsCurrentUserArchitect(currentUserIsArchitect)

        // Fetch other participant's name
        const otherParticipantId = currentUserIsArchitect 
          ? consultResult.consultation.userId 
          : consultResult.consultation.architectId
        
        if (otherParticipantId) {
          const otherUserResult = await getUserData(otherParticipantId)
          if (otherUserResult.success && otherUserResult.userData) {
            setOtherParticipantName(
              otherUserResult.userData.displayName || 
              otherUserResult.userData.email || 
              "Partisipan"
            )
          } else {
            console.error("Failed to fetch other participant data:", otherUserResult.error)
            setOtherParticipantName("Partisipan Tidak Dikenal")
          }
        } else {
          setOtherParticipantName("Menunggu Arsitek Ditugaskan")
        }

        // Fetch messages
        await fetchMessages()

        // Mark messages as read
        await markAllMessagesAsRead()
      } else {
        setError(consultResult.error || "Konsultasi tidak ditemukan")
      }
    } catch (err) {
      console.error("Error fetching consultation:", err)
      setError("Terjadi kesalahan saat mengambil data konsultasi")
    } finally {
      setLoading(false)
    }
  }, [user, consultationId, fetchMessages, markAllMessagesAsRead])

  // Fetch consultation and initial messages
  useEffect(() => {
    if (authLoading) return

    if (user && consultationId) {
      fetchConsultationAndMessages()
      fetchUserName()
    }
  }, [user, authLoading, consultationId, fetchConsultationAndMessages, fetchUserName])

  // Set up polling for new messages
  useEffect(() => {
    if (!user || !consultationId) return

    const intervalId = setInterval(() => {
      fetchMessages()
      markAllMessagesAsRead()
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(intervalId)
  }, [user, consultationId, fetchMessages, markAllMessagesAsRead])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !consultationId || !newMessage.trim() || !consultation) return

    if (consultation.status !== "active") {
      alert("Anda tidak dapat mengirim pesan karena konsultasi belum aktif")
      return
    }

    setSendingMessage(true)

    try {
      // Use current user's name or email as sender name
      const senderName = userName || user.email || "Pengguna"

      const result = await sendMessage(consultationId, user.uid, senderName, newMessage.trim())

      if (result.success) {
        setNewMessage("")
        fetchMessages() // Refresh messages
      } else {
        throw new Error(result.error || "Gagal mengirim pesan")
      }
    } catch (err) {
      console.error("Error sending message:", err)
      alert("Gagal mengirim pesan. Silakan coba lagi.")
    } finally {
      setSendingMessage(false)
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

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu Arsitek"
      case "active":
        return "Aktif"
      case "completed":
        return "Selesai"
      case "cancelled":
        return "Dibatalkan"
      default:
        return "Tidak Diketahui"
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F6EC] to-[#EAE0D0] flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <FiLoader className="animate-spin text-[#594C1A] w-10 h-10" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F6EC] to-[#EAE0D0] flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow container max-w-6xl mx-auto px-4 py-8 flex flex-col">
          <motion.button
            onClick={() => router.push("/Profile/consultations")}
            className="flex items-center text-[#594C1A] hover:text-[#938656] mb-6 transition-colors duration-200 font-medium"
            whileHover={{ x: -5 }}
          >
            <FiArrowLeft className="mr-2" />
            Kembali ke Daftar Konsultasi
          </motion.button>
          <motion.div 
            className="bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-xl shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        </div>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F6EC] to-[#EAE0D0] flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow container max-w-6xl mx-auto px-4 py-8 flex flex-col">
          <motion.button
            onClick={() => router.push("/Profile/consultations")}
            className="flex items-center text-[#594C1A] hover:text-[#938656] mb-6 transition-colors duration-200 font-medium"
            whileHover={{ x: -5 }}
          >
            <FiArrowLeft className="mr-2" />
            Kembali ke Daftar Konsultasi
          </motion.button>
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm">
            Konsultasi tidak ditemukan
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F6EC] to-[#EAE0D0] flex flex-col font-sans">
      <Navbar />

      <div className="flex-grow container max-w-6xl mx-auto px-4 py-8 flex flex-col">
        <motion.button
          onClick={() => router.push("/Profile/consultations")}
          className="flex items-center text-[#594C1A] hover:text-[#938656] mb-6 transition-colors duration-200 font-medium"
          whileHover={{ x: -5 }}
        >
          <FiArrowLeft className="mr-2" />
          Kembali ke Daftar Konsultasi
        </motion.button>

        <motion.div
          className="bg-white shadow-xl rounded-[2rem] overflow-hidden flex-grow flex flex-col border border-[#EAE0D0]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#594C1A] to-[#938656] text-white p-6 sm:p-8 border-b border-[#938656]/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] bg-repeat opacity-10" />
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-wide">
                {consultation.designData?.name || 'Konsultasi'}
              </h1>
              <p className="text-sm sm:text-base text-[#F6F6EC]/80 mb-2">
                {consultation.designData?.description || 'Deskripsi tidak tersedia'}
              </p>

              {/* Display who the user is chatting with */}
              {otherParticipantName && (consultation.status === 'active' || consultation.status === 'completed') && (
                <p className="text-sm sm:text-base text-[#F6F6EC]/90 font-semibold mt-2">
                  {isCurrentUserArchitect ? 'Anda Berbicara Dengan Pengguna:' : 'Anda Berbicara Dengan Arsitek:'} {otherParticipantName}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[#F6F6EC] mt-4">
                <div className="flex items-center">
                  <FiInfo className="mr-2 w-5 h-5" />
                  <span>Gaya: {consultation.designData?.style || 'Belum ditentukan'}</span>
                </div>
                <div className="flex items-center">
                  <FiClock className="mr-2 w-5 h-5" />
                  <span>Dibuat: {formatDate(consultation.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <FiUser className="mr-2 w-5 h-5" />
                  <span>Status: {getStatusText(consultation.status)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            className="flex-grow p-6 sm:p-8 overflow-y-auto bg-gradient-to-b from-white to-[#F6F6EC]/50"
            style={{ maxHeight: "calc(100vh - 350px)" }}
          >
            {consultation.status === "pending" ? (
              <div className="flex items-center justify-center h-full text-center px-4">
                <motion.div 
                  className="p-8 bg-[#F6F6EC] rounded-2xl border border-[#EAE0D0] shadow-md max-w-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", duration: 0.7 }}
                >
                  <FiClock className="mx-auto text-[#594C1A]/50 text-5xl mb-4" />
                  <h3 className="font-bold text-2xl text-[#594C1A] mb-3">Menunggu Arsitek</h3>
                  <p className="text-[#594C1A]/80 leading-relaxed">
                    Permintaan konsultasi Anda sedang menunggu arsitek yang tersedia. Anda akan mendapatkan notifikasi
                    saat arsitek menerima permintaan Anda.
                  </p>
                </motion.div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center px-4">
                <motion.div
                  className="p-8 bg-[#F6F6EC] rounded-2xl border border-[#EAE0D0] shadow-md max-w-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", duration: 0.7 }}
                >
                  <FiMessageSquare className="mx-auto text-[#594C1A]/50 text-5xl mb-4" />
                  <h3 className="font-bold text-2xl text-[#594C1A] mb-3">Mulai Percakapan</h3>
                  <p className="text-[#594C1A]/80 leading-relaxed">
                    Belum ada pesan dalam konsultasi ini. Kirim pesan pertama Anda untuk memulai percakapan dengan arsitek.
                  </p>
                </motion.div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id || index}
                    className={`mb-4 ${message.senderId === user?.uid ? "text-right" : "text-left"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div
                      className={`inline-block px-5 py-3 rounded-2xl max-w-xs lg:max-w-md shadow-md ${
                        message.senderId === user?.uid
                          ? "bg-gradient-to-r from-[#938656] to-[#594C1A] text-white"
                          : "bg-white text-[#594C1A] border border-[#EAE0D0]"
                      }`}
                    >
                      <p className="text-sm break-words">{message.message}</p>
                      {/* Display sender name/role for received messages */}
                      {message.senderId !== user?.uid && consultation && (
                        <p className="text-xs text-[#594C1A]/60 mt-1">
                          {message.senderId === consultation.architectId ? 'Arsitek' : 'Pengguna'}: {message.senderName}
                        </p>
                      )}
                      <p className={`text-xs mt-1 ${
                        message.senderId === user?.uid ? "text-white/70" : "text-[#594C1A]/50"
                      }`}>
                        {/* Safely format timestamp */}
                        {(() => {
                          if (!message.timestamp) return ''
                          
                          if (message.timestamp instanceof Timestamp) {
                            return formatMessageTime(message.timestamp.toDate().toISOString())
                          }
                          
                          if (typeof message.timestamp === 'object' && message.timestamp !== null && 'seconds' in message.timestamp) {
                            const timestampObj = message.timestamp as { seconds: number }
                            return formatMessageTime(new Date(timestampObj.seconds * 1000).toISOString())
                          }
                          
                          if (typeof message.timestamp === 'string') {
                            return formatMessageTime(message.timestamp)
                          }
                          
                          return ''
                        })()}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-amber-100 p-6 bg-gradient-to-r from-white to-amber-25">
            {consultation.status === "active" ? (
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan Anda disini..."
                  className="flex-grow px-5 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !newMessage.trim()}
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 py-3 rounded-xl flex items-center shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {sendingMessage ? (
                    <FiLoader className="animate-spin" />
                  ) : (
                    <>
                      <FiSend className="mr-2" />
                      Kirim
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center shadow-sm">
                <p className="text-amber-700 font-medium">
                  Anda tidak dapat mengirim pesan karena konsultasi belum aktif
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}