'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Check, X, Sparkles, ArrowRight, Zap, Building, Crown } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const plans = [
  {
    name: 'Basic',
    icon: Zap,
    price: { monthly: 0, annual: 0 },
    desc: 'Para equipos pequeños que quieren probar la plataforma.',
    color: '#22C55E',
    popular: false,
    features: [
      { name: 'Hasta 5 usuarios', included: true },
      { name: '500 MB de almacenamiento', included: true },
      { name: '100 consultas/mes', included: true },
      { name: 'Chat IA básico', included: true },
      { name: 'Soporte por email', included: true },
      { name: 'Ingesta multimodal', included: false },
      { name: 'Consultas SQL', included: false },
      { name: 'API access', included: false },
      { name: 'SSO / SAML', included: false },
    ],
  },
  {
    name: 'Pro',
    icon: Building,
    price: { monthly: 49, annual: 39 },
    desc: 'Para empresas que necesitan potencia y flexibilidad.',
    color: '#3B82F6',
    popular: true,
    features: [
      { name: 'Hasta 25 usuarios', included: true },
      { name: '10 GB de almacenamiento', included: true },
      { name: 'Consultas ilimitadas', included: true },
      { name: 'Chat IA avanzado', included: true },
      { name: 'Soporte prioritario', included: true },
      { name: 'Ingesta multimodal', included: true },
      { name: 'Consultas SQL', included: true },
      { name: 'API access', included: true },
      { name: 'SSO / SAML', included: false },
    ],
  },
  {
    name: 'Enterprise',
    icon: Crown,
    price: { monthly: 149, annual: 119 },
    desc: 'Para organizaciones que necesitan todo, sin límites.',
    color: '#8B5CF6',
    popular: false,
    features: [
      { name: 'Usuarios ilimitados', included: true },
      { name: '100 GB de almacenamiento', included: true },
      { name: 'Consultas ilimitadas', included: true },
      { name: 'Chat IA con modelos custom', included: true },
      { name: 'Soporte 24/7 dedicado', included: true },
      { name: 'Ingesta multimodal', included: true },
      { name: 'Consultas SQL avanzadas', included: true },
      { name: 'API access premium', included: true },
      { name: 'SSO / SAML', included: true },
    ],
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      <Header />
      <div className="mesh-gradient" />

      <main>
        <section style={{ paddingTop: 'calc(var(--header-height) + 80px)', paddingBottom: '40px' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 12 }}>
                <Sparkles size={14} /> Pricing transparente
              </span>
              <h1 style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 20 }}>
                El Plan Perfecto para Tu Equipo
              </h1>
              <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 32px' }}>
                Empieza gratis, escala cuando lo necesites. Sin sorpresas.
              </p>
            </motion.div>

            {/* Toggle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 50, padding: '6px', borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
            >
              <button
                onClick={() => setAnnual(false)}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  background: !annual ? 'var(--accent)' : 'transparent', color: !annual ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.3s',
                }}
              >
                Mensual
              </button>
              <button
                onClick={() => setAnnual(true)}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  background: annual ? 'var(--accent)' : 'transparent', color: annual ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                Anual
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>-20%</span>
              </button>
            </motion.div>
          </div>
        </section>

        <section style={{ paddingBottom: 100 }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="card"
                  style={{
                    padding: 32,
                    position: 'relative',
                    border: plan.popular ? '2px solid var(--accent)' : '1px solid var(--border-primary)',
                    overflow: 'hidden',
                  }}
                >
                  {plan.popular && (
                    <div
                      style={{
                        position: 'absolute', top: 16, right: 16, padding: '4px 12px', borderRadius: 100,
                        background: 'var(--gradient-accent)', color: 'white', fontSize: 11, fontWeight: 700,
                      }}
                    >
                      MÁS POPULAR
                    </div>
                  )}

                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${plan.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: plan.color, marginBottom: 16 }}>
                    <plan.icon size={22} />
                  </div>

                  <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{plan.name}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>{plan.desc}</p>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                    <span style={{ fontSize: 44, fontWeight: 800 }}>
                      ${annual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span style={{ fontSize: 15, color: 'var(--text-tertiary)' }}>/mes</span>
                  </div>

                  <Link
                    href="/auth"
                    className={plan.popular ? 'btn-primary' : 'btn-secondary'}
                    style={{ textDecoration: 'none', width: '100%', justifyContent: 'center', marginBottom: 24 }}
                  >
                    {plan.price.monthly === 0 ? 'Empezar Gratis' : 'Comenzar'}
                    <ArrowRight size={16} />
                  </Link>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {plan.features.map((f) => (
                      <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                        {f.included ? (
                          <Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                        ) : (
                          <X size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                        )}
                        <span style={{ color: f.included ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>
                          {f.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
