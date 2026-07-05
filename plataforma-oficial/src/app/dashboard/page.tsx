'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { orgStats } from '@/lib/mockData';
import { 
  FileText, 
  Search, 
  Users, 
  HardDrive, 
  ArrowUpRight, 
  Database, 
  Shield, 
  CheckCircle, 
  UploadCloud, 
  X, 
  Plus, 
  Terminal, 
  RefreshCw, 
  Cpu, 
  Activity, 
  Clock,
  Sparkles,
  Check
} from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
};

export default function DashboardPage() {
  const { currentUser, currentOrg } = useAuth();
  
  // Interactive States
  const [period, setPeriod] = useState<'7d' | '30d' | '12m'>('30d');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  
  // Simulated File Upload State
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocsCount, setUploadedDocsCount] = useState(0);
  const [recentUploadedFiles, setRecentUploadedFiles] = useState<string[]>([]);
  
  // Simulated User Invite State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [invitedUsersCount, setInvitedUsersCount] = useState(0);

  // Reset states on modal close
  useEffect(() => {
    if (!uploadModalOpen) {
      setFileName('');
      setIsUploading(false);
      setUploadStep(0);
      setUploadProgress(0);
    }
  }, [uploadModalOpen]);

  useEffect(() => {
    if (!inviteModalOpen) {
      setInviteName('');
      setInviteEmail('');
      setInviteRole('viewer');
      setIsInviting(false);
      setInviteSuccess(false);
    }
  }, [inviteModalOpen]);

  // Base Stats fetching
  const orgId = currentOrg?.id || 'org-banco';
  const baseStats = orgStats[orgId] || orgStats['org-banco'];

  // Dynamically calculate stats based on the selected period
  const getPeriodStats = () => {
    const totalDocs = baseStats.totalDocuments + uploadedDocsCount;
    const indexedDocs = baseStats.indexedDocuments + uploadedDocsCount;
    const activeUsers = baseStats.activeUsers + invitedUsersCount;

    let totalQueries = baseStats.totalQueries;
    let growth = baseStats.weeklyGrowth;
    let storageUsedStr = baseStats.storageUsed;
    const storageTotalStr = baseStats.storageTotal;

    // Parse storage float value
    const storageUsedNum = parseFloat(storageUsedStr);

    if (period === '7d') {
      totalQueries = Math.round(baseStats.totalQueries * 0.23);
      growth = parseFloat((baseStats.weeklyGrowth * 0.8).toFixed(1));
      storageUsedStr = `${(storageUsedNum * 0.98).toFixed(1)} GB`;
    } else if (period === '12m') {
      totalQueries = Math.round(baseStats.totalQueries * 11.2);
      growth = parseFloat((baseStats.weeklyGrowth * 1.4).toFixed(1));
      storageUsedStr = `${(storageUsedNum * 1.15).toFixed(1)} GB`;
    }

    return {
      totalDocuments: totalDocs,
      indexedDocuments: indexedDocs,
      totalQueries,
      activeUsers,
      storageUsed: storageUsedStr,
      storageTotal: storageTotalStr,
      weeklyGrowth: growth
    };
  };

  const stats = getPeriodStats();

  // Intent Router Distribution Mock Data
  const intentDistribution = orgId === 'org-banco' ? [
    { label: 'Búsqueda Semántica (RAG)', pct: 62, count: Math.round(stats.totalQueries * 0.62), color: 'var(--accent)' },
    { label: 'Consultas Tabulares (Pandas)', pct: 24, count: Math.round(stats.totalQueries * 0.24), color: '#10B981' },
    { label: 'Navegación Web (Internet)', pct: 8, count: Math.round(stats.totalQueries * 0.08), color: '#8B5CF6' },
    { label: 'Respuestas Directas (LLM)', pct: 6, count: Math.round(stats.totalQueries * 0.06), color: '#F59E0B' },
  ] : [
    { label: 'Búsqueda Semántica (RAG)', pct: 70, count: Math.round(stats.totalQueries * 0.70), color: 'var(--accent)' },
    { label: 'Consultas Tabulares (Pandas)', pct: 18, count: Math.round(stats.totalQueries * 0.18), color: '#10B981' },
    { label: 'Navegación Web (Internet)', pct: 5, count: Math.round(stats.totalQueries * 0.05), color: '#8B5CF6' },
    { label: 'Respuestas Directas (LLM)', pct: 7, count: Math.round(stats.totalQueries * 0.07), color: '#F59E0B' },
  ];

  // Recent Queries List Mock Data
  const baseRecentActivities = orgId === 'org-banco' ? [
    { user: 'Admin Banco', query: '¿Cuáles son los requisitos para un crédito hipotecario en la política 2024?', intent: 'RAG', time: 'hace 12 min', status: 'Success' },
    { user: 'Editor Banco', query: 'SELECT cliente, SUM(monto) FROM transacciones GROUP BY cliente LIMIT 5', intent: 'TABLA', time: 'hace 45 min', status: 'Success' },
    { user: 'Demo Banco', query: 'Buscar últimas noticias sobre regulaciones BCRA en internet', intent: 'INTERNET', time: 'hace 2 horas', status: 'Success' },
    { user: 'System', query: 'Resumen de transacciones sospechosas del mes', intent: 'TABLA', time: 'hace 4 horas', status: 'Success' },
  ] : [
    { user: 'Admin Estudio', query: '¿Cuál es la fecha límite para la presentación de balances corporativos?', intent: 'RAG', time: 'hace 8 min', status: 'Success' },
    { user: 'Editor Estudio', query: 'SELECT * FROM clientes WHERE estado = \'activo\'', intent: 'TABLA', time: 'hace 1 hora', status: 'Success' },
    { user: 'Demo Estudio', query: 'Redactar mail de cortesía técnica de bienvenida para nuevos clientes', intent: 'DIRECTO', time: 'hace 3 horas', status: 'Success' },
    { user: 'System', query: 'Indexado de Balance General 2024.pdf finalizado', intent: 'SYSTEM', time: 'hace 5 horas', status: 'Success' },
  ];

  // Prepend uploaded files to activity list
  const recentActivities = [
    ...recentUploadedFiles.map((file, idx) => ({
      user: currentUser?.name || 'Usuario',
      query: `Indexado de documento: ${file}`,
      intent: 'INDEXADO',
      time: 'hace unos instantes',
      status: 'Success'
    })),
    ...baseRecentActivities
  ];

  // Simulated Upload Sequence
  const startSimulatedUpload = () => {
    if (!fileName) return;
    setIsUploading(true);
    setUploadStep(1);
    setUploadProgress(15);
    
    setTimeout(() => {
      setUploadStep(2);
      setUploadProgress(45);
      
      setTimeout(() => {
        setUploadStep(3);
        setUploadProgress(75);
        
        setTimeout(() => {
          setUploadStep(4);
          setUploadProgress(100);
          setUploadedDocsCount(prev => prev + 1);
          setRecentUploadedFiles(prev => [fileName, ...prev]);
          
          setTimeout(() => {
            setUploadModalOpen(false);
          }, 800);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  // Simulated User Invitation
  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    setIsInviting(true);
    
    setTimeout(() => {
      setIsInviting(false);
      setInviteSuccess(true);
      setInvitedUsersCount(prev => prev + 1);
      
      setTimeout(() => {
        setInviteModalOpen(false);
      }, 1200);
    }, 1500);
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      
      {/* Top Banner Area */}
      <motion.div variants={itemVariants} style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: 16,
        paddingBottom: 8,
        borderBottom: '1px solid var(--border-primary)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>{currentOrg?.logo || '🏢'}</span>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Overview de {currentOrg?.name || 'Cargando...'}
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Bienvenido de nuevo, <strong style={{ color: 'var(--text-primary)' }}>{currentUser?.name}</strong>. Aquí tienes la actividad de tu organización.
          </p>
        </div>

        {/* Quick Filter & Actions Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          
          {/* Period Selector Tabs */}
          <div style={{ 
            display: 'flex', 
            background: 'var(--bg-tertiary)', 
            padding: 4, 
            borderRadius: 10,
            border: '1px solid var(--border-primary)'
          }}>
            {[
              { key: '7d', label: '7 días' },
              { key: '30d', label: '30 días' },
              { key: '12m', label: '12 meses' }
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setPeriod(t.key as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: period === t.key ? 'var(--bg-card)' : 'transparent',
                  color: period === t.key ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  boxShadow: period === t.key ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Quick Action Button - Upload */}
          <button 
            onClick={() => setUploadModalOpen(true)}
            className="btn-primary" 
            style={{ padding: '8px 16px', fontSize: 13, borderRadius: 10 }}
          >
            <UploadCloud size={16} />
            Subir Documento
          </button>
        </div>
      </motion.div>

      {/* KPI Bento Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20
      }}>
        {[
          { 
            label: 'Documentos Indexados', 
            value: stats.indexedDocuments, 
            total: stats.totalDocuments, 
            icon: FileText, 
            color: 'var(--accent)',
            desc: 'Archivos procesados en RAG' 
          },
          { 
            label: 'Consultas al Sistema', 
            value: stats.totalQueries.toLocaleString(), 
            growth: `+${stats.weeklyGrowth}%`, 
            icon: Search, 
            color: '#10B981',
            desc: 'Peticiones totales recibidas' 
          },
          { 
            label: 'Usuarios Activos', 
            value: stats.activeUsers, 
            icon: Users, 
            color: '#F59E0B',
            desc: 'Miembros con acceso autorizado' 
          },
          { 
            label: 'Espacio Almacenado', 
            value: stats.storageUsed, 
            total: stats.storageTotal, 
            icon: HardDrive, 
            color: '#8B5CF6',
            desc: 'Tamaño total de PDF/CSV' 
          }
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, background: `${stat.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color
              }}>
                <stat.icon size={18} />
              </div>
              {stat.growth && (
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 8px', fontSize: 11 }}>
                  <ArrowUpRight size={12} /> {stat.growth}
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>
              {stat.label}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 24, fontWeight: 800 }}>{stat.value}</span>
              {stat.total && <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>/ {stat.total}</span>}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
              {stat.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Main Grid Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Chart and Queries Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Chart Card */}
          <motion.div variants={itemVariants} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Historial de Tráfico de Consultas</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Volumen de consultas gestionadas por mes</p>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} /> Actualizado en tiempo real
              </span>
            </div>

            {/* Custom Interactive CSS Bar Chart */}
            <div style={{ height: 220, display: 'flex', alignItems: 'flex-end', gap: 16, paddingBottom: 10, paddingTop: 10 }}>
              {baseStats.monthlyCharts.map((data: any, i: number) => {
                const maxQueries = Math.max(...baseStats.monthlyCharts.map((d: any) => d.queries));
                // Scale height
                const heightValue = (data.queries / maxQueries) * 180; // max height 180px
                
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ 
                      position: 'relative', 
                      width: '100%', 
                      height: 180, 
                      display: 'flex', 
                      alignItems: 'flex-end'
                    }}>
                      <div 
                        className="chart-bar tooltip" 
                        data-tooltip={`${data.queries} consultas`} 
                        style={{ 
                          width: '100%', 
                          height: heightValue, 
                          borderRadius: '6px 6px 0 0',
                          background: i === baseStats.monthlyCharts.length - 1 ? 'var(--gradient-accent)' : 'var(--bg-tertiary)',
                          border: i === baseStats.monthlyCharts.length - 1 ? 'none' : '1px solid var(--border-primary)',
                          transition: 'all 0.3s'
                        }} 
                      />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{data.month}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Queries Activity Log */}
          <motion.div variants={itemVariants} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Actividad Reciente del Inquilino</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Trazas del Intent Router y eventos del sistema</p>
              </div>
              <span className="badge badge-info" style={{ fontSize: 11 }}>
                Live Stream
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Evento / Consulta</th>
                    <th>Intención</th>
                    <th>Tiempo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map((act, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {act.user}
                      </td>
                      <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {act.query}
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: 10, 
                          fontWeight: 700, 
                          padding: '2px 6px', 
                          borderRadius: 4,
                          background: act.intent === 'RAG' ? 'rgba(37,99,235,0.1)' : 
                                      act.intent === 'TABLA' ? 'rgba(16,185,129,0.1)' : 
                                      act.intent === 'INTERNET' ? 'rgba(139,92,246,0.1)' : 
                                      act.intent === 'INDEXADO' ? 'rgba(37,99,235,0.2)' : 'rgba(245,158,11,0.1)',
                          color: act.intent === 'RAG' ? 'var(--accent)' : 
                                 act.intent === 'TABLA' ? '#10B981' : 
                                 act.intent === 'INTERNET' ? '#8B5CF6' : 
                                 act.intent === 'INDEXADO' ? 'var(--accent)' : '#F59E0B'
                        }}>
                          {act.intent}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{act.time}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#10B981', fontSize: 12, fontWeight: 600 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Intent Breakdown & Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Intent Router Distribution Card */}
          <motion.div variants={itemVariants} className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Distribución del Ruteador</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Clasificación de intenciones ejecutadas por el LLM orquestador
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {intentDistribution.map((intent, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{intent.label}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{intent.pct}% ({intent.count})</span>
                  </div>
                  {/* Custom Progress Bar */}
                  <div style={{ width: '100%', height: 6, background: 'var(--bg-tertiary)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ width: `${intent.pct}%`, height: '100%', background: intent.color, borderRadius: 100 }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* System Health / Diagnostics Card */}
          <motion.div variants={itemVariants} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Activity size={18} style={{ color: 'var(--accent)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Diagnóstico de Seguridad</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Aislamiento Row-Level Security', status: 'Activo', value: `Filtro org_id = '${orgId}'`, ok: true },
                { label: 'Tokens Vectoriales Activos', status: 'Listo', value: orgId === 'org-banco' ? '24,510 embeddings' : '11,240 embeddings', ok: true },
                { label: 'Servicio de Inferencia IA', status: 'Online', value: 'Local LLM Server (Ollama)', ok: true },
                { label: 'Latencia Promedio', status: 'Estable', value: orgId === 'org-banco' ? '1.2s (Medio)' : '0.8s (Medio)', ok: true },
                { label: 'Tasa Acierto Caché (Redis)', status: 'Optimizada', value: orgId === 'org-banco' ? '78.4%' : '81.2%', ok: true },
              ].map((diag, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  paddingBottom: 10,
                  borderBottom: i < 4 ? '1px solid var(--border-primary)' : 'none'
                }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{diag.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{diag.value}</p>
                  </div>
                  <span className="badge badge-success" style={{ padding: '2px 8px', fontSize: 10 }}>
                    {diag.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Plan Details & Quick Shortcuts */}
          <motion.div variants={itemVariants} className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Suscripción & Permisos</h3>
            
            <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-tertiary)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Plan {currentOrg?.plan.toUpperCase()}</span>
                <span className="badge badge-info" style={{ fontSize: 10, padding: '2px 8px' }}>Soberano</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Suscripción administrada por el Estudio Botindari. Acceso total a base relacional y vector store.
              </p>
            </div>
            
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Atajos de Gestión</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button 
                onClick={() => setInviteModalOpen(true)}
                style={{
                  padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-primary)',
                  background: 'transparent', color: 'var(--text-primary)', fontSize: 12, textAlign: 'left',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }} 
                className="btn-ghost"
              >
                <span>Invitar miembro al equipo</span>
                <Plus size={14} style={{ color: 'var(--text-tertiary)' }} />
              </button>

              <button 
                onClick={() => window.location.href = '/dashboard/chat'}
                style={{
                  padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-primary)',
                  background: 'transparent', color: 'var(--text-primary)', fontSize: 12, textAlign: 'left',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }} 
                className="btn-ghost"
              >
                <span>Abrir Chat de Inferencia RAG</span>
                <ArrowUpRight size={14} style={{ color: 'var(--text-tertiary)' }} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* SIMULATED UPLOAD MODAL */}
      {/* ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {uploadModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card"
              style={{
                width: '100%',
                maxWidth: 480,
                padding: 28,
                background: 'var(--bg-card)',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative'
              }}
            >
              <button 
                onClick={() => setUploadModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)'
                }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <UploadCloud size={24} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Indexar Nuevo Archivo</h3>
              </div>

              {!isUploading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Sube un documento corporativo (PDF, CSV, TXT) para que el Intent Router lo ponga a disposición de la IA mediante fragmentación vectorial (RAG).
                  </p>
                  
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      Nombre del archivo
                    </label>
                    <input 
                      type="text" 
                      placeholder="ej. Politica_Vacaciones_2026.pdf" 
                      className="input"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                    />
                  </div>

                  <button 
                    disabled={!fileName}
                    onClick={startSimulatedUpload}
                    className="btn-primary" 
                    style={{ width: '100%', padding: '12px', justifyContent: 'center', opacity: fileName ? 1 : 0.6 }}
                  >
                    Iniciar Procesamiento RAG
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'center', padding: '10px 0' }}>
                  
                  {/* Step status circles */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', margin: '0 20px 10px' }}>
                    <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 2, background: 'var(--border-primary)', zIndex: 1 }} />
                    <div style={{ position: 'absolute', top: 12, left: 0, width: `${(uploadStep - 1) * 33.3}%`, height: 2, background: 'var(--accent)', zIndex: 2, transition: 'all 0.4s' }} />
                    
                    {[
                      { s: 1, label: 'Subida' },
                      { s: 2, label: 'Chunking' },
                      { s: 3, label: 'Embeddings' },
                      { s: 4, label: 'Listo' }
                    ].map((stepObj) => {
                      const isActive = uploadStep >= stepObj.s;
                      const isCurrent = uploadStep === stepObj.s;
                      return (
                        <div key={stepObj.s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 3 }}>
                          <div style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            background: isActive ? 'var(--accent)' : 'var(--bg-tertiary)',
                            color: isActive ? 'white' : 'var(--text-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 700,
                            border: `2px solid ${isCurrent ? 'var(--accent)' : 'var(--border-primary)'}`,
                            transition: 'all 0.3s'
                          }}>
                            {uploadStep > stepObj.s ? <Check size={12} strokeWidth={3} /> : stepObj.s}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                            {stepObj.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700 }}>
                      {uploadStep === 1 && 'Subiendo archivo al almacenamiento...'}
                      {uploadStep === 2 && 'Segmentando texto en fragmentos (Chunking)...'}
                      {uploadStep === 3 && 'Generando vectores con modelo local...'}
                      {uploadStep === 4 && '¡Base Vectorial Actualizada Exitosamente!'}
                    </h4>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      {uploadStep < 4 ? `Progreso global: ${uploadProgress}%` : `El documento ya está listo para consultas.`}
                    </p>
                  </div>

                  <div style={{ width: '100%', height: 8, background: 'var(--bg-tertiary)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--gradient-accent)', transition: 'width 0.4s' }} />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────── */}
      {/* SIMULATED INVITE MODAL */}
      {/* ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {inviteModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card"
              style={{
                width: '100%',
                maxWidth: 440,
                padding: 28,
                background: 'var(--bg-card)',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative'
              }}
            >
              <button 
                onClick={() => setInviteModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)'
                }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Users size={24} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Invitar Miembro</h3>
              </div>

              {!inviteSuccess ? (
                <form onSubmit={handleInviteUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Agrega un nuevo usuario a tu organización corporativa en la red local.
                  </p>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      Nombre Completo
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="ej. Juan Perez" 
                      className="input"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      Correo Electrónico
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="ej. juan@organizacion.com" 
                      className="input"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      Rol del Sistema
                    </label>
                    <select 
                      className="input"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                    >
                      <option value="viewer">Viewer (Solo lectura)</option>
                      <option value="editor">Editor (Subida e Indexación)</option>
                      <option value="admin">Admin (Acceso Total)</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    disabled={isInviting}
                    className="btn-primary" 
                    style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
                  >
                    {isInviting ? 'Procesando invitación...' : 'Enviar Invitación de Acceso'}
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%', background: 'rgba(16,185,129,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981'
                  }}>
                    <CheckCircle size={36} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 700 }}>Invitación Procesada Exitosamente</h4>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Se ha concedido acceso a <strong>{inviteName}</strong> en la organización con permisos de <strong>{inviteRole.toUpperCase()}</strong>.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

