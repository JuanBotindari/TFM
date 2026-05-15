'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { mockDocuments, mockUsers } from '@/lib/mockData';
import { ShieldAlert, Shield, Lock, Unlock, Search } from 'lucide-react';
import Link from 'next/link';

export default function AccessControlPage() {
  const { isAdmin, currentOrg } = useAuth();

  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
        <ShieldAlert size={64} style={{ color: 'var(--danger)', marginBottom: 24 }} />
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Acceso Restringido</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Solo los administradores pueden gestionar políticas de acceso.</p>
        <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>Volver al Dashboard</Link>
      </div>
    );
  }

  const orgDocs = mockDocuments.filter(d => d.orgId === currentOrg?.id);
  const orgUsers = mockUsers.filter(u => u.orgId === currentOrg?.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Control de Acceso (ACL)</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Gestiona qué usuarios pueden acceder a qué documentos y bases de datos.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={18} /> Permisos por Documento
            </h2>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input className="input" placeholder="Buscar documento..." style={{ paddingLeft: 30, padding: '6px 12px 6px 30px', fontSize: 13, minHeight: 'unset' }} />
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Acceso General</th>
                <th>Usuarios con Acceso</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orgDocs.map(doc => {
                const isPublic = doc.accessUserIds.length === orgUsers.length;
                return (
                  <tr key={doc.id}>
                    <td style={{ fontWeight: 500 }}>{doc.name}</td>
                    <td>
                      {isPublic ? (
                        <span className="badge badge-success"><Unlock size={12} style={{ marginRight: 4 }} /> Toda la org</span>
                      ) : (
                        <span className="badge badge-warning"><Lock size={12} style={{ marginRight: 4 }} /> Restringido</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {doc.accessUserIds.slice(0, 3).map((uid, i) => {
                          const u = orgUsers.find(user => user.id === uid);
                          return (
                            <div key={uid} className="tooltip" data-tooltip={u?.name} style={{
                              width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-tertiary)',
                              border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 700, marginLeft: i > 0 ? -10 : 0, zIndex: 10 - i
                            }}>
                              {u?.name.charAt(0)}
                            </div>
                          );
                        })}
                        {doc.accessUserIds.length > 3 && (
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-hover)',
                            border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, marginLeft: -10, zIndex: 1
                          }}>
                            +{doc.accessUserIds.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>Gestionar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} style={{ color: 'var(--accent)' }} /> Políticas Globales
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              Define reglas predeterminadas para cuando se suben nuevos documentos.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, cursor: 'pointer' }}>
                <input type="radio" name="default_policy" defaultChecked />
                <span>Solo Administradores y Creador</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, cursor: 'pointer' }}>
                <input type="radio" name="default_policy" />
                <span>Toda la organización (Público)</span>
              </label>
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: 20 }}>Guardar Políticas</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
