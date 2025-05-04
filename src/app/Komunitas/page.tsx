"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Share2, User, PlusCircle, Grid, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Post {
  id: number;
  user: string;
  avatar: string;
  title: string;
  content: string;
  image?: string;
  comments: number;
  timestamp: string;
  tags: string[];
}

interface NewPostForm {
  title: string;
  content: string;
  tags: string;
}

export default function KomunitasDesainInterior() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('trending');
  const [posts, setPosts] = useState<Post[]>([]);
  const [showPostForm, setShowPostForm] = useState<boolean>(false);
  const [newPost, setNewPost] = useState<NewPostForm>({
    title: '',
    content: '',
    tags: ''
  });
  const router = useRouter();

  useEffect(() => {
    // Simulasi memuat data
    setPosts([
      {
        id: 1,
        user: 'Jessica Lin',
        avatar: '/api/placeholder/40/40',
        title: 'Ide Ruang Tamu Minimalis Modern',
        content: 'Saya berencana merenovasi ruang tamu dengan pendekatan minimalis. Ada yang punya pengalaman dengan palet warna netral yang tetap terasa hangat dan nyaman?',
        image: '/api/placeholder/400/300',
        comments: 47,
        timestamp: '2 jam lalu',
        tags: ['minimalis', 'ruangtamu', 'renovasi']
      },
      {
        id: 2,
        user: 'Michael Chen',
        avatar: '/api/placeholder/40/40',
        title: 'Timeline Pembangunan Rumah Prefab',
        content: 'Baru dapat persetujuan untuk proyek rumah prefab saya! Bagi yang sudah pernah melakukannya, berapa timeline realistis dari persetujuan sampai bisa ditempati?',
        image: '/api/placeholder/400/300',
        comments: 36,
        timestamp: '4 jam lalu',
        tags: ['rumahprefab', 'konstruksi', 'timeline']
      },
      {
        id: 3,
        user: 'Sophia Park',
        avatar: '/api/placeholder/40/40',
        title: 'Material Dapur yang Berkelanjutan',
        content: 'Mencari material ramah lingkungan untuk renovasi dapur. Ada rekomendasi untuk countertop dan kabinet yang berkelanjutan dan tahan lama?',
        image: '/api/placeholder/400/300',
        comments: 62,
        timestamp: '6 jam lalu',
        tags: ['berkelanjutan', 'dapur', 'ramahlingkungan']
      },
      {
        id: 4,
        user: 'Robert Lee',
        avatar: '/api/placeholder/40/40',
        title: 'Tantangan Desain Ruang Kecil',
        content: 'Bekerja dengan apartemen seluas 500 kaki persegi. Bagaimana cara memaksimalkan ruang tanpa mengorbankan gaya? Ingin melihat contoh desain ruang kecil yang sukses!',
        comments: 43,
        timestamp: '8 jam lalu',
        tags: ['ruangkecil', 'apartemen', 'desain']
      }
    ]);
  }, []);

  const handlePostClick = (postId: number) => {
    router.push(`./Komunitas/diskusi`);
  };

  const handleNewPostClick = () => {
    setShowPostForm(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulasi membuat post baru
    const createdPost: Post = {
      id: posts.length + 1,
      user: 'Anda', // Ganti dengan user yang login
      avatar: '/api/placeholder/40/40',
      title: newPost.title,
      content: newPost.content,
      comments: 0,
      timestamp: 'Baru saja',
      tags: newPost.tags.split(',').map(tag => tag.trim())
    };

    setPosts(prev => [createdPost, ...prev]);
    setNewPost({ title: '', content: '', tags: '' });
    setShowPostForm(false);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#EAF4DE] text-[#594C1A]">
      <Navbar />
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center space-x-3 mb-6">
                <User size={20} className="text-[#594C1A]" />
                <h2 className="text-lg font-medium">Komunitas</h2>
              </div>
              
              <div className="space-y-3">
                <button className="flex items-center space-x-3 w-full py-2 px-3 rounded-lg hover:bg-[#EAF4DE] transition-all">
                  <Grid size={18} className="text-[#938656]" />
                  <span>Semua Postingan</span>
                </button>
                <button className="flex items-center space-x-3 w-full py-2 px-3 rounded-lg bg-[#EAF4DE] text-[#594C1A] font-medium">
                  <MessageSquare size={18} className="text-[#938656]" />
                  <span>Diskusi</span>
                </button>
                <button className="flex items-center space-x-3 w-full py-2 px-3 rounded-lg hover:bg-[#EAF4DE] transition-all">
                  <span>Disimpan</span>
                </button>
              </div>
              
              <div className="mt-8">
                <h3 className="text-sm font-medium text-[#938656] mb-3">Tag Populer</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 text-xs rounded-full bg-[#EAF4DE] text-[#594C1A]">#minimalis</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-[#EAF4DE] text-[#594C1A]">#rumahprefab</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-[#EAF4DE] text-[#594C1A]">#berkelanjutan</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-[#EAF4DE] text-[#594C1A]">#renovasi</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-[#EAF4DE] text-[#594C1A]">#ruangkecil</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Feed */}
          <div className="md:w-3/4">
            {/* Top Controls */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <div className="flex p-1 bg-[#EAF4DE] rounded-full">
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'trending' ? 'bg-white text-[#594C1A] shadow-sm' : 'text-[#938656]'}`}
                  onClick={() => setActiveTab('trending')}
                >
                  Terpopuler
                </button>
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'latest' ? 'bg-white text-[#594C1A] shadow-sm' : 'text-[#938656]'}`}
                  onClick={() => setActiveTab('latest')}
                >
                  Terbaru
                </button>
              </div>
              
              <button 
                onClick={handleNewPostClick}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-[#594C1A] text-white hover:bg-[#938656] transition-all shadow-sm"
              >
                <PlusCircle size={18} />
                <span>Posting Baru</span>
              </button>
            </div>

            {/* Form Buat Postingan Baru */}
            {showPostForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-6 mb-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Buat Postingan Baru</h2>
                  <button 
                    onClick={() => setShowPostForm(false)}
                    className="text-[#938656] hover:text-[#594C1A]"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmitPost}>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium mb-1">Judul</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newPost.title}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-[#EAF4DE] rounded-lg focus:ring-2 focus:ring-[#594C1A] focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="content" className="block text-sm font-medium mb-1">Konten</label>
                    <textarea
                      id="content"
                      name="content"
                      value={newPost.content}
                      onChange={handleFormChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-[#EAF4DE] rounded-lg focus:ring-2 focus:ring-[#594C1A] focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="tags" className="block text-sm font-medium mb-1">Tag (pisahkan dengan koma)</label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={newPost.tags}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-[#EAF4DE] rounded-lg focus:ring-2 focus:ring-[#594C1A] focus:border-transparent"
                      placeholder="minimalis, ruangtamu, renovasi"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#594C1A] text-white rounded-full hover:bg-[#938656] transition-colors"
                    >
                      Posting
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Discussion Cards */}
            <motion.div
              className="space-y-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {posts.map(post => (
                <motion.div 
                  key={post.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  variants={item}
                  onClick={() => handlePostClick(post.id)}
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-full" />
                      <div>
                        <h3 className="font-medium text-[#594C1A]">{post.user}</h3>
                        <p className="text-xs text-[#938656]">{post.timestamp}</p>
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-serif font-semibold mb-3">{post.title}</h2>
                    <p className="text-[#594C1A]/90 mb-4">{post.content}</p>
                    
                    {post.image && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img src={post.image} alt={post.title} className="w-full h-auto" />
                      </div>
                    )}
                    
                    {post.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 text-xs rounded-full bg-[#EAF4DE] text-[#594C1A]">#{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                      <button className="flex items-center space-x-1 text-[#938656] hover:text-[#594C1A]">
                        <MessageSquare size={16} />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-[#938656] hover:text-[#594C1A]">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}