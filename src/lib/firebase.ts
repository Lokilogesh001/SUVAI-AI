
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKJX8tF7p7v-5_vu1NpbsVwldthPUX6C4",
  authDomain: "suvai-5870d.firebaseapp.com",
  projectId: "suvai-5870d",
  storageBucket: "suvai-5870d.firebasestorage.app",
  messagingSenderId: "130942979149",
  appId: "1:130942979149:web:fae5436d2cd07e8872a004"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
