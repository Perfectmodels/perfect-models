'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AdminPagePermissions, UserPermissions } from '../types';

export type UserRole = 'admin' | 'manager' | 'student' | 'jury' | 'registration' | 'jury-contest';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  userId: string;
  contestId?: string;
  permissions?: UserPermissions;
  adminPermissions?: AdminPagePermissions;
  mustChangePassword?: boolean;
  identifier?: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  createUserWithRole: (
    email: string,
    password: string,
    role: UserRole,
    profileData: { id: string; name: string; [key: string]: any },
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const emitAuthChanged = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('pmm-auth-changed'));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/profile', { credentials: 'include', cache: 'no-store' });
      if (!response.ok) {
        setUser(null);
        return null;
      }
      const payload = await response.json().catch(() => ({}));
      const profile = payload?.user as AuthUser | null;
      if (!profile) {
        setUser(null);
        return null;
      }
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('[auth] profile refresh failed', error);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (identifier: string, password: string): Promise<LoginResult> => {
    try {
      const candidate = identifier.trim().toLowerCase();
      if (!candidate) return { success: false, error: 'Identifiant requis.' };

      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: candidate, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: result?.message || result?.error?.message || result?.error || 'Identifiant ou mot de passe incorrect.',
        };
      }

      const appUser = await refresh();
      if (!appUser) return { success: false, error: 'Compte authentifié mais profil PMM indisponible.' };
      emitAuthChanged();
      if (appUser.role === 'manager' && typeof window !== 'undefined') window.location.assign('/manager');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erreur de connexion.' };
    }
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' });
    } finally {
      setUser(null);
      emitAuthChanged();
    }
  }, []);

  const createUserWithRole = useCallback(async (
    email: string,
    password: string,
    role: UserRole,
    profileData: { id: string; name: string; [key: string]: any },
  ) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, profileData }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) return { success: false, error: payload.error || 'Création impossible.' };
      emitAuthChanged();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Création impossible.' };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const response = await fetch('/api/auth/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          redirectTo: `${window.location.origin}/login`,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        return {
          success: false,
          error: payload?.message || payload?.error?.message || payload?.error || "Impossible d'envoyer le lien.",
        };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Impossible d'envoyer le lien." };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, createUserWithRole, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
