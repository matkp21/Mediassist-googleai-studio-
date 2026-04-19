// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAnalytics, type Analytics, isSupported } from "firebase/analytics";
import { getVertexAI, getGenerativeModel } from "firebase/vertexai-preview";
// import { getFunctions, type Functions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

let app: FirebaseApp;
if (!getApps().length) {
  // Check if we have a valid config before initializing to prevent build errors
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
  } else {
    // Provide a dummy app for build time if config is missing
    app = initializeApp({ apiKey: "dummy-key-for-build", projectId: "dummy-project" }, "build-dummy");
  }
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);
const firestore: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
// const functions: Functions = getFunctions(app); // Optional: specify region

// Initialize Vertex AI
const vertexAI = getVertexAI(app);

// Helper to quickly get the fast Gemini 1.5 Flash model
const getFlashModel = () => getGenerativeModel(vertexAI, { model: "gemini-1.5-flash" });
const getProModel = () => getGenerativeModel(vertexAI, { model: "gemini-1.5-pro" });

export { app, auth, firestore, storage, analytics, vertexAI, getFlashModel, getProModel /*, functions */ };
