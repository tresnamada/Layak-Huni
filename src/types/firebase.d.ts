import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';

declare global {
  interface Window {
    fbApp?: FirebaseApp;
  }
}

declare module '@/firebase' {
  export const app: FirebaseApp;
  export const auth: Auth;
  export const db: Firestore;
  export const storage: FirebaseStorage;
} 