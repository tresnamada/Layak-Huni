"use client"
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Share2, User, PlusCircle, Grid, X, Trash2, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useCommunity } from '@/context/CommunityContext';
import { useAuth } from '@/context/AuthContext';
import { CommunityPost, convertImageToBase64 } from '@/services/communityService';
import { getProfile } from '@/services/profileService';

interface NewPostForm {
  title: string;
  content: string;
  tags: string;
  category: 'discussion' | 'collaboration' | 'workshop' | 'general';
  image?: File;
}

export default function KomunitasDesainInterior() {
  const [activeTab, setActiveTab] = useState<string>('trending');
  const [showPostForm, setShowPostForm] = useState<boolean>(false);
  const [newPost, setNewPost] = useState<NewPostForm>({
    title: '',
    content: '',
    tags: '',
    category: 'discussion'
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { user } = useAuth();
  const { 
    posts, 
    loading, 
    fetchPosts, 
    createNewPost,
    toggleLike,
    deletePost
  } = useCommunity();

  useEffect(() => {
    // Fetch posts based on active tab
    const fetchInitialPosts = async () => {
      if (activeTab === 'trending') {
        await fetchPosts(undefined, undefined, undefined); // Will be ordered by likes/comments
      } else {
        await fetchPosts(); // Default ordering by createdAt desc
      }
    };
    fetchInitialPosts();
  }, [activeTab, fetchPosts]);

  const handlePostClick = (postId: string) => {
    router.push(`/Komunitas/diskusi/${postId}`);
  };

  const handleNewPostClick = () => {
    if (!user) {
      router.push('/Login');
      return;
    }
    setShowPostForm(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Reset previous error
      setImageError(null);

      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setNewPost(prev => ({ ...prev, image: file }));
    } catch (error) {
      setImageError('Failed to process image');
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageError(null);
    setNewPost(prev => ({ ...prev, image: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      let imageUrl = null;
      if (newPost.image) {
        try {
          imageUrl = await convertImageToBase64(newPost.image);
        } catch (error) {
          setImageError('Failed to process image');
          return;
        }
      }

      // Get user's profile to use their full name
      const { success, data: profileData } = await getProfile(user.uid);
      const authorName = success && profileData 
        ? `${profileData.firstName} ${profileData.lastName}`.trim()
        : user.displayName || 'Anonymous';

      const postData = {
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        tags: newPost.tags.split(',').map(tag => tag.trim()),
        authorId: user.uid,
        authorName,
        imageUrl
      };

      await createNewPost(postData);
      setNewPost({ title: '', content: '', tags: '', category: 'discussion' });
      setImagePreview(null);
      setShowPostForm(false);
    } catch (error) {
      console.error('Error creating post:', error);
      if (error instanceof Error && error.message.includes('Image size')) {
        setImageError(error.message);
      }
    }
  };

  const handleLikeClick = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation(); // Prevent post click event
    if (!user) {
      router.push('/Login');
      return;
    }
    await toggleLike(postId);
  };

  const handleDeletePost = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation(); // Prevent post click event
    if (!user || !postId) return;

    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        // Ensure we're passing the correct user ID
        if (!user.uid) {
          throw new Error('User ID not found');
        }
        await deletePost(postId, user.uid);
        // Post will be removed from the list automatically through real-time updates
      } catch (error) {
        console.error('Error deleting post:', error);
        // Show error to user
        alert(error instanceof Error ? error.message : 'Failed to delete post');
      }
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EAF4DE] text-[#594C1A] font-jakarta">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#594C1A]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAF4DE] text-[#594C1A] font-jakarta">
      <Navbar />
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center space-x-3 mb-6">
                <User size={20} className="text-[#594C1A]" />
                <h2 className="text-lg font-medium font-jakarta">Komunitas</h2>
              </div>
              
              <div className="space-y-3 font-jakarta">
                <button className="flex items-center space-x-3 w-full py-2 px-3 rounded-lg hover:bg-[#EAF4DE] transition-all">
                  <Grid size={18} className="text-[#938656]" />
                  <span>Semua Postingan</span>
                </button>
                <button className="flex items-center space-x-3 w-full py-2 px-3 rounded-lg bg-[#EAF4DE] text-[#594C1A] font-medium">
                  <MessageSquare size={18} className="text-[#938656]" />
                  <span>Diskusi</span>
                </button>
                {user && (
                  <button className="flex items-center space-x-3 w-full py-2 px-3 rounded-lg hover:bg-[#EAF4DE] transition-all">
                    <span>Disimpan</span>
                  </button>
                )}
              </div>
              
              <div className="mt-8">
                <h3 className="text-sm font-medium text-[#938656] mb-3 font-jakarta">Tag Populer</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(posts.flatMap(post => post.tags))).slice(0, 5).map(tag => (
                    <span key={tag} className="px-3 py-1 text-xs rounded-full bg-[#EAF4DE] text-[#594C1A]">
                      #{tag}
                    </span>
                  ))}
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
                  <h2 className="text-xl font-semibold font-jakarta">Buat Postingan Baru</h2>
                  <button 
                    onClick={() => setShowPostForm(false)}
                    className="text-[#938656] hover:text-[#594C1A]"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmitPost}>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium mb-1 font-jakarta">Judul</label>
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
                    <label htmlFor="category" className="block text-sm font-medium mb-1 font-jakarta">Kategori</label>
                    <select
                      id="category"
                      name="category"
                      value={newPost.category}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-[#EAF4DE] rounded-lg focus:ring-2 focus:ring-[#594C1A] focus:border-transparent"
                      required
                    >
                      <option value="discussion">Diskusi</option>
                      <option value="collaboration">Kolaborasi</option>
                      <option value="workshop">Workshop</option>
                      <option value="general">Umum</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="content" className="block text-sm font-medium mb-1 font-jakarta">Konten</label>
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
                    <label className="block text-sm font-medium mb-1 font-jakarta">Gambar (Opsional - Max 1MB)</label>
                    <div className="mt-1 flex items-center space-x-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="px-4 py-2 bg-[#EAF4DE] text-[#594C1A] rounded-lg cursor-pointer hover:bg-[#594C1A] hover:text-white transition-colors flex items-center space-x-2"
                      >
                        <ImageIcon size={20} />
                        <span>Pilih Gambar</span>
                      </label>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                    {imageError && (
                      <div className="mt-2 text-red-500 flex items-center space-x-1">
                        <ImageIcon size={16} />
                        <span>{imageError}</span>
                      </div>
                    )}
                    {imagePreview && (
                      <div className="mt-2 relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48 rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="tags" className="block text-sm font-medium mb-1 font-jakarta">Tag (pisahkan dengan koma)</label>
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
              {posts.map((post: CommunityPost) => (
                <motion.div 
                  key={post.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  variants={item}
                  onClick={() => post.id && handlePostClick(post.id)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#EAF4DE] flex items-center justify-center">
                          <User size={20} className="text-[#594C1A]" />
                        </div>
                        <div>
                          <h3 className="font-medium text-[#594C1A] font-jakarta">{post.authorName}</h3>
                          <p className="text-xs text-[#938656]">
                            {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                      {user && post.authorId === user.uid && (
                        <button
                          onClick={(e) => post.id && handleDeletePost(e, post.id)}
                          className="p-2 text-red-500 hover:text-red-700 transition-colors"
                          title="Delete post"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-semibold mb-3 font-jakarta">{post.title}</h2>
                    <p className="text-[#594C1A]/90 mb-4">{post.content}</p>
                    
                    {post.imageUrl && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img src={post.imageUrl} alt={post.title} className="w-full h-auto" />
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
                      <button 
                        className="flex items-center space-x-1 text-[#938656] hover:text-[#594C1A]"
                        onClick={(e) => post.id && handleLikeClick(e, post.id)}
                      >
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