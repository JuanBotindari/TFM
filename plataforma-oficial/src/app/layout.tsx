import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TFM Producto — Plataforma IA RAG para Empresas",
  description:
    "Plataforma SaaS de inteligencia artificial RAG para que empresas gestionen y consulten su base de conocimiento con documentos, imágenes y datos.",
  keywords: ["IA", "RAG", "SaaS", "inteligencia artificial", "documentos", "empresas"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning>
        <body>
          <div className={inter.className}>
            <ThemeProvider>
              <AuthProvider>{children}</AuthProvider>
            </ThemeProvider>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
