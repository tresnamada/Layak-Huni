// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALZ5_coEBJKe2Qbs0MeW7XHCWluGj42zw",
  authDomain: "siaphuni-8ee48.firebaseapp.com",
  projectId: "siaphuni-8ee48",
  storageBucket: "siaphuni-8ee48.firebasestorage.app",
  messagingSenderId: "121222743559",
  appId: "1:121222743559:web:d950f5ce3f053b62ad4ca2",
  measurementId: "G-YDXQG62EFC"
};
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Taruh Firebasenya Key Disini

// Initialize Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw new Error("Failed to initialize Firebase. Please check your configuration.");
}

export { app, auth, db };