'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { Menu, X, Sun, Moon, Monitor, ChevronRight } from 'lucide-react';

const navLinks = [
  { name: 'Inicio', href: '/' },
  { name: 'Nosotros', href: '/about' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Pitch', href: '/pitch' },
  { name: 'Contacto', href: '/contact' },
];

const themeIcons = {
  light: Sun,
  grey: Monitor,
  midnight: Moon,
};

import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { theme, cycleTheme, themeLabel } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const ThemeIcon = themeIcons[theme];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 'var(--header-height)',
        background: theme === 'light'
          ? 'rgba(248, 250, 252, 0.85)'
          : theme === 'grey'
            ? 'rgba(17, 17, 17, 0.85)'
            : 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-primary)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.05 }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--gradient-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            T
          </motion.div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            TFM<span style={{ color: 'var(--accent)' }}>.</span>producto
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '8px 18px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  background: isActive ? 'var(--accent-light)' : 'transparent',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={cycleTheme}
            title={themeLabel}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <ThemeIcon size={18} />
          </motion.button>

          {/* Auth buttons */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '8px' }}>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="btn-ghost" style={{ textDecoration: 'none', fontSize: 14 }}>
                  Dashboard
                </Link>
                <button 
                  onClick={() => logout()} 
                  className="btn-primary" 
                  style={{ textDecoration: 'none', padding: '10px 22px', fontSize: 14, cursor: 'pointer', border: 'none' }}
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/auth" className="btn-ghost" style={{ textDecoration: 'none', fontSize: 14 }}>
                  Iniciar Sesión
                </Link>
                <Link href="/auth" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 22px', fontSize: 14 }}>
                  Comenzar
                  <ChevronRight size={16} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-toggle"
            style={{
              display: 'none',
              width: 40,
              height: 40,
              borderRadius: 10,
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-primary)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 500,
                    color: pathname === link.href ? 'var(--accent)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    background: pathname === link.href ? 'var(--accent-light)' : 'transparent',
                  }}
                >
                  {link.name}
                </Link>
              ))}
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <Link
                  href="/auth"
                  className="btn-primary"
                  onClick={() => setMobileOpen(false)}
                  style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}
                >
                  Comenzar
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
