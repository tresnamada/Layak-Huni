"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSupportThread, SupportThread } from '@/services/supportService';
import { isAdmin } from '@/services/adminService';
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
  Shield,
  CheckCircle
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Extend the imported SupportThread interface
interface AdminSupportThread extends SupportThread {
  purchaseId?: string; // Add purchaseId here
}

export default function AdminSupportThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [thread, setThread] = useState<AdminSupportThread | null>(null); // Use AdminSupportThread
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/Login');
      return;
    }

    const checkAdmin = async () => {
      try {
        const adminStatus = await isAdmin(user.uid);
        setIsAdminUser(adminStatus);
        if (!adminStatus) {
          router.push('/Admin'); // Redirect if not admin
          return;
        }
        setIsCheckingAdmin(false);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to verify admin status');
        setIsCheckingAdmin(false);
        setIsAdminUser(false);
        router.push('/Admin'); // Redirect on error
        return;
      }
    };

    checkAdmin();

    // Load thread and messages only if user is confirmed admin (or during initial load)
    if (user && (isAdminUser || isCheckingAdmin === true)) { // Proceed only if admin check is pending or true
        const loadThread = async () => {
            try {
                const { success, thread: threadData, error } = await getSupportThread(resolvedParams.id);
                if (success && threadData) {
                    // Cast to AdminSupportThread to include purchaseId
                    setThread(threadData as AdminSupportThread);
                } else {
                    setError(error || 'Failed to load support thread');
                }
            } catch (err) {
                console.error('Error loading thread:', err);
                setError('An unexpected error occurred');
            } finally {
                 // Set loading to false only after both admin check and thread loading are complete
                 if (!isCheckingAdmin) setLoading(false);
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
                    id: doc.id, // doc.id is always a string
                    senderId: data.senderId,
                    senderName: data.senderName, // Store sender name
                    message: data.message,
                    timestamp: data.timestamp?.toDate() || new Date(), // Handle missing timestamp
                    read: data.read || false // Handle missing read status
                });
            });
            setMessages(newMessages);
             // Set loading to false only after both admin check and message loading are complete
             if (!isCheckingAdmin) setLoading(false);
        });

        return () => unsubscribe();
    }

  }, [resolvedParams.id, router, user, isAdminUser, isCheckingAdmin]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    setSending(true);
    try {
      const messagesRef = collection(db, 'supportThreads', resolvedParams.id, 'messages');
      await addDoc(messagesRef, {
        senderId: user.uid,
        senderName: user.displayName || 'Admin', // Use Admin name
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false
      });

      // Update thread's last message and status if closed
      const threadRef = doc(db, 'supportThreads', resolvedParams.id);
      const updates: { lastMessage: string; lastMessageTime: ReturnType<typeof serverTimestamp>; unreadMessages: boolean; status?: 'in-progress' } = {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        unreadMessages: true // Mark as unread for the user
      };

      // Optionally re-open thread if admin replies to a closed thread
      if (thread?.status === 'closed') {
          updates.status = 'in-progress';
      }

      await updateDoc(threadRef, updates);

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (isCheckingAdmin || !isAdminUser) {
      return (
          <div className="min-h-screen bg-[#F6F6EC] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#594C1A] border-t-transparent"></div>
          </div>
      );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6EC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#594C1A] border-t-transparent"></div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="min-h-screen bg-[#F6F6EC] flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error || 'Thread not found'}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center text-[#594C1A] hover:text-[#938656]"
        >
          <ChevronLeft size={20} className="mr-2" />
          <span>Kembali</span>
        </button>
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
              <span>Kembali ke Support</span>
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
                 {thread.purchaseId && ( // Access purchaseId here
                    <span className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Purchase ID: {thread.purchaseId}
                    </span>
                 )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-[60vh] overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user!.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-xl p-4 ${
                    message.senderId === user!.uid
                      ? 'bg-[#594C1A] text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="flex items-center mb-2">
                      {message.senderId === user!.uid ? (
                        <Shield className="w-4 h-4 mr-2" /> // Admin Icon
                      ) : (
                        <User className="w-4 h-4 mr-2" /> // User Icon
                      )}
                      <span className="text-sm font-medium">
                        {message.senderName}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                    <span className="text-xs opacity-70 mt-2 block">
                      {message.timestamp?.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) || ''}
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
                  placeholder="Ketik balasan..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#594C1A] focus:border-[#594C1A]"
                  disabled={sending || thread?.status === 'closed'}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim() || thread?.status === 'closed'}
                  className="px-4 py-2 bg-[#594C1A] text-white rounded-lg hover:bg-[#938656] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
               {thread?.status === 'closed' && (
                   <p className="text-sm text-gray-600 mt-2">This thread is closed. Replying will re-open it.</p>
               )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 