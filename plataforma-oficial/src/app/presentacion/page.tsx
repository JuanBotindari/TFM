'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChevronDown, ChevronRight, Shield, Lock, Users, Code2, Brain, Database } from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface H3Item {
  title: string;
  body: string;
}

interface H2Section {
  icon: React.ElementType;
  tag: string;
  title: string;
  body: string;
  h3: H3Item[];
}

interface H1Section {
  number: string;
  tag: string;
  title: string;
  description: string;
  h2sections: H2Section[];
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────
const sections: H1Section[] = [
  {
    number: '01',
    tag: 'INTRODUCCIÓN',
    title: 'El Valor Estratégico del Dato y las Limitaciones de la IA Comercial',
    description:
      'En el contexto organizacional contemporáneo, los datos y el conocimiento derivados de su análisis han adquirido una relevancia estratégica equiparable a la de los activos tradicionales (Mikalef et al., 2020; Côrte-Real et al., 2016). Los datos han dejado de ser un subproducto operativo para convertirse en un activo organizacional central. Su valor no se manifiesta por acumulación, sino por la capacidad de transformarlos en conocimiento accionable que oriente la acción organizativa.',
    h2sections: [
      {
        icon: Brain,
        tag: 'EL PROBLEMA',
        title: 'Silos de Información y las Alucinaciones de la IA Comercial',
        body: 'Las empresas tienen conocimiento severamente fragmentado. Por un lado, poseen conocimiento no estructurado encapsulado en normativas, PDFs y complejos diccionarios de datos (modelos de seguros y contables). Por otro lado, manejan métricas estructuradas en bases de datos relacionales. Intentar capitalizar estos activos intangibles utilizando Inteligencia Artificial Comercial (como ChatGPT o Claude) plantea dos problemas insalvables para el entorno empresarial:\n\n1. Privacidad y Continuidad del Negocio: Subir datos financieros o confidenciales a servidores de terceros vulnera la integridad y privacidad del dato.\n\n2. Alucinaciones: Los Modelos Fundacionales (LLMs) están pre-entrenados con datos públicos de internet. Desconocen el contexto privado de la compañía, lo que genera respuestas matemáticamente plausibles pero factualmente incorrectas.',
        h3: [
          {
            title: 'Limitación técnica: Ventana de Contexto Limitada',
            body: 'Los LLMs tienen una capacidad máxima de tokens que pueden procesar en una sola llamada. En la práctica, esto significa que no pueden "leer" un manual de 200 páginas en una consulta. La arquitectura RAG resuelve esto fragmentando el documento y recuperando solo los fragmentos relevantes (chunks) para cada pregunta.',
          },
          {
            title: 'Limitación regulatoria: GDPR y Soberanía del Dato',
            body: 'El Reglamento General de Protección de Datos (GDPR) de la Unión Europea impone restricciones severas sobre la transferencia de datos personales a terceros países. El uso de APIs de OpenAI o Anthropic implica enviar datos a Estados Unidos, lo cual requiere mecanismos de transferencia específicos (SCCs) que no todas las empresas pueden implementar.',
          },
        ],
      },
      {
        icon: Database,
        tag: 'LA PROPUESTA',
        title: 'Plataforma RAG + Text-to-SQL: Gestión del Conocimiento con IA Generativa',
        body: 'El objetivo de este Trabajo de Fin de Máster ha sido el diseño y construcción de una plataforma B2B SaaS híbrida orientada a la gestión del conocimiento organizacional mediante inteligencia artificial generativa. Una solución que despliega una arquitectura RAG (Retrieval-Augmented Generation) para la comprensión profunda de documentos corporativos, y Text-to-SQL para la ejecución de consultas analíticas directas sobre bases de datos. Todo ello bajo una arquitectura de Inquilino Múltiple (Multi-Tenant) y ejecutando modelos Open-Source en local para garantizar la soberanía total sobre los activos estratégicos de la organización.',
        h3: [
          {
            title: 'Objetivo Académico del TFM',
            body: 'Diseñar y construir una solución basada en arquitectura RAG que permita a las organizaciones gestionar su conocimiento mediante inteligencia artificial generativa, garantizando privacidad, precisión y escalabilidad bajo un modelo de Inquilino Múltiple (Multi-Tenant).',
          },
          {
            title: 'Stack Tecnológico: Frontend, Backend y Base de Datos',
            body: 'Frontend en Next.js 14 (App Router) desplegado en Vercel. Backend de IA en Python (FastAPI + Uvicorn) ejecutándose On-Premise. Base de datos Supabase (PostgreSQL + extensión pgvector para vectores). Autenticación con Clerk (JWT + RBAC). Conexión Nube-Local mediante túnel reverso (Pinggy/Ngrok).',
          },
        ],
      },
    ],
  },
  {
    number: '02',
    tag: 'ARQUITECTURA DE SEGURIDAD',
    title: 'Multi-Tenancy y Control de Acceso Basado en Roles (RBAC)',
    description:
      'Para que la plataforma sea un producto B2B viable, el primer pilar es el aislamiento absoluto de la información entre clientes. Un cliente (Empresa A) jamás debe poder acceder a los documentos ni a las tablas de bases de datos de otro cliente (Empresa B). A esto se le conoce como prevención del Cross-Tenant Data Leakage y es el eje central de toda la gobernanza de seguridad de la plataforma.',
    h2sections: [
      {
        icon: Shield,
        tag: 'AUTENTICACIÓN',
        title: 'Gestión de Identidad en el Edge con Clerk',
        body: 'Hemos descartado sistemas de autenticación básicos para integrar Clerk, una solución Auth moderna compatible con arquitecturas Edge. La autenticación ocurre en el middleware de Next.js antes de que la página llegue a renderizarse. Se implementó un flujo completo permitiendo tanto el acceso por Email con verificación OTP, como por credenciales clásicas de usuario/contraseña. El middleware de Clerk se ejecuta en el Edge de Vercel antes de que cualquier componente React cargue, validando el JWT en cada request y redirigiendo a /auth si la sesión es inválida.',
        h3: [
          {
            title: 'Sincronización Clerk ↔ Supabase (AuthContext.tsx)',
            body: 'El hook AuthContext.tsx captura el JWT emitido por Clerk tras el login y ejecuta un upsert contra la tabla user_profiles de Supabase, insertando {id, org_id, role}. Esto mantiene la consistencia entre el sistema de identidad en la nube (Clerk) y nuestra base de datos relacional (Supabase), permitiendo que cualquier query SQL pueda filtrar por org_id de forma eficiente.',
          },
          {
            title: 'Lectura de publicMetadata en el JWT',
            body: 'Clerk emite un Token JWT que incluye el objeto publicMetadata. En este objeto almacenamos dos variables críticas: el orgId (Identificador único de la organización del usuario) y el role (admin, editor, viewer). Estas variables se propagan por toda la aplicación a través del AuthContext de React, condicionando tanto la UI como las llamadas al backend.',
          },
        ],
      },
      {
        icon: Lock,
        tag: 'CONTROL DE ROLES',
        title: 'Control de Roles: viewer, editor, admin',
        body: 'Esta arquitectura de roles condiciona por completo la Interfaz de Usuario. Si un usuario tiene el rol de viewer, la capa de Next.js re-renderiza el DOM para bloquear y ocultar funcionalidades críticas en el Gestor Documental. Un usuario raso puede consultar a la IA, pero no tiene permisos ni los botones habilitados para subir nuevos diccionarios de datos ni para eliminar archivos del entorno corporativo. Esta lógica no es solo visual: el backend de FastAPI también valida el rol en cada petición antes de ejecutar operaciones sensibles.',
        h3: [
          {
            title: 'Renderizado Condicional por Rol en Next.js',
            body: 'Cada componente de la UI consume el AuthContext para conocer el rol activo. Los botones de "Subir documento" y "Eliminar" están envueltos en un renderizado condicional {isAdmin && <Button>}. Esto asegura que incluso si un usuario intenta acceder directamente a las rutas de API, el backend rechaza la operación por falta de permisos.',
          },
        ],
      },
      {
        icon: Users,
        tag: 'AISLAMIENTO DE DATOS',
        title: 'Prevención de Cross-Tenant Data Leakage',
        body: 'El orgId se propaga desde Clerk hasta los esquemas de Supabase y los diccionarios de tablas. Al inicializar el dashboard, el frontend carga dinámicamente el archivo tableSchemas.ts correspondiente al orgId activo. Este fichero contiene exclusivamente los metadatos (tablas, columnas, tipos) de la base de datos de esa organización. El backend nunca recibe esquemas cruzados entre clientes, eliminando la posibilidad de que el LLM genere SQL que toque datos de otro tenant.',
        h3: [
          {
            title: 'Aislamiento Vectorial en pgvector',
            body: 'Todos los embeddings almacenados en Supabase incluyen el campo org_id como metadato de filtrado. El Cosine Similarity Search filtra siempre por WHERE org_id = current_org_id, garantizando que los chunks de documentos de la Empresa A nunca aparezcan en las respuestas RAG de la Empresa B. Es un aislamiento aplicado tanto a nivel de aplicación como a nivel de base de datos.',
          },
          {
            title: 'Configuración por Cliente: tableSchemas.ts y settings.json',
            body: 'Hemos descentralizado la configuración de cada cliente. El archivo tableSchemas.ts define las tablas y columnas accesibles para cada orgId. El archivo settings.json actúa como fallback y configura instrucciones de sistema específicas para cada cliente. Esta arquitectura permite añadir un nuevo cliente sin modificar el código fuente, simplemente añadiendo sus ficheros de configuración.',
          },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────
// H3 Accordion
// ─────────────────────────────────────────────
function H3Accordion({ item }: { item: H3Item }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderLeft: '2px solid var(--accent)', marginTop: 8, borderRadius: '0 8px 8px 0', overflow: 'hidden', background: 'rgba(59,130,246,0.04)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Code2 size={13} /> {item.title}
        </span>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}>
            <p style={{ padding: '0 16px 14px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, textAlign: 'justify' }}>{item.body}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// H1 Slide
// ─────────────────────────────────────────────
function H1Slide({ data }: { data: H1Section }) {
  return (
    <section style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', padding: '100px 0 60px', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
      {/* Big number */}
      <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(140px, 22vw, 300px)', fontWeight: 900, color: 'var(--border-primary)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', opacity: 0.35 }}>
        {data.number}
      </div>
      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 100, background: 'var(--accent-light)', fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          {data.tag}
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: 'clamp(32px, 4.5vw, 58px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 28 }}>
          {data.title}
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.85, textAlign: 'justify' }}>
          {data.description}
        </motion.p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// H2 Slide
// ─────────────────────────────────────────────
function H2Slide({ data, index }: { data: H2Section; index: number }) {
  const Icon = data.icon;
  const isEven = index % 2 === 0;
  const paragraphs = data.body.split('\n\n');

  return (
    <section style={{ padding: '80px 0', background: isEven ? 'transparent' : 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border-primary)' }}>
      <div className="container" style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* H2 Header */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4 }}>
            <Icon size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{data.tag}</span>
            <h3 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginTop: 4 }}>{data.title}</h3>
          </div>
        </motion.div>

        {/* H2 Body text — full paragraphs, always visible */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
          style={{ marginBottom: 36 }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.85, textAlign: 'justify', marginBottom: i < paragraphs.length - 1 ? 16 : 0 }}>
              {p}
            </p>
          ))}
        </motion.div>

        {/* H3 expandables */}
        {data.h3.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Detalle Técnico
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.h3.map((h3, i) => <H3Accordion key={i} item={h3} />)}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Progress Sidebar
// ─────────────────────────────────────────────
function ProgressSidebar({ sections }: { sections: H1Section[] }) {
  const [active, setActive] = useState(0);
  const allSections = sections.map((s) => ({ label: s.number, title: s.title }));

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + window.innerHeight / 2;
      const els = document.querySelectorAll('[data-section]');
      els.forEach((el, i) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        const top = rect.top + window.scrollY;
        if (scrollY >= top) setActive(i);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 10, zIndex: 50 }}>
      {allSections.map((s, i) => (
        <div key={i} title={s.title} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          onClick={() => document.querySelectorAll('[data-section]')[i]?.scrollIntoView({ behavior: 'smooth' })}>
          <div style={{ width: i === active ? 8 : 6, height: i === active ? 28 : 6, borderRadius: 99, background: i === active ? 'var(--accent)' : 'var(--border-primary)', transition: 'all 0.3s ease', flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function PresentacionPage() {
  return (
    <>
      <Header />
      <div className="mesh-gradient" />
      <ProgressSidebar sections={sections} />

      {/* Hero */}
      <section style={{ paddingTop: 'calc(var(--header-height) + 80px)', paddingBottom: 80, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 100, background: 'var(--accent-light)', fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 28 }}>
            TFM — UPF Barcelona School of Management · 2026
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: 'clamp(36px, 5.5vw, 72px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 24 }}>
            Gestión del Conocimiento Organizacional mediante{' '}
            <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              IA Generativa
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.7 }}>
            Juan Ignacio Botindari Rugnone · Marcel Portaz Blay · Isabella Rebolledo Domínguez
          </motion.p>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s infinite' }} />
            Desplázate para recorrer la presentación
          </motion.p>
        </div>
      </section>

      {/* Sections */}
      {sections.map((section, sIdx) => (
        <div key={sIdx} data-section={sIdx}>
          <H1Slide data={section} />
          {section.h2sections.map((h2, h2Idx) => (
            <H2Slide key={h2Idx} data={h2} index={h2Idx} />
          ))}
        </div>
      ))}

      <Footer />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </>
  );
}
