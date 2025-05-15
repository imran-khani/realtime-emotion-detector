import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCcQ1Qhstg9NsTbvO_zL9hrQZAZQp2bQDY",
  authDomain: "emotion-detection-c8e6c.firebaseapp.com",
  projectId: "emotion-detection-c8e6c",
  storageBucket: "emotion-detection-c8e6c.firebasestorage.app",
  messagingSenderId: "1052824105900",
  appId: "1:1052824105900:web:5f8333c89e878bf9fe4009"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;