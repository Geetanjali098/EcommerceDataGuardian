import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Firebase configuration
// This configuration is for the ECommerce Data Guardian project
const firebaseConfig = {
  apiKey: "AIzaSyAjoV9zv0WkdMMHzRFFTE3kQYsJ_uWJbJs",
  authDomain: "ecommercedataguardian.firebaseapp.com",
  projectId: "ecommercedataguardian",
  storageBucket: "ecommercedataguardian.firebasestorage.app",
  messagingSenderId: "363517889984",
  appId: "1:363517889984:web:5cf3d91a346ea2c26f4c25",
  measurementId: "G-S796Y24VZ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export analytics, auth and provider
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app; // ✅ Export app if needed elsewhere