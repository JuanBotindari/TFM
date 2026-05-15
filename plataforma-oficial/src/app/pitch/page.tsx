'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Brain, Shield, BarChart3, Zap, Globe, TrendingUp, ArrowRight, Check,
  Database, MessageSquare, Lock, FileSearch, Users, Building,
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const slides = [
  {
    tag: 'EL PROBLEMA',
    title: 'El Conocimiento Empresarial Está Fragmentado',
    points: [
      'Documentos críticos dispersos en múltiples sistemas',
      'Los empleados pierden 20% de su tiempo buscando información',
      'Sin trazabilidad ni control de acceso centralizado',
      'Las consultas ad-hoc a datos tabulares requieren técnicos',
    ],
    visual: 'problem',
  },
  {
    tag: 'LA SOLUCIÓN',
    title: 'TFM-Producto: IA RAG Enterprise',
    points: [
      'Un punto único de acceso a todo el conocimiento',
      'Chat con IA que cita fuentes verificables',
      'Ingesta multimodal: PDFs, imágenes, CSVs, texto',
      'Consultas SQL con interfaz visual y control de roles',
    ],
    visual: 'solution',
  },
  {
    tag: 'MERCADO',
    title: 'Un Mercado de $15B en Crecimiento',
    points: [
      'El mercado de Knowledge Management crece 23% anual',
      'Las empresas gastan $1.3T/año por ineficiencia informacional',
      'Solo el 20% usa IA para gestión documental',
      'Nuestro TAM: bancos, estudios contables, consultoras',
    ],
    visual: 'market',
  },
];

const differentiators = [
  { icon: Brain, title: 'RAG con Citación', desc: 'Cada respuesta incluye las fuentes exactas del documento.' },
  { icon: Shield, title: 'Control Granular', desc: 'Permisos por usuario, rol y documento individual.' },
  { icon: Database, title: 'Multi-Modal', desc: 'PDFs, imágenes, CSVs y texto en un solo pipeline.' },
  { icon: Lock, title: 'Enterprise Security', desc: 'Aislamiento de datos por organización, SSO y auditoría.' },
  { icon: BarChart3, title: 'Analytics Avanzados', desc: 'Métricas de uso, rendimiento y ROI en tiempo real.' },
  { icon: Globe, title: 'Multi-Tenant', desc: 'Arquitectura nativa para múltiples organizaciones.' },
];

const roadmap = [
  { quarter: 'Q1 2025', items: ['MVP Lanzamiento', 'Ingesta PDF e imágenes', 'Chat IA básico'], done: true },
  { quarter: 'Q2 2025', items: ['Consultas SQL', 'Sistema de roles', 'Multi-tenant'], done: true },
  { quarter: 'Q3 2025', items: ['API pública', 'Integraciones Slack/Teams', 'Analytics dashboard'], done: false },
  { quarter: 'Q4 2025', items: ['Modelos custom', 'On-premise deployment', 'SOC2 compliance'], done: false },
];

export default function PitchPage() {
  return (
    <>
      <Header />
      <div className="mesh-gradient" />

      <main>
        {/* Hero */}
        <section
          style={{
            paddingTop: 'calc(var(--header-height) + 60px)',
            paddingBottom: 80,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--gradient-accent)',
              opacity: 0.04,
              pointerEvents: 'none',
            }}
          />
          <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100,
                background: 'var(--accent-light)', fontSize: 12, fontWeight: 700, color: 'var(--accent)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 24,
              }}
            >
              Presentación Corporativa
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: 800, letterSpacing: '-0.03em',
                lineHeight: 1.1, marginBottom: 24, maxWidth: 900, margin: '0 auto 24px',
              }}
            >
              La Plataforma de IA que Transforma el{' '}
              <span
                style={{
                  background: 'var(--gradient-accent)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Conocimiento Empresarial
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: 20, color: 'var(--text-secondary)', maxWidth: 650, margin: '0 auto 40px', lineHeight: 1.6 }}
            >
              Retrieval-Augmented Generation para banca, contabilidad y empresas que necesitan respuestas precisas desde sus propios documentos.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Link href="/auth" className="btn-primary" style={{ textDecoration: 'none', padding: '16px 36px', fontSize: 16 }}>
                Solicitar Demo
                <ArrowRight size={18} />
              </Link>
              <Link href="/pricing" className="btn-secondary" style={{ textDecoration: 'none', padding: '16px 36px', fontSize: 16 }}>
                Ver Planes
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Problem / Solution / Market Slides */}
        {slides.map((slide, i) => (
          <section key={i} className="section" style={{ background: i % 2 === 0 ? 'var(--bg-secondary)' : 'transparent' }}>
            <div className="container">
              <motion.div {...fadeInUp}>
                <span
                  style={{
                    display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 12,
                    padding: '4px 12px', borderRadius: 6, background: 'var(--accent-light)',
                  }}
                >
                  {slide.tag}
                </span>
                <h2 style={{ fontSize: 'clamp(26px, 3vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 32, maxWidth: 700 }}>
                  {slide.title}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {slide.points.map((point, j) => (
                    <div key={j} className="card" style={{ padding: '20px 24px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0, fontWeight: 700, fontSize: 13 }}>
                        {j + 1}
                      </div>
                      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{point}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        ))}

        {/* Differentiators */}
        <section className="section">
          <div className="container">
            <motion.div {...fadeInUp} style={{ textAlign: 'center', marginBottom: 50 }}>
              <h2 style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, marginBottom: 16 }}>
                ¿Por qué TFM-Producto?
              </h2>
              <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
                Ventajas competitivas que nos distinguen
              </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
              {differentiators.map((d, i) => (
                <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.08 }} className="card" style={{ padding: 24, display: 'flex', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                    <d.icon size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{d.title}</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{d.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <motion.div {...fadeInUp} style={{ textAlign: 'center', marginBottom: 50 }}>
              <h2 style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, marginBottom: 16 }}>Roadmap</h2>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              {roadmap.map((phase, i) => (
                <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }} className="card" style={{ padding: 24, position: 'relative' }}>
                  {phase.done && (
                    <div style={{ position: 'absolute', top: 12, right: 12 }} className="badge badge-success">
                      Completado
                    </div>
                  )}
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: phase.done ? 'var(--accent)' : 'var(--text-tertiary)', marginBottom: 16 }}>
                    {phase.quarter}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {phase.items.map((item, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                        <Check size={16} style={{ color: phase.done ? 'var(--success)' : 'var(--text-tertiary)', flexShrink: 0 }} />
                        <span style={{ color: phase.done ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section">
          <div className="container">
            <motion.div
              {...fadeInUp}
              style={{
                textAlign: 'center', padding: '60px 40px', borderRadius: 'var(--radius-lg)',
                background: 'var(--gradient-accent)', position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: 'white', marginBottom: 16, position: 'relative' }}>
                ¿Listo para Transformar tu Empresa?
              </h2>
              <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px', position: 'relative' }}>
                Agenda una demo personalizada con nuestro equipo.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                <Link
                  href="/contact"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', borderRadius: 12,
                    background: 'white', color: '#2563EB', fontWeight: 700, fontSize: 16, textDecoration: 'none',
                  }}
                >
                  Contactar Ventas
                  <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
