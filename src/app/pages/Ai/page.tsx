"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiLoader, FiHome, FiDollarSign, FiList, FiMessageSquare, FiPaperclip, FiRefreshCw, FiCheck, FiArrowRight } from 'react-icons/fi';

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
  }>;
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const slideIn = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 }
};

export default function AiChat() {
  const [messages, setMessages] = useState<{ isUser: boolean; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
        body: JSON.stringify({ userMessage: message, stage: 'initial' }),
      });

      const data = await response.json();
      if (response.ok) {
        try {
          const parsedQuestions = JSON.parse(data.response);
          if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
            setQuestions(parsedQuestions);
            setCurrentQuestionIndex(0);
            setMessages(prev => [...prev, { 
              isUser: false, 
              content: 'Mari kita mulai analisis rumah impian Anda. Saya akan mengajukan beberapa pertanyaan untuk memahami kebutuhan Anda dengan lebih baik.' 
            }]);
          } else {
            throw new Error('Invalid questions format');
          }
        } catch (parseError) {
          console.error('Error parsing questions:', parseError);
          setMessages(prev => [...prev, { 
            isUser: false, 
            content: 'Maaf, terjadi kesalahan dalam memproses pertanyaan. Silakan coba lagi.' 
          }]);
        }
      } else {
        throw new Error(data.error || 'Failed to get questions');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { isUser: false, content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' }]);
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
          stage: 'analysis',
          type: 'detailed'
        }),
      });

      const data = await response.json();
      if (response.ok) {
        try {
          const result = JSON.parse(data.response);
          if (result && typeof result === 'object') {
            setAnalysisResult(result);
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
      } else {
        throw new Error(data.error || 'Failed to get analysis');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { isUser: false, content: 'Maaf, terjadi kesalahan dalam mendapatkan analisis.' }]);
    } finally {
      setLoading(false);
    }
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
          body: JSON.stringify({ userMessage, stage: 'chat' }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessages(prev => [...prev, { isUser: false, content: data.response }]);
        } else {
          throw new Error(data.error || 'Failed to get response');
        }
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, { isUser: false, content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' }]);
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

  return (
    <main className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start gap-3 mb-2">
            <h1 className="text-3xl font-semibold">
              Hi there, <span className="text-purple-600">Guest</span>
            </h1>
          </div>
          <h2 className="text-2xl text-purple-600 font-semibold mb-4">
            What would you like to know?
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Use one of the most common prompts below or use your own to begin
          </p>

          {/* Quick Prompts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
              onClick={() => setInput("Saya ingin mencari rumah. Apa saja yang perlu saya pertimbangkan?")}
            >
              <div className="flex items-center gap-2 mb-2">
                <FiHome className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm text-gray-800">Mencari rumah yang tepat untuk Anda</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
              onClick={() => setInput("Bagaimana proses pembelian rumah di SiapHuni?")}
            >
              <div className="flex items-center gap-2 mb-2">
                <FiDollarSign className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm text-gray-800">Pelajari proses pembelian rumah</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
              onClick={() => setInput("Apa saja fitur dan fasilitas yang tersedia di rumah SiapHuni?")}
            >
              <div className="flex items-center gap-2 mb-2">
                <FiList className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm text-gray-800">Eksplorasi fitur dan fasilitas</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
              onClick={() => setInput("Bagaimana teknologi smart home di rumah SiapHuni bekerja?")}
            >
              <div className="flex items-center gap-2 mb-2">
                <FiMessageSquare className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm text-gray-800">Pelajari teknologi smart home</p>
            </motion.button>
          </div>

          {/* Main Input */}
          <div className="relative">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tanyakan apa saja tentang SiapHuni..."
                  className="w-full p-4 pr-24 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <FiPaperclip className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <FiLoader className="w-5 h-5 animate-spin" />
                    ) : (
                      <FiSend className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>0/1000</span>
                <button type="button" className="flex items-center gap-1 hover:text-gray-700">
                  <FiRefreshCw className="w-4 h-4" /> Refresh Prompts
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Chat Messages */}
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                initial="initial"
                animate="animate"
                exit="exit"
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.isUser
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Current Question */}
          <AnimatePresence>
            {currentQuestionIndex >= 0 && questions[currentQuestionIndex] && (
              <motion.div
                variants={slideIn}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex justify-start"
              >
                <div className="max-w-[80%] p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-amber-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-full">
                      {React.createElement(getQuestionIcon(questions[currentQuestionIndex].id), {
                        className: "w-5 h-5 text-red-800"
                      })}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {questions[currentQuestionIndex].question}
                    </h3>
                  </div>
                  
                  {questions[currentQuestionIndex].type === 'options' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {questions[currentQuestionIndex].options?.map((option, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(option)}
                          className="px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-left text-gray-700 hover:bg-amber-50 border border-amber-100 hover:border-amber-200"
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <form onSubmit={handleTextSubmit} className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={questions[currentQuestionIndex].placeholder || "Ketik jawaban Anda..."}
                        className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white/90"
                      />
                      <div className="flex justify-end">
                        <motion.button
                          type="submit"
                          disabled={!input.trim()}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-2 bg-gradient-to-r from-red-800 to-amber-700 text-white rounded-xl hover:from-red-900 hover:to-amber-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                        >
                          <span>Kirim</span>
                          <FiSend className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analysis Result */}
          <AnimatePresence>
            {analysisResult && (
              <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="space-y-6"
              >
                {/* Summary */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-amber-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiCheck className="w-5 h-5 text-red-800" />
                    Ringkasan Analisis
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{analysisResult.summary}</p>
                </div>

                {/* Recommendations */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-amber-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiList className="w-5 h-5 text-red-800" />
                    Rekomendasi
                  </h3>
                  <ul className="space-y-3">
                    {analysisResult.recommendations.map((rec, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3 bg-white/50 p-3 rounded-lg"
                      >
                        <FiCheck className="w-5 h-5 text-red-800 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{rec}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Matching Houses */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-amber-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiHome className="w-5 h-5 text-red-800" />
                    Rumah yang Cocok
                  </h3>
                  <div className="space-y-4">
                    {analysisResult.matchingHouses.map((house, idx) => (
                      <motion.div
                        key={house.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-amber-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-800">{house.name}</h4>
                          <span className="text-sm bg-red-50 text-red-800 px-3 py-1 rounded-full">
                            {Math.round(house.matchScore * 100)}% Cocok
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{house.details}</p>
                        <button className="text-red-800 hover:text-red-900 flex items-center gap-1 text-sm font-medium">
                          Lihat Detail <FiArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-4"
            >
              <div className="relative w-12 h-12">
                <motion.div
                  className="absolute inset-0 border-4 border-gray-200 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
    </main>
  );
}
