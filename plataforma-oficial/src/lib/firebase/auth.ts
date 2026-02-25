// ===========================================
// 🔑 Firebase Authentication - Funciones Helper
// ===========================================
// Contiene las funciones de autenticación más comunes.
// Importar desde aquí en tus componentes React.

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    User,
    UserCredential,
    updateProfile,
} from "firebase/auth";
import { auth } from "./config";

// -------------------------------------------
// Proveedor de Google (para login con Google)
// -------------------------------------------
const googleProvider = new GoogleAuthProvider();

// -------------------------------------------
// Funciones de Autenticación
// -------------------------------------------

/**
 * Registrar un nuevo usuario con email y contraseña.
 * @param email - Email del usuario
 * @param password - Contraseña (mínimo 6 caracteres)
 * @param displayName - Nombre visible del usuario (opcional)
 */
export async function registerWithEmail(
    email: string,
    password: string,
    displayName?: string
): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Si se proporcionó un nombre, actualizar el perfil
    if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
    }

    return userCredential;
}

/**
 * Iniciar sesión con email y contraseña.
 * @param email - Email del usuario registrado
 * @param password - Contraseña del usuario
 */
export async function loginWithEmail(
    email: string,
    password: string
): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Iniciar sesión con Google (abre un popup).
 * El usuario selecciona su cuenta de Google y se autentica automáticamente.
 */
export async function loginWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(auth, googleProvider);
}

/**
 * Cerrar sesión del usuario actual.
 */
export async function logout(): Promise<void> {
    return signOut(auth);
}

/**
 * Observador del estado de autenticación.
 * Se ejecuta cada vez que el usuario inicia/cierra sesión.
 * @param callback - Función que recibe el usuario actual (o null si no hay sesión)
 * @returns Función para dejar de escuchar (unsubscribe)
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const unsubscribe = onAuthChange((user) => {
 *     if (user) {
 *       console.log("Usuario logueado:", user.email);
 *     } else {
 *       console.log("Sin sesión");
 *     }
 *   });
 *   return () => unsubscribe(); // Limpiar al desmontar
 * }, []);
 * ```
 */
export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

/** Re-exportar el tipo User para conveniencia */
export type { User };
