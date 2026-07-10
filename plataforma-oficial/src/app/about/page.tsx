'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Users, Target, Lightbulb, Award, Globe, Code } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const team = [
  { name: 'Juan Botindari', role: 'Founder & Lead Developer', bio: 'Especialista en IA y sistemas RAG con experiencia en banca y consultoría.', emoji: '👨‍💻' },
  { name: 'Marcel Portaz', role: 'Co-Founder & AI Architect', bio: 'Experto en modelos de lenguaje y pipelines de procesamiento de datos.', emoji: '🧠' },
  { name: 'Isabella Rebolledo', role: 'Head of Design', bio: 'Diseñadora UX/UI con foco en experiencias enterprise de alta calidad.', emoji: '🎨' },
];

const values = [
  { icon: Target, title: 'Misión', desc: 'Democratizar el acceso a la inteligencia artificial para empresas de todos los tamaños.' },
  { icon: Lightbulb, title: 'Innovación', desc: 'Combinamos las últimas técnicas de NLP con una UX excepcional.' },
  { icon: Users, title: 'Comunidad', desc: 'Construimos junto a nuestros clientes, escuchando sus necesidades reales.' },
  { icon: Award, title: 'Excelencia', desc: 'Cada línea de código refleja nuestro compromiso con la calidad.' },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="mesh-gradient" />

      <main>
        {/* Hero */}
        <section style={{ paddingTop: 'calc(var(--header-height) + 80px)', paddingBottom: '60px' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 20 }}
            >
              Sobre{' '}
              <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Nosotros
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}
            >
              Somos un equipo apasionado por la IA y la tecnología, construyendo herramientas que transforman cómo las empresas gestionan su conocimiento.
            </motion.p>
          </div>
        </section>

        {/* Values */}
        <section className="section" style={{ background: 'var(--bg-secondary)', paddingTop: 60 }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
              {values.map((v, i) => (
                <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }} className="card" style={{ padding: 28, textAlign: 'center' }}>
                  <div
                    style={{
                      width: 52, height: 52, borderRadius: 14, background: 'var(--accent-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
                      margin: '0 auto 16px',
                    }}
                  >
                    <v.icon size={24} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{v.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section">
          <div className="container">
            <motion.div {...fadeInUp} style={{ textAlign: 'center', marginBottom: 50 }}>
              <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, marginBottom: 12 }}>Nuestro Equipo</h2>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Las personas detrás de OmniRAG</p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
              {team.map((member, i) => (
                <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }} className="card" style={{ padding: 28, textAlign: 'center' }}>
                  <div
                    style={{
                      width: 72, height: 72, borderRadius: 20, background: 'var(--gradient-accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 32, margin: '0 auto 16px',
                    }}
                  >
                    {member.emoji}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{member.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginBottom: 10 }}>{member.role}</p>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{member.bio}</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                    <a href="#" style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }}><Globe size={18} /></a>
                    <a href="#" style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }}><Code size={18} /></a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container" style={{ maxWidth: 700 }}>
            <motion.div {...fadeInUp}>
              <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, marginBottom: 24, textAlign: 'center' }}>Nuestra Historia</h2>
              <div style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <p style={{ marginBottom: 16 }}>
                  OmniRAG nació en 2024 como un proyecto de fin de máster con una visión clara: hacer que la inteligencia artificial sea accesible y útil para empresas reales.
                </p>
                <p style={{ marginBottom: 16 }}>
                  Después de trabajar en el sector bancario y contable, identificamos un problema recurrente: las empresas tienen enormes cantidades de conocimiento atrapado en documentos que nadie consulta eficientemente.
                </p>
                <p>
                  Hoy, nuestra plataforma RAG permite a bancos, estudios contables y empresas de tecnología consultar su base documental como si hablaran con un experto — con respuestas precisas y fuentes verificables.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
