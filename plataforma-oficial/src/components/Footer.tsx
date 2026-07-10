'use client';

import React from 'react';
import Link from 'next/link';
import { Code, Globe, Mail, Heart } from 'lucide-react';

const footerLinks = {
  Producto: [
    { name: 'Características', href: '/#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Demo', href: '/auth' },
    { name: 'API', href: '#' },
  ],
  Empresa: [
    { name: 'Nosotros', href: '/about' },
    { name: 'Contacto', href: '/contact' },
    { name: 'Blog', href: '#' },
    { name: 'Careers', href: '#' },
  ],
  Legal: [
    { name: 'Privacidad', href: '#' },
    { name: 'Términos', href: '#' },
    { name: 'Licencia', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-primary)',
        padding: '60px 0 30px',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '40px',
            marginBottom: '50px',
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'var(--gradient-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                T
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                Omni<span style={{ color: 'var(--accent)' }}>RAG</span>
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.6, maxWidth: 280 }}>
              La plataforma de IA RAG para empresas que necesitan gestionar y consultar su conocimiento de forma inteligente.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              {[
                { icon: Code, href: 'https://github.com/JuanBotindari' },
                { icon: Globe, href: '#' },
                { icon: Mail, href: 'mailto:contact@omnirag.com' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-tertiary)',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-tertiary)',
                  marginBottom: '16px',
                }}
              >
                {title}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {links.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    style={{
                      fontSize: 14,
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-primary)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            © {new Date().getFullYear()} OmniRAG. Todos los derechos reservados.
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Hecho con <Heart size={12} style={{ color: 'var(--danger)' }} /> por Juan Botindari
          </p>
        </div>
      </div>
    </footer>
  );
}
