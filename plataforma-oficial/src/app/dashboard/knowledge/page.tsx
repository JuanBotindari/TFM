'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { type Document } from '@/lib/mockData';
import { UploadCloud, FileText, FileImage, FileSpreadsheet, FileIcon, Search, Filter, MoreVertical, Trash2, Loader2 } from 'lucide-react';

export default function KnowledgePage() {
  const { currentUser, currentOrg } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    if (!currentOrg?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('org_id', currentOrg.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      
      const mappedDocs: Document[] = (data || []).map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        status: doc.status,
        uploadedBy: doc.uploaded_by,
        uploadedAt: doc.uploaded_at,
        orgId: doc.org_id,
        accessUserIds: doc.access_user_ids || [],
        filePath: doc.file_path
      }));

      setDocuments(mappedDocs);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError('No se pudieron cargar los documentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentOrg?.id]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !currentOrg || !currentUser) return;
    
    setUploading(true);
    setError(null);

    const file = files[0];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${currentOrg.id}/${fileName}`;

    try {
      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Insert into DB
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          type: ['pdf', 'csv', 'txt'].includes(fileExt || '') ? fileExt : 'image',
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          uploaded_by: currentUser.id,
          org_id: currentOrg.id,
          file_path: filePath,
          status: 'indexed' // En un flujo real esto empezaría como 'processing'
        });

      if (dbError) throw dbError;

      // 3. Refresh list
      await fetchDocuments();
      alert('Archivo subido con éxito');
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Error al subir el archivo: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, path: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este documento?')) return;
    
    try {
      // Delete from storage
      await supabase.storage.from('documents').remove([path]);
      // Delete from DB
      await supabase.from('documents').delete().eq('id', id);
      // Refresh
      await fetchDocuments();
    } catch (err: any) {
      alert('Error al eliminar');
    }
  };

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
      default: return <span className="badge badge-ghost">Desconocido</span>;
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        onDrop={(e) => { 
          e.preventDefault(); 
          setIsDragging(false); 
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          hidden 
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <div style={{ 
          width: 64, height: 64, borderRadius: 16, background: 'var(--bg-tertiary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          color: isDragging ? 'var(--accent)' : 'var(--text-secondary)'
        }}>
          {uploading ? <Loader2 className="animate-spin" size={32} /> : <UploadCloud size={32} />}
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          {uploading ? 'Subiendo archivo...' : 'Sube documentos o tablas'}
        </h3>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 20, textAlign: 'center', maxWidth: 400 }}>
          Arrastra y suelta archivos aquí o haz clic para explorar. <br/>Soportamos PDF, CSV y TXT hasta 50MB.
        </p>
        <button className="btn-primary" disabled={uploading}>
          {uploading ? 'Procesando...' : 'Seleccionar Archivos'}
        </button>
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
            Mostrando {filteredDocuments.length} archivos
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12, color: 'var(--text-tertiary)' }}>
              <Loader2 className="animate-spin" size={24} />
              Cargando documentos...
            </div>
          ) : error ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12, textAlign: 'center' }}>
              <div style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</div>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', maxWidth: 400 }}>
                Copia y pega el SQL proporcionado en el editor de Supabase para crear la tabla necesaria.
              </p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12, color: 'var(--text-tertiary)' }}>
              <FileIcon size={32} opacity={0.5} />
              No se encontraron documentos.
            </div>
          ) : (
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
                {filteredDocuments.map((doc) => (
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
                      <button 
                        onClick={() => handleDelete(doc.id, doc.filePath || '')}
                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4 }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
