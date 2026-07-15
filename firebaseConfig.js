// src/firebaseConfig.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAFjRZzfMMiatgjUUjs3IzDsJNflhtJkS4",
  authDomain: "crownbound-8d3f1.firebaseapp.com",
  projectId: "crownbound-8d3f1",
  storageBucket: "crownbound-8d3f1.appspot.com",
  messagingSenderId: "104416414355",
  appId: "1:104416414355:web:9bd5c4fc9d56628bda5b66",
  databaseURL: "https://crownbound-8d3f1-default-rtdb.firebaseio.com",
};

// Initialize Firebase only once
let app = null;
let db = null;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  }
  db = getFirestore();
} catch (e) {
  console.warn("⚠️ Firebase init failed:", e?.message || e);
  app = null;
  db = null;
}

export { app, db };
