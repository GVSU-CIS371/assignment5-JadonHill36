import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDhL7QUys_0IEJu34XpIUPHXYIu-3txVWk",
  authDomain: "assignment4-fe6b5.firebaseapp.com",
  projectId: "assignment4-fe6b5",
  storageBucket: "assignment4-fe6b5.firebasestorage.app",
  messagingSenderId: "629674333685",
  appId: "1:629674333685:web:7ddff1424678353fa9bcbc"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

