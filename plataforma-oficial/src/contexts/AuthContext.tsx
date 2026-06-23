'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { mockOrganizations, mockUsers, type User, type Organization } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';

export type AuthMode = 'company' | 'user' | 'guest' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  currentOrg: Organization | null;
  authMode: AuthMode;

  loginAsGuest: () => void;
  logout: () => void;
  isAdmin: boolean;
  isEditor: boolean;
  isViewer: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>(null);

  // Sync Clerk user with our AuthContext
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const role = (user.publicMetadata?.role as any) || 'viewer';
      const orgId = (user.publicMetadata?.orgId as string) || 'org-estudio';

      // 🔄 Sync with Supabase user_profiles table
      supabase
        .from('user_profiles')
        .upsert({ 
          id: user.id, 
          org_id: orgId, 
          role: role 
        })
        .then(({ error }) => {
          if (error) console.error('Error syncing user profile to Supabase:', error);
        });

      // For now, map Clerk user to our structure
      const syncUser: User = {
        id: user.id,
        name: user.fullName || user.username || 'Usuario',
        email: user.primaryEmailAddress?.emailAddress || '',
        role: role,
        orgId: orgId,
        avatar: user.imageUrl,
        joinedAt: user.createdAt?.toISOString() || new Date().toISOString(),
      };
      
      setCurrentUser(syncUser);
      const org = mockOrganizations.find((o) => o.id === syncUser.orgId) || mockOrganizations[0];
      setCurrentOrg(org);
      setAuthMode('user');
    } else if (isLoaded && !isSignedIn && authMode !== 'guest') {
      setCurrentUser(null);
      setCurrentOrg(null);
      setAuthMode(null);
    }
  }, [user, isLoaded, isSignedIn, authMode]);

  const loginAsGuest = () => {
    const guestUser: User = {
      id: 'guest-001',
      name: 'Invitado Demo',
      email: 'guest@demo.tfm',
      role: 'viewer',
      orgId: 'org-001',
      avatar: '',
      joinedAt: new Date().toISOString(),
    };
    
    // Set cookie for middleware to allow access
    document.cookie = "tfm_guest_mode=true; path=/; max-age=3600"; // 1 hour
    
    setCurrentUser(guestUser);
    setCurrentOrg(mockOrganizations[0]);
    setAuthMode('guest');
  };

  const logout = async () => {
    // Clear guest cookie if exists
    document.cookie = "tfm_guest_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    await signOut();
  };

  const isAuthenticated = currentUser !== null;
  const isAdmin = currentUser?.role === 'admin';
  const isEditor = currentUser?.role === 'editor';
  const isViewer = currentUser?.role === 'viewer';
  const isGuest = authMode === 'guest';

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        currentOrg,
        authMode,

        loginAsGuest,
        logout,
        isAdmin,
        isEditor,
        isViewer,
        isGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
