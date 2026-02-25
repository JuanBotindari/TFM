// ===========================================
// 🛡️ AuthProvider - Contexto Global de Autenticación
// ===========================================
// Envuelve tu app con este Provider para tener acceso
// al usuario actual desde cualquier componente.
//
// Uso en layout.tsx:
//   <AuthProvider>{children}</AuthProvider>
//
// Uso en cualquier componente:
//   const { user, loading } = useAuth();

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import { onAuthChange } from "@/lib/firebase/auth";

// -------------------------------------------
// Tipos del contexto
// -------------------------------------------
interface AuthContextType {
    /** El usuario actual de Firebase (null si no hay sesión) */
    user: User | null;
    /** true mientras se verifica el estado de la sesión al cargar la app */
    loading: boolean;
}

// -------------------------------------------
// Contexto
// -------------------------------------------
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

// -------------------------------------------
// Provider
// -------------------------------------------
interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Escuchar cambios en el estado de autenticación
        const unsubscribe = onAuthChange((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        // Limpiar el listener al desmontar
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// -------------------------------------------
// Hook personalizado
// -------------------------------------------

/**
 * Hook para acceder al estado de autenticación.
 * Debe usarse dentro de un componente envuelto por <AuthProvider>.
 *
 * @example
 * ```tsx
 * function MiComponente() {
 *   const { user, loading } = useAuth();
 *
 *   if (loading) return <p>Cargando...</p>;
 *   if (!user) return <p>Debes iniciar sesión</p>;
 *
 *   return <p>Hola, {user.displayName}</p>;
 * }
 * ```
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
    }
    return context;
}
