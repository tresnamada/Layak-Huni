"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiLoader, FiHome, FiDollarSign, FiList, FiMessageSquare, FiPaperclip, FiRefreshCw, FiCheck, FiArrowRight, FiRepeat } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

export default function AiPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<{ isUser: boolean; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
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
    <div className="min-h-screen flex flex-col bg-[#F6F6EC]">
      <div className="container mx-auto p-4 flex-1 flex flex-col">
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[80vh]">
          {/* Header */}
          <div className="p-4 bg-amber-800 text-white flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">SiHuni AI Assistant</h1>
              <p className="text-sm">Asisten pintar untuk menemukan rumah impian Anda</p>
            </div>
            {analysisCompleted && (
              <button 
                onClick={restartAnalysis}
                className="flex items-center space-x-1 bg-amber-700 hover:bg-amber-600 px-3 py-1 rounded text-sm"
              >
                <FiRepeat />
                <span>Mulai Ulang</span>
              </button>
            )}
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome message if no messages yet */}
            {messages.length === 0 && (
              <motion.div
                initial="initial"
                animate="animate"
                variants={fadeIn}
                className="bg-amber-50 p-4 rounded-lg"
              >
                <p className="font-medium text-amber-800">Selamat datang di SiHuni!</p>
                <p className="text-gray-700">Saya akan membantu Anda menemukan rumah impian. Silakan ceritakan tentang rumah yang Anda cari.</p>
              </motion.div>
            )}
            
            {/* Find the index of the analysis completion message */}
            {(() => {
              const analysisMessageIndex = messages.findIndex(
                msg => !msg.isUser && msg.content === 'Analisis rumah impian Anda telah selesai. Berikut adalah hasilnya:'
              );
              
              // Messages before analysis
              const messagesToShow = analysisMessageIndex >= 0
                ? messages.slice(0, analysisMessageIndex + 1)
                : messages;
                
              return (
                <>
                  {/* Render messages before analysis */}
                  {messagesToShow.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial="initial"
                      animate="animate"
                      variants={fadeIn}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.isUser
                            ? 'bg-amber-800 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        {msg.isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div className="whitespace-pre-wrap prose prose-sm max-w-none prose-headings:text-gray-800 prose-a:text-amber-800">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({node, ...props}) => <a className="text-amber-800 hover:underline" {...props} />,
                                h1: ({node, ...props}) => <h1 className="text-lg font-bold" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-md font-bold" {...props} />,
                                h3: ({node, ...props}) => <h3 className="font-bold" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-5" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-5" {...props} />,
                                li: ({node, ...props}) => <li className="my-1" {...props} />
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Analysis result */}
                  {analysisResult && (
                    <motion.div
                      initial="initial"
                      animate="animate"
                      variants={fadeIn}
                      className="bg-white border border-amber-200 p-4 rounded-lg shadow-sm space-y-4"
                    >
                      <h3 className="font-bold text-amber-800 text-lg">Analisis Rumah Impian Anda</h3>
                      <p className="text-gray-700">{analysisResult.summary}</p>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Rekomendasi</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {analysisResult.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-gray-700">{rec}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Rumah yang Cocok</h4>
                        <div className="space-y-3">
                          {analysisResult.matchingHouses.map((house, idx) => (
                            <div key={idx} className="border border-amber-100 rounded-lg p-3 bg-amber-50">
                              <div className="flex justify-between items-start">
                                <h5 className="font-bold text-amber-800">{house.name}</h5>
                                <span className="bg-amber-800 text-white text-xs px-2 py-1 rounded-full">
                                  {Math.round(house.matchScore * 100)}% Match
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mt-1">{house.details}</p>
                              
                              {house.highlights && (
                                <div className="mt-2">
                                  <h6 className="text-sm font-semibold text-gray-700">Keunggulan:</h6>
                                  <ul className="list-disc pl-5 text-sm text-gray-600">
                                    {house.highlights.map((highlight, hidx) => (
                                      <li key={hidx}>{highlight}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              <div className="flex flex-wrap mt-2 gap-2">
                                {house.price && (
                                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center">
                                    <FiDollarSign className="mr-1" /> {house.price}
                                  </span>
                                )}
                                {house.area && (
                                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center">
                                    <FiHome className="mr-1" /> {house.area}
                                  </span>
                                )}
                                {house.constructionTime && (
                                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center">
                                    <FiRefreshCw className="mr-1" /> {house.constructionTime}
                                  </span>
                                )}
                              </div>
                              
                              <button
                                onClick={() => router.push(`/Houses/${house.id}`)}
                                className="mt-3 w-full flex items-center justify-center px-3 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
                              >
                                <span>Lihat Detail</span>
                                <FiArrowRight className="ml-2" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Messages after analysis */}
                  {analysisMessageIndex >= 0 && messages.slice(analysisMessageIndex + 1).map((msg, index) => (
                    <motion.div
                      key={`post-analysis-${index}`}
                      initial="initial"
                      animate="animate"
                      variants={fadeIn}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.isUser
                            ? 'bg-amber-800 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        {msg.isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div className="whitespace-pre-wrap prose prose-sm max-w-none prose-headings:text-gray-800 prose-a:text-amber-800">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({node, ...props}) => <a className="text-amber-800 hover:underline" {...props} />,
                                h1: ({node, ...props}) => <h1 className="text-lg font-bold" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-md font-bold" {...props} />,
                                h3: ({node, ...props}) => <h3 className="font-bold" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-5" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-5" {...props} />,
                                li: ({node, ...props}) => <li className="my-1" {...props} />
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </>
              );
            })()}
            
            {/* Current question */}
            {currentQuestionIndex >= 0 && currentQuestionIndex < questions.length && (
              <motion.div
                initial="initial"
                animate="animate"
                variants={slideIn}
                className="bg-white border border-amber-200 p-4 rounded-lg shadow-sm"
              >
                <div className="flex items-start">
                  {React.createElement(getQuestionIcon(questions[currentQuestionIndex].id), {
                    className: "w-5 h-5 mt-1 mr-2 text-amber-800",
                  })}
                  <div>
                    <p className="font-medium text-gray-800">{questions[currentQuestionIndex].question}</p>
                    
                    {questions[currentQuestionIndex].type === 'options' && questions[currentQuestionIndex].options && (
                      <div className="mt-3 space-y-2">
                        {questions[currentQuestionIndex].options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(option)}
                            className="w-full px-3 py-2 text-left bg-amber-50 hover:bg-amber-100 rounded-md transition-colors flex items-center"
                          >
                            <span className="mr-2">{String.fromCharCode(65 + idx)}.</span>
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {questions[currentQuestionIndex].type === 'text' && (
                      <form onSubmit={handleTextSubmit} className="mt-3">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={questions[currentQuestionIndex].placeholder || "Ketik jawaban Anda..."}
                          className="w-full px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="submit"
                          className="mt-2 px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-700"
                        >
                          Kirim
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-center">
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                  <FiLoader className="animate-spin text-amber-800" />
                  <span className="text-sm text-gray-600">Sedang berpikir...</span>
                </div>
              </div>
            )}
            
            {/* Anchor for scrolling */}
            <div ref={chatEndRef} />
          </div>
          
          {/* Input area */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan tentang rumah impian Anda..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                disabled={(currentQuestionIndex >= 0 && currentQuestionIndex < questions.length && !loading) && !analysisCompleted}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-800 text-white rounded-r-lg hover:bg-amber-700 transition-colors flex items-center"
                disabled={((currentQuestionIndex >= 0 && currentQuestionIndex < questions.length && !loading) && !analysisCompleted) || loading}
              >
                {loading ? <FiLoader className="animate-spin" /> : <FiSend />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
