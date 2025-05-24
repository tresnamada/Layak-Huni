"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getConsultation, type Consultation } from "@/services/consultationService"
import { getMessages, sendMessage, markMessagesAsRead, type ChatMessage } from "@/services/chatService"
import { getUserData } from "@/services/userService"
import { useRouter } from "next/navigation"
import { FiArrowLeft, FiLoader, FiSend, FiInfo, FiClock, FiUser } from "react-icons/fi"
import Navbar from "@/components/Navbar"

export default function ConsultationChatPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth({ redirectToLogin: true })
  const router = useRouter()
  const consultationId = params.id

  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch consultation and initial messages
  useEffect(() => {
    if (authLoading) return

    if (user && consultationId) {
      fetchConsultationAndMessages()
      fetchUserName()
    }
  }, [user, authLoading, consultationId])

  // Set up polling for new messages
  useEffect(() => {
    if (!user || !consultationId) return

    const intervalId = setInterval(() => {
      fetchMessages()
      markAllMessagesAsRead()
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(intervalId)
  }, [user, consultationId])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const fetchUserName = async () => {
    if (!user) return

    try {
      const result = await getUserData(user.uid)

      if (result.success && result.userData) {
        setUserName(result.userData.displayName || user.email || "Pengguna")
      }
    } catch (err) {
      console.error("Error fetching user data:", err)
    }
  }

  const fetchConsultationAndMessages = async () => {
    if (!user || !consultationId) return

    setLoading(true)
    setError(null)

    try {
      // Fetch consultation details
      const consultResult = await getConsultation(consultationId)

      if (consultResult.success && consultResult.consultation) {
        setConsultation(consultResult.consultation)

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
  }

  const fetchMessages = async () => {
    if (!user || !consultationId) return

    try {
      const result = await getMessages(consultationId)

      if (result.success) {
        setMessages(result.messages)
      }
    } catch (err) {
      console.error("Error fetching messages:", err)
    }
  }

  const markAllMessagesAsRead = async () => {
    if (!user || !consultationId) return

    try {
      await markMessagesAsRead(consultationId, user.uid)
    } catch (err) {
      console.error("Error marking messages as read:", err)
    }
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col">
      <Navbar />

      <div className="flex-grow container max-w-6xl mx-auto px-4 py-6 flex flex-col">
        <button
          onClick={() => router.push("/Profile/consultations")}
          className="flex items-center text-amber-700 hover:text-amber-900 mb-4 transition-colors duration-200 font-medium"
        >
          <FiArrowLeft className="mr-2" />
          Kembali ke Daftar Konsultasi
        </button>

        {authLoading || loading ? (
          <div className="flex items-center justify-center h-64">
            <FiLoader className="animate-spin text-amber-600 w-10 h-10" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm">{error}</div>
        ) : consultation ? (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden flex-grow flex flex-col border border-amber-100">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-amber-800 to-amber-700 text-white p-6">
              <h1 className="text-2xl font-bold mb-2">{consultation.designData.name}</h1>
              <p className="text-sm text-amber-100">
                {consultation.status === "pending" ? (
                  <span className="flex items-center bg-amber-600/30 px-3 py-1 rounded-full">
                    <FiClock className="mr-2" />
                    Menunggu arsitek tersedia
                  </span>
                ) : consultation.status === "active" ? (
                  <span className="flex items-center bg-green-600/30 px-3 py-1 rounded-full">
                    <FiUser className="mr-2" />
                    Konsultasi dengan Arsitek
                  </span>
                ) : null}
              </p>
            </div>

            {/* Chat Messages */}
            <div
              className="flex-grow p-6 overflow-y-auto bg-gradient-to-b from-white to-amber-25"
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              {consultation.status === "pending" ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm">
                    <FiClock className="mx-auto text-amber-600 text-4xl mb-4" />
                    <h3 className="font-bold text-2xl text-amber-900 mb-3">Menunggu Arsitek</h3>
                    <p className="text-amber-700 leading-relaxed max-w-md">
                      Permintaan konsultasi Anda sedang menunggu arsitek yang tersedia. Anda akan mendapatkan notifikasi
                      saat arsitek tersedia untuk konsultasi.
                    </p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-sm">
                    <FiInfo className="mx-auto text-amber-600 text-4xl mb-4" />
                    <h3 className="font-bold text-2xl text-amber-900 mb-3">Mulai Konsultasi</h3>
                    <p className="text-amber-700 leading-relaxed max-w-md">
                      Silakan mulai konsultasi dengan mengirimkan pesan kepada arsitek. Anda bisa bertanya tentang
                      detail desain, saran, atau hal lain terkait desain rumah Anda.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`mb-4 ${message.senderId === user?.uid ? "text-right" : "text-left"}`}
                    >
                      <div
                        className={`inline-block px-5 py-3 rounded-2xl max-w-xs lg:max-w-md shadow-sm ${
                          message.senderId === user?.uid
                            ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white"
                            : "bg-white text-amber-900 border border-amber-100"
                        }`}
                      >
                        <p className="text-sm font-semibold mb-2 opacity-90">
                          {message.senderId === user?.uid ? "Anda" : message.senderName}
                        </p>
                        <p className="leading-relaxed">{message.message}</p>
                        <p
                          className={`text-xs mt-2 ${
                            message.senderId === user?.uid ? "text-amber-200" : "text-amber-500"
                          }`}
                        >
                          {formatMessageTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
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
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm">
            Konsultasi tidak ditemukan
          </div>
        )}
      </div>
    </div>
  )
}
