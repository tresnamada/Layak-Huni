import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

export interface SupportThread {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  adminId?: string;
  adminName?: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  unreadMessages?: boolean;
  designId?: string; // Optional: if related to a specific design
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Create a new support thread
 */
export const createSupportThread = async (
  userId: string, 
  userName: string,
  userEmail: string,
  subject: string,
  initialMessage: string,
  designId?: string
) => {
  try {
    // Create the support thread document
    const supportThreadsRef = collection(db, 'supportThreads');
    
    const threadData: Omit<SupportThread, 'id'> = {
      userId,
      userName,
      userEmail,
      subject,
      status: 'open',
      priority: 'medium',
      unreadMessages: true,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      lastMessage: initialMessage,
      lastMessageTime: serverTimestamp() as Timestamp
    };
    
    // Add designId if provided
    if (designId) {
      threadData.designId = designId;
    }
    
    const threadRef = await addDoc(supportThreadsRef, threadData);
    const threadId = threadRef.id;
    
    // Add the initial message
    const messagesRef = collection(db, 'supportThreads', threadId, 'messages');
    await addDoc(messagesRef, {
      senderId: userId,
      senderName: userName,
      message: initialMessage,
      timestamp: serverTimestamp(),
      read: false
    });
    
    return { 
      success: true, 
      threadId 
    };
  } catch (error) {
    console.error('Error creating support thread:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create support thread' 
    };
  }
};

/**
 * Get all support threads for a user
 */
export const getUserSupportThreads = async (userId: string) => {
  try {
    const threadsRef = collection(db, 'supportThreads');
    const q = query(
      threadsRef, 
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const threads: SupportThread[] = [];
    
    querySnapshot.forEach((doc) => {
      threads.push({
        id: doc.id,
        ...doc.data() as Omit<SupportThread, 'id'>
      });
    });
    
    return { 
      success: true, 
      threads 
    };
  } catch (error) {
    console.error('Error getting user support threads:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get user support threads',
      threads: []
    };
  }
};

/**
 * Get all open support threads for admins
 */
export const getAllOpenSupportThreads = async () => {
  try {
    const threadsRef = collection(db, 'supportThreads');
    const q = query(
      threadsRef, 
      where('status', 'in', ['open', 'in-progress']),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const threads: SupportThread[] = [];
    
    querySnapshot.forEach((doc) => {
      threads.push({
        id: doc.id,
        ...doc.data() as Omit<SupportThread, 'id'>
      });
    });
    
    return { 
      success: true, 
      threads 
    };
  } catch (error) {
    console.error('Error getting open support threads:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get open support threads',
      threads: []
    };
  }
};

/**
 * Get a specific support thread
 */
export const getSupportThread = async (threadId: string) => {
  try {
    const threadRef = doc(db, 'supportThreads', threadId);
    const docSnap = await getDoc(threadRef);
    
    if (docSnap.exists()) {
      const thread = {
        id: docSnap.id,
        ...docSnap.data()
      } as SupportThread;
      
      return { 
        success: true, 
        thread 
      };
    } else {
      return { 
        success: false, 
        error: 'Support thread not found' 
      };
    }
  } catch (error) {
    console.error('Error getting support thread:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get support thread' 
    };
  }
};

/**
 * Update support thread status
 */
export const updateSupportThreadStatus = async (
  threadId: string, 
  status: 'open' | 'in-progress' | 'closed',
  adminId?: string,
  adminName?: string
) => {
  try {
    const threadRef = doc(db, 'supportThreads', threadId);
    
    const updateData: Record<string, any> = {
      status,
      updatedAt: serverTimestamp()
    };
    
    // If an admin is now assigned to this thread, update admin info
    if (adminId && adminName) {
      updateData.adminId = adminId;
      updateData.adminName = adminName;
    }
    
    await addDoc(collection(db, 'supportThreads', threadId, 'statusHistory'), {
      status,
      updatedBy: adminId || 'system',
      updatedByName: adminName || 'System',
      timestamp: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating support thread status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update support thread status' 
    };
  }
};

/**
 * Update support thread priority
 */
export const updateSupportThreadPriority = async (
  threadId: string, 
  priority: 'low' | 'medium' | 'high'
) => {
  try {
    const threadRef = doc(db, 'supportThreads', threadId);
    
    await addDoc(collection(db, 'supportThreads', threadId, 'statusHistory'), {
      priority,
      updatedBy: 'admin', // This would typically be the admin's ID
      timestamp: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating support thread priority:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update support thread priority' 
    };
  }
};

/**
 * Close a support thread
 */
export const closeSupportThread = async (threadId: string, closedBy: string, closedByName: string) => {
  try {
    const threadRef = doc(db, 'supportThreads', threadId);
    
    await addDoc(collection(db, 'supportThreads', threadId, 'statusHistory'), {
      status: 'closed',
      updatedBy: closedBy,
      updatedByName: closedByName,
      timestamp: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error closing support thread:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to close support thread' 
    };
  }
}; 