import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc,
  where, 
  getDocs,
  Timestamp
} from 'firebase/firestore';

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Timestamp | null;
  read: boolean;
}

/**
 * Send a message in a consultation chat
 */
export const sendMessage = async (
  consultationId: string, 
  senderId: string, 
  senderName: string, 
  message: string
) => {
  try {
    const messagesRef = collection(db, 'consultations', consultationId, 'messages');
    
    await addDoc(messagesRef, {
      senderId,
      senderName,
      message,
      timestamp: serverTimestamp(),
      read: false
    });
    
    // Update the consultation with the latest message
    const consultationRef = doc(db, 'consultations', consultationId);
    await updateDoc(consultationRef, {
      lastMessage: message,
      lastMessageTime: serverTimestamp(),
      unreadMessages: true
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending message:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send message' 
    };
  }
};

/**
 * Send an admin support message
 */
export const sendAdminSupportMessage = async (
  supportThreadId: string, 
  senderId: string, 
  senderName: string, 
  message: string
) => {
  try {
    const messagesRef = collection(db, 'supportThreads', supportThreadId, 'messages');
    
    await addDoc(messagesRef, {
      senderId,
      senderName,
      message,
      timestamp: serverTimestamp(),
      read: false
    });
    
    // Update the support thread with the latest message
    const supportThreadRef = doc(db, 'supportThreads', supportThreadId);
    await updateDoc(supportThreadRef, {
      lastMessage: message,
      lastMessageTime: serverTimestamp(),
      unreadMessages: true
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending admin support message:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send admin support message' 
    };
  }
};

/**
 * Send a regular user support message (non-admin)
 */
export const sendSupportMessage = async (
  supportThreadId: string, 
  senderId: string, 
  senderName: string, 
  message: string
) => {
  try {
    const messagesRef = collection(db, 'supportThreads', supportThreadId, 'messages');
    
    await addDoc(messagesRef, {
      senderId,
      senderName,
      message,
      timestamp: serverTimestamp(),
      read: false
    });
    
    // Update the support thread with the latest message
    const supportThreadRef = doc(db, 'supportThreads', supportThreadId);
    await updateDoc(supportThreadRef, {
      lastMessage: message,
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
      unreadMessages: true
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending support message:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send support message' 
    };
  }
};

/**
 * Listen to messages in a consultation chat
 */
export const subscribeToMessages = (
  consultationId: string, 
  callback: (messages: ChatMessage[]) => void
) => {
  const messagesRef = collection(db, 'consultations', consultationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp'));
  
  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data() as Omit<ChatMessage, 'id'>
      });
    });
    callback(messages);
  });
};

/**
 * Listen to messages in an admin support thread
 */
export const subscribeToSupportMessages = (
  supportThreadId: string, 
  callback: (messages: ChatMessage[]) => void
) => {
  const messagesRef = collection(db, 'supportThreads', supportThreadId, 'messages');
  const q = query(messagesRef, orderBy('timestamp'));
  
  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data() as Omit<ChatMessage, 'id'>
      });
    });
    callback(messages);
  });
};

/**
 * Mark all messages as read
 */
export const markMessagesAsRead = async (consultationId: string, userId: string) => {
  try {
    const messagesRef = collection(db, 'consultations', consultationId, 'messages');
    const q = query(messagesRef, where('senderId', '!=', userId), where('read', '==', false));
    
    const snapshot = await onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach(async (document) => {
        await updateDoc(doc(db, 'consultations', consultationId, 'messages', document.id), {
          read: true
        });
      });
      
      // Also update the consultation's unreadMessages flag
      updateDoc(doc(db, 'consultations', consultationId), {
        unreadMessages: false
      });
      
      // Unsubscribe after processing
      snapshot();
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark messages as read' 
    };
  }
};

/**
 * Mark all support messages as read
 */
export const markSupportMessagesAsRead = async (supportThreadId: string, userId: string) => {
  try {
    const messagesRef = collection(db, 'supportThreads', supportThreadId, 'messages');
    const q = query(messagesRef, where('senderId', '!=', userId), where('read', '==', false));
    
    const snapshot = await onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach(async (document) => {
        await updateDoc(doc(db, 'supportThreads', supportThreadId, 'messages', document.id), {
          read: true
        });
      });
      
      // Also update the support thread's unreadMessages flag
      updateDoc(doc(db, 'supportThreads', supportThreadId), {
        unreadMessages: false
      });
      
      // Unsubscribe after processing
      snapshot();
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error marking support messages as read:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark support messages as read' 
    };
  }
};

/**
 * Get all messages for a consultation
 */
export const getMessages = async (consultationId: string) => {
  try {
    const messagesCollection = collection(db, 'consultations', consultationId, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));
    
    const querySnapshot = await getDocs(q);
    const messages: ChatMessage[] = [];
    
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data() as Omit<ChatMessage, 'id'>
      } as ChatMessage);
    });
    
    return { 
      success: true, 
      messages 
    };
  } catch (error) {
    console.error('Error getting messages:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to retrieve messages',
      messages: []
    };
  }
};

/**
 * Count unread messages for a user
 */
export const countUnreadMessages = async (consultationId: string, userId: string) => {
  try {
    const messagesCollection = collection(db, 'consultations', consultationId, 'messages');
    const q = query(
      messagesCollection,
      where('read', '==', false),
      where('senderId', '!=', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    return { 
      success: true, 
      count: querySnapshot.size 
    };
  } catch (error) {
    console.error('Error counting unread messages:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to count unread messages',
      count: 0
    };
  }
}; 