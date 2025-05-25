"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createSupportThread, SupportThread } from '@/services/supportService';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/firebase';
import Navbar from '@/components/Navbar';
import { 
  MessageSquare,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Send,
  Clock,
  Plus
} from 'lucide-react';

export default function SupportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const purchaseId = searchParams.get('purchaseId');

  useEffect(() => {
    if (!user) {
      router.push('/Login');
      return;
    }

    // Load user's support threads
    const threadsRef = collection(db, 'supportThreads');
    const q = query(
      threadsRef,
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newThreads: SupportThread[] = [];
      snapshot.forEach((doc) => {
        newThreads.push({
          id: doc.id,
          ...doc.data()
        } as SupportThread);
      });
      setThreads(newThreads);
      setLoadingThreads(false);
    });
    
    return () => unsubscribe();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await createSupportThread(
        user.uid,
        user.displayName || 'User',
        user.email || '',
        subject,
        message,
        purchaseId || undefined
      );
      
      if (error) {
        setError(error || 'Failed to create support thread');
      } else {
        setSubject('');
        setMessage('');
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error creating support thread:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
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
          <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
                <p className="mt-2 text-gray-600">
                  Tim support kami siap membantu Anda dengan pertanyaan seputar material dan konstruksi
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-[#594C1A] hover:bg-[#938656]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Buat Permintaan Baru
              </button>
          </div>
        </div>
        
          {showForm ? (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        {error && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                  <p className="text-red-700">{error}</p>
          </div>
        )}
        
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subjek
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                    placeholder="Masukkan subjek permintaan bantuan"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#594C1A] focus:border-[#594C1A]"
                  required
                />
              </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Pesan
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                    placeholder="Jelaskan detail permintaan bantuan Anda"
                    rows={6}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#594C1A] focus:border-[#594C1A]"
                  required
                  />
              </div>

                <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-[#594C1A] hover:bg-[#938656] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Kirim Permintaan
                      </>
                    )}
                </button>
              </div>
            </form>
          </div>
          ) : null}
        
          {/* Support Threads List */}
          <div className="space-y-4">
            {loadingThreads ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-8 h-8 text-[#594C1A] animate-spin" />
              </div>
            ) : threads.length > 0 ? (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{thread.subject}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            thread.status === 'open' 
                              ? 'bg-green-100 text-green-800'
                              : thread.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {thread.status === 'open' ? 'Open' : 
                             thread.status === 'in-progress' ? 'In Progress' : 'Closed'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-4">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>
                            {thread.createdAt.toDate().toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
            </div>
                        <p className="text-gray-600 line-clamp-2">{thread.lastMessage}</p>
                    </div>
                      <button
                        onClick={() => router.push(`/support/${thread.id}`)}
                        className="px-4 py-2 bg-[#594C1A] text-white rounded-lg hover:bg-[#938656] transition-colors"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Permintaan Bantuan</h3>
                <p className="text-gray-600 mb-6">
                  Buat permintaan bantuan baru untuk mendapatkan bantuan dari tim support kami
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-[#594C1A] hover:bg-[#938656]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Permintaan Baru
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 