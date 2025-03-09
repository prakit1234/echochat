import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD7QGKC8bkgcoyYOiWtInZQvjcb5Fkc6LE",
  authDomain: "echochat-94e60.firebaseapp.com",
  projectId: "echochat-94e60",
  storageBucket: "echochat-94e60.firebasestorage.app",
  messagingSenderId: "414833243301",
  appId: "1:414833243301:web:7d0197d7b39befcfb4c94c",
  measurementId: "G-EBLYC3V08Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const provider = new GoogleAuthProvider();

export {
  auth,
  provider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  database
};
