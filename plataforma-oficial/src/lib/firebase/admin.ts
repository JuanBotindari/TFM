// ===========================================
// 🔐 Firebase Admin SDK - Configuración del Servidor
// ===========================================
// Este archivo inicializa Firebase Admin para el SERVIDOR.
// Se usa en: API Routes, Server Actions, Server Components.
// NUNCA importar este archivo en componentes del cliente ("use client").

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

// -------------------------------------------
// Inicialización del Admin SDK (Singleton)
// -------------------------------------------
function getAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    return initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            // La private key viene con \n escapados, hay que reemplazarlos
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
}

const adminApp: App = getAdminApp();

/** Admin Auth - Verificar tokens, crear usuarios, asignar roles */
const adminAuth: Auth = getAuth(adminApp);

/** Admin Firestore - Acceso completo a la base de datos sin restricciones */
const adminDb: Firestore = getFirestore(adminApp);

/** Admin Storage - Acceso completo al almacenamiento */
const adminStorage: Storage = getStorage(adminApp);

export { adminApp, adminAuth, adminDb, adminStorage };
