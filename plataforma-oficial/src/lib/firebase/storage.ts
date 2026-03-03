// ===========================================
// 📁 Cloud Storage - Funciones Helper
// ===========================================
// Funciones para gestionar archivos en Firebase Storage.
// Ideal para subir documentos RAG (Silver/Gold), imágenes, etc.

import {
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    listAll,
    UploadTask,
    UploadMetadata,
} from "firebase/storage";
import { storage } from "./config";

// -------------------------------------------
// Tipos auxiliares
// -------------------------------------------
export interface StorageFile {
    name: string;
    fullPath: string;
    downloadURL: string;
}

export interface UploadProgress {
    bytesTransferred: number;
    totalBytes: number;
    percentage: number;
}

// -------------------------------------------
// SUBIR archivos
// -------------------------------------------

/**
 * Subir un archivo a Storage (simple, sin progreso).
 * @param file - Archivo a subir (File del input o Blob)
 * @param path - Ruta en Storage (ej: "documentos/gold/manual.pdf")
 * @param metadata - Metadata opcional (contentType, etc.)
 * @returns URL pública de descarga del archivo
 *
 * @example
 * ```ts
 * const url = await uploadFile(file, `documentos/gold/${file.name}`);
 * console.log("Archivo disponible en:", url);
 * ```
 */
export async function uploadFile(
    file: File | Blob,
    path: string,
    metadata?: UploadMetadata
): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, metadata);
    return getDownloadURL(storageRef);
}

/**
 * Subir un archivo con seguimiento de progreso.
 * Útil para archivos grandes donde quieras mostrar una barra de progreso.
 * @param file - Archivo a subir
 * @param path - Ruta en Storage
 * @param onProgress - Callback que recibe el progreso en cada cambio
 * @param metadata - Metadata opcional
 * @returns Promise con la URL de descarga al completar
 *
 * @example
 * ```ts
 * const url = await uploadFileWithProgress(
 *   file,
 *   `documentos/silver/${file.name}`,
 *   (progress) => {
 *     console.log(`${progress.percentage}% completado`);
 *     setUploadPercent(progress.percentage);
 *   }
 * );
 * ```
 */
export function uploadFileWithProgress(
    file: File | Blob,
    path: string,
    onProgress: (progress: UploadProgress) => void,
    metadata?: UploadMetadata
): { task: UploadTask; promise: Promise<string> } {
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file, metadata);

    const promise = new Promise<string>((resolve, reject) => {
        task.on(
            "state_changed",
            (snapshot) => {
                const percentage = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                onProgress({
                    bytesTransferred: snapshot.bytesTransferred,
                    totalBytes: snapshot.totalBytes,
                    percentage,
                });
            },
            (error) => reject(error),
            async () => {
                const url = await getDownloadURL(task.snapshot.ref);
                resolve(url);
            }
        );
    });

    return { task, promise };
}

// -------------------------------------------
// OBTENER URLs
// -------------------------------------------

/**
 * Obtener la URL de descarga de un archivo existente.
 * @param path - Ruta del archivo en Storage
 * @returns URL pública de descarga
 */
export async function getFileURL(path: string): Promise<string> {
    const storageRef = ref(storage, path);
    return getDownloadURL(storageRef);
}

// -------------------------------------------
// ELIMINAR archivos
// -------------------------------------------

/**
 * Eliminar un archivo de Storage.
 * @param path - Ruta del archivo a eliminar
 */
export async function deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
}

// -------------------------------------------
// LISTAR archivos
// -------------------------------------------

/**
 * Listar todos los archivos de un directorio en Storage.
 * @param directoryPath - Ruta del directorio (ej: "documentos/gold")
 * @returns Array con info de cada archivo (nombre, ruta, URL)
 *
 * @example
 * ```ts
 * // Listar todos los documentos Gold
 * const files = await listFiles("documentos/gold");
 * files.forEach(f => console.log(f.name, f.downloadURL));
 * ```
 */
export async function listFiles(directoryPath: string): Promise<StorageFile[]> {
    const directoryRef = ref(storage, directoryPath);
    const result = await listAll(directoryRef);

    const files: StorageFile[] = await Promise.all(
        result.items.map(async (itemRef) => ({
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            downloadURL: await getDownloadURL(itemRef),
        }))
    );

    return files;
}
