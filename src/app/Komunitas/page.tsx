  "use client"
  import { useState, useEffect, useRef } from 'react';
  import { motion, AnimatePresence } from 'framer-motion';
  import { MessageSquare, Share2, User, PlusCircle, Grid, X, Trash2, Image as ImageIcon, Send, MessageCircle, Bookmark } from 'lucide-react';
  import { useRouter } from 'next/navigation';
  import Navbar from '@/components/Navbar';
  import { useCommunity } from '@/context/CommunityContext';
  import { useAuth } from '@/context/AuthContext';
  import { CommunityPost, convertImageToBase64 } from '@/services/communityService';
  import { getProfile } from '@/services/profileService';
  import { doc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp, deleteDoc, setDoc } from 'firebase/firestore';
  import { db } from '@/lib/firebase';
  import Image from 'next/image';

  interface Comment {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: Timestamp;
  }

  interface NewPostForm {
    title: string;
    content: string;
    tags: string;
    category: 'discussion' | 'collaboration' | 'workshop' | 'general';
    image?: File;
  }

  type ViewMode = 'all' | 'discussion' | 'collaboration' | 'workshop' | 'general' | 'saved';

  export default function KomunitasDesainInterior() {
    const [activeTab, setActiveTab] = useState<string>('trending');
    const [viewMode, setViewMode] = useState<ViewMode>('all');
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
    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [savedPosts, setSavedPosts] = useState<string[]>([]);

    const router = useRouter();
    const { user } = useAuth();
    const { 
      posts, 
      loading, 
      fetchPosts, 
      createNewPost,
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

    useEffect(() => {
      // Load saved posts when user is authenticated
      if (user) {
        const loadSavedPosts = async () => {
          try {
            const savedRef = collection(db, 'users', user.uid, 'savedPosts');
            const unsubscribe = onSnapshot(savedRef, (snapshot) => {
              const savedIds: string[] = [];
              snapshot.forEach((doc) => {
                savedIds.push(doc.id);
              });
              setSavedPosts(savedIds);
            });
            return unsubscribe;
          } catch (err) {
            console.error('Error loading saved posts:', err);
          }
        };
        loadSavedPosts();
      }
    }, [user]);

    const handlePostClick = (postId: string) => {
      setExpandedPost(expandedPost === postId ? null : postId);
      if (expandedPost !== postId) {
        // Load comments when expanding a post
        loadComments(postId);
      }
    };

    const loadComments = async (postId: string) => {
      try {
        const postRef = doc(db, 'posts', postId);
        const commentsRef = collection(postRef, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const commentsList: Comment[] = [];
          snapshot.forEach((doc) => {
            commentsList.push({
              id: doc.id,
              ...doc.data()
            } as Comment);
          });
          setComments(prev => ({
            ...prev,
            [postId]: commentsList
          }));
        });

        return unsubscribe;
      } catch (err) {
        console.error('Error loading comments:', err);
      }
    };

    const handleCommentSubmit = async (e: React.FormEvent, postId: string) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!user || !newComment.trim()) return;

      setCommentLoading(true);
      try {
        const postRef = doc(db, 'posts', postId);
        const commentsRef = collection(postRef, 'comments');
        
        // Get user's profile to use their full name
        const { success, data: profileData } = await getProfile(user.uid);
        const authorName = success && profileData 
          ? `${profileData.firstName} ${profileData.lastName}`.trim()
          : user.displayName || 'Anonymous';

        await addDoc(commentsRef, {
          content: newComment.trim(),
          authorId: user.uid,
          authorName,
          createdAt: serverTimestamp()
        });

        setNewComment('');
      } catch (err) {
        console.error('Error adding comment:', err);
      } finally {
        setCommentLoading(false);
      }
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
      } catch (err) {
        console.error('Error processing image:', err);
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
          } catch (err) {
            console.error('Error converting image:', err);
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
      } catch (err) {
        console.error('Error creating post:', err);
        if (err instanceof Error && err.message.includes('Image size')) {
          setImageError(err.message);
        }
      }
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

    const handleShareClick = (e: React.MouseEvent, postId: string) => {
      e.stopPropagation();
      const url = `${window.location.origin}/Komunitas/diskusi/${postId}`;
      setShareUrl(url);
      setShowShareModal(true);
    };

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link berhasil disalin!');
      } catch (err) {
        console.error('Failed to copy:', err);
        alert('Gagal menyalin link');
      }
    };

    const toggleSavePost = async (postId: string) => {
      if (!user) {
        router.push('/Login');
        return;
      }

      try {
        const savedRef = doc(db, 'users', user.uid, 'savedPosts', postId);
        if (savedPosts.includes(postId)) {
          await deleteDoc(savedRef);
        } else {
          await setDoc(savedRef, { savedAt: serverTimestamp() });
        }
      } catch (err) {
        console.error('Error toggling saved post:', err);
      }
    };

    const filteredPosts = posts.filter(post => {
      if (!post.id) return false;
      if (viewMode === 'all') return true;
      if (viewMode === 'saved') return savedPosts.includes(post.id);
      return post.category === viewMode;
    });

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
          <div className="flex flex-col md:flex-row gap-6 md:mt-20">
            {/* Sidebar */}
            <div className="md:w-1/4">
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex items-center space-x-3 mb-6">
                  <User size={20} className="text-[#594C1A]" />
                  <h2 className="text-lg font-medium font-jakarta">Komunitas</h2>
                </div>
                
                <div className="space-y-3 font-jakarta">
                  <button 
                    onClick={() => setViewMode('all')}
                    className={`flex items-center space-x-3 w-full py-2 px-3 rounded-lg transition-all ${
                      viewMode === 'all' ? 'bg-[#EAF4DE] text-[#594C1A] font-medium' : 'hover:bg-[#EAF4DE]'
                    }`}
                  >
                    <Grid size={18} className="text-[#938656]" />
                    <span>Semua Postingan</span>
                  </button>
                  <button 
                    onClick={() => setViewMode('discussion')}
                    className={`flex items-center space-x-3 w-full py-2 px-3 rounded-lg transition-all ${
                      viewMode === 'discussion' ? 'bg-[#EAF4DE] text-[#594C1A] font-medium' : 'hover:bg-[#EAF4DE]'
                    }`}
                  >
                    <MessageSquare size={18} className="text-[#938656]" />
                    <span>Diskusi</span>
                  </button>
                  {user && (
                    <button 
                      onClick={() => setViewMode('saved')}
                      className={`flex items-center space-x-3 w-full py-2 px-3 rounded-lg transition-all ${
                        viewMode === 'saved' ? 'bg-[#EAF4DE] text-[#594C1A] font-medium' : 'hover:bg-[#EAF4DE]'
                      }`}
                    >
                      <Bookmark size={18} className="text-[#938656]" />
                      <span>Disimpan</span>
                    </button>
                  )}
                </div>
                
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-[#938656] mb-3 font-jakarta">Kategori</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setViewMode('collaboration')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                        viewMode === 'collaboration' ? 'bg-[#EAF4DE] text-[#594C1A] font-medium' : 'hover:bg-[#EAF4DE]'
                      }`}
                    >
                      Kolaborasi
                    </button>
                    <button 
                      onClick={() => setViewMode('workshop')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                        viewMode === 'workshop' ? 'bg-[#EAF4DE] text-[#594C1A] font-medium' : 'hover:bg-[#EAF4DE]'
                      }`}
                    >
                      Workshop
                    </button>
                    <button 
                      onClick={() => setViewMode('general')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                        viewMode === 'general' ? 'bg-[#EAF4DE] text-[#594C1A] font-medium' : 'hover:bg-[#EAF4DE]'
                      }`}
                    >
                      Umum
                    </button>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-[#938656] mb-3 font-jakarta">Tag Populer</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(posts.flatMap(post => post.tags))).slice(0, 5).map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          // Filter posts by tag
                          const postsWithTag = posts.filter(post => post.tags.includes(tag));
                          if (postsWithTag.length > 0) {
                            setViewMode('all');
                            // You might want to add a tag filter state to show only posts with this tag
                          }
                        }}
                        className="px-3 py-1 text-xs rounded-full bg-[#EAF4DE] text-[#594C1A] hover:bg-[#594C1A] hover:text-white transition-colors"
                      >
                        #{tag}
                      </button>
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
                          <Image
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
                {filteredPosts.map((post: CommunityPost) => (
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
                          <Image src={post.imageUrl} alt={post.title} className="w-full h-auto" />
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
                          onClick={(e) => {
                            e.stopPropagation();
                            if (post.id) {
                              handlePostClick(post.id);
                            }
                          }}
                        >
                          <MessageCircle size={16} />
                          <span>{post.id ? (comments[post.id]?.length || 0) : 0}</span>
                        </button>
                        <button 
                          className="flex items-center space-x-1 text-[#938656] hover:text-[#594C1A]"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (post.id) {
                              handleShareClick(e, post.id);
                            }
                          }}
                        >
                          <Share2 size={16} />
                          <span>Bagikan</span>
                        </button>
                        {user && post.id && (
                          <button 
                            className={`flex items-center space-x-1 ${
                              savedPosts.includes(post.id) ? 'text-[#594C1A]' : 'text-[#938656] hover:text-[#594C1A]'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (post.id) {
                                toggleSavePost(post.id);
                              }
                            }}
                          >
                            <Bookmark size={16} fill={savedPosts.includes(post.id) ? 'currentColor' : 'none'} />
                            <span>Simpan</span>
                          </button>
                        )}
                      </div>

                      {/* Comments Section */}
                      {expandedPost === post.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100" onClick={e => e.stopPropagation()}>
                          <h4 className="text-sm font-medium text-[#594C1A] mb-4">Komentar</h4>
                          
                          {/* Comment Form */}
                          {user && (
                            <form onSubmit={(e) => post.id && handleCommentSubmit(e, post.id)} className="mb-4">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  placeholder="Tulis komentar..."
                                  className="flex-1 px-4 py-2 border border-[#EAF4DE] rounded-lg focus:ring-2 focus:ring-[#594C1A] focus:border-transparent"
                                />
                                <button
                                  type="submit"
                                  disabled={commentLoading || !newComment.trim()}
                                  className="px-4 py-2 bg-[#594C1A] text-white rounded-lg hover:bg-[#938656] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {commentLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Send size={20} />
                                  )}
                                </button>
                              </div>
                            </form>
                          )}

                          {/* Comments List */}
                          <div className="space-y-4">
                            {comments[post.id]?.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#EAF4DE] flex items-center justify-center flex-shrink-0">
                                  <User size={16} className="text-[#594C1A]" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm text-[#594C1A]">{comment.authorName}</span>
                                    <span className="text-xs text-[#938656]">
                                      {comment.createdAt?.toDate()?.toLocaleDateString() || 'Just now'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-[#594C1A]/90">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                            {(!comments[post.id] || comments[post.id].length === 0) && (
                              <p className="text-sm text-[#938656] text-center py-4">
                                Belum ada komentar. Jadilah yang pertama berkomentar!
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </main>

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowShareModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#594C1A]">Bagikan Postingan</h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="mb-4">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="w-full px-4 py-2 border border-[#EAF4DE] rounded-lg bg-gray-50"
                  />
                </div>
                
                <button
                  onClick={copyToClipboard}
                  className="w-full px-4 py-2 bg-[#594C1A] text-white rounded-lg hover:bg-[#938656] transition-colors"
                >
                  Salin Link
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }