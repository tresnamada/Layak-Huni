"use client"
import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiSend,
  FiLoader,
  FiHome,
  FiDollarSign,
  FiList,
  FiMessageSquare,
  FiRefreshCw,
  FiArrowRight,
  FiX,
  FiMapPin,
  FiHeart,
  FiStar,
  FiTrendingUp,
  FiShield,
  FiBook,
} from "react-icons/fi"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Navbar from "@/components/Navbar"
import { useRouter } from "next/navigation"

interface Question {
  id: string
  question: string
  type: "options" | "text"
  options?: string[]
  placeholder?: string
}

interface Answer {
  questionId: string
  answer: string
}

interface AnalysisResult {
  summary: string
  recommendations: string[]
  matchingHouses: Array<{
    id: string
    name: string
    matchScore: number
    details: string
    highlights?: string[]
    price?: string
    area?: string
    constructionTime?: string
  }>
  advice?: {
    title: string
    content: string
    suggestions: string[]
  }
  customDesignSuggestion?: {
    title: string
    description: string
    benefits: string[]
  }
}

const slideIn = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 },
}

export default function AiPage() {
  const [messages, setMessages] = useState<{ isUser: boolean; content: string }[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [analysisCompleted, setAnalysisCompleted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [selectedHouse, setSelectedHouse] = useState<AnalysisResult["matchingHouses"][0] | null>(null)
  const [showHouseModal, setShowHouseModal] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const router = useRouter()

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, questions, analysisResult])

  const handleInitialMessage = async (message: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: message,
          stage: "initial",
        }),
      })

      const data = await response.json()
      if (response.ok) {
        try {
          const parsedQuestions = JSON.parse(data.response)
          if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
            const formattedQuestions = parsedQuestions.map(
              (q: {
                id: string
                question: string
                type: string
                options?: string[]
                placeholder?: string
              }) => ({
                id: q.id,
                question: q.question,
                type: (q.type === "options" ? "options" : "text") as "options" | "text",
                options: q.options || [],
                placeholder: q.placeholder || "Ketik jawaban Anda...",
              }),
            )

            setQuestions(formattedQuestions)
            setCurrentQuestionIndex(0)
            setMessages((prev) => [
              ...prev,
              {
                isUser: false,
                content:
                  "Terima kasih atas informasi awal Anda. Mari kita lanjutkan dengan beberapa pertanyaan tambahan untuk memahami kebutuhan Anda dengan lebih baik.",
              },
            ])
          } else {
            throw new Error("Format pertanyaan tidak valid")
          }
        } catch (parseError) {
          console.error("Error parsing questions:", parseError)
          setMessages((prev) => [
            ...prev,
            {
              isUser: false,
              content: "Maaf, terjadi kesalahan dalam memproses pertanyaan. Silakan coba lagi.",
            },
          ])
        }
      } else {
        const errorMessage = data.error || "Gagal mendapatkan pertanyaan"
        const retryMessage = data.details?.includes("503") ? " Silakan coba lagi dalam beberapa saat." : ""

        setMessages((prev) => [
          ...prev,
          {
            isUser: false,
            content: `${errorMessage}${retryMessage}`,
          },
        ])
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          isUser: false,
          content: "Maaf, terjadi kesalahan. Silakan coba lagi dalam beberapa saat.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex]
    const newAnswer = { questionId: currentQuestion.id, answer }
    setAnswers((prev) => [...prev, newAnswer])
    setMessages((prev) => [...prev, { isUser: true, content: answer }])
    setInput("")

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      setCurrentQuestionIndex(-1)
      await handleGetAnalysis()
    }
  }

  const handleGetAnalysis = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          stage: "analysis",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get analysis")
      }

      const data = await response.json()
      try {
        const result = JSON.parse(data.response)
        if (result && typeof result === "object") {
          setAnalysisResult(result)
          setAnalysisCompleted(true)
          setMessages((prev) => [
            ...prev,
            {
              isUser: false,
              content: "Analisis rumah impian Anda telah selesai. Berikut adalah hasilnya:",
            },
          ])
        } else {
          throw new Error("Invalid analysis format")
        }
      } catch (parseError) {
        console.error("Error parsing analysis:", parseError)
        setMessages((prev) => [
          ...prev,
          {
            isUser: false,
            content: "Maaf, terjadi kesalahan dalam memproses analisis. Silakan coba lagi.",
          },
        ])
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          isUser: false,
          content: "Maaf, terjadi kesalahan dalam mendapatkan analisis.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCustomDesign = () => {
    router.push("/custom-design")
  }

  const restartAnalysis = () => {
    setMessages([])
    setQuestions([])
    setCurrentQuestionIndex(-1)
    setAnswers([])
    setAnalysisResult(null)
    setAnalysisCompleted(false)
    setInput("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { isUser: true, content: userMessage }])

    if (messages.length === 0) {
      await handleInitialMessage(userMessage)
    } else {
      try {
        setLoading(true)
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMessage,
            stage: "chat",
          }),
        })

        const data = await response.json()
        if (response.ok) {
          setMessages((prev) => [...prev, { isUser: false, content: data.response }])
        } else {
          const errorMessage = data.error || "Gagal mendapatkan respons"
          const retryMessage = data.details?.includes("503") ? " Silakan coba lagi dalam beberapa saat." : ""

          setMessages((prev) => [
            ...prev,
            {
              isUser: false,
              content: `${errorMessage}${retryMessage}`,
            },
          ])
        }
      } catch (error) {
        console.error("Error:", error)
        setMessages((prev) => [
          ...prev,
          {
            isUser: false,
            content: "Maaf, terjadi kesalahan. Silakan coba lagi dalam beberapa saat.",
          },
        ])
      } finally {
        setLoading(false)
      }
    }
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      handleAnswer(input.trim())
    }
  }

  const getQuestionIcon = (questionId: string) => {
    const icons = {
      style: FiHome,
      budget: FiDollarSign,
      space: FiHome,
      location: FiHome,
      features: FiList,
    }
    return icons[questionId.split("-")[0] as keyof typeof icons] || FiHome
  }

  const quickFeatures = [
    {
      icon: <FiHome className="w-8 h-8" />,
      title: "Rekomendasi Cerdas",
      desc: "AI menganalisis preferensi Anda untuk memberikan rekomendasi rumah yang tepat sasaran.",
      gradient: "from-amber-400 to-orange-500",
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: "Analisis Mendalam",
      desc: "Evaluasi komprehensif kebutuhan, budget, dan gaya hidup untuk hasil optimal.",
      gradient: "from-yellow-400 to-amber-500",
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: "Konsultasi Terpercaya",
      desc: "Dapatkan saran profesional dari AI yang telah dilatih dengan data properti terkini.",
      gradient: "from-orange-400 to-red-500",
    },
  ]

  const userGuideSteps = [
    {
      step: 1,
      title: "Ceritakan Impian Anda",
      description:
        "Mulai dengan menceritakan rumah impian Anda secara detail. Semakin spesifik, semakin akurat rekomendasinya.",
      example: '"Saya ingin rumah minimalis modern 3 kamar di Jakarta Selatan dengan budget 1.5M"',
      icon: <FiMessageSquare className="w-6 h-6" />,
      color: "from-amber-400 to-orange-500",
    },
    {
      step: 2,
      title: "Jawab Pertanyaan Detail",
      description: "AI akan mengajukan pertanyaan lanjutan untuk memahami preferensi dan kebutuhan spesifik Anda.",
      example: "Pertanyaan tentang lokasi, fasilitas, dan gaya arsitektur yang diinginkan",
      icon: <FiList className="w-6 h-6" />,
      color: "from-yellow-400 to-amber-500",
    },
    {
      step: 3,
      title: "Terima Rekomendasi",
      description: "Dapatkan analisis komprehensif dan rekomendasi rumah yang sesuai dengan kriteria Anda.",
      example: "Daftar rumah dengan skor kesesuaian, harga, dan detail lengkap",
      icon: <FiStar className="w-6 h-6" />,
      color: "from-orange-400 to-red-500",
    },
    {
      step: 4,
      title: "Konsultasi Lanjutan",
      description: "Tanyakan detail lebih lanjut tentang properti atau minta saran tambahan seputar pembelian.",
      example: "Diskusi tentang lokasi, investasi, atau proses pembelian",
      icon: <FiHome className="w-6 h-6" />,
      color: "from-red-400 to-pink-500",
    },
  ]

  const handleViewDetails = (house: AnalysisResult["matchingHouses"][0]) => {
    setSelectedHouse(house)
    setShowHouseModal(true)
  }

  return (
    <div className="min-h-screen bg-[#F6F6EC] relative">
      <Navbar />

      <div className="flex-1 flex flex-col w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-6 py-20">
            {/* Hero Section */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center mb-12"
            >
              <div className="relative">
                <div className="relative w-64 h-64 mx-auto mb-8">
                  <video autoPlay loop muted playsInline className="object-contain w-full h-full rounded-2xl">
                    <source src="/animation.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>

              <h1 className="text-6xl md:text-7xl font-bold text-[#594C1A] mb-6">Konsultasi Rumah AI</h1>
              <p className="text-xl md:text-2xl text-[#594C1A] max-w-3xl mx-auto leading-relaxed font-light mb-8">
                Asisten cerdas untuk menemukan rumah impian Anda dengan teknologi AI terdepan
              </p>

              {/* Quick Start Tips */}

            </motion.div>

            {/* Search Bar */}
            <motion.form
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="w-full max-w-4xl mb-20"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-[#4A443A] rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-amber-200 space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ceritakan rumah impian Anda..."
                    className="w-full px-10 py-6 text-lg rounded-3xl border-0 focus:outline-none focus:ring-4 focus:ring-amber-500/20 bg-transparent placeholder-amber-600/06 text-[#4A443A]"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#4A443A] hover:bg-[#E8E8DE] text-white rounded-2xl p-4 shadow-lg transition-all duration-300 hover:scale-105 ml-2"
                  >
                    <FiSend className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.form>

            {/* Features Grid */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl"
            >
              {quickFeatures.map((feature, index) => (
                <motion.div key={index} whileHover={{ y: -8, scale: 1.02 }} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-white to-amber-50 rounded-3xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-amber-200 hover:shadow-2xl transition-all duration-300">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white mb-6 shadow-lg`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-[#594C1A] mb-4">{feature.title}</h3>
                    <p className="text-[#594C1A] leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header with Restart Button */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-amber-200 px-6 py-4">
              <div className="max-w-4xl mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                    <FiHome className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#594C1A]">SiHuni AI Assistant</h2>
                    <p className="text-sm text-[#594C1A]">Konsultasi Rumah Impian</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={restartAnalysis}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-xl hover:from-amber-700 hover:to-orange-800 transition-all duration-300 shadow-lg"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  <span className="font-medium">Mulai Ulang</span>
                </motion.button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-w-4xl mx-auto w-full">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] ${msg.isUser ? "order-2" : "order-1"}`}>
                    <div
                      className={`p-6 rounded-3xl shadow-lg ${msg.isUser
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-br-lg"
                          : "bg-white/95 backdrop-blur-sm border border-amber-200 text-amber-900 rounded-bl-lg"
                        }`}
                    >
                      {msg.isUser ? (
                        <p className="leading-relaxed">{msg.content}</p>
                      ) : (
                        <div className="prose prose-amber max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ ...props }) => (
                                <a className="text-amber-600 hover:underline font-medium" {...props} />
                              ),
                              h1: ({ ...props }) => <h1 className="text-xl font-bold mb-4" {...props} />,
                              h2: ({ ...props }) => <h2 className="text-lg font-bold mb-3" {...props} />,
                              h3: ({ ...props }) => <h3 className="text-base font-bold mb-2" {...props} />,
                              ul: ({ ...props }) => <ul className="list-disc pl-6 space-y-2" {...props} />,
                              ol: ({ ...props }) => <ol className="list-decimal pl-6 space-y-2" {...props} />,
                              li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <div className={`mt-2 text-xs text-amber-500 ${msg.isUser ? "text-right" : "text-left"}`}>
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Current Question */}
              {currentQuestionIndex >= 0 && currentQuestionIndex < questions.length && (
                <motion.div
                  initial="initial"
                  animate="animate"
                  variants={slideIn}
                  className="bg-gradient-to-r from-white to-amber-50 border border-amber-300 p-8 rounded-3xl shadow-xl"
                >
                  <div className="flex items-start">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center shadow-lg mr-6">
                      {React.createElement(getQuestionIcon(questions[currentQuestionIndex].id), {
                        className: "w-6 h-6 text-white",
                      })}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-amber-900 text-xl mb-6">
                        {questions[currentQuestionIndex].question}
                      </h3>

                      {questions[currentQuestionIndex].type === "options" &&
                        questions[currentQuestionIndex].options && (
                          <div className="space-y-3">
                            {questions[currentQuestionIndex].options.map((option, idx) => (
                              <motion.button
                                key={idx}
                                whileHover={{ scale: 1.02, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAnswer(option)}
                                className="w-full px-6 py-4 text-left bg-white hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 rounded-2xl transition-all duration-300 flex items-center shadow-md hover:shadow-lg border border-amber-200 group"
                              >
                                <span className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold mr-4 text-sm group-hover:scale-110 transition-transform">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="group-hover:text-amber-900 font-medium text-amber-800">{option}</span>
                              </motion.button>
                            ))}
                          </div>
                        )}

                      {questions[currentQuestionIndex].type === "text" && (
                        <form onSubmit={handleTextSubmit} className="space-y-4">
                          <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={questions[currentQuestionIndex].placeholder || "Ketik jawaban Anda..."}
                            className="w-full px-6 py-4 border-2 border-amber-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-300 shadow-sm bg-white text-amber-900 placeholder-amber-500"
                          />
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 font-medium shadow-lg"
                          >
                            Kirim Jawaban
                          </motion.button>
                        </form>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Analysis Results */}
              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-white via-amber-50 to-orange-50 border border-amber-300 p-10 rounded-3xl shadow-2xl"
                >
                  {/* Results Header */}
                  <div className="text-center mb-12">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <FiStar className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-4">
                      Analisis Selesai!
                    </h2>
                    <p className="text-xl text-amber-700 max-w-2xl mx-auto">
                      Berikut adalah rekomendasi rumah yang sesuai dengan preferensi Anda
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="mb-12">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center mr-4">
                        <FiMessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-amber-900">Ringkasan Analisis</h3>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-300">
                      <p className="text-amber-800 leading-relaxed text-lg">{analysisResult.summary}</p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mb-12">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center mr-4">
                        <FiTrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-amber-900">Rekomendasi Utama</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {analysisResult.recommendations.map((rec, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ y: -2 }}
                          className="bg-white p-6 rounded-2xl shadow-lg border border-amber-200 hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex items-start">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">
                              {index + 1}
                            </div>
                            <p className="text-amber-800 leading-relaxed">{rec}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Matching Houses */}
                  <div className="mb-12">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center mr-4">
                        <FiHome className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-amber-900">Rumah yang Cocok untuk Anda</h3>
                    </div>
                    <div className="space-y-8">
                      {analysisResult.matchingHouses.map((house, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ y: -4 }}
                          className="bg-white p-8 rounded-3xl shadow-xl border border-amber-200 hover:shadow-2xl transition-all duration-300"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                            <div>
                              <h4 className="text-2xl font-bold text-amber-900 mb-3">{house.name}</h4>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-full">
                                  <FiStar className="w-4 h-4 mr-2" />
                                  <span className="font-bold">{house.matchScore}% Cocok</span>
                                </div>
                                {house.constructionTime && (
                                  <span className="text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-sm">
                                    {house.constructionTime}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {house.price && (
                              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200">
                                <div className="flex items-center mb-3">
                                  <FiDollarSign className="w-6 h-6 text-amber-600 mr-3" />
                                  <span className="font-bold text-amber-800">Harga</span>
                                </div>
                                <p className="text-2xl font-bold text-amber-900">{house.price}</p>
                              </div>
                            )}
                            {house.area && (
                              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-2xl border border-yellow-200">
                                <div className="flex items-center mb-3">
                                  <FiHome className="w-6 h-6 text-yellow-600 mr-3" />
                                  <span className="font-bold text-amber-800">Luas Bangunan</span>
                                </div>
                                <p className="text-2xl font-bold text-amber-900">{house.area}</p>
                              </div>
                            )}
                          </div>

                          <div className="mb-6">
                            <h5 className="text-lg font-bold text-amber-800 mb-4">Deskripsi</h5>
                            <p className="text-amber-700 leading-relaxed bg-amber-50 p-6 rounded-2xl border border-amber-200">
                              {house.details}
                            </p>
                          </div>

                          {house.highlights && house.highlights.length > 0 && (
                            <div className="mb-6">
                              <h5 className="text-lg font-bold text-amber-800 mb-4">Keunggulan</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {house.highlights.map((highlight, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200"
                                  >
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                                      <span className="text-white text-xs font-bold">✓</span>
                                    </div>
                                    <p className="text-green-800 leading-relaxed">{highlight}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleViewDetails(house)}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg flex items-center justify-center"
                          >
                            <FiArrowRight className="w-5 h-5 mr-3" />
                            Lihat Detail Lengkap
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Design Suggestion */}
                  {analysisResult.customDesignSuggestion && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-3xl border border-orange-200">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-4">
                          <FiHome className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-amber-900 mb-2">
                          {analysisResult.customDesignSuggestion.title}
                        </h3>
                        <p className="text-amber-700 text-lg">{analysisResult.customDesignSuggestion.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {analysisResult.customDesignSuggestion.benefits.map((benefit, index) => (
                          <div
                            key={index}
                            className="flex items-start bg-white p-6 rounded-2xl shadow-lg border border-orange-200"
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center mr-4 flex-shrink-0">
                              <span className="text-white text-sm font-bold">✓</span>
                            </div>
                            <p className="text-amber-800 leading-relaxed">{benefit}</p>
                          </div>
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCustomDesign}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg flex items-center justify-center"
                      >
                        <FiHome className="w-6 h-6 mr-3" />
                        Mulai Desain Custom Sekarang
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Loading */}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                  <div className="flex items-center space-x-4 bg-white/95 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-lg border border-amber-200">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                      <FiLoader className="animate-spin text-white w-4 h-4" />
                    </div>
                    <span className="text-amber-700 font-medium">AI sedang menganalisis...</span>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white/95 backdrop-blur-sm border-t border-amber-200 px-6 py-6">
              <form onSubmit={handleSubmit} className="flex items-center space-x-4 max-w-4xl mx-auto">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tanyakan lebih lanjut tentang rumah impian Anda..."
                    className="w-full px-6 py-4 border-2 border-amber-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-300 bg-white shadow-sm text-amber-900 placeholder-amber-600"
                    disabled={
                      currentQuestionIndex >= 0 &&
                      currentQuestionIndex < questions.length &&
                      !loading &&
                      !analysisCompleted
                    }
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:hover:scale-100 flex items-center"
                  disabled={
                    (currentQuestionIndex >= 0 &&
                      currentQuestionIndex < questions.length &&
                      !loading &&
                      !analysisCompleted) ||
                    loading
                  }
                >
                  {loading ? <FiLoader className="animate-spin w-5 h-5" /> : <FiSend className="w-5 h-5" />}
                </motion.button>
              </form>
            </div>
          </div>
        )}
      </div>


      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowGuideModal(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <FiBook className="w-7 h-7" />
      </motion.button>

      {/* User Guide Modal */}
      <AnimatePresence>
        {showGuideModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowGuideModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-white to-amber-50 p-8 border-b border-amber-200 flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center mr-6 shadow-lg">
                    <FiBook className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-amber-900">Panduan Penggunaan</h3>
                    <p className="text-amber-700 text-lg">Cara menggunakan SiHuni AI</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowGuideModal(false)}
                  className="p-3 rounded-2xl hover:bg-amber-100 transition-colors"
                >
                  <FiX className="w-6 h-6 text-amber-600" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <div className="text-center mb-12">
                  <h4 className="text-2xl font-bold text-amber-900 mb-4">
                    Ikuti langkah mudah ini untuk mendapatkan rekomendasi terbaik
                  </h4>
                  <p className="text-amber-700 text-lg">
                    SiHuni AI akan membantu Anda menemukan rumah impian dengan analisis yang mendalam
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {userGuideSteps.map((step, index) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative"
                    >
                      <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl p-8 shadow-lg border border-amber-200 hover:shadow-xl transition-all duration-300">
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center text-white mb-6 shadow-lg`}
                        >
                          {step.icon}
                        </div>
                        <div className="flex items-center mb-4">
                          <span className="text-sm font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full mr-3">
                            Langkah {step.step}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-amber-900 mb-4">{step.title}</h3>
                        <p className="text-amber-700 mb-6 leading-relaxed">{step.description}</p>
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                          <p className="text-sm text-amber-800 italic font-medium">{step.example}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-12 text-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowGuideModal(false)}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg"
                  >
                    Mulai Sekarang
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* House Details Modal */}
      <AnimatePresence>
        {showHouseModal && selectedHouse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowHouseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-white to-amber-50 p-8 border-b border-amber-200 flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center mr-6 shadow-lg">
                    <FiHome className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-amber-900">{selectedHouse.name}</h3>
                    <p className="text-amber-700 text-lg">Detail Lengkap Properti</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowHouseModal(false)}
                  className="p-3 rounded-2xl hover:bg-amber-100 transition-colors"
                >
                  <FiX className="w-6 h-6 text-amber-600" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                {/* Match Score */}
                <div className="flex items-center justify-center mb-8">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl shadow-lg">
                    <div className="flex items-center">
                      <FiStar className="w-6 h-6 mr-3" />
                      <span className="text-2xl font-bold">{selectedHouse.matchScore}% Cocok</span>
                    </div>
                  </div>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  {selectedHouse.price && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-3xl border border-amber-200">
                      <div className="flex items-center mb-4">
                        <FiDollarSign className="w-8 h-8 text-amber-600 mr-4" />
                        <span className="text-xl font-bold text-amber-800">Harga</span>
                      </div>
                      <p className="text-3xl font-bold text-amber-900">{selectedHouse.price}</p>
                    </div>
                  )}
                  {selectedHouse.area && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-8 rounded-3xl border border-yellow-200">
                      <div className="flex items-center mb-4">
                        <FiHome className="w-8 h-8 text-yellow-600 mr-4" />
                        <span className="text-xl font-bold text-amber-800">Luas Bangunan</span>
                      </div>
                      <p className="text-3xl font-bold text-amber-900">{selectedHouse.area}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-10">
                  <h4 className="text-2xl font-bold text-amber-900 mb-6">Deskripsi Lengkap</h4>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-3xl border border-amber-200">
                    <p className="text-amber-800 leading-relaxed text-lg">{selectedHouse.details}</p>
                  </div>
                </div>

                {/* Highlights */}
                {selectedHouse.highlights && selectedHouse.highlights.length > 0 && (
                  <div className="mb-10">
                    <h4 className="text-2xl font-bold text-amber-900 mb-6">Keunggulan</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedHouse.highlights.map((highlight, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -2 }}
                          className="flex items-start bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-4 flex-shrink-0">
                            <span className="text-white text-sm font-bold">✓</span>
                          </div>
                          <p className="text-green-800 leading-relaxed">{highlight}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg flex items-center justify-center"
                  >
                    <FiHeart className="w-6 h-6 mr-3" />
                    Simpan ke Favorit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg flex items-center justify-center"
                  >
                    <FiMapPin className="w-6 h-6 mr-3" />
                    Lihat Lokasi
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
