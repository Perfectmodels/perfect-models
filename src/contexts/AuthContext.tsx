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

export interface LoginResult { success: boolean; error?: string; code?: string; }

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  createUserWithRole: (email: string, password: string, role: UserRole, profileData: { id: string; name: string; [key: string]: any }) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; code?: string }>;
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

const connectionMessage = 'Le service est momentanément inaccessible. Vérifiez votre connexion internet puis réessayez.';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/profile', { credentials: 'include', cache: 'no-store' });
      if (!response.ok) { setUser(null); return null; }
      const payload = await response.json().catch(() => ({}));
      const profile = payload?.user as AuthUser | null;
      if (!profile) { setUser(null); return null; }
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('[auth] profile refresh failed', error);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => { refresh().finally(() => setLoading(false)); }, [refresh]);

  const login = useCallback(async (identifier: string, password: string): Promise<LoginResult> => {
    try {
      const candidate = identifier.trim().toLowerCase();
      if (!candidate) return { success: false, error: 'Saisissez votre e-mail ou identifiant PMM.', code: 'MISSING_IDENTIFIER' };
      if (!password) return { success: false, error: 'Saisissez votre mot de passe.', code: 'MISSING_PASSWORD' };

      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: candidate, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) return { success: false, error: result?.error || result?.message || 'La connexion n’a pas pu être établie.', code: result?.code };

      const appUser = await refresh();
      if (!appUser) return { success: false, error: 'La connexion a réussi, mais votre profil PMM n’est pas encore disponible. Actualisez la page ou contactez l’agence.', code: 'PROFILE_UNAVAILABLE' };
      emitAuthChanged();
      if (appUser.role === 'manager' && typeof window !== 'undefined') window.location.assign('/manager');
      return { success: true };
    } catch (error) {
      console.error('[auth] login network failure', error);
      return { success: false, error: connectionMessage, code: 'NETWORK_ERROR' };
    }
  }, [refresh]);

  const logout = useCallback(async () => {
    try { await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' }); }
    catch (error) { console.warn('[auth] sign-out request failed', error); }
    finally { setUser(null); emitAuthChanged(); }
  }, []);

  const createUserWithRole = useCallback(async (email: string, password: string, role: UserRole, profileData: { id: string; name: string; [key: string]: any }) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, role, profileData }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) return { success: false, error: payload.error || 'Le compte n’a pas pu être créé.' };
      emitAuthChanged();
      return { success: true };
    } catch (error) {
      console.error('[auth] account creation network failure', error);
      return { success: false, error: connectionMessage };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const response = await fetch('/api/auth/forget-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) return { success: false, error: payload?.error || payload?.message || "Le lien de réinitialisation n’a pas pu être envoyé.", code: payload?.code };
      return { success: true };
    } catch (error) {
      console.error('[auth] password recovery network failure', error);
      return { success: false, error: connectionMessage, code: 'NETWORK_ERROR' };
    }
  }, []);

  return <AuthContext.Provider value={{ user, loading, login, logout, createUserWithRole, resetPassword }}>{children}</AuthContext.Provider>;
};
