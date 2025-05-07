'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  MessageSquare, 
  Share2, 
  Heart, 
  ArrowLeft,
  Send
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useCommunity } from '@/context/CommunityContext';
import { useAuth } from '@/context/AuthContext';
import { getProfile } from '@/services/profileService';

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { 
    selectedPost,
    comments,
    loading,
    error,
    fetchPost,
    fetchComments,
    addNewComment,
    toggleLike
  } = useCommunity();

  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.postId) {
      fetchPost(params.postId as string);
      fetchComments(params.postId as string);
    }
  }, [params.postId, fetchPost, fetchComments]);

  const handleBack = () => {
    router.back();
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPost || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // Fetch user profile to get the correct name
      const { success, data: profileData } = await getProfile(user.uid);
      const authorName = success && profileData 
        ? `${profileData.firstName} ${profileData.lastName}`.trim()
        : user.displayName || 'Anonymous';

      await addNewComment({
        postId: selectedPost.id!,
        content: newComment.trim(),
        authorId: user.uid,
        authorName: authorName
      });
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!selectedPost?.id) return;
    await toggleLike(selectedPost.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EAF4DE] text-[#594C1A]">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#594C1A]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !selectedPost) {
    return (
      <div className="min-h-screen bg-[#EAF4DE] text-[#594C1A]">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-semibold text-center">
              {error || 'Post not found'}
            </h2>
            <div className="flex justify-center mt-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 px-4 py-2 bg-[#594C1A] text-white rounded-full hover:bg-[#938656] transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Kembali</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAF4DE] text-[#594C1A]">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 mb-6 text-[#594C1A] hover:text-[#938656] transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Kembali ke Komunitas</span>
        </button>

        {/* Post Detail Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#EAF4DE] flex items-center justify-center">
                <User size={24} className="text-[#594C1A]" />
              </div>
              <div>
                <h3 className="font-medium text-[#594C1A]">{selectedPost.authorName}</h3>
                <p className="text-sm text-[#938656]">
                  {selectedPost.createdAt 
                    ? new Date(selectedPost.createdAt.seconds * 1000).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Just now'
                  }
                </p>
              </div>
            </div>

            <h1 className="text-2xl font-serif font-semibold mb-4">{selectedPost.title}</h1>
            <p className="text-[#594C1A]/90 mb-6 whitespace-pre-wrap">{selectedPost.content}</p>

            {selectedPost.imageUrl && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img 
                  src={selectedPost.imageUrl} 
                  alt={selectedPost.title}
                  className="w-full h-auto" 
                />
              </div>
            )}

            {selectedPost.tags && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedPost.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="px-3 py-1 text-sm rounded-full bg-[#EAF4DE] text-[#594C1A]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
              <button 
                onClick={handleLike}
                className="flex items-center space-x-1 text-[#938656] hover:text-[#594C1A]"
              >
                <Heart size={20} className={selectedPost.likes > 0 ? 'fill-current' : ''} />
                <span>{selectedPost.likes}</span>
              </button>
              <div className="flex items-center space-x-1 text-[#938656]">
                <MessageSquare size={20} />
                <span>{selectedPost.comments}</span>
              </div>
              <button className="flex items-center space-x-1 text-[#938656] hover:text-[#594C1A]">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Komentar ({comments.length})</h2>

            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#EAF4DE] flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-[#594C1A]" />
                  </div>
                  <div className="flex-grow">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Tulis komentar..."
                      className="w-full px-4 py-2 border border-[#EAF4DE] rounded-lg focus:ring-2 focus:ring-[#594C1A] focus:border-transparent resize-none"
                      rows={3}
                      required
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#594C1A] text-white rounded-full hover:bg-[#938656] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={16} />
                        <span>Kirim</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-[#EAF4DE] rounded-lg p-4 mb-8 text-center">
                <p className="text-[#594C1A] mb-2">Login untuk memberikan komentar</p>
                <button
                  onClick={() => router.push('/Login')}
                  className="px-4 py-2 bg-[#594C1A] text-white rounded-full hover:bg-[#938656] transition-colors"
                >
                  Login
                </button>
              </div>
            )}

            {/* Comments List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex space-x-4"
                >
                  <div className="w-10 h-10 rounded-full bg-[#EAF4DE] flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-[#594C1A]" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-[#594C1A]">{comment.authorName}</h3>
                      <p className="text-sm text-[#938656]">
                        {comment.createdAt
                          ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Just now'
                        }
                      </p>
                    </div>
                    <p className="text-[#594C1A]/90 whitespace-pre-wrap">{comment.content}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <button className="flex items-center space-x-1 text-[#938656] hover:text-[#594C1A]">
                        <Heart size={16} />
                        <span>{comment.likes}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {comments.length === 0 && (
                <div className="text-center text-[#938656] py-8">
                  Belum ada komentar. Jadilah yang pertama berkomentar!
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
} 