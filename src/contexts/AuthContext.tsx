'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { neonClient } from '@/lib/neon-browser';
import type { UserPermissions } from '../types';

export type UserRole = 'admin' | 'student' | 'jury' | 'registration' | 'jury-contest';
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  userId: string;
  contestId?: string;
  permissions?: UserPermissions;
  mustChangePassword?: boolean;
  identifier?: string;
}
export interface ModelMigrationRequest { modelId: string; name: string; suggestedEmail: string }
export interface LoginResult { success: boolean; error?: string; migrationRequired?: boolean; migration?: ModelMigrationRequest }
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  createUserWithRole: (email: string, password: string, role: UserRole, profileData: { id: string; name: string; [key: string]: any }) => Promise<{ success: boolean; error?: string }>;
  migrateModelToAuth: (modelId: string, email: string, newPassword: string, legacyPassword?: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  signInWithPhone: (phone: string, containerId?: string) => Promise<{ success: boolean; error?: string }>;
  confirmPhoneCode: (code: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
};

const emit = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('pmm-auth-changed'));
};
const ADMIN_ALIASES = new Set([
  'admin',
  'contact@perfectmodels.online',
  'contact@perfectmodels.ga',
  'perfectmodels.ga@gmail.com',
]);

type ProfileRow = {
  user_id: string;
  identifier: string;
  app_role: UserRole;
  login_email: string;
  profile_id: string | null;
  status: string;
  must_change_password: boolean;
  permissions: UserPermissions | null;
  contest_id: string | null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const sessionResult = await (neonClient.auth as any).getSession();
      const session = sessionResult?.data;
      const sessionUser = session?.user;
      if (!sessionUser?.id) {
        setUser(null);
        return null;
      }

      const { data, error } = await neonClient
        .from('auth_profiles')
        .select('user_id,identifier,app_role,login_email,profile_id,status,must_change_password,permissions,contest_id')
        .eq('user_id', sessionUser.id)
        .limit(1);

      if (error) throw error;
      const profile = (data as ProfileRow[] | null)?.[0];
      if (!profile || profile.status !== 'active') {
        setUser(null);
        return null;
      }

      const appUser: AuthUser = {
        uid: profile.user_id,
        userId: profile.profile_id || profile.identifier,
        email: profile.login_email || sessionUser.email || null,
        displayName: sessionUser.name || profile.identifier,
        role: profile.app_role,
        identifier: profile.identifier,
        permissions: profile.permissions || undefined,
        mustChangePassword: Boolean(profile.must_change_password),
        contestId: profile.contest_id || undefined,
      };
      setUser(appUser);
      return appUser;
    } catch (error) {
      console.error('[auth] Neon profile refresh failed', error);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (identifier: string, password: string): Promise<LoginResult> => {
    try {
      let candidate = identifier.trim().toLowerCase();
      if (!candidate) return { success: false, error: 'Identifiant requis.' };
      if (ADMIN_ALIASES.has(candidate)) candidate = 'admin';

      const { data, error } = await neonClient.rpc('pmm_resolve_login', {
        p_identifier: candidate,
      });
      if (error) return { success: false, error: 'Identifiant introuvable.' };

      const resolved = (data as Array<{ login_email: string; status: string }> | null)?.[0];
      if (!resolved?.login_email || resolved.status !== 'active') {
        return { success: false, error: 'Identifiant introuvable ou compte inactif.' };
      }

      const result = await (neonClient.auth as any).signIn.email({
        email: resolved.login_email,
        password,
      });
      if (result?.error) {
        return { success: false, error: result.error.message || 'Identifiant ou mot de passe incorrect.' };
      }

      const appUser = await refresh();
      if (!appUser) return { success: false, error: 'Compte authentifié mais profil PMM indisponible.' };
      emit();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erreur de connexion.' };
    }
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await (neonClient.auth as any).signOut();
    } finally {
      setUser(null);
      emit();
    }
  }, []);

  const createUserWithRole = useCallback(async (
    email: string,
    password: string,
    role: UserRole,
    profileData: { id: string; name: string; [key: string]: any },
  ) => {
    try {
      const r = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, profileData }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return { success: false, error: j.error || 'Création impossible.' };
      emit();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Création impossible.' };
    }
  }, []);

  const migrateModelToAuth = useCallback(
    async () => ({ success: false, error: 'Ce portail utilise désormais Neon Auth. Les comptes mannequins ont déjà été centralisés.' }),
    [],
  );

  const resetPassword = useCallback(async (email: string) => {
    try {
      const r = await fetch('/api/auth/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), redirectTo: `${window.location.origin}/login` }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        return { success: false, error: j?.message || j?.error?.message || "Impossible d'envoyer le lien." };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Impossible d'envoyer le lien." };
    }
  }, []);

  const signInWithPhone = useCallback(async () => ({ success: false, error: 'La connexion par téléphone est désactivée.' }), []);
  const confirmPhoneCode = useCallback(async () => ({ success: false, error: 'La connexion par téléphone est désactivée.' }), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, createUserWithRole, migrateModelToAuth, resetPassword, signInWithPhone, confirmPhoneCode }}>
      {children}
    </AuthContext.Provider>
  );
};
