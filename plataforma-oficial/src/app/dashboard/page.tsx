'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardStats } from '@/lib/mockData';
import { FileText, Search, Users, HardDrive, ArrowUpRight } from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function DashboardPage() {
  const { currentUser, currentOrg } = useAuth();

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Overview de {currentOrg?.name}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Bienvenido de nuevo, {currentUser?.name}. Aquí tienes un resumen de la actividad.
        </p>
      </motion.div>

      {/* Bento Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        marginBottom: 24
      }}>
        {/* KPI Cards */}
        {[
          { label: 'Documentos Indexados', value: dashboardStats.indexedDocuments, total: dashboardStats.totalDocuments, icon: FileText, color: 'var(--accent)' },
          { label: 'Consultas (Mes)', value: dashboardStats.totalQueries, growth: '+12.5%', icon: Search, color: '#22C55E' },
          { label: 'Usuarios Activos', value: dashboardStats.activeUsers, icon: Users, color: '#F59E0B' },
          { label: 'Almacenamiento', value: dashboardStats.storageUsed, total: dashboardStats.storageTotal, icon: HardDrive, color: '#8B5CF6' }
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: `${stat.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color
              }}>
                <stat.icon size={20} />
              </div>
              {stat.growth && (
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ArrowUpRight size={14} /> {stat.growth}
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>
              {stat.label}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 800 }}>{stat.value}</span>
              {stat.total && <span style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>/ {stat.total}</span>}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Chart Area */}
        <motion.div variants={itemVariants} className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Actividad de Consultas</h3>
          <div style={{ height: 250, display: 'flex', alignItems: 'flex-end', gap: 16, paddingBottom: 20 }}>
            {dashboardStats.monthlyCharts.map((data, i) => {
              const maxQueries = Math.max(...dashboardStats.monthlyCharts.map(d => d.queries));
              const height = `${(data.queries / maxQueries) * 100}%`;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div className="chart-bar tooltip" data-tooltip={`${data.queries} consultas`} style={{ width: '100%', height, borderRadius: '6px 6px 0 0' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{data.month}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity / Plan Info */}
        <motion.div variants={itemVariants} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Detalles del Plan</h3>
          <div style={{ flex: 1 }}>
            <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-tertiary)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Plan {currentOrg?.plan.toUpperCase()}</span>
                <span className="badge badge-info">Activo</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Tu organización está en el plan {currentOrg?.plan}. Tienes acceso a todas las funcionalidades principales.
              </p>
            </div>
            
            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Atajos Rápidos</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Subir nuevo documento', 'Invitar miembro del equipo', 'Configurar integración'].map((task, i) => (
                <button key={i} style={{
                  padding: '12px', borderRadius: 8, border: '1px solid var(--border-primary)',
                  background: 'transparent', color: 'var(--text-primary)', fontSize: 13, textAlign: 'left',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'background 0.2s'
                }} className="btn-ghost">
                  {task} <ArrowUpRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
