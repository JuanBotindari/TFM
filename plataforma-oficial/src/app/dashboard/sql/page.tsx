'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Play, Save, AlertCircle, Database, Lock, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface HistoryItem {
  id: string;
  query: string;
  timestamp: string;
  status: 'success' | 'error';
  error?: string;
}

const businessTemplates = [
  {
    id: 'temp-001',
    name: 'Listar Pólizas Activas',
    query: "SELECT * FROM poliza LIMIT 10;"
  },
  {
    id: 'temp-002',
    name: 'Siniestros por Estado',
    query: "SELECT estado, COUNT(*) as cantidad FROM siniestro GROUP BY estado;"
  },
  {
    id: 'temp-003',
    name: 'Últimos Pagos Registrados',
    query: "SELECT * FROM pago ORDER BY id DESC LIMIT 10;"
  },
  {
    id: 'temp-004',
    name: 'Buscar Personas Aseguradas',
    query: "SELECT * FROM persona LIMIT 10;"
  },
  {
    id: 'temp-005',
    name: 'Pólizas con sus Asegurados',
    query: "SELECT p.numero_poliza, per.nombre, per.email \nFROM poliza p \nJOIN asegurado_poliza ap ON p.id = ap.poliza_id \nJOIN persona per ON ap.persona_id = per.id \nLIMIT 10;"
  }
];

export default function SqlPage() {
  const { isAdmin } = useAuth();
  const [query, setQuery] = useState('SELECT * FROM poliza LIMIT 10;');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{cols: string[], rows: any[]}|null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // History and Tab states
  const [activeTab, setActiveTab] = useState<'schema' | 'history' | 'saved'>('schema');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [schema, setSchema] = useState<Record<string, string[]>>({});
  const [isLoadingSchema, setIsLoadingSchema] = useState(true);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tfm-sql-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading SQL history:', e);
      }
    }
  }, []);

  // Fetch actual schema from DB on mount, filtering out system/RAG tables
  useEffect(() => {
    async function fetchSchema() {
      try {
        setIsLoadingSchema(true);
        const res = await fetch('/api/sql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              SELECT table_name, column_name, data_type 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
                AND table_name NOT IN ('documents', 'document_chunks', 'user_profiles')
              ORDER BY table_name, ordinal_position;
            `
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.rows && data.rows.length > 0) {
            const tempSchema: Record<string, string[]> = {};
            data.rows.forEach((row: any) => {
              const tableName = row.table_name;
              const colInfo = `${row.column_name} (${row.data_type})`;
              if (!tempSchema[tableName]) {
                tempSchema[tableName] = [];
              }
              tempSchema[tableName].push(colInfo);
            });
            setSchema(tempSchema);
          } else {
            // Fallback business schema
            setSchema({
              'poliza': ['id (uuid)', 'numero_poliza (text)', 'fecha_inicio (date)', 'fecha_fin (date)', 'estado (text)'],
              'persona': ['id (uuid)', 'nombre (text)', 'documento (text)', 'email (text)', 'telefono (text)'],
              'siniestro': ['id (uuid)', 'poliza_id (uuid)', 'fecha_siniestro (date)', 'descripcion (text)', 'estado (text)']
            });
          }
        } else {
          throw new Error('No se pudo cargar el esquema.');
        }
      } catch (err) {
        console.error('Error fetching schema:', err);
        // Fallback business schema
        setSchema({
          'poliza': ['id (uuid)', 'numero_poliza (text)', 'fecha_inicio (date)', 'fecha_fin (date)', 'estado (text)'],
          'persona': ['id (uuid)', 'nombre (text)', 'documento (text)', 'email (text)', 'telefono (text)'],
          'siniestro': ['id (uuid)', 'poliza_id (uuid)', 'fecha_siniestro (date)', 'descripcion (text)', 'estado (text)'],
          'pago': ['id (uuid)', 'poliza_id (uuid)', 'fecha_pago (date)', 'monto (numeric)', 'metodo_pago (text)'],
          'recibo': ['id (uuid)', 'poliza_id (uuid)', 'numero_recibo (text)', 'monto (numeric)']
        });
      } finally {
        setIsLoadingSchema(false);
      }
    }

    fetchSchema();
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('tfm-sql-history', JSON.stringify(newHistory));
  };

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Ocurrió un error al ejecutar la consulta.');
      }

      setResults({
        cols: data.cols || [],
        rows: data.rows || [],
      });

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        query,
        timestamp: new Date().toLocaleTimeString(),
        status: 'success',
      };
      saveHistory([newHistoryItem, ...history]);
    } catch (err: any) {
      const errorMessage = err.message || 'Error en la conexión con la base de datos.';
      setError(errorMessage);

      // Add to history as error
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        query,
        timestamp: new Date().toLocaleTimeString(),
        status: 'error',
        error: errorMessage,
      };
      saveHistory([newHistoryItem, ...history]);
    } finally {
      setIsRunning(false);
    }
  };

  const clearHistory = () => {
    saveHistory([]);
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
          <p style={{ color: 'var(--text-secondary)' }}>Ejecuta consultas directamente en la base de datos de producción y explora el esquema de negocio de la empresa.</p>
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
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', fontSize: 14, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Resultados</span>
              {results && (
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {results.rows.length} filas obtenidas
                </span>
              )}
            </div>
            
            <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-card)' }}>
              {error ? (
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                    <AlertCircle size={18} /> Error de SQL
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 13, background: 'rgba(239, 68, 68, 0.05)', padding: 16, borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                    {error}
                  </pre>
                </div>
              ) : results ? (
                results.cols.length > 0 ? (
                  <table className="data-table" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {results.cols.map(c => <th key={c} style={{ position: 'sticky', top: 0, zIndex: 1 }}>{c}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {results.rows.map((r, i) => (
                        <tr key={i}>
                          {results.cols.map(c => (
                            <td key={c} style={{ fontFamily: 'monospace', fontSize: 13 }}>
                              {r[c] === null ? <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>null</span> : String(r[c])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                    Consulta ejecutada con éxito. No se devolvieron filas.
                  </div>
                )
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                  Ejecuta una consulta para ver los resultados
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar (Schema, History, Templates) */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 380 }}>
          
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Tab Header Selector */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)' }}>
              <button 
                onClick={() => setActiveTab('schema')}
                style={{
                  flex: 1, padding: '12px 8px', border: 'none', background: 'transparent',
                  color: activeTab === 'schema' ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'schema' ? 700 : 500, fontSize: 13, cursor: 'pointer',
                  borderBottom: activeTab === 'schema' ? '2px solid var(--accent)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s'
                }}
              >
                <Database size={14} /> Esquema
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                style={{
                  flex: 1, padding: '12px 8px', border: 'none', background: 'transparent',
                  color: activeTab === 'history' ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'history' ? 700 : 500, fontSize: 13, cursor: 'pointer',
                  borderBottom: activeTab === 'history' ? '2px solid var(--accent)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s'
                }}
              >
                <Clock size={14} /> Historial
              </button>
              <button 
                onClick={() => setActiveTab('saved')}
                style={{
                  flex: 1, padding: '12px 8px', border: 'none', background: 'transparent',
                  color: activeTab === 'saved' ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'saved' ? 700 : 500, fontSize: 13, cursor: 'pointer',
                  borderBottom: activeTab === 'saved' ? '2px solid var(--accent)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s'
                }}
              >
                <Save size={14} /> Plantillas
              </button>
            </div>

            {/* Tab Contents */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              {activeTab === 'schema' && (
                <div>
                  {isLoadingSchema ? (
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 14, textAlign: 'center', padding: 24 }}>
                      Cargando esquema de la empresa...
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {Object.keys(schema).map(tableName => (
                        <div key={tableName}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Database size={14} /> {tableName}
                          </p>
                          <div style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, borderLeft: '1px dashed var(--border-primary)' }}>
                            {schema[tableName].map(col => (
                              <div key={col} style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                {col}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Últimas consultas ejecutadas</span>
                    {history.length > 0 && (
                      <button 
                        onClick={clearHistory}
                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                      >
                        <Trash2 size={12} /> Limpiar
                      </button>
                    )}
                  </div>
                  
                  {history.length === 0 ? (
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 14, textAlign: 'center', padding: 24 }}>
                      Aún no hay consultas en el historial.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {history.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => setQuery(item.query)}
                          style={{
                            padding: 12, borderRadius: 8, background: 'var(--bg-tertiary)', cursor: 'pointer',
                            border: '1px solid var(--border-primary)', position: 'relative', overflow: 'hidden',
                            transition: 'border-color 0.2s'
                          }}
                          className="hover:border-[var(--accent)]"
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={10} /> {item.timestamp}
                            </span>
                            {item.status === 'success' ? (
                              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 2, fontSize: 11 }}>
                                <CheckCircle2 size={12} /> OK
                              </span>
                            ) : (
                              <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 2, fontSize: 11 }}>
                                <XCircle size={12} /> Error
                              </span>
                            )}
                          </div>
                          <p style={{
                            fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                          }}>
                            {item.query}
                          </p>
                          {item.error && (
                            <p style={{ fontSize: 10, color: 'var(--danger)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.error}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'saved' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {businessTemplates.map(q => (
                    <div key={q.id} 
                      style={{ padding: '12px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.2s', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)' }}
                      className="hover:bg-[var(--bg-hover)]"
                      onClick={() => setQuery(q.query)}
                    >
                      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{q.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {q.query}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
