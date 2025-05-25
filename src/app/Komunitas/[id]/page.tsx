"use client"
import { useState, useEffect, useRef, use } from 'react';
import { ArrowLeft, Image, Send, Paperclip, Smile, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface Message {
  id: number;
  user: string;
  avatar: string;
  content: string;
  image?: string;
  timestamp: string;
  isMine: boolean;
}

interface DiskusiDetail {
  id: number;
  title: string;
  participantsCount: number;
  participants: {
    name: string;
    avatar: string;
  }[];
  messages: Message[];
}

export default function DiskusiDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [diskusi, setDiskusi] = useState<DiskusiDetail | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Simulasi loading data diskusi berdasarkan ID
    setTimeout(() => {
      setDiskusi({
        id: parseInt(resolvedParams.id),
        title: "Ide Ruang Tamu Minimalis Modern",
        participantsCount: 47,
        participants: [
          { name: "Jessica Lin", avatar: "/api/placeholder/40/40" },
          { name: "Michael Chen", avatar: "/api/placeholder/40/40" },
          { name: "Sophia Park", avatar: "/api/placeholder/40/40" },
          { name: "Robert Lee", avatar: "/api/placeholder/40/40" },
          { name: "Anda", avatar: "/api/placeholder/40/40" }
        ],
        messages: [
          {
            id: 1,
            user: "Jessica Lin",
            avatar: "/api/placeholder/40/40",
            content: "Saya berencana merenovasi ruang tamu dengan pendekatan minimalis. Ada yang punya pengalaman dengan palet warna netral yang tetap terasa hangat dan nyaman?",
            timestamp: "14:30",
            isMine: false
          },
          {
            id: 2,
            user: "Michael Chen",
            avatar: "/api/placeholder/40/40",
            content: "Saya selesai merenovasi tahun lalu. Kombinasi warna putih gading dan abu-abu terang dengan aksen kayu sangat berhasil untuk ruang tamu saya.",
            timestamp: "14:35",
            isMine: false
          },
          {
            id: 3,
            user: "Jessica Lin",
            avatar: "/api/placeholder/40/40",
            content: "Terima kasih Michael! Apakah kamu menggunakan pencahayaan khusus untuk mempertahankan kehangatan ruangan?",
            timestamp: "14:40",
            isMine: false
          },
          {
            id: 4,
            user: "Sophia Park",
            avatar: "/api/placeholder/40/40",
            content: "Dari pengalaman saya, pencahayaan hangat dengan lampu dinding dan lampu lantai sangat penting untuk ruang minimalis. Hindari pencahayaan langsung dari langit-langit saja.",
            image: "/api/placeholder/300/200",
            timestamp: "14:45",
            isMine: false
          },
          {
            id: 5,
            user: "Robert Lee",
            avatar: "/api/placeholder/40/40",
            content: "Setuju dengan Sophia. Saya juga menambahkan tanaman indoor untuk memberikan kehidupan pada ruang minimalis.",
            timestamp: "14:50",
            isMine: false
          },
          {
            id: 6,
            user: "Anda",
            avatar: "/api/placeholder/40/40",
            content: "Terima kasih atas sarannya! Saya juga tertarik dengan aksen kayu. Apakah ada rekomendasi furniture dengan bahan kayu yang cocok untuk ruang tamu minimalis?",
            timestamp: "14:55",
            isMine: true
          }
        ]
      });
      setIsLoading(false);
    }, 1000);
  }, [resolvedParams.id]);

  useEffect(() => {
    scrollToBottom();
  }, [diskusi]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !selectedImage) || !diskusi) return;

    const newMsg: Message = {
      id: diskusi.messages.length + 1,
      user: "Anda",
      avatar: "/api/placeholder/40/40",
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    };

    if (imagePreview) {
      newMsg.image = imagePreview;
    }

    setDiskusi({
      ...diskusi,
      messages: [...diskusi.messages, newMsg]
    });

    setNewMessage('');
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleGoBack = () => {
    router.push('/Komunitas');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAF4DE]">
        <div className="text-[#594C1A] text-lg">Memuat diskusi...</div>
      </div>
    );
  }

  if (!diskusi) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAF4DE]">
        <div className="text-[#594C1A] text-lg">Diskusi tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAF4DE] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center">
            <button 
              onClick={handleGoBack}
              className="mr-3 p-1 rounded-full hover:bg-[#EAF4DE] transition-all"
            >
              <ArrowLeft size={24} className="text-[#594C1A]" />
            </button>
            
            <div className="flex-1">
              <h1 className="font-serif text-lg font-semibold text-[#594C1A] truncate">{diskusi.title}</h1>
              <div className="flex items-center text-sm text-[#938656]">
                <span>{diskusi.participantsCount} peserta</span>
              </div>
            </div>

            <div className="flex -space-x-2">
              {diskusi.participants.slice(0, 3).map((participant, index) => (
                <img 
                  key={index}
                  src={participant.avatar} 
                  alt={participant.name}
                  className="w-8 h-8 rounded-full border-2 border-white" 
                />
              ))}
              {diskusi.participants.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-[#594C1A] flex items-center justify-center text-white text-xs border-2 border-white">
                  +{diskusi.participants.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div 
            className="space-y-4 pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {diskusi.messages.map((message) => (
              <motion.div 
                key={message.id}
                className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={`flex max-w-[80%] ${message.isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!message.isMine && (
                    <div className="flex-shrink-0 mr-2">
                      <img src={message.avatar} alt={message.user} className="w-10 h-10 rounded-full" />
                    </div>
                  )}
                  
                  <div className={`
                    rounded-2xl py-2 px-4 shadow-sm
                    ${message.isMine 
                      ? 'bg-[#594C1A] text-white rounded-tr-none' 
                      : 'bg-white text-[#594C1A] rounded-tl-none'}
                  `}>
                    {!message.isMine && (
                      <div className="font-medium text-sm mb-1">{message.user}</div>
                    )}
                    
                    <div className="mb-1">{message.content}</div>
                    
                    {message.image && (
                      <div className="mt-2 rounded-lg overflow-hidden">
                        <img 
                          src={message.image} 
                          alt="Pesan gambar" 
                          className="max-w-full h-auto"
                        />
                      </div>
                    )}
                    
                    <div className={`text-xs mt-1 ${message.isMine ? 'text-white/70' : 'text-[#938656]'}`}>
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </motion.div>
        </div>
      </div>

      {/* Image Preview Area */}
      {imagePreview && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="container mx-auto max-w-3xl">
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-32 object-contain rounded-lg"
              />
              <button 
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 py-3 px-4 sticky bottom-0">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleAttachmentClick}
              className="p-2 rounded-full hover:bg-[#EAF4DE] text-[#594C1A] transition-all"
            >
              <Paperclip size={22} />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            
            <div className="flex-1 bg-[#EAF4DE] rounded-full">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ketik pesan..."
                className="w-full px-4 py-2 bg-transparent focus:outline-none resize-none max-h-20 text-[#594C1A]"
                rows={1}
              />
            </div>
            
            <button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && !selectedImage}
              className={`p-3 rounded-full ${
                !newMessage.trim() && !selectedImage 
                  ? 'bg-[#EAF4DE] text-[#938656]' 
                  : 'bg-[#594C1A] text-white'
              } transition-all`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}