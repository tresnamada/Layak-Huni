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
import { setUserRole } from './userService';

const typedAuth: Auth = auth;
const googleProvider = new GoogleAuthProvider();

export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(typedAuth, email, password);
    
    // Create a user document in Firestore with default 'user' role
    try {
      await setUserRole(userCredential.user.uid, 'user', email, userCredential.user.displayName || '');
    } catch (roleError) {
      console.error('Error setting user role:', roleError);
      // We don't want to fail the registration if this fails
      // But we log the error for debugging
    }

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
    
    // Create/update user document for Google sign-in with default 'user' role
    try {
      await setUserRole(
        result.user.uid, 
        'user', 
        result.user.email || '', 
        result.user.displayName || ''
      );
    } catch (roleError) {
      console.error('Error setting user role for Google sign-in:', roleError);
      // We don't want to fail the login if this fails
    }
    
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