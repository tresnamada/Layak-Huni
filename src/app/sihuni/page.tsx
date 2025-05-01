"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiLoader, FiHome, FiDollarSign, FiList, FiMessageSquare, FiRefreshCw, FiArrowRight, FiX, FiMapPin, FiHeart } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
  question: string;
  type: 'options' | 'text';
  options?: string[];
  placeholder?: string;
}

interface Answer {
  questionId: string;
  answer: string;
}

interface AnalysisResult {
  summary: string;
  recommendations: string[];
  matchingHouses: Array<{
    id: string;
    name: string;
    matchScore: number;
    details: string;
    highlights?: string[];
    price?: string;
    area?: string;
    constructionTime?: string;
  }>;
  advice?: {
    title: string;
    content: string;
    suggestions: string[];
  };
  customDesignSuggestion?: {
    title: string;
    description: string;
    benefits: string[];
  };
}

const slideIn = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 }
};

export default function AiPage() {
  const [messages, setMessages] = useState<{ isUser: boolean; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [selectedHouse, setSelectedHouse] = useState<AnalysisResult['matchingHouses'][0] | null>(null);
  const [showHouseModal, setShowHouseModal] = useState(false);
  const router = useRouter();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, questions, analysisResult]);

  const handleInitialMessage = async (message: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage: message, 
          stage: 'initial' 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        try {
          const parsedQuestions = JSON.parse(data.response);
          if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
            // Ensure each question has the required properties
            const formattedQuestions = parsedQuestions.map((q: { 
              id: string; 
              question: string; 
              type: string; 
              options?: string[]; 
              placeholder?: string 
            }) => ({
              id: q.id,
              question: q.question,
              type: (q.type === 'options' ? 'options' : 'text') as 'options' | 'text',
              options: q.options || [],
              placeholder: q.placeholder || "Ketik jawaban Anda..."
            }));
            
            setQuestions(formattedQuestions);
            setCurrentQuestionIndex(0);
            setMessages(prev => [...prev, { 
              isUser: false, 
              content: 'Terima kasih atas informasi awal Anda. Mari kita lanjutkan dengan beberapa pertanyaan tambahan untuk memahami kebutuhan Anda dengan lebih baik.' 
            }]);
          } else {
            throw new Error('Format pertanyaan tidak valid');
          }
        } catch (parseError) {
          console.error('Error parsing questions:', parseError);
          setMessages(prev => [...prev, { 
            isUser: false, 
            content: 'Maaf, terjadi kesalahan dalam memproses pertanyaan. Silakan coba lagi.' 
          }]);
        }
      } else {
        const errorMessage = data.error || 'Gagal mendapatkan pertanyaan';
        const retryMessage = data.details?.includes('503') 
          ? ' Silakan coba lagi dalam beberapa saat.' 
          : '';
        
        setMessages(prev => [...prev, { 
          isUser: false, 
          content: `${errorMessage}${retryMessage}` 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        isUser: false, 
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi dalam beberapa saat.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const newAnswer = { questionId: currentQuestion.id, answer };
    setAnswers(prev => [...prev, newAnswer]);
    setMessages(prev => [...prev, { isUser: true, content: answer }]);
    setInput(''); // Reset input after answering

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Reset current question index to hide the question UI
      setCurrentQuestionIndex(-1);
      await handleGetAnalysis();
    }
  };

  const handleGetAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers,
          stage: 'analysis'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get analysis');
      }

      const data = await response.json();
      try {
        const result = JSON.parse(data.response);
        if (result && typeof result === 'object') {
          setAnalysisResult(result);
          setAnalysisCompleted(true);
          setMessages(prev => [...prev, { 
            isUser: false, 
            content: 'Analisis rumah impian Anda telah selesai. Berikut adalah hasilnya:' 
          }]);
        } else {
          throw new Error('Invalid analysis format');
        }
      } catch (parseError) {
        console.error('Error parsing analysis:', parseError);
        setMessages(prev => [...prev, { 
          isUser: false, 
          content: 'Maaf, terjadi kesalahan dalam memproses analisis. Silakan coba lagi.' 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        isUser: false, 
        content: 'Maaf, terjadi kesalahan dalam mendapatkan analisis.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const restartAnalysis = () => {
    setMessages([]);
    setQuestions([]);
    setCurrentQuestionIndex(-1);
    setAnswers([]);
    setAnalysisResult(null);
    setAnalysisCompleted(false);
    setInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { isUser: true, content: userMessage }]);

    if (messages.length === 0) {
      await handleInitialMessage(userMessage);
    } else {
      // Handle regular chat after analysis
      try {
        setLoading(true);
        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userMessage, 
            stage: 'chat' 
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessages(prev => [...prev, { isUser: false, content: data.response }]);
        } else {
          const errorMessage = data.error || 'Gagal mendapatkan respons';
          const retryMessage = data.details?.includes('503') 
            ? ' Silakan coba lagi dalam beberapa saat.' 
            : '';
          
          setMessages(prev => [...prev, { 
            isUser: false, 
            content: `${errorMessage}${retryMessage}` 
          }]);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, { 
          isUser: false, 
          content: 'Maaf, terjadi kesalahan. Silakan coba lagi dalam beberapa saat.' 
        }]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleAnswer(input.trim());
    }
  };

  const getQuestionIcon = (questionId: string) => {
    const icons = {
      style: FiHome,
      budget: FiDollarSign,
      space: FiHome,
      location: FiHome,
      features: FiList,
    };
    return icons[questionId.split('-')[0] as keyof typeof icons] || FiHome;
  };

  // Quick features for welcome section
  const quickFeatures = [
    {
      icon: <FiHome className="w-6 h-6 text-amber-500" />,
      title: 'Rekomendasi Rumah',
      desc: 'Dapatkan rekomendasi rumah yang sesuai dengan kebutuhan dan preferensi Anda.'
    },
    {
      icon: <FiList className="w-6 h-6 text-amber-500" />,
      title: 'Analisis Kebutuhan',
      desc: 'AI kami akan menganalisis kebutuhan Anda untuk menemukan rumah impian.'
    },
    {
      icon: <FiMessageSquare className="w-6 h-6 text-amber-500" />,
      title: 'Konsultasi Gratis',
      desc: 'Tanyakan apa saja tentang properti, lokasi, atau tips membeli rumah.'
    },
  ];

  // User guide steps
  const userGuideSteps = [
    {
      step: 1,
      title: 'Ceritakan Kebutuhan Anda',
      description: 'Mulai dengan menceritakan rumah impian Anda. Misalnya: "Saya ingin rumah minimalis 3 kamar di Jakarta dengan budget 1M"',
      example: 'Contoh: "Rumah minimalis 3 kamar di Jakarta dengan budget 1M"'
    },
    {
      step: 2,
      title: 'Jawab Pertanyaan Lanjutan',
      description: 'AI akan mengajukan pertanyaan tambahan untuk memahami kebutuhan Anda lebih detail',
      example: 'Contoh: "Apakah Anda membutuhkan taman atau garasi?"'
    },
    {
      step: 3,
      title: 'Dapatkan Rekomendasi',
      description: 'Setelah menjawab semua pertanyaan, AI akan memberikan rekomendasi rumah yang sesuai',
      example: 'Anda akan mendapatkan daftar rumah yang cocok dengan kriteria Anda'
    },
    {
      step: 4,
      title: 'Konsultasi Lanjutan',
      description: 'Tanyakan lebih detail tentang properti yang direkomendasikan',
      example: 'Contoh: "Berapa lama waktu pembangunan rumah ini?"'
    }
  ];

  const handleViewDetails = (house: AnalysisResult['matchingHouses'][0]) => {
    setSelectedHouse(house);
    setShowHouseModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F6F6EC] to-[#F0F4E8]">
      <Navbar />
      <div className="flex-1 flex flex-col w-full">
        {/* Welcome Section */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-4 py-16">
            {/* AI Avatar with Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center mb-16"
            >
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300 flex items-center justify-center shadow-2xl animate-pulse-slow">
                  <FiHome className="w-20 h-20 text-amber-600" />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex space-x-3">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-amber-200 border-2 border-white"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-amber-300 border-2 border-white"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-amber-400 border-2 border-white"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Welcome Text with Animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold text-gray-800 mb-6">Selamat datang di SiHuni! <span className="inline-block animate-bounce">👋</span></h2>
              <p className="text-gray-600 text-xl max-w-2xl leading-relaxed">Asisten AI siap membantu Anda menemukan rumah impian, memberikan rekomendasi, dan menjawab pertanyaan seputar properti.</p>
            </motion.div>

            {/* User Guide Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-full max-w-4xl mb-16"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Cara Menggunakan SiHuni</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {userGuideSteps.map((step) => (
                  <motion.div
                    key={step.step}
                    whileHover={{ y: -5 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100 p-6 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                        {step.step}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h4>
                        <p className="text-gray-600 mb-3">{step.description}</p>
                        <div className="bg-amber-50 p-3 rounded-lg">
                          <p className="text-sm text-amber-800">{step.example}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Input Chat Modern with Animation */}
            <motion.form
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              onSubmit={handleSubmit}
              className="w-full max-w-2xl mb-16"
            >
              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ceritakan rumah impian Anda..."
                  className="w-full px-8 py-6 rounded-2xl border-2 border-amber-200 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-xl transition-all duration-300 pr-16 group-hover:shadow-xl"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl p-4 shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <FiSend className="w-6 h-6" />
                </button>
              </div>
            </motion.form>
            
            {/* Quick Features with Animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl"
            >
              {quickFeatures.map((f, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100 p-8 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300"
                >
                  <div className="mb-6 text-amber-600">{f.icon}</div>
                  <div className="font-semibold text-gray-800 text-xl mb-3">{f.title}</div>
                  <div className="text-gray-600">{f.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Restart Button */}
            <div className="flex justify-end p-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={restartAnalysis}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-amber-600 rounded-xl border border-amber-200 hover:bg-amber-50 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Mulai Ulang</span>
              </motion.button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-3xl mx-auto w-full scrollbar-hide">
              <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl ${
                      msg.isUser
                        ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-br-sm shadow-sm'
                        : 'bg-white/90 backdrop-blur-sm text-gray-800 rounded-bl-sm border border-amber-100 shadow-sm'
                    }`}
                  >
                    {msg.isUser ? (
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    ) : (
                      <div className="whitespace-pre-wrap prose prose-sm max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({...props}) => <a className="text-amber-600 hover:underline" {...props} />,
                            h1: ({...props}) => <h1 className="text-lg font-bold" {...props} />,
                            h2: ({...props}) => <h2 className="text-base font-bold" {...props} />,
                            h3: ({...props}) => <h3 className="text-sm font-bold" {...props} />,
                            ul: ({...props}) => <ul className="list-disc pl-4 space-y-1" {...props} />,
                            ol: ({...props}) => <ol className="list-decimal pl-4 space-y-1" {...props} />,
                            li: ({...props}) => <li className="my-1" {...props} />
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    {/* Message timestamp */}
                    <div className={`mt-1 text-[10px] ${msg.isUser ? 'text-amber-200' : 'text-gray-400'}`}>
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Current question */}
              {currentQuestionIndex >= 0 && currentQuestionIndex < questions.length && (
                <motion.div
                  initial="initial"
                  animate="animate"
                  variants={slideIn}
                  className="bg-white/90 backdrop-blur-sm border border-amber-200 p-6 rounded-2xl shadow-sm relative"
                >
                  <div className="flex items-start">
                    <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-sm">
                      {React.createElement(getQuestionIcon(questions[currentQuestionIndex].id), {
                        className: "w-5 h-5 text-amber-600",
                      })}
                    </div>
                    <div className="flex-1 pl-8">
                      <p className="font-medium text-gray-800 text-lg mb-6">{questions[currentQuestionIndex].question}</p>
                      
                      {questions[currentQuestionIndex].type === 'options' && questions[currentQuestionIndex].options && (
                        <div className="mt-4 space-y-3">
                          {questions[currentQuestionIndex].options.map((option, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => handleAnswer(option)}
                              className="w-full px-6 py-4 text-left bg-amber-50 hover:bg-amber-100 rounded-xl transition-all duration-300 flex items-center text-base shadow-sm hover:shadow-sm group"
                            >
                              <span className="mr-3 font-medium text-amber-600 group-hover:text-amber-700">{String.fromCharCode(65 + idx)}.</span>
                              <span className="group-hover:text-amber-800">{option}</span>
                            </motion.button>
                          ))}
                        </div>
                      )}
                      
                      {questions[currentQuestionIndex].type === 'text' && (
                        <form onSubmit={handleTextSubmit} className="mt-4">
                          <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={questions[currentQuestionIndex].placeholder || "Ketik jawaban Anda..."}
                            className="w-full px-6 py-4 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 text-base shadow-sm"
                          />
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            className="mt-4 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-300 text-base shadow-sm"
                          >
                            Kirim
                          </motion.button>
                        </form>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Analysis Result Display */}
              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/90 backdrop-blur-sm border border-amber-200 p-8 rounded-2xl shadow-lg"
                >
                  {/* Header Section */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-lg mr-4">
                        <FiHome className="w-8 h-8 text-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-800">Hasil Analisis Rumah Impian Anda</h2>
                        <p className="text-gray-600 mt-1">Berdasarkan preferensi dan kebutuhan yang Anda sampaikan</p>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="px-6 py-3 bg-amber-100 rounded-full">
                        <span className="text-amber-800 font-semibold">
                          {new Date().toLocaleDateString('id-ID', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Section */}
                  <div className="mb-10">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                        <FiMessageSquare className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-800">Ringkasan Analisis</h3>
                    </div>
                    <div className="bg-amber-50 p-8 rounded-xl border border-amber-100">
                      <p className="text-gray-700 leading-relaxed text-lg">{analysisResult.summary}</p>
                    </div>
                  </div>

                  {/* Key Insights Section */}
                  <div className="mb-10">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                        <FiList className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-800">Rekomendasi Utama</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {analysisResult.recommendations.map((rec, index) => (
                        <div key={index} className="bg-amber-50 p-6 rounded-xl border border-amber-100 hover:shadow-lg transition-shadow duration-300">
                          <div className="flex items-start">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-lg mr-4">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-gray-700 text-lg leading-relaxed">{rec}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advice Section */}
                  {analysisResult.advice && (
                    <div className="mb-10">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                          <FiMessageSquare className="w-5 h-5 text-amber-600" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800">{analysisResult.advice.title}</h3>
                      </div>
                      <div className="bg-amber-50 p-8 rounded-xl border border-amber-100">
                        <p className="text-gray-700 leading-relaxed text-lg mb-4">{analysisResult.advice.content}</p>
                        <div className="space-y-3">
                          {analysisResult.advice.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-semibold mr-3 mt-1">
                                ✓
                              </span>
                              <p className="text-gray-700">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Custom Design Suggestion */}
                  {analysisResult.customDesignSuggestion && (
                    <div className="mb-10">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                          <FiHome className="w-5 h-5 text-amber-600" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800">{analysisResult.customDesignSuggestion.title}</h3>
                      </div>
                      <div className="bg-amber-50 p-8 rounded-xl border border-amber-100">
                        <p className="text-gray-700 leading-relaxed text-lg mb-6">{analysisResult.customDesignSuggestion.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysisResult.customDesignSuggestion.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-start bg-white p-4 rounded-xl shadow-sm">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-semibold mr-3 mt-1">
                                ✓
                              </span>
                              <p className="text-gray-700">{benefit}</p>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => router.push('/custom-design')}
                          className="mt-6 w-full bg-amber-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-amber-700 transition-colors flex items-center justify-center"
                        >
                          <FiHome className="w-5 h-5 mr-2" />
                          Mulai Desain Custom
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Matching Houses Section */}
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                        <FiHome className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-800">Rumah yang Cocok</h3>
                    </div>
                    <div className="space-y-8">
                      {analysisResult.matchingHouses.map((house, index) => (
                        <div key={index} className="bg-amber-50 p-8 rounded-xl border border-amber-100 hover:shadow-lg transition-shadow duration-300">
                          {/* House Header */}
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                            <div>
                              <h4 className="text-2xl font-bold text-gray-800 mb-2">{house.name}</h4>
                              <div className="flex items-center space-x-4">
                                <span className="px-4 py-2 bg-amber-200 text-amber-800 rounded-full text-sm font-medium">
                                  {house.matchScore}% Cocok
                                </span>
                                {house.constructionTime && (
                                  <span className="text-gray-600">
                                    Dibangun: {house.constructionTime}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* House Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {house.price && (
                              <div className="bg-white p-4 rounded-xl shadow-sm">
                                <div className="flex items-center mb-2">
                                  <FiDollarSign className="w-5 h-5 text-amber-600 mr-2" />
                                  <span className="text-gray-600 font-medium">Harga</span>
                                </div>
                                <p className="text-xl font-semibold text-gray-800">{house.price}</p>
                              </div>
                            )}
                            {house.area && (
                              <div className="bg-white p-4 rounded-xl shadow-sm">
                                <div className="flex items-center mb-2">
                                  <FiHome className="w-5 h-5 text-amber-600 mr-2" />
                                  <span className="text-gray-600 font-medium">Luas Bangunan</span>
                                </div>
                                <p className="text-xl font-semibold text-gray-800">{house.area}</p>
                              </div>
                            )}
                          </div>

                          {/* House Description */}
                          <div className="mb-6">
                            <h5 className="text-lg font-semibold text-gray-700 mb-3">Deskripsi</h5>
                            <p className="text-gray-700 leading-relaxed">{house.details}</p>
                          </div>

                          {/* House Highlights */}
                          {house.highlights && house.highlights.length > 0 && (
                            <div>
                              <h5 className="text-lg font-semibold text-gray-700 mb-3">Keunggulan</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {house.highlights.map((highlight, idx) => (
                                  <div key={idx} className="flex items-start bg-white p-4 rounded-xl shadow-sm">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-semibold mr-3 mt-1">
                                      ✓
                                    </span>
                                    <p className="text-gray-700">{highlight}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Add View Details Button */}
                          <div className="mt-6">
                            <button
                              onClick={() => handleViewDetails(house)}
                              className="w-full bg-amber-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-amber-700 transition-colors flex items-center justify-center"
                            >
                              <FiArrowRight className="w-5 h-5 mr-2" />
                              Lihat Detail Lengkap
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Loading indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center"
                >
                  <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-sm">
                    <FiLoader className="animate-spin text-amber-600 w-5 h-5" />
                    <span className="text-gray-600 text-sm">Sedang berpikir...</span>
                  </div>
                </motion.div>
              )}
              
              {/* Anchor for scrolling */}
              <div ref={chatEndRef} />
            </div>
            
            {/* Input area */}
            <div className="border-t border-amber-100 bg-transparent backdrop-blur-sm py-4 sticky bottom-0">
              <form onSubmit={handleSubmit} className="flex items-center space-x-3 max-w-3xl mx-auto w-full px-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tanyakan tentang rumah impian Anda..."
                  className="flex-1 px-6 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 bg-white text-gray-800 text-sm shadow-sm"
                  disabled={(currentQuestionIndex >= 0 && currentQuestionIndex < questions.length && !loading) && !analysisCompleted}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-300 text-sm shadow-sm disabled:opacity-50 disabled:hover:scale-100 flex items-center"
                  disabled={((currentQuestionIndex >= 0 && currentQuestionIndex < questions.length && !loading) && !analysisCompleted) || loading}
                >
                  {loading ? <FiLoader className="animate-spin w-5 h-5" /> : <FiSend className="w-5 h-5" />}
                </motion.button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* House Details Modal */}
      <AnimatePresence>
        {showHouseModal && selectedHouse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHouseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                    <FiHome className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{selectedHouse.name}</h3>
                    <p className="text-gray-600">Detail Lengkap Rumah</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHouseModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Match Score and Basic Info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="px-4 py-2 bg-amber-200 text-amber-800 rounded-full text-sm font-medium">
                      {selectedHouse.matchScore}% Cocok
                    </span>
                    {selectedHouse.constructionTime && (
                      <span className="text-gray-600">
                        Dibangun: {selectedHouse.constructionTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {selectedHouse.price && (
                    <div className="bg-amber-50 p-6 rounded-xl">
                      <div className="flex items-center mb-3">
                        <FiDollarSign className="w-6 h-6 text-amber-600 mr-2" />
                        <span className="text-gray-700 font-medium">Harga</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{selectedHouse.price}</p>
                    </div>
                  )}
                  {selectedHouse.area && (
                    <div className="bg-amber-50 p-6 rounded-xl">
                      <div className="flex items-center mb-3">
                        <FiHome className="w-6 h-6 text-amber-600 mr-2" />
                        <span className="text-gray-700 font-medium">Luas Bangunan</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{selectedHouse.area}</p>
                    </div>
                  )}
                </div>

                {/* Detailed Description */}
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Deskripsi Lengkap</h4>
                  <div className="bg-amber-50 p-6 rounded-xl">
                    <p className="text-gray-700 leading-relaxed">{selectedHouse.details}</p>
                  </div>
                </div>

                {/* Highlights */}
                {selectedHouse.highlights && selectedHouse.highlights.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4">Keunggulan</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedHouse.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-start bg-amber-50 p-4 rounded-xl">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-semibold mr-3 mt-1">
                            ✓
                          </span>
                          <p className="text-gray-700">{highlight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-amber-700 transition-colors flex items-center justify-center">
                    <FiHeart className="w-5 h-5 mr-2" />
                    Simpan ke Favorit
                  </button>
                  <button className="flex-1 bg-white border-2 border-amber-600 text-amber-600 px-6 py-3 rounded-xl font-medium hover:bg-amber-50 transition-colors flex items-center justify-center">
                    <FiMapPin className="w-5 h-5 mr-2" />
                    Lihat Lokasi
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
