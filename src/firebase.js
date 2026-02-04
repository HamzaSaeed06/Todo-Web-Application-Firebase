// Firebase app initialize
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

// ================= AUTHENTICATION =================
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithPopup,
  linkWithCredential, 
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// ================= FIRESTORE DATABASE =================
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBYkSH5ZbdWH3p6C4G2LJOw9J5KkEDzeig",
  authDomain: "todo-web-application-7b804.firebaseapp.com",
  projectId: "todo-web-application-7b804",
  storageBucket: "todo-web-application-7b804.firebasestorage.app",
  messagingSenderId: "304239157285",
  appId: "1:304239157285:web:169d1dde7634693ab5dfcc",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Exporting everything
export {
  auth,
  db,
  GoogleAuthProvider,
  GithubAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithPopup,
  linkWithCredential, 
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  getFirestore,
  onSnapshot
};