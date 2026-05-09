'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers } from '@/lib/mockData';
import { ShieldAlert, UserPlus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
  const { isAdmin, currentOrg } = useAuth();

  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
        <ShieldAlert size={64} style={{ color: 'var(--danger)', marginBottom: 24 }} />
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Acceso Restringido</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Solo los administradores de la organización pueden gestionar usuarios.</p>
        <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>Volver al Dashboard</Link>
      </div>
    );
  }

  const orgUsers = mockUsers.filter(u => u.orgId === currentOrg?.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Gestión de Usuarios</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Administra los miembros de {currentOrg?.name} y sus roles.</p>
        </div>
        <button className="btn-primary">
          <UserPlus size={16} /> Invitar Usuario
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha de Ingreso</th>
              <th style={{ width: 100 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orgUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 13
                    }}>
                      {user.name.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 600 }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'badge-info' : user.role === 'editor' ? 'badge-success' : 'badge-warning'}`} style={{ textTransform: 'capitalize' }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{new Date(user.joinedAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4 }}><Edit2 size={16} /></button>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4 }}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
