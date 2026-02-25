# 🔥 Guía de Configuración de Firebase para TFM-Chat

Esta guía explica paso a paso cómo conectar el proyecto con Firebase.

---

## 📋 Requisitos Previos

- Tener una cuenta de Google
- Tener el proyecto `plataforma-oficial` corriendo localmente

---

## 🚀 Paso 1: Crear el Proyecto en Firebase Console

1. Ve a [console.firebase.google.com](https://console.firebase.google.com/)
2. Click en **"Agregar proyecto"** (o "Add project")
3. Escribe el nombre: `TFM-Chat` (o el nombre que prefieras)
4. **Google Analytics**: Activado (recomendado). Selecciona la cuenta por defecto.
5. Click en **"Crear proyecto"** y espera a que se configure

---

## 🌐 Paso 2: Registrar la App Web

1. En la pantalla principal del proyecto, click en el ícono de **Web** (`</>`)
2. **Nombre de la app**: `TFM-Chat Web`
3. ❌ **NO** marques "Firebase Hosting" por ahora
4. Click en **"Registrar app"**
5. Verás un bloque de código como este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "tfm-chat-xxxxx.firebaseapp.com",
  projectId: "tfm-chat-xxxxx",
  storageBucket: "tfm-chat-xxxxx.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef...",
  measurementId: "G-XXXXXXXXXX"
};
```

6. **Copia estos valores** y pégalos en el archivo `.env.local` dentro de `/plataforma-oficial/`

---

## 🔑 Paso 3: Configurar el archivo `.env.local`

Abre el archivo `plataforma-oficial/.env.local` y reemplaza los valores de ejemplo con los tuyos:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tfm-chat-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tfm-chat-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tfm-chat-xxxxx.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> ⚠️ **IMPORTANTE**: El archivo `.env.local` está en el `.gitignore` y **NO se sube a GitHub**. Cada miembro del equipo necesita crear el suyo.

---

## 🔐 Paso 4: Obtener las Credenciales Admin (Server-Side)

Esto es necesario para las operaciones del servidor (verificar tokens, crear usuarios con roles, etc.):

1. En Firebase Console, ve a ⚙️ **Configuración del proyecto** > **Cuentas de servicio**
2. Click en **"Generar nueva clave privada"**
3. Se descargará un archivo JSON. Ábrelo y copia los valores en el `.env.local`:

```env
FIREBASE_ADMIN_PROJECT_ID=tu-proyecto-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> 🔒 **SEGURIDAD**: Nunca subas este JSON a GitHub ni compartas la private key públicamente.

---

## ✅ Paso 5: Activar los Servicios en Firebase Console

### Authentication
1. En el menú lateral: **Authentication** > **Sign-in method**
2. Activa los proveedores que necesites:
   - ✅ **Email/Password** (obligatorio)
   - ✅ **Google** (recomendado)
3. En la pestaña **Settings** > **Authorized domains**, agrega `localhost`

### Firestore Database
1. En el menú lateral: **Firestore Database** > **Crear base de datos**
2. Selecciona **modo de prueba** (para desarrollo) o **modo producción**
3. Elige la ubicación más cercana (ej: `europe-west1` para España)

### Storage
1. En el menú lateral: **Storage** > **Comenzar**
2. Acepta las reglas de seguridad por defecto
3. Elige la misma ubicación que Firestore

---

## 💻 Paso 6: Usar Firebase en el Código

### Verificar si un usuario tiene sesión activa

```tsx
"use client";
import { useAuth } from "@/context/AuthContext";

export default function MiPagina() {
  const { user, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;
  if (!user) return <p>Debes iniciar sesión</p>;

  return <p>Hola, {user.displayName || user.email}</p>;
}
```

### Login con Google

```tsx
import { loginWithGoogle } from "@/lib/firebase";

async function handleGoogleLogin() {
  try {
    const result = await loginWithGoogle();
    console.log("Bienvenido:", result.user.displayName);
  } catch (error) {
    console.error("Error en login:", error);
  }
}
```

### Guardar un chat en Firestore

```tsx
import { createDocument } from "@/lib/firebase";

const chatId = await createDocument("chats", {
  userId: user.uid,
  message: "¿Cómo genero un reporte de IVA?",
  response: "Para generar un reporte de IVA...",
  tenant: "estudio-contable-a",
});
```

### Subir un documento a Storage

```tsx
import { uploadFile } from "@/lib/firebase";

const input = document.querySelector("input[type='file']") as HTMLInputElement;
const file = input.files![0];

const url = await uploadFile(file, `documentos/gold/${file.name}`);
console.log("Documento subido:", url);
```

---

## 📁 Estructura de Archivos Firebase

```
plataforma-oficial/
├── .env.local                    # 🔑 Variables de entorno (NO se sube a Git)
└── src/
    ├── context/
    │   └── AuthContext.tsx        # 🛡️ Provider + Hook useAuth()
    └── lib/
        └── firebase/
            ├── index.ts          # 📦 Punto de entrada (barrel file)
            ├── config.ts         # ⚙️ Inicialización del SDK cliente
            ├── admin.ts          # 🔐 SDK Admin (solo servidor)
            ├── auth.ts           # 🔑 Funciones de autenticación
            ├── firestore.ts      # 📄 CRUD de Firestore
            └── storage.ts        # 📁 Gestión de archivos
```

---

## ❓ Preguntas Frecuentes

### ¿El API Key es público?
Sí, el API Key de Firebase del lado del cliente es **público por diseño**. La seguridad se gestiona con las **Firebase Security Rules** en Firestore y Storage. El API Key solo identifica tu proyecto, no da acceso directo.

### ¿Puedo usar Firebase gratis?
Sí, Firebase tiene un [plan gratuito (Spark)](https://firebase.google.com/pricing) muy generoso:
- Auth: Ilimitado
- Firestore: 1 GB almacenamiento, 50K lecturas/día
- Storage: 5 GB almacenamiento
- Hosting: 10 GB transferencia/mes

### ¿Cómo comparto las credenciales con el equipo?
Comparte el contenido del `.env.local` de forma segura (ej: mensaje privado, vault de contraseñas). **Nunca por un canal público o GitHub.**

---

© 2026 - TFM: Inteligencia Artificial Aplicada a la Gestión del Conocimiento.
