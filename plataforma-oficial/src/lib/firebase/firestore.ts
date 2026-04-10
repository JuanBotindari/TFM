// ===========================================
// 📦 Cloud Firestore - Funciones Helper
// ===========================================
// Operaciones CRUD genéricas para Firestore.
// Todas las funciones están tipadas con generics para reutilización.

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    DocumentData,
    QueryConstraint,
    WhereFilterOp,
    OrderByDirection,
    serverTimestamp,
    Timestamp,
    setDoc,
} from "firebase/firestore";
import { db } from "./config";

// -------------------------------------------
// Tipos auxiliares
// -------------------------------------------
export interface FirestoreDocument {
    id: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

// -------------------------------------------
// CREAR documentos
// -------------------------------------------

/**
 * Crear un nuevo documento con ID automático.
 * @param collectionName - Nombre de la colección (ej: "chats", "users")
 * @param data - Datos del documento
 * @returns ID del documento creado
 *
 * @example
 * ```ts
 * const chatId = await createDocument("chats", {
 *   userId: "abc123",
 *   message: "Hola mundo",
 * });
 * ```
 */
export async function createDocument<T extends DocumentData>(
    collectionName: string,
    data: T
): Promise<string> {
    const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Crear o sobreescribir un documento con un ID específico.
 * @param collectionName - Nombre de la colección
 * @param documentId - ID del documento
 * @param data - Datos del documento
 */
export async function setDocument<T extends DocumentData>(
    collectionName: string,
    documentId: string,
    data: T
): Promise<void> {
    await setDoc(doc(db, collectionName, documentId), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

// -------------------------------------------
// LEER documentos
// -------------------------------------------

/**
 * Obtener un documento por su ID.
 * @param collectionName - Nombre de la colección
 * @param documentId - ID del documento
 * @returns El documento con sus datos, o null si no existe
 */
export async function getDocument<T>(
    collectionName: string,
    documentId: string
): Promise<(T & FirestoreDocument) | null> {
    const docSnap = await getDoc(doc(db, collectionName, documentId));

    if (!docSnap.exists()) return null;

    return {
        id: docSnap.id,
        ...docSnap.data(),
    } as T & FirestoreDocument;
}

/**
 * Obtener todos los documentos de una colección.
 * @param collectionName - Nombre de la colección
 * @returns Array de documentos
 */
export async function getCollection<T>(
    collectionName: string
): Promise<(T & FirestoreDocument)[]> {
    const querySnapshot = await getDocs(collection(db, collectionName));

    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as (T & FirestoreDocument)[];
}

/**
 * Consultar documentos con filtros.
 * @param collectionName - Nombre de la colección
 * @param filters - Array de filtros [campo, operador, valor]
 * @param sortBy - Campo para ordenar (opcional)
 * @param sortDirection - Dirección del orden: "asc" o "desc" (opcional)
 * @param maxResults - Máximo de resultados (opcional)
 *
 * @example
 * ```ts
 * // Obtener los últimos 10 chats de un usuario
 * const chats = await queryDocuments(
 *   "chats",
 *   [["userId", "==", "abc123"]],
 *   "createdAt",
 *   "desc",
 *   10
 * );
 * ```
 */
export async function queryDocuments<T>(
    collectionName: string,
    filters: [string, WhereFilterOp, unknown][],
    sortBy?: string,
    sortDirection?: OrderByDirection,
    maxResults?: number
): Promise<(T & FirestoreDocument)[]> {
    const constraints: QueryConstraint[] = [];

    // Agregar filtros WHERE
    for (const [field, operator, value] of filters) {
        constraints.push(where(field, operator, value));
    }

    // Agregar ORDER BY
    if (sortBy) {
        constraints.push(orderBy(sortBy, sortDirection || "asc"));
    }

    // Agregar LIMIT
    if (maxResults) {
        constraints.push(limit(maxResults));
    }

    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as (T & FirestoreDocument)[];
}

// -------------------------------------------
// ACTUALIZAR documentos
// -------------------------------------------

/**
 * Actualizar campos específicos de un documento.
 * Solo actualiza los campos proporcionados, no sobreescribe el documento completo.
 * @param collectionName - Nombre de la colección
 * @param documentId - ID del documento
 * @param data - Campos a actualizar
 */
export async function updateDocument(
    collectionName: string,
    documentId: string,
    data: Partial<DocumentData>
): Promise<void> {
    await updateDoc(doc(db, collectionName, documentId), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

// -------------------------------------------
// ELIMINAR documentos
// -------------------------------------------

/**
 * Eliminar un documento por su ID.
 * @param collectionName - Nombre de la colección
 * @param documentId - ID del documento
 */
export async function removeDocument(
    collectionName: string,
    documentId: string
): Promise<void> {
    await deleteDoc(doc(db, collectionName, documentId));
}

// -------------------------------------------
// LISTENERS EN TIEMPO REAL
// -------------------------------------------

/**
 * Escuchar cambios en tiempo real de una colección.
 * @param collectionName - Nombre de la colección
 * @param callback - Función que recibe los documentos actualizados
 * @param filters - Filtros opcionales
 * @returns Función para dejar de escuchar (unsubscribe)
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const unsubscribe = listenCollection("chats", (chats) => {
 *     setMessages(chats);
 *   }, [["userId", "==", currentUser.uid]]);
 *
 *   return () => unsubscribe();
 * }, []);
 * ```
 */
export function listenCollection<T>(
    collectionName: string,
    callback: (docs: (T & FirestoreDocument)[]) => void,
    filters?: [string, WhereFilterOp, unknown][]
) {
    const constraints: QueryConstraint[] = [];

    if (filters) {
        for (const [field, operator, value] of filters) {
            constraints.push(where(field, operator, value));
        }
    }

    const q = query(collection(db, collectionName), ...constraints);

    return onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as (T & FirestoreDocument)[];

        callback(docs);
    });
}
