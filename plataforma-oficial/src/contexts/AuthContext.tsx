'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { mockOrganizations, mockUsers, type User, type Organization } from '@/lib/mockData';

export type AuthMode = 'company' | 'user' | 'guest' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  currentOrg: Organization | null;
  authMode: AuthMode;
  login: (email: string, password: string, mode: AuthMode) => boolean;
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
      // For now, map Clerk user to our mock user structure or create a dynamic one
      const syncUser: User = {
        id: user.id,
        name: user.fullName || user.username || 'Usuario',
        email: user.primaryEmailAddress?.emailAddress || '',
        role: (user.publicMetadata?.role as any) || 'viewer', // Read role from Clerk metadata
        orgId: (user.publicMetadata?.orgId as string) || 'org-001',
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

  const login = (email: string, _password: string, mode: AuthMode): boolean => {
    const user = mockUsers.find((u) => u.email === email);
    if (user) {
      setCurrentUser(user);
      const org = mockOrganizations.find((o) => o.id === user.orgId) || null;
      setCurrentOrg(org);
      setAuthMode(mode);
      return true;
    }
    return false;
  };

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
    setCurrentUser(guestUser);
    setCurrentOrg(mockOrganizations[0]);
    setAuthMode('guest');
  };

  const logout = async () => {
    await signOut();
    setCurrentUser(null);
    setCurrentOrg(null);
    setAuthMode(null);
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
        login,
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
