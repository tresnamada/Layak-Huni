"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiLoader, FiHome, FiDollarSign, FiList, FiMessageSquare, FiPaperclip, FiRefreshCw, FiCheck, FiArrowRight } from 'react-icons/fi';
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
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, questions, analysisResult]);

  useEffect(() => {
    // Redirect to the new SiHuni page
    router.push('/sihuni');
  }, [router]);

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
    <div className="min-h-screen flex items-center justify-center bg-[#F6F6EC]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Mengarahkan ke halaman SiHuni...</p>
      </div>
    </div>
  );
}
