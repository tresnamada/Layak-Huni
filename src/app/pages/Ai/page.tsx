"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

export default function AiChat() {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Halo! Saya SiHuni, asisten AI yang akan membantu Anda menemukan rumah prebuilt yang sempurna untuk kebutuhan Anda. Silakan beritahu saya apa yang Anda cari dalam rumah impian Anda?',
      isUser: false,
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatStage, setChatStage] = useState<'initial' | 'questions_generated' | 'questions_answered'>('initial');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    
    // Add user message to chat
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      isUser: true,
    };
    
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);
    
    try {
      // Create chat history for the API request
      const chatHistory = messages.map(({ content, isUser }) => ({
        content,
        isUser,
      }));
      
      // Determine current stage
      let stage = chatStage;
      if (chatStage === 'questions_generated') {
        stage = 'questions_answered';
        setChatStage('questions_answered');
      }
      
      console.log('Sending request to AI with stage:', stage);
      
      // Call API
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage,
          chatHistory,
          stage,
        }),
      });
      
      console.log('Received response with status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error details:', errorData);
        throw new Error(`Server error: ${response.status} ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Received data from API');
      
      // Update chat stage if needed
      if (chatStage === 'initial') {
        setChatStage('questions_generated');
      }
      
      // Add AI response to chat
      const newAiMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        isUser: false,
      };
      
      setMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Generate a more helpful error message
      let errorMessage = 'Maaf, terjadi kesalahan. Silakan coba lagi nanti.';
      
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        
        // Provide more specific error messages based on common issues
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.';
        } else if (error.message.includes('API key')) {
          errorMessage = 'Terjadi masalah dengan otentikasi AI. Hubungi administrator untuk bantuan.';
        } else if (error.message.includes('Server error')) {
          errorMessage = `Terjadi kesalahan pada server: ${error.message}. Coba lagi nanti.`;
        }
      }
      
      // Add error message to chat
      const errorMsg: Message = {
        id: Date.now().toString(),
        content: errorMessage,
        isUser: false,
      };
      
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="flex flex-col h-screen bg-[#F6F6EC] text-[#3D3A35]">
      {/* Header */}
      <header className="flex items-center justify-center p-4 border-b border-[#E0DAD2] bg-white">
        <h1 className="text-2xl font-medium text-[#5A5342]">SiHuni - Asisten Rumah Prebuilt</h1>
      </header>
      
      {/* Chat container */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md rounded-xl p-4 ${
                  message.isUser
                    ? 'bg-[#5A5342] text-white rounded-tr-none'
                    : 'bg-white rounded-tl-none'
                }`}
              >
                {message.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-md rounded-xl p-4 bg-white rounded-tl-none">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p>SiHuni sedang mengetik...</p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input form */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-[#E0DAD2] p-4 bg-white"
      >
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesan Anda di sini..."
            className="flex-1 p-3 rounded-lg border border-[#E0DAD2] focus:outline-none focus:ring-2 focus:ring-[#5A5342]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#5A5342] text-white p-3 rounded-lg hover:bg-[#8C7B6C] transition-colors duration-200 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
