'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  Upload, 
  Search, 
  MoreVertical, 
  Trash2, 
  Eye, 
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileUp,
  X,
  FileCode,
  FileArchive,
  BookOpen
} from 'lucide-react';

export default function DocumentsPage() {
  const { currentOrg, currentUser } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (currentOrg?.id) {
        query = query.eq('org_id', currentOrg.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentOrg]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !currentOrg?.id) return;

    setUploading(true);
    const file = files[0];

    // Check for duplicate document names
    const isDuplicate = documents.some(doc => doc.name === file.name);
    if (isDuplicate) {
      alert(`Ya existe un documento con el nombre "${file.name}". Por favor, cámbiale el nombre o elimina el anterior antes de subirlo.`);
      setUploading(false);
      return;
    }
    
    // Sanitize filename: remove spaces, accents and special chars
    const sanitizedName = file.name
      .replace(/\s+/g, '_')
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, '');

    const fileName = `${Date.now()}_${sanitizedName}`;
    const storagePath = `${currentOrg.id}/${fileName}`;

    try {
      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('company-documents')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // 2. Insert metadata into 'documents' table
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          storage_path: storagePath,
          file_type: file.type.split('/')[1] || 'unknown',
          size_bytes: file.size,
          org_id: currentOrg.id,
          status: 'indexed' // Guardado directamente como indexado. El backend de Python lo procesará dinámicamente al chatear.
        });

      if (dbError) throw dbError;

      // 3. Refresh list
      await fetchDocuments();

      // 4. Trigger embeddings recompute for all documents
      try {
        await fetch('/api/embeddings/recompute', { method: 'POST' });
      } catch (recomputeErr) {
        console.error('Error triggering embeddings recompute:', recomputeErr);
      }
      
      // Simulate processing for the demo
      setTimeout(() => {
        setDocuments(prev => prev.map(doc => 
          doc.name === file.name ? { ...doc, status: 'indexed' } : doc
        ));
      }, 3000);

    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Error al subir el archivo. Verifica que el bucket "company-documents" exista y tenga políticas de acceso.');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (id: string, storagePath: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) return;

    try {
      // 1. Remove from DB
      await supabase.from('documents').delete().eq('id', id);
      // 2. Remove from Storage
      await supabase.storage.from('company-documents').remove([storagePath]);
      // 3. Refresh
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'indexed': return <CheckCircle2 size={16} style={{ color: '#22C55E' }} />;
      case 'processing': return <Clock size={16} className="spin" style={{ color: '#F59E0B' }} />;
      case 'error': return <AlertCircle size={16} style={{ color: '#EF4444' }} />;
      default: return null;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Explorador de Documentos</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Gestiona tu base de conocimiento no estructurada. La IA aprenderá de estos archivos.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Upload size={18} /> Subir Documento
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleFileUpload(e.target.files)} 
            style={{ display: 'none' }} 
            accept=".pdf,.docx,.txt"
          />
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileUpload(e.dataTransfer.files); }}
        style={{
          border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--border-primary)'}`,
          background: dragActive ? 'var(--accent-light)' : 'var(--bg-subtle)',
          borderRadius: 20,
          padding: '40px',
          textAlign: 'center',
          transition: 'all 0.2s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16
        }}
      >
        <div style={{ 
          width: 64, height: 64, borderRadius: 16, background: 'var(--bg-card)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <FileUp size={32} />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
            {uploading ? 'Subiendo archivo...' : 'Arrastra y suelta tus archivos aquí'}
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
            Soporta PDF, Word y Texto (Máx. 50MB)
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input 
            type="text" 
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
            style={{ paddingLeft: 42 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {filteredDocs.length} documentos encontrados
          </span>
        </div>
      </div>

      {/* Documents Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 24
      }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card skeleton" style={{ height: 180 }} />
          ))
        ) : filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => (
            <motion.div 
              key={doc.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ padding: 20, position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: 12, background: 'var(--bg-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
                }}>
                  <FileText size={24} />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-ghost" style={{ padding: 6 }}><Download size={16} /></button>
                  <button 
                    onClick={() => deleteDocument(doc.id, doc.storage_path)}
                    className="btn-ghost" style={{ padding: 6, color: 'var(--danger)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>
                  <span>{formatSize(doc.size_bytes)}</span>
                  <span>•</span>
                  <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ 
                marginTop: 'auto',
                paddingTop: 16,
                borderTop: '1px solid var(--border-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
                  {getStatusIcon(doc.status)}
                  <span style={{ 
                    color: doc.status === 'indexed' ? '#22C55E' : doc.status === 'processing' ? '#F59E0B' : '#EF4444'
                  }}>
                    {doc.status === 'indexed' ? 'Indexado para IA' : doc.status === 'processing' ? 'Procesando...' : 'Error'}
                  </span>
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ fontSize: 11, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <BookOpen size={12} /> Ver Resumen
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <FileCode size={40} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No hay documentos</h3>
            <p style={{ color: 'var(--text-tertiary)', maxWidth: 400, margin: '0 auto' }}>
              Sube tus manuales, pólizas o reglamentos para que la IA pueda ayudarte a analizarlos.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .skeleton {
          background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-tertiary) 50%, var(--bg-card) 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
