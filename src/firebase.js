// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyD0NwMYQawU0r-SnYQlTO-LDYez_mdtOco",
    authDomain: "casaciordas.firebaseapp.com",
    projectId: "casaciordas",
    storageBucket: "casaciordas.firebasestorage.app",
    messagingSenderId: "279505031605",
    appId: "1:279505031605:web:c967eeef0addd2370909fc",
    databaseURL: "https://casaciordas-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const realtimeDB = getDatabase(app);
export const storage = getStorage(app);
