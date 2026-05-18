'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { mockSqlQueries } from '@/lib/mockData';
import { Play, Save, History, AlertCircle, Database, Lock } from 'lucide-react';

export default function SqlPage() {
  const { isAdmin } = useAuth();
  const [query, setQuery] = useState('SELECT *\nFROM transacciones\nLIMIT 100;');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{cols: string[], rows: any[]}|null>(null);

  const handleRun = () => {
    setIsRunning(true);
    // Simulate query execution
    setTimeout(() => {
      setIsRunning(false);
      setResults({
        cols: ['id', 'fecha', 'monto', 'tipo', 'cliente'],
        rows: [
          { id: 1, fecha: '2024-08-16', monto: 15000, tipo: 'transferencia', cliente: 'Acme Corp' },
          { id: 2, fecha: '2024-08-16', monto: 3400, tipo: 'depósito', cliente: 'Tech Solutions' },
          { id: 3, fecha: '2024-08-15', monto: 89000, tipo: 'pago_prov', cliente: 'Global Services' },
        ]
      });
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: 'calc(100vh - 120px)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            Consultas SQL
            {!isAdmin && (
              <span className="badge" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>
                <Lock size={12} /> Read-Only
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Consulta directamente las tablas de datos indexados (CSVs, bases de datos).</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flex: 1, minHeight: 0 }}>
        
        {/* Main Editor Area */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Editor Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Editor Toolbar */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: 'var(--radius)', borderTopRightRadius: 'var(--radius)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22C55E' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {isAdmin && (
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }}>
                    <Save size={14} /> Guardar
                  </button>
                )}
                <button 
                  onClick={handleRun}
                  disabled={isRunning || (!isAdmin && !query.trim().toUpperCase().startsWith('SELECT'))}
                  className="btn-primary" 
                  style={{ padding: '6px 16px', fontSize: 13 }}
                >
                  {isRunning ? 'Ejecutando...' : <><Play size={14} /> Ejecutar</>}
                </button>
              </div>
            </div>

            {!isAdmin && !query.trim().toUpperCase().startsWith('SELECT') && (
              <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <AlertCircle size={16} /> En modo Read-Only, solo se permiten sentencias SELECT.
              </div>
            )}

            {/* Editor Textarea */}
            <div style={{ flex: 1, padding: 16, background: 'var(--bg-input)' }}>
              <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: 15, resize: 'none'
                }}
                spellCheck={false}
              />
            </div>
          </motion.div>

          {/* Results Area */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', fontSize: 14, fontWeight: 600 }}>
              Resultados
            </div>
            <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-card)' }}>
              {results ? (
                <table className="data-table" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {results.cols.map(c => <th key={c} style={{ position: 'sticky', top: 0, zIndex: 1 }}>{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {results.rows.map((r, i) => (
                      <tr key={i}>
                        {results.cols.map(c => <td key={c} style={{ fontFamily: 'monospace', fontSize: 13 }}>{r[c]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                  Ejecuta una consulta para ver los resultados
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar (Saved Queries / Schema) */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 350 }}>
          
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <History size={16} /> Consultas Guardadas
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
              {mockSqlQueries.map(q => (
                <div key={q.id} 
                  style={{ padding: '12px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.2s' }}
                  className="hover:bg-[var(--bg-hover)]"
                  onClick={() => setQuery(q.query)}
                >
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{q.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {q.query}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Database size={16} /> Esquema de Tablas
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Database size={14} /> transacciones
                </p>
                <div style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['id (int)', 'fecha (date)', 'monto (numeric)', 'tipo (varchar)', 'cliente (varchar)'].map(col => (
                    <div key={col} style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {col}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
