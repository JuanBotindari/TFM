'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';

import { useUser } from '@clerk/nextjs';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { isLoaded } = useUser();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isLoaded && !isAuthenticated) {
      router.push('/auth');
    }
  }, [mounted, isLoaded, isAuthenticated, router]);

  if (!mounted || !isLoaded || (!isAuthenticated && mounted)) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      
      <motion.main
        animate={{ marginLeft: collapsed ? 80 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <div style={{ padding: '32px', flex: 1, maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
          {children}
        </div>
      </motion.main>
    </div>
  );
}
