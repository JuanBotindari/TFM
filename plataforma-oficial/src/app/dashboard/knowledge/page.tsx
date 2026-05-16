'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Brain, 
  Database, 
  FileText, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Layers,
  Zap,
  TrendingUp,
  BookOpen,
  PieChart
} from 'lucide-react';
import Link from 'next/link';

export default function KnowledgeBasePage() {
  const { currentOrg } = useAuth();
  const [stats, setStats] = useState({
    tables: 0,
    rows: 0,
    documents: 0,
    chunks: 0,
    lastUpdate: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentOrg?.id) return;
      setLoading(true);
      try {
        // Fetch counts for summary
        const [
          { count: polizaCount },
          { count: personaCount },
          { count: docsCount },
          { count: chunksCount }
        ] = await Promise.all([
          supabase.from('poliza').select('*', { count: 'exact', head: true }).eq('org_id', currentOrg.id),
          supabase.from('persona').select('*', { count: 'exact', head: true }).eq('org_id', currentOrg.id),
          supabase.from('documents').select('*', { count: 'exact', head: true }).eq('org_id', currentOrg.id),
          supabase.from('document_chunks').select('*', { count: 'exact', head: true }).eq('org_id', currentOrg.id),
        ]);

        setStats({
          tables: 5, // persona, poliza, siniestro, recibo, pago
          rows: (polizaCount || 0) + (personaCount || 0),
          documents: docsCount || 0,
          chunks: chunksCount || 0,
          lastUpdate: new Date().toLocaleString()
        });
      } catch (err) {
        console.error('Error fetching knowledge stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentOrg]);

  const cards = [
    {
      title: 'Datos Estructurados',
      description: 'Tablas relacionales con información de pólizas, asegurados y siniestros.',
      icon: Database,
      count: `${stats.rows} registros`,
      link: '/dashboard/tables',
      color: 'var(--accent)',
      features: ['Filtros dinámicos', 'Exportación CSV', 'Integridad relacional']
    },
    {
      title: 'Datos No Estructurados',
      description: 'Documentos PDF, Word y texto procesados para búsqueda semántica.',
      icon: FileText,
      count: `${stats.documents} archivos`,
      link: '/dashboard/documents',
      color: '#8B5CF6',
      features: ['Búsqueda RAG', 'Fragmentación inteligente', 'Vectores de IA']
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Base de Conocimiento</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            El cerebro de tu organización. Combina datos de tablas y documentos para alimentar la IA.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600, display: 'block' }}>ÚLTIMA SINCRONIZACIÓN</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{stats.lastUpdate || 'Cargando...'}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        {[
          { label: 'Tablas Activas', value: stats.tables, icon: Layers, color: 'var(--accent)' },
          { label: 'Documentos', value: stats.documents, icon: BookOpen, color: '#8B5CF6' },
          { label: 'Fragmentos IA', value: stats.chunks, icon: Zap, color: '#F59E0B' },
          { label: 'Crecimiento', value: '+12%', icon: TrendingUp, color: '#22C55E' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card" 
            style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}
          >
            <div style={{ 
              width: 52, height: 52, borderRadius: 14, background: `${stat.color}15`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color
            }}>
              <stat.icon size={24} />
            </div>
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>{stat.label}</p>
              <h3 style={{ fontSize: 24, fontWeight: 800 }}>{loading ? '...' : stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {cards.map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ 
              position: 'absolute', top: -20, right: -20, opacity: 0.05, transform: 'rotate(-15deg)'
            }}>
              <card.icon size={160} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: 18, background: 'var(--bg-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color
              }}>
                <card.icon size={32} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: card.color }}>{loading ? '...' : card.count}</span>
            </div>

            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{card.title}</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                {card.description}
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {card.features.map((f, j) => (
                  <span key={j} style={{ 
                    fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 20, 
                    background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)'
                  }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <Link href={card.link} style={{ marginTop: 'auto' }}>
              <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px' }}>
                Explorar {card.title} <ArrowRight size={18} />
              </button>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Integration Status */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card" 
        style={{ padding: 32, background: 'var(--bg-tertiary)', border: '1px solid var(--accent)' }}
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
            boxShadow: '0 0 20px var(--accent-light)'
          }}>
            <Brain size={40} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Integración de IA Híbrida</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              Tu asistente de IA está configurado para consultar **ambas fuentes de datos** simultáneamente. 
              Esto significa que puede responder preguntas complejas que cruzan información de tus PDFs con datos reales de tus tablas SQL.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22C55E', fontWeight: 700, fontSize: 14 }}>
                <CheckCircle2 size={16} /> Sistema Activo
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Latencia: 142ms</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
