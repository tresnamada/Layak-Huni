import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';

// Add image validation and conversion functions
const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB in bytes

export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_IMAGE_SIZE) {
      reject(new Error('Image size must be less than 1MB'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
    reader.readAsDataURL(file);
  });
};

export interface CommunityPost {
  id?: string;
  title: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  authorName: string;
  category: 'discussion' | 'collaboration' | 'workshop' | 'general';
  tags: string[];
  likes: number;
  comments: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Comment {
  id?: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  likes: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Create a new community post with optional image
 */
export const createPost = async (
  postData: Omit<CommunityPost, 'id' | 'likes' | 'comments' | 'createdAt' | 'updatedAt'>,
): Promise<string> => {
  try {
    let imageUrl = null;
    if (postData.imageUrl) {
      try {
        imageUrl = postData.imageUrl;
      } catch (error) {
        throw new Error('Image processing failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }

    const postRef = await addDoc(collection(db, 'communityPosts'), {
      ...postData,
      imageUrl,
      likes: 0,
      comments: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return postRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

/**
 * Get all community posts with optional filtering
 */
export const getPosts = async (
  category?: CommunityPost['category'],
  tag?: string,
  authorId?: string
): Promise<CommunityPost[]> => {
  try {
    let postsQuery = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'));

    if (category) {
      postsQuery = query(postsQuery, where('category', '==', category));
    }
    if (tag) {
      postsQuery = query(postsQuery, where('tags', 'array-contains', tag));
    }
    if (authorId) {
      postsQuery = query(postsQuery, where('authorId', '==', authorId));
    }

    const snapshot = await getDocs(postsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CommunityPost));
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

/**
 * Get a single post by ID
 */
export const getPostById = async (postId: string): Promise<CommunityPost | null> => {
  try {
    const docRef = doc(db, 'communityPosts', postId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as CommunityPost;
    }
    return null;
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
};

/**
 * Update a community post
 */
export const updatePost = async (
  postId: string, 
  updateData: Partial<Omit<CommunityPost, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, 'communityPosts', postId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

/**
 * Delete a community post and its associated likes and comments
 */
export const deletePost = async (postId: string, userId: string): Promise<void> => {
  try {
    // Get the post first to check ownership
    const postRef = doc(db, 'communityPosts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    // Check if the user is the post owner
    if (postData.authorId !== userId) {
      console.log('Post author:', postData.authorId, 'User trying to delete:', userId); // Debug log
      throw new Error('Unauthorized: You can only delete your own posts');
    }

    // Delete all comments for this post
    const commentsQuery = query(collection(db, 'comments'), where('postId', '==', postId));
    const commentsSnapshot = await getDocs(commentsQuery);
    const commentDeletions = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    
    // Delete all likes for this post
    const likesQuery = query(collection(db, 'postLikes'), where('postId', '==', postId));
    const likesSnapshot = await getDocs(likesQuery);
    const likeDeletions = likesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    
    // Wait for all deletions to complete
    await Promise.all([...commentDeletions, ...likeDeletions]);
    
    // Finally delete the post
    await deleteDoc(postRef);
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

/**
 * Add a comment to a post
 */
export const addComment = async (
  comment: Omit<Comment, 'id' | 'likes' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    // Add the comment
    const commentRef = await addDoc(collection(db, 'comments'), {
      ...comment,
      likes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update the post's comment count
    const postRef = doc(db, 'communityPosts', comment.postId);
    const postDoc = await getDoc(postRef);
    if (postDoc.exists()) {
      await updateDoc(postRef, {
        comments: (postDoc.data().comments || 0) + 1
      });
    }

    return commentRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

/**
 * Get comments for a post
 */
export const getComments = async (postId: string): Promise<Comment[]> => {
  try {
    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(commentsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Comment));
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

/**
 * Like or unlike a post
 */
export const togglePostLike = async (postId: string, userId: string): Promise<void> => {
  try {
    const likesCollection = collection(db, 'postLikes');
    const likeId = `${postId}_${userId}`;
    const likeRef = doc(db, 'postLikes', likeId);
    const postRef = doc(db, 'communityPosts', postId);
    
    const likeDoc = await getDoc(likeRef);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    if (likeDoc.exists()) {
      // Unlike
      await deleteDoc(likeRef);
      await updateDoc(postRef, {
        likes: Math.max((postDoc.data().likes || 0) - 1, 0)
      });
    } else {
      // Like
      await setDoc(likeRef, {
        postId,
        userId,
        createdAt: serverTimestamp()
      });
      await updateDoc(postRef, {
        likes: (postDoc.data().likes || 0) + 1
      });
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    throw error;
  }
}; 