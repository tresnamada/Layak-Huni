import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  AuthError,
  Auth,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase';

const typedAuth: Auth = auth;
const googleProvider = new GoogleAuthProvider();

export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(typedAuth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { user: null, error: authError.message };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(typedAuth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { user: null, error: authError.message };
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(typedAuth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { user: null, error: authError.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(typedAuth);
    return { error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { error: authError.message };
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(typedAuth, callback);
}; 