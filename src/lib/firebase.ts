import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBrZtbiy0nVqHcaihZcVLJEvpqhtqwLTww",
  authDomain: "evenet-managment.firebaseapp.com",
  projectId: "evenet-managment",
  storageBucket: "evenet-managment.firebasestorage.app",
  messagingSenderId: "628138180321",
  appId: "1:628138180321:web:5aaff4b6782265fe0001a0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);