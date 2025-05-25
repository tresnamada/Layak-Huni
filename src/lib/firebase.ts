import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Export Firestore methods
export const getCollection = (collectionName: string) => collection(db, collectionName);
export const getDocument = (collectionName: string, docId: string) => doc(db, collectionName, docId);
export const getDocumentData = async (collectionName: string, docId: string) => {
  const docRef = getDocument(collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};
export const getCollectionData = async (collectionName: string) => {
  const querySnapshot = await getDocs(getCollection(collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
export const addDocument = async (collectionName: string, data: any) => {
  return await addDoc(getCollection(collectionName), data);
};
export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  const docRef = getDocument(collectionName, docId);
  return await updateDoc(docRef, data);
};
export const deleteDocument = async (collectionName: string, docId: string) => {
  const docRef = getDocument(collectionName, docId);
  return await deleteDoc(docRef);
};
export const queryCollection = (collectionName: string, field: string, operator: any, value: any) => {
  const collectionRef = getCollection(collectionName);
  return query(collectionRef, where(field, operator, value));
};

export { db };
export default app; 