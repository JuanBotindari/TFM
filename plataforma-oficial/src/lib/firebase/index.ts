// ===========================================
// 🔥 Firebase - Punto de Entrada Central
// ===========================================
// Importa todo lo que necesites desde aquí:
//
// import { auth, db, storage } from "@/lib/firebase";
// import { loginWithGoogle, logout } from "@/lib/firebase/auth";
// import { createDocument, getDocument } from "@/lib/firebase/firestore";
// import { uploadFile, listFiles } from "@/lib/firebase/storage";

// Configuración y servicios base
export { app, auth, db, storage, analytics } from "./config";

// Funciones de autenticación
export {
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    onAuthChange,
} from "./auth";
export type { User } from "./auth";

// Funciones de Firestore (base de datos)
export {
    createDocument,
    setDocument,
    getDocument,
    getCollection,
    queryDocuments,
    updateDocument,
    removeDocument,
    listenCollection,
} from "./firestore";
export type { FirestoreDocument } from "./firestore";

// Funciones de Storage (archivos)
export {
    uploadFile,
    uploadFileWithProgress,
    getFileURL,
    deleteFile,
    listFiles,
} from "./storage";
export type { StorageFile, UploadProgress } from "./storage";
