'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultTableDocs } from '@/lib/tableSchemas';
import { 
  Table as TableIcon, 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  Database,
  ArrowUpDown,
  RefreshCw,
  List
} from 'lucide-react';

const getIconForTable = (tableName: string) => {
  const icons: Record<string, string> = {
    poliza: '📄', persona: '👤', siniestro: '💥', recibo: '💰', pago: '🏦', asegurado_poliza: '👥',
    entidades: '🏢', ejercicios_fiscales: '📅', compras: '🛒', ventas: '📈', 
    tipos_comprobante: '🧾', tipos_gasto: '💳', tipo_venta: '🏷️'
  };
  return icons[tableName] || '📊';
};

export default function TablesPage() {
  const { currentOrg } = useAuth();
  
  const TABLES = useMemo(() => {
    const docs = getDefaultTableDocs(currentOrg?.id);
    return docs.map(doc => ({
      id: doc.tableName,
      name: doc.tableName.charAt(0).toUpperCase() + doc.tableName.slice(1).replace(/_/g, ' '),
      icon: getIconForTable(doc.tableName)
    }));
  }, [currentOrg]);

  const [selectedTable, setSelectedTable] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    if (TABLES.length > 0 && (!selectedTable || !TABLES.find(t => t.id === selectedTable))) {
      setSelectedTable(TABLES[0].id);
    }
  }, [TABLES, selectedTable]);

  const fetchData = async () => {
    if (!selectedTable) return;
    setLoading(true);
    try {
      let query = supabase
        .from(selectedTable)
        .select('*', { count: 'exact' })
        .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1);
      
      if (currentOrg?.id) {
        query = query.eq('org_id', currentOrg.id);
      }

      if (sortConfig) {
        query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });
      }

      const { data: result, error, count } = await query;
      if (error) {
        if (error.message?.includes('org_id') || error.code === 'PGRST200') {
          console.warn(`Column org_id might be missing in ${selectedTable}, falling back to query without org_id filter`);
          let fallbackQuery = supabase
            .from(selectedTable)
            .select('*', { count: 'exact' })
            .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1);
          
          if (sortConfig) {
            fallbackQuery = fallbackQuery.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });
          }
          
          const fallbackResult = await fallbackQuery;
          if (fallbackResult.error) throw fallbackResult.error;
          
          setData(fallbackResult.data || []);
          setTotalCount(fallbackResult.count || 0);
        } else {
          throw error;
        }
      } else {
        setData(result || []);
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error('Error fetching table data:', err);
    } finally {
      setTimeout(() => setLoading(false), 300); // Small delay to avoid flickering
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTable, currentOrg, currentPage, pageSize, sortConfig]);

  // Reset page when table or page size changes
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedTable, pageSize]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const columns = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'org_id') : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Explorador de Tablas</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Consulta los datos estructurados de la organización.
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
        paddingBottom: 4,
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
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'nowrap',
              boxShadow: selectedTable === table.id ? '0 4px 12px var(--accent-glow)' : 'none',
              transform: selectedTable === table.id ? 'translateY(-2px)' : 'none'
            }}
          >
            <span>{table.icon}</span>
            {table.name}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ position: 'relative', minHeight: 600 }}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedTable + loading}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="card" 
            style={{ 
              padding: 0, 
              overflow: 'hidden', 
              display: 'flex', 
              flexDirection: 'column',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              height: '100%'
            }}
          >
            {/* Table Controls */}
            <div style={{ 
              padding: '16px 24px', 
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 20,
              background: 'var(--bg-card)'
            }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input 
                  type="text" 
                  placeholder={`Buscar en esta vista...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 16px 10px 42px',
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
                  <Download size={16} /> Exportar
                </button>
              </div>
            </div>

            {/* Table Body */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 16 }}>
                  <div className="loader" />
                  <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Cargando {selectedTable}...</p>
                </div>
              ) : filteredData.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-tertiary)' }}>
                    <tr>
                      {columns.map((col) => (
                        <th 
                          key={col} 
                          onClick={() => handleSort(col)}
                          style={{ 
                            padding: '14px 24px', 
                            fontSize: 12, 
                            fontWeight: 700, 
                            color: 'var(--text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            userSelect: 'none',
                            borderBottom: '2px solid var(--border-primary)'
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
                    {filteredData.map((row, idx) => (
                      <tr 
                        key={idx}
                        style={{ 
                          borderBottom: '1px solid var(--border-primary)',
                          background: idx % 2 === 0 ? 'transparent' : 'var(--bg-subtle)'
                        }}
                      >
                        {columns.map((col) => (
                          <td key={col} style={{ padding: '14px 24px', fontSize: 14, color: 'var(--text-primary)' }}>
                            {row[col]?.toString() || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 16 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Database size={32} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No hay datos disponibles en este rango.</p>
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            <div style={{ 
              padding: '12px 24px', 
              borderTop: '1px solid var(--border-primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-card)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                  Total: <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong> registros
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Filas:</span>
                  <select 
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: 12,
                      color: 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Página <strong>{currentPage + 1}</strong> de {Math.ceil(totalCount / pageSize)}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0 || loading}
                    className="btn-secondary" 
                    style={{ padding: 8, opacity: currentPage === 0 ? 0.5 : 1 }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={(currentPage + 1) * pageSize >= totalCount || loading}
                    className="btn-secondary" 
                    style={{ padding: 8, opacity: (currentPage + 1) * pageSize >= totalCount ? 0.5 : 1 }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style jsx>{`
        .loader {
          width: 32px;
          height: 32px;
          border: 3px solid var(--bg-tertiary);
          border-top: 3px solid var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
}
