'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { BookOpen, Save, FileText, Table as TableIcon, Edit2, ShieldAlert, Check, X } from 'lucide-react';

import { getDefaultTableDocs } from '@/lib/tableSchemas';

export default function DocumentationPage() {
  const { currentOrg, isAdmin } = useAuth();
  
  // States
  const [documents, setDocuments] = useState<any[]>([]);
  const [docDescriptions, setDocDescriptions] = useState<Record<string, string>>({});
  const [tablesDocs, setTablesDocs] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'tables'>('documents');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch uploaded documents
        let query = supabase.from('documents').select('*').order('uploaded_at', { ascending: false });
        if (currentOrg?.id) {
          query = query.eq('org_id', currentOrg.id);
        }
        const { data: docsData } = await query;
        if (docsData) {
          setDocuments(docsData);
          const initialDesc: Record<string, string> = {};
          docsData.forEach((d: any) => {
            if (d.description) initialDesc[d.id] = d.description;
          });
          setDocDescriptions(initialDesc);
        }

        const savedTablesDocs = localStorage.getItem(`tfm_tables_docs_${currentOrg?.id}`);
        if (savedTablesDocs) {
          setTablesDocs(JSON.parse(savedTablesDocs));
        } else {
          setTablesDocs(getDefaultTableDocs(currentOrg?.id));
        }

      } catch (err) {
        console.error('Error fetching documentation data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentOrg]);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem(`tfm_tables_docs_${currentOrg?.id}`, JSON.stringify(tablesDocs));
      
      // Guardar las descripciones directamente en Supabase
      const updatePromises = Object.entries(docDescriptions).map(([id, desc]) => 
        supabase.from('documents').update({ description: desc }).eq('id', id)
      );
      
      await Promise.all(updatePromises);

      setSaving(false);
      alert('Documentación guardada exitosamente.');
    } catch (e) {
      console.error(e);
      setSaving(false);
      alert('Hubo un error al guardar los cambios.');
    }
  };

  const updateTableColumn = (tIndex: number, cIndex: number, field: string, value: any) => {
    const newTablesDocs = [...tablesDocs];
    newTablesDocs[tIndex].columns[cIndex] = {
      ...newTablesDocs[tIndex].columns[cIndex],
      [field]: value
    };
    setTablesDocs(newTablesDocs);
  };

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Cargando documentación...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <BookOpen size={28} color="var(--accent)" />
            Documentación
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Detalles y descripciones de documentos subidos y estructuras de tablas de la base de datos.
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        )}
      </div>

      {!isAdmin && (
        <div style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 12, border: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldAlert size={20} color="var(--text-tertiary)" />
          <span style={{ color: 'var(--text-secondary)' }}>Estás en modo solo lectura. Solo los administradores pueden modificar la documentación.</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border-primary)', paddingBottom: 16 }}>
        <button
          onClick={() => setActiveTab('documents')}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'documents' ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: activeTab === 'documents' ? 'white' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
        >
          <FileText size={18} /> Documentos
        </button>
        <button
          onClick={() => setActiveTab('tables')}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'tables' ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: activeTab === 'tables' ? 'white' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
        >
          <TableIcon size={18} /> Tablas
        </button>
      </div>

      {/* Seccion Documentos */}
      {activeTab === 'documents' && (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={20} /> Documentos Subidos
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-tertiary)' }}>Nombre del Documento</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-tertiary)' }}>Tamaño</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-tertiary)' }}>Subido el</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-tertiary)' }}>Breve Descripción</th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? documents.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{doc.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{formatSize(doc.size_bytes)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(doc.uploaded_at).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {isAdmin ? (
                      <input 
                        type="text" 
                        value={docDescriptions[doc.id] || ''}
                        onChange={(e) => setDocDescriptions(prev => ({...prev, [doc.id]: e.target.value}))}
                        placeholder="Añadir descripción..."
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 6,
                          border: '1px solid var(--border-primary)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    ) : (
                      <span style={{ color: docDescriptions[doc.id] ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                        {docDescriptions[doc.id] || 'Sin descripción'}
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    No hay documentos subidos en esta organización.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      )}

      {/* Seccion Tablas */}
      {activeTab === 'tables' && (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TableIcon size={20} /> Descripción de Tablas
        </h2>
        
        {tablesDocs.map((table, tIndex) => (
          <div key={tIndex} style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: '8px 8px 0 0', margin: 0, border: '1px solid var(--border-primary)', borderBottom: 'none' }}>
              Tabla: <span style={{ color: 'var(--accent)' }}>{table.tableName}</span>
            </h3>
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-primary)', borderRadius: '0 0 8px 8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-primary)', background: 'var(--bg-subtle)' }}>
                    <th style={{ width: '20%', padding: '12px 16px', color: 'var(--text-tertiary)', fontSize: 13 }}>Columna</th>
                    <th style={{ width: '15%', padding: '12px 16px', color: 'var(--text-tertiary)', fontSize: 13 }}>Tipo</th>
                    <th style={{ width: '45%', padding: '12px 16px', color: 'var(--text-tertiary)', fontSize: 13 }}>Descripción</th>
                    <th style={{ width: '10%', padding: '12px 16px', color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center' }}>PK</th>
                    <th style={{ width: '10%', padding: '12px 16px', color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center' }}>Sensible</th>
                  </tr>
                </thead>
                <tbody>
                  {table.columns.map((col: any, cIndex: number) => (
                    <tr key={cIndex} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500, fontSize: 14 }}>{col.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14 }}>
                        {isAdmin ? (
                          <input 
                            type="text" 
                            value={col.type}
                            onChange={(e) => updateTableColumn(tIndex, cIndex, 'type', e.target.value)}
                            style={{ width: '100%', padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border-primary)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                          />
                        ) : col.type}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 14 }}>
                        {isAdmin ? (
                          <input 
                            type="text" 
                            value={col.description}
                            onChange={(e) => updateTableColumn(tIndex, cIndex, 'description', e.target.value)}
                            placeholder="Descripción de la columna"
                            style={{ width: '100%', padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border-primary)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                          />
                        ) : (
                          <span style={{ color: col.description ? 'inherit' : 'var(--text-tertiary)' }}>{col.description || 'Sin descripción'}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => isAdmin && updateTableColumn(tIndex, cIndex, 'isPk', !col.isPk)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: isAdmin ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            opacity: isAdmin ? 1 : 0.7
                          }}
                        >
                          {col.isPk ? <Check color="#22c55e" size={20} /> : <X color="#ef4444" size={20} />}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => isAdmin && updateTableColumn(tIndex, cIndex, 'isSensitive', !col.isSensitive)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: isAdmin ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            opacity: isAdmin ? 1 : 0.7
                          }}
                        >
                          {col.isSensitive ? <Check color="#22c55e" size={20} /> : <X color="#ef4444" size={20} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </motion.div>
      )}
    </div>
  );
}
