'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  Database,
  Terminal,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Sparkles,
  FileText,
  Table,
  Brain,
  FolderSearch,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const sidebarItems = [
  { name: 'Resumen General', href: '/dashboard', icon: LayoutDashboard, adminOnly: false },
  { name: 'Chat IA', href: '/dashboard/chat', icon: MessageSquare, adminOnly: false },
  { name: 'Base de Conocimiento', href: '/dashboard/knowledge', icon: Brain, adminOnly: false },
  { name: 'Explorador de Tablas', href: '/dashboard/tables', icon: Table, adminOnly: false },
  { name: 'Explorador de Documentos', href: '/dashboard/documents', icon: FileText, adminOnly: false },
  { name: 'Consultas SQL', href: '/dashboard/sql', icon: Terminal, adminOnly: false },
  { name: 'Gestión Usuarios', href: '/dashboard/users', icon: Users, adminOnly: true },
  { name: 'Control de Acceso', href: '/dashboard/access', icon: Shield, adminOnly: true },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, currentOrg, isAdmin, isGuest, logout } = useAuth();

  const visibleItems = sidebarItems.filter((item) => !item.adminOnly || isAdmin);

  const [health, setHealth] = useState<{
    status: 'healthy' | 'unhealthy' | 'checking' | 'error';
    error?: string;
    interpreted?: string;
    model?: string;
  }>({ status: 'checking' });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/nextapi/health');
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setHealth({
            status: 'unhealthy',
            error: data?.error || 'Error de conexión',
            interpreted: data?.diagnostics?.error?.interpreted || 'El motor de IA está reportando fallos de conexión.'
          });
          return;
        }
        const data = await res.json();
        if (data.status === 'healthy') {
          setHealth({
            status: 'healthy',
            model: data.diagnostics?.llm?.model_configured || 'gemini'
          });
        } else {
          setHealth({
            status: 'unhealthy',
            error: data.diagnostics?.error?.raw || 'Error de diagnóstico',
            interpreted: data.diagnostics?.error?.interpreted || 'Error al conectar al LLM.'
          });
        }
      } catch (err: any) {
        setHealth({
          status: 'error',
          error: err.message,
          interpreted: 'No se pudo conectar con el backend de Python.'
        });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-primary)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 'var(--header-height)',
          padding: collapsed ? '0 16px' : '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-primary)',
          flexShrink: 0,
        }}
      >
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
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
                  flexShrink: 0,
                }}
              >
                T
              </div>
              <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                TFM<span style={{ color: 'var(--accent)' }}>.</span>producto
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {collapsed && (
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
        )}

        {!collapsed && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={14} />
          </motion.button>
        )}
      </div>

      {/* Collapse button (when collapsed) */}
      {collapsed && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggle}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '12px auto',
          }}
        >
          <ChevronRight size={14} />
        </motion.button>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: collapsed ? '8px' : '12px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={collapsed ? 'tooltip' : ''}
                data-tooltip={item.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '12px' : '10px 14px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-light)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 14,
                  transition: 'all 0.2s',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  position: 'relative',
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: 20,
                      borderRadius: 2,
                      background: 'var(--accent)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Guest badge */}
        {isGuest && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              margin: '20px 0',
              padding: '14px',
              borderRadius: 12,
              background: 'var(--accent-light)',
              border: '1px solid var(--accent)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={14} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>Modo Demo</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              Estás en modo solo lectura. Regístrate para acceder a todas las funciones.
            </p>
          </motion.div>
        )}
      </nav>

      {/* IA Status Indicator */}
      <div style={{ flexShrink: 0 }}>
        {!collapsed ? (
          <div style={{
            margin: '10px 12px',
            padding: '12px',
            borderRadius: '12px',
            background: health.status === 'healthy' ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
            border: `1px solid ${health.status === 'healthy' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <motion.span
                animate={{
                  scale: health.status === 'checking' ? [1, 1.2, 1] : 1,
                  opacity: health.status === 'checking' ? [0.6, 1, 0.6] : 1
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: health.status === 'healthy' ? '#10b981' : health.status === 'checking' ? '#f59e0b' : '#ef4444',
                  boxShadow: health.status === 'healthy' ? '0 0 8px #10b981' : health.status === 'checking' ? '0 0 8px #f59e0b' : '0 0 8px #ef4444',
                  display: 'inline-block'
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                {health.status === 'healthy' ? 'Motor IA Activo' : health.status === 'checking' ? 'Verificando IA...' : 'Motor IA Inactivo'}
              </span>
            </div>
            {health.status === 'healthy' && (
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                Modelo: {health.model}
              </span>
            )}
            {health.status !== 'healthy' && health.status !== 'checking' && (
              <span style={{ 
                fontSize: 10, 
                color: 'var(--danger, #ef4444)', 
                lineHeight: 1.4,
                wordBreak: 'break-word',
                maxHeight: '60px',
                overflowY: 'auto' 
              }}>
                {health.interpreted || 'Error de conexión con el LLM.'}
              </span>
            )}
          </div>
        ) : (
          <div 
            className="tooltip" 
            data-tooltip={health.status === 'healthy' ? `Motor IA Activo (${health.model})` : `Error IA: ${health.interpreted || 'Inactivo'}`}
            style={{
              display: 'flex',
              justifyContent: 'center',
              margin: '12px auto',
              cursor: 'pointer'
            }}
          >
            <motion.span
              animate={{
                scale: health.status === 'checking' ? [1, 1.2, 1] : 1,
                opacity: health.status === 'checking' ? [0.6, 1, 0.6] : 1
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: health.status === 'healthy' ? '#10b981' : health.status === 'checking' ? '#f59e0b' : '#ef4444',
                boxShadow: health.status === 'healthy' ? '0 0 8px #10b981' : health.status === 'checking' ? '0 0 8px #f59e0b' : '0 0 8px #ef4444',
                display: 'inline-block'
              }}
            />
          </div>
        )}
      </div>

      {/* User section */}
      <div
        style={{
          padding: collapsed ? '12px 8px' : '16px 20px',
          borderTop: '1px solid var(--border-primary)',
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--gradient-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.name || 'Usuario'}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentOrg?.name || ''}
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: collapsed ? 'column' : 'row', gap: '4px' }}>
          <button
            className={collapsed ? 'tooltip' : ''}
            data-tooltip="Configuración"
            style={{
              flex: collapsed ? undefined : 1,
              padding: collapsed ? '10px' : '8px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--bg-hover)',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <Settings size={16} />
          </button>
          <button
            onClick={logout}
            className={collapsed ? 'tooltip' : ''}
            data-tooltip="Cerrar sesión"
            style={{
              flex: collapsed ? undefined : 1,
              padding: collapsed ? '10px' : '8px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--bg-hover)',
              color: 'var(--danger)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
