'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, MapPin, Phone, Send, Clock, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      <Header />
      <div className="mesh-gradient" />

      <main>
        <section style={{ paddingTop: 'calc(var(--header-height) + 80px)', paddingBottom: '60px' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 20 }}
            >
              Hablemos
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}
            >
              ¿Tenés una pregunta, una propuesta o simplemente querés saludar? Escribinos.
            </motion.p>
          </div>
        </section>

        <section style={{ paddingBottom: 100 }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 40, alignItems: 'start' }}>
              {/* Contact Info */}
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[
                    { icon: Mail, label: 'Email', value: 'contact@omnirag.com' },
                    { icon: Phone, label: 'Teléfono', value: '+54 11 5555-0100' },
                    { icon: MapPin, label: 'Ubicación', value: 'Buenos Aires, Argentina' },
                    { icon: Clock, label: 'Horario', value: 'Lun-Vie, 9:00 - 18:00 ART' },
                  ].map((item, i) => (
                    <div key={i} className="card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div
                        style={{
                          width: 44, height: 44, borderRadius: 12, background: 'var(--accent-light)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0,
                        }}
                      >
                        <item.icon size={20} />
                      </div>
                      <div>
                        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                        <p style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 500 }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FAQ quick */}
                <div className="card" style={{ padding: 24, marginTop: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <MessageSquare size={18} style={{ color: 'var(--accent)' }} />
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>FAQ Rápido</h3>
                  </div>
                  {[
                    { q: '¿Hay plan gratuito?', a: 'Sí, el plan Basic es gratis para siempre con funcionalidades limitadas.' },
                    { q: '¿Cuánto tarda el setup?', a: 'Menos de 90 segundos. Solo cargá tus documentos y listo.' },
                  ].map((faq, i) => (
                    <div key={i} style={{ marginBottom: i === 0 ? 14 : 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{faq.q}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{faq.a}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <form onSubmit={handleSubmit} className="card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Enviar Mensaje</h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Nombre completo</label>
                      <input
                        className="input"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email</label>
                      <input
                        className="input"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Empresa (opcional)</label>
                      <input
                        className="input"
                        placeholder="Nombre de tu empresa"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Mensaje</label>
                      <textarea
                        className="input"
                        placeholder="Contanos en qué te podemos ayudar..."
                        rows={5}
                        style={{ resize: 'vertical' }}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      {submitted ? (
                        <>✓ Enviado con éxito</>
                      ) : (
                        <>
                          Enviar Mensaje
                          <Send size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1.2fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
