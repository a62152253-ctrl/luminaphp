import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
         signInWithEmailAndPassword, createUserWithEmailAndPassword,
         sendPasswordResetEmail, updateProfile,
         RecaptchaVerifier, signInWithPhoneNumber,
         PhoneAuthProvider, EmailAuthProvider, linkWithCredential }
  from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js';
import { getFirestore, collection, getDocs, getDoc, doc, addDoc, setDoc, query, where, orderBy, updateDoc, deleteDoc, writeBatch, limit, serverTimestamp, onSnapshot, increment } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyAPkAJw5gJnqlVCWQ0_c-S8xgSRxSVAm_c",
  authDomain: "luminaphp-88b38.firebaseapp.com",
  projectId: "luminaphp-88b38",
  storageBucket: "luminaphp-88b38.firebasestorage.app",
  messagingSenderId: "325253699769",
  appId: "1:325253699769:web:0478032290e56f394b2368",
  measurementId: "G-VL6BW0Y4GZ"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
         signInWithEmailAndPassword, createUserWithEmailAndPassword,
         sendPasswordResetEmail, updateProfile,
         RecaptchaVerifier, signInWithPhoneNumber,
         PhoneAuthProvider, EmailAuthProvider, linkWithCredential,
         collection, getDocs, getDoc, doc, addDoc, setDoc, query, where, orderBy, updateDoc,
         deleteDoc, writeBatch, limit, serverTimestamp, onSnapshot, increment,
         storageRef, uploadBytes, getDownloadURL };
