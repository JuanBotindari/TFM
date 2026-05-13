'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { mockDocuments } from '@/lib/mockData';
import { UploadCloud, FileText, FileImage, FileSpreadsheet, FileIcon, Search, Filter, MoreVertical, Trash2 } from 'lucide-react';

export default function KnowledgePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getIcon = (type: string) => {
    switch(type) {
      case 'pdf': return <FileText size={18} style={{ color: '#EF4444' }} />;
      case 'image': return <FileImage size={18} style={{ color: '#3B82F6' }} />;
      case 'csv': return <FileSpreadsheet size={18} style={{ color: '#10B981' }} />;
      default: return <FileIcon size={18} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'indexed': return <span className="badge badge-success"><div className="status-dot online" style={{ width: 6, height: 6, marginRight: 4 }} /> Indexado</span>;
      case 'processing': return <span className="badge badge-warning"><div className="status-dot processing" style={{ width: 6, height: 6, marginRight: 4 }} /> Procesando</span>;
      case 'error': return <span className="badge badge-danger"><div className="status-dot offline" style={{ width: 6, height: 6, marginRight: 4, background: '#EF4444' }} /> Error</span>;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Base de Conocimiento</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Gestiona los documentos y datos que alimentan al modelo de IA.</p>
      </div>

      {/* Upload Zone */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{
          padding: 40,
          border: isDragging ? '2px dashed var(--accent)' : '2px dashed var(--border-primary)',
          background: isDragging ? 'var(--accent-glow)' : 'var(--bg-card)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease', cursor: 'pointer'
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
      >
        <div style={{ 
          width: 64, height: 64, borderRadius: 16, background: 'var(--bg-tertiary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          color: isDragging ? 'var(--accent)' : 'var(--text-secondary)'
        }}>
          <UploadCloud size={32} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Sube documentos o tablas</h3>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 20, textAlign: 'center', maxWidth: 400 }}>
          Arrastra y suelta archivos aquí o haz clic para explorar. <br/>Soportamos PDF, PNG, JPG, CSV y TXT hasta 50MB.
        </p>
        <button className="btn-primary">Seleccionar Archivos</button>
      </motion.div>

      {/* Documents Table Area */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 250 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 350 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input 
                className="input" 
                placeholder="Buscar documentos..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: 36, paddingTop: 8, paddingBottom: 8 }}
              />
            </div>
            <button className="btn-secondary" style={{ padding: '8px 12px' }}><Filter size={16} /> Filtros</button>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            Mostrando {mockDocuments.length} archivos
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre del Archivo</th>
                <th>Estado</th>
                <th>Tamaño</th>
                <th>Fecha Subida</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {mockDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        width: 32, height: 32, borderRadius: 8, background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {getIcon(doc.type)}
                      </div>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{doc.name}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(doc.status)}</td>
                  <td>{doc.size}</td>
                  <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                  <td>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4 }}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination mock */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Página 1 de 1</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" disabled>Anterior</button>
            <button className="btn-ghost" disabled>Siguiente</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
