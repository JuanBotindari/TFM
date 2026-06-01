'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Eye, EyeOff, Building, User, Sparkles, ArrowLeft, LogIn, UserPlus, Sun, Moon, Monitor } from 'lucide-react';
import Link from 'next/link';

type AuthTab = 'login' | 'register';
type LoginMode = 'company' | 'user';

const themeIcons = { light: Sun, grey: Monitor, midnight: Moon };

import { useSignIn, useSignUp } from '@clerk/nextjs';

export default function AuthPage() {
  const router = useRouter();
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  
  const { loginAsGuest } = useAuth();
  const { theme, cycleTheme, themeLabel } = useTheme();
  const [tab, setTab] = useState<AuthTab>('login');
  const [loginMode, setLoginMode] = useState<LoginMode>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ThemeIcon = themeIcons[theme];

  // If already signed in, redirect to dashboard
  React.useEffect(() => {
    if (isSignInLoaded && signIn?.status === 'complete') {
      router.push('/dashboard');
    }
  }, [isSignInLoaded, signIn?.status, router]);

  const handleLogin = async (e?: React.FormEvent, overrideEmail?: string, overridePassword?: string) => {
    if (e) e.preventDefault();
    if (!isSignInLoaded) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await signIn.create({
        identifier: overrideEmail || email, // This can be email or username in Clerk
        password: overridePassword || password,
      });

      if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
        router.push('/dashboard');
      } else {
        console.log(result);
        setError('Se requiere verificación adicional o la cuenta no está completa.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.errors?.[0]?.code === 'session_already_exists') {
        router.push('/dashboard');
        return;
      }
      setError(err.errors?.[0]?.message || 'Error al iniciar sesión. Revisa tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    router.push('/dashboard');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;

    setLoading(true);
    setError('');

    try {
      const result = await signUp.create({
        emailAddress: email,
        username: username,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
      });

      if (result.status === 'complete') {
        await setSignUpActive({ session: result.createdSessionId });
        router.push('/dashboard');
      } else {
        // En un flujo real aquí pediríamos el código de verificación de email
        setError('Cuenta creada, pero requiere verificación de email (revisa tu consola para el siguiente paso).');
        console.log('SignUp Result:', result);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.message || 'Error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    //{ label: 'Admin Banco', username: 'admin_banco', role: 'admin', password: 'admin_banco_1' },
    { label: 'Editor Banco', username: 'edit_banco', role: 'editor', password: 'edit_banco_1' },
    { label: 'Demo Banco', username: 'viewer_banco', role: 'viewer', password: 'viewer_banco_1' },
    //{ label: 'Admin Estudio', username: 'admin_estudio', role: 'admin', password: 'admin_estudio_1' },
    { label: 'Editor Estudio', username: 'edit_estudio', role: 'editor', password: 'edit_estudio_1' },
    { label: 'Demo Estudio', username: 'viewer_estudio', role: 'viewer', password: 'viewer_estudio_1' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="mesh-gradient" />

      {/* Decorative orbs */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', top: -200, right: -200, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', bottom: -100, left: -100, pointerEvents: 'none' }} />

      {/* Top bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>
        <button
          onClick={cycleTheme}
          title={themeLabel}
          style={{
            width: 38, height: 38, borderRadius: 10, border: '1px solid var(--border-primary)',
            background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ThemeIcon size={16} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 440, position: 'relative' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: 16, background: 'var(--gradient-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 22, margin: '0 auto 16px',
            }}
          >
            T
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
            TFM<span style={{ color: 'var(--accent)' }}>.</span>producto
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
            {tab === 'login' ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta gratuita'}
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: 4, borderRadius: 12, background: 'var(--bg-tertiary)' }}>
            {[
              { key: 'login' as AuthTab, label: 'Iniciar Sesión', icon: LogIn },
              { key: 'register' as AuthTab, label: 'Registrarse', icon: UserPlus },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError(''); }}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: tab === t.key ? 'var(--bg-card)' : 'transparent',
                  color: tab === t.key ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  boxShadow: tab === t.key ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
              >
                {/* Login Mode Selector */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  {[
                    { key: 'company' as LoginMode, label: 'Empresa', icon: Building },
                    { key: 'user' as LoginMode, label: 'Usuario', icon: User },
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setLoginMode(m.key)}
                      style={{
                        flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 600,
                        border: loginMode === m.key ? '2px solid var(--accent)' : '1px solid var(--border-primary)',
                        background: loginMode === m.key ? 'var(--accent-light)' : 'var(--bg-input)',
                        color: loginMode === m.key ? 'var(--accent)' : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <m.icon size={16} /> {m.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email o Usuario</label>
                    <input className="input" type="text" placeholder="tu@email.com o usuario" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Contraseña</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ paddingRight: 44 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer',
                        }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p style={{ fontSize: 13, color: 'var(--danger)', padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)' }}>
                      {error}
                    </p>
                  )}

                  <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    {!loading && <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
                  </button>
                </div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-primary)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>o</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-primary)' }} />
                </div>

                {/* Guest Login */}
                <button
                  type="button"
                  onClick={handleGuest}
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                >
                  <Sparkles size={16} />
                  Probar Demo como Invitado
                </button>

                {/* Demo credentials */}
                <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Credenciales Demo
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {demoCredentials.map((cred) => (
                      <button
                        key={cred.username}
                        type="button"
                        onClick={() => { 
                          setEmail(cred.username); 
                          setPassword(cred.password); 
                          handleLogin(undefined, cred.username, cred.password);
                        }}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 12px', borderRadius: 8, border: 'none', background: 'var(--bg-input)',
                          cursor: 'pointer', transition: 'all 0.15s', fontSize: 13,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{cred.label}</span>
                        <span className="badge badge-info" style={{ fontSize: 11 }}>{cred.role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegister}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Nombre completo</label>
                    <input className="input" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Nombre de usuario</label>
                    <input className="input" placeholder="usuario123" value={username} onChange={(e) => setUsername(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email</label>
                    <input className="input" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Empresa</label>
                    <input className="input" placeholder="Nombre de tu empresa" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Contraseña</label>
                    <input
                      className="input"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    {!loading && <UserPlus size={16} />}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
