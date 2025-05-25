"use client"

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSupportThread, SupportThread } from '@/services/supportService';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Navbar from '@/components/Navbar';
import { 
  AlertCircle,
  Loader2,
  ChevronLeft,
  Send,
  Clock,
  User,
  Shield
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function SupportThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [thread, setThread] = useState<SupportThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/Login');
      return;
    }

    const loadThread = async () => {
      try {
        const { success, thread: threadData, error } = await getSupportThread(resolvedParams.id);
        if (success && threadData) {
          setThread(threadData);
        } else {
          setError(error || 'Failed to load support thread');
        }
      } catch (err) {
        console.error('Error loading thread:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadThread();

    // Subscribe to messages
    const messagesRef = collection(db, 'supportThreads', resolvedParams.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        newMessages.push({
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName,
          message: data.message,
          timestamp: data.timestamp.toDate(),
          read: data.read
        });
      });
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [resolvedParams.id, router, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    setSending(true);
    try {
      const messagesRef = collection(db, 'supportThreads', resolvedParams.id, 'messages');
      await addDoc(messagesRef, {
        senderId: user.uid,
        senderName: user.displayName || 'User',
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false
      });

      // Update thread's last message
      const threadRef = doc(db, 'supportThreads', resolvedParams.id);
      await updateDoc(threadRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        unreadMessages: true
      });

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6EC]">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-[60vh]">
              <Loader2 className="w-8 h-8 text-[#594C1A] animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="min-h-screen bg-[#F6F6EC]">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 rounded-xl p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Thread</h2>
              <p className="text-gray-600 mb-6">{error || 'Thread not found'}</p>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-[#594C1A] hover:bg-[#938656]"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6EC]">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-[#594C1A] hover:text-[#938656] mb-4"
            >
              <ChevronLeft size={20} className="mr-2" />
              <span>Kembali</span>
            </button>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{thread.subject}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className={`px-3 py-1 rounded-full ${
                  thread.status === 'open' 
                    ? 'bg-green-100 text-green-800'
                    : thread.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {thread.status === 'open' ? 'Open' : 
                   thread.status === 'in-progress' ? 'In Progress' : 'Closed'}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {thread.createdAt.toDate().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-[60vh] overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-xl p-4 ${
                    message.senderId === user.uid
                      ? 'bg-[#594C1A] text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="flex items-center mb-2">
                      {message.senderId === user.uid ? (
                        <User className="w-4 h-4 mr-2" />
                      ) : (
                        <Shield className="w-4 h-4 mr-2" />
                      )}
                      <span className="text-sm font-medium">
                        {message.senderName}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                    <span className="text-xs opacity-70 mt-2 block">
                      {message.timestamp.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#594C1A] focus:border-[#594C1A]"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-2 bg-[#594C1A] text-white rounded-lg hover:bg-[#938656] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 