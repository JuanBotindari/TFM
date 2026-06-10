'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Brain,
  FileSearch,
  Shield,
  Zap,
  BarChart3,
  Globe,
  ArrowRight,
  Check,
  Star,
  ChevronRight,
  Sparkles,
  Database,
  MessageSquare,
  Lock,
  Terminal,
  Users,
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true },
};

const features = [
  {
    icon: Brain,
    title: 'IA RAG Avanzada',
    desc: 'Respuestas precisas basadas en tus documentos, con citación automática de fuentes.',
  },
  {
    icon: FileSearch,
    title: 'Ingesta Multimodal',
    desc: 'Procesa PDFs, imágenes, CSVs y archivos de texto de forma unificada.',
  },
  {
    icon: Shield,
    title: 'Control de Acceso',
    desc: 'Gestión granular de permisos por usuario, rol y documento.',
  },
  {
    icon: Zap,
    title: 'Consultas SQL',
    desc: 'Interfaz visual para consultar tus datos tabulares con protección de roles.',
  },
  {
    icon: BarChart3,
    title: 'Analytics en Tiempo Real',
    desc: 'Dashboard con métricas de uso, rendimiento y tendencias de consultas.',
  },
  {
    icon: Globe,
    title: 'Multi-Organización',
    desc: 'Soporte nativo para múltiples empresas con aislamiento de datos completo.',
  },
];

const testimonials = [
  {
    name: 'Laura Fernández',
    role: 'CTO, Banco Nacional',
    quote: 'TFM-producto transformó cómo nuestros analistas acceden a regulaciones. El tiempo de respuesta bajó un 80%.',
    rating: 5,
  },
  {
    name: 'Martín Rodríguez',
    role: 'Director, Estudio Contable AR',
    quote: 'La capacidad de consultar documentos y tablas simultáneamente es revolucionaria para nuestro flujo de trabajo.',
    rating: 5,
  },
  {
    name: 'Sofía Amaya',
    role: 'VP Innovación, FinTech Solutions',
    quote: 'La interfaz de chat con citación de fuentes nos da la confianza que necesitamos para decisiones críticas.',
    rating: 5,
  },
];

const stats = [
  { number: '10K+', label: 'Documentos procesados' },
  { number: '99.9%', label: 'Uptime garantizado' },
  { number: '<2s', label: 'Tiempo de respuesta' },
  { number: '50+', label: 'Empresas confían' },
];

export default function LandingPage() {
  return (
    <>
      <Header />
      <div className="mesh-gradient" />

      <main>
        {/* ══════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════ */}
        <section
          style={{
            paddingTop: 'calc(var(--header-height) + 80px)',
            paddingBottom: '80px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative orbs */}
          <div
            style={{
              position: 'absolute',
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
              top: -100,
              right: -100,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
              bottom: -100,
              left: -100,
              pointerEvents: 'none',
            }}
          />

          <div className="container">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                borderRadius: 100,
                background: 'var(--accent-light)',
                border: '1px solid var(--accent)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--accent)',
                marginBottom: 28,
              }}
            >
              <Sparkles size={14} />
              Potenciando más de 10,000 consultas semanales
            </motion.div>

            {/* Hero Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{
                fontSize: 'clamp(36px, 5.5vw, 72px)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                marginBottom: 24,
                maxWidth: 800,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Potencia tu Empresa con{' '}
              <span
                style={{
                  background: 'var(--gradient-accent)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                IA en Tiempo Real
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                fontSize: 'clamp(16px, 1.2vw, 20px)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: 600,
                margin: '0 auto 40px',
              }}
            >
              Un dashboard para gestionar documentos, optimizar consultas y hacer crecer tu negocio — sin conjeturas.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Link href="/auth" className="btn-primary" style={{ textDecoration: 'none', padding: '14px 32px', fontSize: 16 }}>
                Comenzar Ahora
                <ArrowRight size={18} />
              </Link>
              <Link href="/presentacion" className="btn-secondary" style={{ textDecoration: 'none', padding: '14px 32px', fontSize: 16 }}>
                Ver Presentación
              </Link>
            </motion.div>

            {/* Hero Image (Dashboard Preview) */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                marginTop: 60,
                borderRadius: 20,
                border: '1px solid var(--border-primary)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                background: 'var(--bg-card)',
                maxWidth: 1000,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              {/* Mock Dashboard Preview */}
              <div style={{ padding: 2, background: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', gap: 6, padding: '10px 14px' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22C55E' }} />
                </div>
              </div>
              <div style={{ padding: '40px 32px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, minHeight: 350 }}>
                {/* Mini sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Dashboard', 'Chat IA', 'Documentos', 'SQL', 'Usuarios'].map((item, i) => (
                    <div
                      key={item}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: i === 0 ? 600 : 400,
                        color: i === 0 ? 'var(--accent)' : 'var(--text-tertiary)',
                        background: i === 0 ? 'var(--accent-light)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {([LayoutDashboard, MessageSquare, Database, Terminal, Users] as any)[i] &&
                        React.createElement(([LayoutDashboard, MessageSquare, Database, Terminal, Users] as any)[i], { size: 15 })}
                      {item}
                    </div>
                  ))}
                </div>
                {/* Mini dashboard content */}
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 4 }}>Martes, 8 de Mayo 2026</p>
                  <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Buenos días, Juan 👋</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                    {[
                      { label: 'Documentos', value: '342', color: 'var(--accent)' },
                      { label: 'Consultas hoy', value: '1,547', color: '#22C55E' },
                      { label: 'Usuarios activos', value: '28', color: '#8B5CF6' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        style={{
                          padding: '16px',
                          borderRadius: 12,
                          border: '1px solid var(--border-primary)',
                          background: 'var(--bg-tertiary)',
                        }}
                      >
                        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>{stat.label}</p>
                        <p style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Mini chart */}
                  <div
                    style={{
                      marginTop: 16,
                      padding: '20px',
                      borderRadius: 12,
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-tertiary)',
                    }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Consultas por Mes</p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
                      {[40, 60, 70, 55, 80, 95, 100].map((h, i) => (
                        <div
                          key={i}
                          className="chart-bar"
                          style={{
                            flex: 1,
                            height: `${h}%`,
                            opacity: 0.7 + (i * 0.04),
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text-tertiary)' }}>
              Tu setup estará listo en menos de 90 segundos
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            STATS BAR
        ══════════════════════════════════════════ */}
        <motion.section {...fadeInUp} style={{ padding: '40px 0' }}>
          <div className="container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 24,
                padding: '32px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {stats.map((stat) => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <p
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      background: 'var(--gradient-accent)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {stat.number}
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 4 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════ */}
        <section className="section">
          <div className="container">
            <motion.div {...fadeInUp} style={{ textAlign: 'center', marginBottom: 60 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--accent)',
                  marginBottom: 12,
                }}
              >
                <Sparkles size={14} /> ¿Cómo funciona?
              </span>
              <h2
                style={{
                  fontSize: 'clamp(28px, 3vw, 44px)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  marginBottom: 16,
                }}
              >
                Así Mejoramos{' '}
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>Tu Flujo de Trabajo</span>
              </h2>
            </motion.div>

            <motion.div
              {...staggerContainer}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 24,
              }}
            >
              {[
                {
                  step: '01',
                  icon: Database,
                  title: 'Sube tu Conocimiento',
                  desc: 'Carga PDFs, imágenes, CSVs y documentos. Nuestro motor los indexa automáticamente.',
                },
                {
                  step: '02',
                  icon: MessageSquare,
                  title: 'Consulta con IA',
                  desc: 'Pregunta en lenguaje natural. La IA busca en tus documentos y responde con fuentes.',
                },
                {
                  step: '03',
                  icon: Lock,
                  title: 'Control Total',
                  desc: 'Gestiona quién accede a qué. Roles, permisos y auditoría de cada consulta.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={{ initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 } }}
                  className="card"
                  style={{ padding: 32, position: 'relative', overflow: 'hidden' }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 20,
                      fontSize: 64,
                      fontWeight: 800,
                      color: 'var(--border-primary)',
                      opacity: 0.5,
                      lineHeight: 1,
                    }}
                  >
                    {item.step}
                  </span>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: 'var(--accent-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)',
                      marginBottom: 20,
                    }}
                  >
                    <item.icon size={22} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
                  <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FEATURES GRID
        ══════════════════════════════════════════ */}
        <section className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <motion.div {...fadeInUp} style={{ textAlign: 'center', marginBottom: 60 }}>
              <h2
                style={{
                  fontSize: 'clamp(28px, 3vw, 44px)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  marginBottom: 16,
                }}
              >
                Todo lo que Necesitas
              </h2>
              <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
                Herramientas enterprise-grade para gestionar el conocimiento de tu organización.
              </p>
            </motion.div>

            <motion.div
              {...staggerContainer}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: 20,
              }}
            >
              {features.map((feat, i) => (
                <motion.div
                  key={i}
                  variants={{ initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 } }}
                  className="card"
                  style={{ padding: '28px', display: 'flex', gap: 16 }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'var(--accent-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)',
                      flexShrink: 0,
                    }}
                  >
                    <feat.icon size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{feat.title}</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════════════ */}
        <section className="section">
          <div className="container">
            <motion.div {...fadeInUp} style={{ textAlign: 'center', marginBottom: 60 }}>
              <h2
                style={{
                  fontSize: 'clamp(28px, 3vw, 44px)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  marginBottom: 16,
                }}
              >
                Lo que Dicen Nuestros Clientes
              </h2>
            </motion.div>

            <motion.div
              {...staggerContainer}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 24,
              }}
            >
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  variants={{ initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 } }}
                  className="card"
                  style={{ padding: 28 }}
                >
                  <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={16} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'var(--gradient-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CTA SECTION
        ══════════════════════════════════════════ */}
        <section className="section">
          <div className="container">
            <motion.div
              {...fadeInUp}
              style={{
                textAlign: 'center',
                padding: '60px 40px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--gradient-accent)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)',
                  pointerEvents: 'none',
                }}
              />
              <h2
                style={{
                  fontSize: 'clamp(28px, 3vw, 40px)',
                  fontWeight: 800,
                  color: 'white',
                  marginBottom: 16,
                  position: 'relative',
                }}
              >
                Empieza Hoy, Escala Mañana
              </h2>
              <p
                style={{
                  fontSize: 17,
                  color: 'rgba(255,255,255,0.85)',
                  marginBottom: 32,
                  maxWidth: 500,
                  margin: '0 auto 32px',
                  position: 'relative',
                }}
              >
                Configuración en menos de 90 segundos. Sin tarjeta de crédito.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                <Link
                  href="/auth"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 32px',
                    borderRadius: 12,
                    background: 'white',
                    color: '#2563EB',
                    fontWeight: 700,
                    fontSize: 16,
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  Crear Cuenta Gratis
                  <ChevronRight size={18} />
                </Link>
                <Link
                  href="/auth"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 32px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 16,
                    textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.3)',
                    transition: 'all 0.3s',
                  }}
                >
                  Probar Demo
                </Link>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 24,
                  marginTop: 24,
                  flexWrap: 'wrap',
                  position: 'relative',
                }}
              >
                {['Sin tarjeta de crédito', 'Setup en 90 seg', 'Soporte 24/7'].map((item) => (
                  <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                    <Check size={14} /> {item}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

// Inline icon component for the dashboard preview
function LayoutDashboard(props: any) {
  const size = props.size || 15;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
