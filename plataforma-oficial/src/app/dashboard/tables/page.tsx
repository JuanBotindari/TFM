'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Table as TableIcon, 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  Database,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';

const TABLES = [
  { id: 'poliza', name: 'Pólizas', icon: '📄' },
  { id: 'persona', name: 'Asegurados', icon: '👤' },
  { id: 'siniestro', name: 'Siniestros', icon: '💥' },
  { id: 'recibo', name: 'Recibos', icon: '💰' },
  { id: 'pago', name: 'Pagos', icon: '🏦' },
];

export default function TablesPage() {
  const { currentOrg } = useAuth();
  const [selectedTable, setSelectedTable] = useState(TABLES[0].id);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real multi-tenant app, RLS handles the filtering.
      // We'll explicitly filter for the demo if RLS isn't fully set up in Clerk
      let query = supabase.from(selectedTable).select('*');
      
      if (currentOrg?.id) {
        query = query.eq('org_id', currentOrg.id);
      }

      const { data: result, error } = await query;
      if (error) throw error;
      setData(result || []);
    } catch (err) {
      console.error('Error fetching table data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTable, currentOrg]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (searchTerm) {
      sortableData = sortableData.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig, searchTerm]);

  const columns = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'org_id') : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Explorador de Tablas</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Visualiza y filtra los datos estructurados de {currentOrg?.name}.
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="btn-ghost" 
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12 }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Table Selector */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        overflowX: 'auto', 
        paddingBottom: 8,
        scrollbarWidth: 'none'
      }}>
        {TABLES.map((table) => (
          <button
            key={table.id}
            onClick={() => setSelectedTable(table.id)}
            style={{
              padding: '12px 20px',
              borderRadius: 14,
              border: selectedTable === table.id ? '2px solid var(--accent)' : '1px solid var(--border-primary)',
              background: selectedTable === table.id ? 'var(--accent-light)' : 'var(--bg-card)',
              color: selectedTable === table.id ? 'var(--accent)' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            <span>{table.icon}</span>
            {table.name}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <motion.div 
        layout
        className="card" 
        style={{ padding: 0, overflow: 'hidden', minHeight: 500, display: 'flex', flexDirection: 'column' }}
      >
        {/* Table Controls */}
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder={`Buscar en ${selectedTable}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 42px',
                borderRadius: 12,
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-input)',
                fontSize: 14,
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={16} /> Filtros
            </button>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Download size={16} /> Exportar
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div style={{ flex: 1, overflowX: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <div className="loader" />
            </div>
          ) : sortedData.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)' }}>
                  {columns.map((col) => (
                    <th 
                      key={col} 
                      onClick={() => handleSort(col)}
                      style={{ 
                        padding: '16px 24px', 
                        fontSize: 12, 
                        fontWeight: 700, 
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {col.replace('_', ' ')}
                        <ArrowUpDown size={12} style={{ opacity: sortConfig?.key === col ? 1 : 0.3 }} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {sortedData.map((row, idx) => (
                    <motion.tr 
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ 
                        borderBottom: '1px solid var(--border-primary)',
                        background: idx % 2 === 0 ? 'transparent' : 'var(--bg-subtle)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'var(--bg-subtle)')}
                    >
                      {columns.map((col) => (
                        <td key={col} style={{ padding: '16px 24px', fontSize: 14, color: 'var(--text-primary)' }}>
                          {row[col]?.toString() || '-'}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 400, gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={32} style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No se encontraron datos en esta tabla.</p>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div style={{ 
          padding: '16px 24px', 
          borderTop: '1px solid var(--border-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-card)'
        }}>
          <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            Mostrando {sortedData.length} de {data.length} registros
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" disabled style={{ padding: 8 }}><ChevronLeft size={16} /></button>
            <button className="btn-secondary" disabled style={{ padding: 8 }}><ChevronRight size={16} /></button>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .loader {
          width: 30px;
          height: 30px;
          border: 3px solid var(--border-primary);
          border-top: 3px solid var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
