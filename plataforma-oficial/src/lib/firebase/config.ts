// ===========================================
// 🔥 Firebase Client SDK - Configuración Central
// ===========================================
// Este archivo inicializa Firebase en el CLIENTE (navegador).
// Se usa en componentes React y hooks del lado del cliente.

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

// -------------------------------------------
// Configuración del proyecto Firebase
// Los valores se leen desde las variables de entorno (.env.local)
// -------------------------------------------
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// -------------------------------------------
// Inicialización Singleton
// Next.js puede re-ejecutar este módulo (Hot Reload),
// así que verificamos si ya existe una app antes de crear una nueva.
// -------------------------------------------
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// -------------------------------------------
// Instancias de los servicios Firebase
// -------------------------------------------

/** Firebase Authentication - Para login/registro de usuarios */
const auth: Auth = getAuth(app);

/** Cloud Firestore - Base de datos NoSQL en tiempo real */
const db: Firestore = getFirestore(app);

/** Cloud Storage - Almacenamiento de archivos (PDFs, imágenes, etc.) */
const storage: FirebaseStorage = getStorage(app);

/**
 * Firebase Analytics - Métricas de uso (solo funciona en el navegador)
 * Se inicializa de forma asíncrona porque no está disponible en SSR.
 */
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics };
