'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert, UserPlus, Edit2, Trash2, RefreshCw, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ClerkUser {
  id: string;
  name: string;
  email: string;
  username: string | null;
  role: 'admin' | 'editor' | 'viewer';
  orgId: string;
  avatar: string;
  joinedAt: string;
  hasPassword: boolean;
  emailVerified: boolean;
}

export default function UsersPage() {
  const { isAdmin, currentOrg } = useAuth();
  const [users, setUsers] = useState<ClerkUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Error al cargar usuarios');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  // Filter users by current org
  const orgUsers = users.filter(u => u.orgId === currentOrg?.id);
  const otherUsers = users.filter(u => u.orgId !== currentOrg?.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Gestión de Usuarios</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Administra los miembros de {currentOrg?.name} y sus roles.
            <span style={{ marginLeft: 8, color: 'var(--text-tertiary)', fontSize: 13 }}>
              ({orgUsers.length} en tu org · {users.length} total)
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={fetchUsers} disabled={loading} style={{ padding: '10px 14px' }}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
          <button className="btn-primary">
            <UserPlus size={16} /> Invitar Usuario
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', fontSize: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: 'var(--text-tertiary)' }}>
          <Loader2 size={24} className="spin" />
          <span>Cargando usuarios...</span>
        </div>
      ) : (
        <>
          {/* Users in current org */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Usuarios de {currentOrg?.name}</span>
              <span className="badge badge-info" style={{ fontSize: 11 }}>{orgUsers.length}</span>
            </div>
            {orgUsers.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email / Username</th>
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
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 13,
                            overflow: 'hidden',
                          }}>
                            {user.avatar ? (
                              <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span style={{ fontWeight: 600 }}>{user.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        <div>
                          {user.email}
                          {user.username && (
                            <span style={{ display: 'block', fontSize: 12, color: 'var(--text-tertiary)' }}>@{user.username}</span>
                          )}
                        </div>
                      </td>
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
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                No hay usuarios en esta organización.
              </div>
            )}
          </motion.div>

          {/* Other users (all orgs) */}
          {otherUsers.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} style={{ color: 'var(--text-tertiary)' }} />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Otros usuarios</span>
                <span className="badge badge-warning" style={{ fontSize: 11 }}>{otherUsers.length}</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email / Username</th>
                    <th>Rol</th>
                    <th>Organización</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {otherUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ 
                            width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 13,
                            overflow: 'hidden',
                          }}>
                            {user.avatar ? (
                              <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span style={{ fontWeight: 600 }}>{user.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {user.email}
                        {user.username && (
                          <span style={{ display: 'block', fontSize: 12, color: 'var(--text-tertiary)' }}>@{user.username}</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'badge-info' : user.role === 'editor' ? 'badge-success' : 'badge-warning'}`} style={{ textTransform: 'capitalize' }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>{user.orgId}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{new Date(user.joinedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
