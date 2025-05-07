'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CommunityPost, Comment } from '../services/communityService';
import * as communityService from '../services/communityService';
import { useAuth } from './AuthContext';

interface CommunityContextType {
  posts: CommunityPost[];
  loading: boolean;
  error: string | null;
  selectedPost: CommunityPost | null;
  comments: Comment[];
  fetchPosts: (category?: string, tag?: string, authorId?: string) => Promise<void>;
  fetchPost: (postId: string) => Promise<void>;
  createNewPost: (postData: Omit<CommunityPost, 'id' | 'likes' | 'comments' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateExistingPost: (postId: string, updateData: Partial<Omit<CommunityPost, 'id' | 'createdAt'>>) => Promise<void>;
  deleteExistingPost: (postId: string) => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
  addNewComment: (comment: Omit<Comment, 'id' | 'likes' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  toggleLike: (postId: string) => Promise<void>;
  deletePost: (postId: string, userId: string) => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};

interface CommunityProviderProps {
  children: ReactNode;
}

export const CommunityProvider: React.FC<CommunityProviderProps> = ({ children }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  
  const { user } = useAuth();

  const fetchPosts = useCallback(async (category?: string, tag?: string, authorId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPosts = await communityService.getPosts(
        category as CommunityPost['category'],
        tag,
        authorId
      );
      setPosts(fetchedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPost = useCallback(async (postId: string) => {
    setLoading(true);
    setError(null);
    try {
      const post = await communityService.getPostById(postId);
      if (post) {
        setSelectedPost(post);
      } else {
        setError('Post not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch post');
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewPost = useCallback(async (
    postData: Omit<CommunityPost, 'id' | 'likes' | 'comments' | 'createdAt' | 'updatedAt'>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const postId = await communityService.createPost(postData);
      await fetchPosts(); // Refresh posts list
      return postId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPosts]);

  const updateExistingPost = useCallback(async (
    postId: string,
    updateData: Partial<Omit<CommunityPost, 'id' | 'createdAt'>>
  ) => {
    setLoading(true);
    setError(null);
    try {
      await communityService.updatePost(postId, updateData);
      if (selectedPost?.id === postId) {
        await fetchPost(postId);
      }
      await fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPost, fetchPosts, selectedPost]);

  const deleteExistingPost = useCallback(async (postId: string) => {
    setLoading(true);
    setError(null);
    try {
      await communityService.deletePost(postId);
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }
      await fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPosts, selectedPost]);

  const fetchComments = useCallback(async (postId: string) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedComments = await communityService.getComments(postId);
      setComments(fetchedComments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }, []);

  const addNewComment = useCallback(async (
    comment: Omit<Comment, 'id' | 'likes' | 'createdAt' | 'updatedAt'>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const commentId = await communityService.addComment(comment);
      await fetchComments(comment.postId);
      if (selectedPost?.id === comment.postId) {
        await fetchPost(comment.postId);
      }
      return commentId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchComments, fetchPost, selectedPost]);

  const toggleLike = useCallback(async (postId: string) => {
    if (!user) {
      setError('You must be logged in to like posts');
      return;
    }
    
    setError(null);
    try {
      await communityService.togglePostLike(postId, user.uid);
      if (selectedPost?.id === postId) {
        await fetchPost(postId);
      }
      await fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle like');
    }
  }, [fetchPost, fetchPosts, user, selectedPost]);

  const handleDeletePost = async (postId: string, userId: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!userId) {
        throw new Error('User ID not found');
      }
      await communityService.deletePost(postId, userId);
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete post';
      setError(errorMessage);
      throw error; // Re-throw to handle in the component
    } finally {
      setLoading(false);
    }
  };

  const value = {
    posts,
    loading,
    error,
    selectedPost,
    comments,
    fetchPosts,
    fetchPost,
    createNewPost,
    updateExistingPost,
    deleteExistingPost,
    fetchComments,
    addNewComment,
    toggleLike,
    deletePost: handleDeletePost
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}; 