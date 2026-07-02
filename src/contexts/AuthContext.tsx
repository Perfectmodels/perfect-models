import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db, rtdb } from '../firebase';
import { firebaseConfig } from '../firebaseConfig';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  sendPasswordResetEmail,
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  User as FirebaseUser,
} from 'firebase/auth';
import { ref, get, set, update } from 'firebase/database';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'student' | 'jury' | 'registration' | 'jury-contest';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  /** ID dans la collection métier (models/{id}, juryMembers/{id}, etc.) */
  userId: string;
  /** ID du concours beauté — uniquement pour jury-contest */
  contestId?: string;
}

export interface ModelMigrationRequest {
  modelId: string;
  name: string;
  suggestedEmail: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  migrationRequired?: boolean;
  migration?: ModelMigrationRequest;
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
    profileData: { id: string; name: string; [key: string]: any }
  ) => Promise<{ success: boolean; error?: string }>;
  migrateModelToAuth: (
    modelId: string,
    email: string,
    newPassword: string,
    legacyPassword?: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  signInWithPhone: (phone: string, containerId?: string) => Promise<{ success: boolean; error?: string }>;
  confirmPhoneCode: (code: string) => Promise<{ success: boolean; error?: string }>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCOUNT_ROLES: UserRole[] = ['admin', 'student', 'jury', 'registration', 'jury-contest'];

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && ACCOUNT_ROLES.includes(value as UserRole);

const suggestModelEmail = (name: string, existingEmail?: string) => {
  if (existingEmail) return existingEmail;
  const localPart = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f']/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  return `${localPart || 'mannequin'}@perfectmodels.online`;
};

const getProvisioningAuth = async () => {
  const appName = 'account-provisioning';
  const provisioningApp = getApps().some((candidate) => candidate.name === appName)
    ? getApp(appName)
    : initializeApp(firebaseConfig, appName);
  const provisioningAuth = getAuth(provisioningApp);
  await setPersistence(provisioningAuth, inMemoryPersistence);
  return provisioningAuth;
};

interface AccountProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  profileId: string;
  username?: string;
  contestId?: string;
  migrationSource?: 'legacy-rtdb';
}

async function saveAccountProfile(profile: AccountProfile) {
  const accountRef = doc(db, 'accounts', profile.uid);
  const current = await getDoc(accountRef);
  const payload: Record<string, unknown> = {
    uid: profile.uid,
    email: profile.email,
    displayName: profile.displayName,
    role: profile.role,
    profileId: profile.profileId,
    status: 'active',
    updatedAt: serverTimestamp(),
  };

  if (profile.username) payload.username = profile.username;
  if (profile.contestId) payload.contestId = profile.contestId;
  if (profile.migrationSource && !current.data()?.migrationSource) {
    payload.migrationSource = profile.migrationSource;
    payload.migratedAt = serverTimestamp();
  }
  if (!current.exists()) payload.createdAt = serverTimestamp();

  await setDoc(accountRef, payload, { merge: true });
}

async function saveLegacyUserNode(profile: AccountProfile) {
  await set(ref(rtdb, `users/${profile.uid}`), {
    role: profile.role,
    profileId: profile.profileId,
    name: profile.displayName,
    email: profile.email,
    contestId: profile.contestId ?? null,
    updatedAt: new Date().toISOString(),
  });
}

async function backfillAccountProfile(profile: AccountProfile) {
  await saveAccountProfile(profile).catch((error) => {
    console.warn('[AuthContext] Firestore account backfill skipped:', error);
  });
}

/**
 * Résout le rôle d'un utilisateur Firebase à partir du nœud RTDB `users/{uid}`.
 * Fallback : recherche dans les collections métier par email.
 */
async function resolveUserRole(firebaseUser: FirebaseUser): Promise<AuthUser | null> {
  try {
    // 1. Profil Firestore privé (source de vérité principale)
    const accountSnap = await getDoc(doc(db, 'accounts', firebaseUser.uid));
    if (accountSnap.exists()) {
      const account = accountSnap.data();
      if (isUserRole(account.role) && typeof account.profileId === 'string') {
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: account.displayName || firebaseUser.displayName,
          role: account.role,
          userId: account.profileId,
          contestId: account.contestId,
        };
      }
    }

    // 2. Nœud legacy users/{uid}
    const userSnap = await get(ref(rtdb, `users/${firebaseUser.uid}`));
    if (userSnap.exists()) {
      const userData = userSnap.val();
      const resolved = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: userData.name || firebaseUser.displayName,
        role: userData.role as UserRole,
        userId: userData.profileId || firebaseUser.uid,
        contestId: userData.contestId,
      };
      if (firebaseUser.email && isUserRole(resolved.role)) {
        await backfillAccountProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: resolved.displayName || firebaseUser.email,
          role: resolved.role,
          profileId: resolved.userId,
          contestId: resolved.contestId,
        });
      }
      return resolved;
    }

    // 3. Fallback : recherche dans les collections métier par email
    const email = firebaseUser.email;
    if (!email) return null;

    // models → student
    const modelsSnap = await get(ref(rtdb, 'models'));
    if (modelsSnap.exists()) {
      for (const [modelId, modelData] of Object.entries(modelsSnap.val())) {
        if ((modelData as any).email === email) {
          // Écrire le nœud users/{uid} pour les prochaines connexions
          await set(ref(rtdb, `users/${firebaseUser.uid}`), {
            role: 'student',
            profileId: modelId,
            name: (modelData as any).name,
            email,
            createdAt: new Date().toISOString(),
          });
          await backfillAccountProfile({
            uid: firebaseUser.uid,
            email,
            displayName: (modelData as any).name,
            role: 'student',
            profileId: modelId,
            username: (modelData as any).username,
          });
          return {
            uid: firebaseUser.uid,
            email,
            displayName: (modelData as any).name,
            role: 'student',
            userId: modelId,
          };
        }
      }
    }

    // juryMembers → jury
    const jurySnap = await get(ref(rtdb, 'juryMembers'));
    if (jurySnap.exists()) {
      for (const [juryId, juryData] of Object.entries(jurySnap.val())) {
        if ((juryData as any).email === email) {
          await set(ref(rtdb, `users/${firebaseUser.uid}`), {
            role: 'jury',
            profileId: juryId,
            name: (juryData as any).name,
            email,
            createdAt: new Date().toISOString(),
          });
          await backfillAccountProfile({
            uid: firebaseUser.uid,
            email,
            displayName: (juryData as any).name,
            role: 'jury',
            profileId: juryId,
            username: (juryData as any).username,
          });
          return {
            uid: firebaseUser.uid,
            email,
            displayName: (juryData as any).name,
            role: 'jury',
            userId: juryId,
          };
        }
      }
    }

    // registrationStaff → registration
    const staffSnap = await get(ref(rtdb, 'registrationStaff'));
    if (staffSnap.exists()) {
      for (const [staffId, staffData] of Object.entries(staffSnap.val())) {
        if ((staffData as any).email === email) {
          await set(ref(rtdb, `users/${firebaseUser.uid}`), {
            role: 'registration',
            profileId: staffId,
            name: (staffData as any).name,
            email,
            createdAt: new Date().toISOString(),
          });
          await backfillAccountProfile({
            uid: firebaseUser.uid,
            email,
            displayName: (staffData as any).name,
            role: 'registration',
            profileId: staffId,
            username: (staffData as any).username,
          });
          return {
            uid: firebaseUser.uid,
            email,
            displayName: (staffData as any).name,
            role: 'registration',
            userId: staffId,
          };
        }
      }
    }

    // beautyContests → jury-contest
    const contestsSnap = await get(ref(rtdb, 'beautyContests'));
    if (contestsSnap.exists()) {
      for (const [contestId, contestVal] of Object.entries(contestsSnap.val() as Record<string, any>)) {
        if (!contestVal?.juries) continue;
        for (const [juryId, juryVal] of Object.entries(contestVal.juries as Record<string, any>)) {
          if ((juryVal as any).email === email) {
            await set(ref(rtdb, `users/${firebaseUser.uid}`), {
              role: 'jury-contest',
              profileId: juryId,
              contestId,
              name: (juryVal as any).name,
              email,
              createdAt: new Date().toISOString(),
            });
            await backfillAccountProfile({
              uid: firebaseUser.uid,
              email,
              displayName: (juryVal as any).name,
              role: 'jury-contest',
              profileId: juryId,
              username: (juryVal as any).username,
              contestId,
            });
            return {
              uid: firebaseUser.uid,
              email,
              displayName: (juryVal as any).name,
              role: 'jury-contest',
              userId: juryId,
              contestId,
            };
          }
        }
      }
    }

    // admin par email dédié
    if (email === 'admin@perfectmodels.online') {
      await set(ref(rtdb, `users/${firebaseUser.uid}`), {
        role: 'admin',
        profileId: 'admin',
        name: 'Admin',
        email,
        createdAt: new Date().toISOString(),
      });
      await backfillAccountProfile({
        uid: firebaseUser.uid,
        email,
        displayName: 'Admin',
        role: 'admin',
        profileId: 'admin',
      });
      return {
        uid: firebaseUser.uid,
        email,
        displayName: 'Admin',
        role: 'admin',
        userId: 'admin',
      };
    }
  } catch (err) {
    console.error('[AuthContext] resolveUserRole error:', err);
  }
  return null;
}

/** Résout l'email Firebase depuis un identifiant (nom, username, email) + rôle ciblé */
async function resolveEmailFromIdentifier(identifier: string): Promise<{
  email?: string;
  profileId: string;
  role: UserRole;
  name: string;
  username?: string;
  firebaseUid?: string;
  legacyPassword?: string;
  contestId?: string;
} | null> {
  const lower = identifier.toLowerCase().trim();

  // Admin
  if (lower === 'admin') {
    return { email: 'admin@perfectmodels.online', profileId: 'admin', role: 'admin', name: 'Admin' };
  }

  // Si l'identifiant est déjà un email valide, on cherche directement dans les collections
  const isEmail = lower.includes('@');

  // models
  const modelsSnap = await get(ref(rtdb, 'models'));
  if (modelsSnap.exists()) {
    for (const [id, data] of Object.entries(modelsSnap.val())) {
      const m = data as any;
      const matches = isEmail
        ? m.email?.toLowerCase() === lower
        : m.email?.toLowerCase() === lower ||
          m.username?.toLowerCase() === lower ||
          m.name?.toLowerCase() === lower;
      if (matches) {
        return {
          email: m.email,
          profileId: id,
          role: 'student',
          name: m.name,
          username: m.username,
          firebaseUid: m.firebaseUid,
          legacyPassword: m.password,
        };
      }
    }
  }

  // juryMembers
  const jurySnap = await get(ref(rtdb, 'juryMembers'));
  if (jurySnap.exists()) {
    for (const [id, data] of Object.entries(jurySnap.val())) {
      const j = data as any;
      const matches = isEmail
        ? j.email?.toLowerCase() === lower
        : j.email?.toLowerCase() === lower ||
          j.username?.toLowerCase() === lower ||
          j.name?.toLowerCase() === lower;
      if (matches && j.email) {
        return { email: j.email, profileId: id, role: 'jury', name: j.name };
      }
    }
  }

  // registrationStaff
  const staffSnap = await get(ref(rtdb, 'registrationStaff'));
  if (staffSnap.exists()) {
    for (const [id, data] of Object.entries(staffSnap.val())) {
      const s = data as any;
      const matches = isEmail
        ? s.email?.toLowerCase() === lower
        : s.email?.toLowerCase() === lower ||
          s.username?.toLowerCase() === lower ||
          s.name?.toLowerCase() === lower;
      if (matches && s.email) {
        return { email: s.email, profileId: id, role: 'registration', name: s.name };
      }
    }
  }

  // beautyContests juries
  const contestsSnap = await get(ref(rtdb, 'beautyContests'));
  if (contestsSnap.exists()) {
    for (const [contestId, contestVal] of Object.entries(contestsSnap.val() as Record<string, any>)) {
      if (!contestVal?.juries) continue;
      for (const [juryId, juryVal] of Object.entries(contestVal.juries as Record<string, any>)) {
        const j = juryVal as any;
        const matches = isEmail
          ? j.email?.toLowerCase() === lower
          : j.email?.toLowerCase() === lower ||
            j.username?.toLowerCase() === lower ||
            j.name?.toLowerCase() === lower;
        if (matches && j.email) {
          return { email: j.email, profileId: juryId, role: 'jury-contest', name: j.name, contestId };
        }
      }
    }
  }

  return null;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const confirmationResultRef = React.useRef<ConfirmationResult | null>(null);

  // Écoute l'état Firebase Auth — source de vérité unique
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const authUser = await resolveUserRole(firebaseUser);
        setUser(authUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Connexion universelle : accepte email, nom ou matricule.
   * Un mannequin legacy est orienté vers la migration intégrée à la page login.
   */
  const login = useCallback(async (identifier: string, password: string): Promise<LoginResult> => {
    try {
      const resolved = await resolveEmailFromIdentifier(identifier);

      if (!resolved) {
        return { success: false, error: 'Identifiant introuvable. Vérifiez votre nom ou matricule.' };
      }

      if (resolved.role === 'student' && !resolved.firebaseUid) {
        if (!resolved.legacyPassword || resolved.legacyPassword !== password) {
          return { success: false, error: 'Identifiant ou mot de passe incorrect.' };
        }
        return {
          success: false,
          migrationRequired: true,
          migration: {
            modelId: resolved.profileId,
            name: resolved.name,
            suggestedEmail: suggestModelEmail(resolved.name, resolved.email),
          },
        };
      }

      if (!resolved.email) {
        return {
          success: false,
          error: "Ce compte n'a pas encore d'adresse email. Contactez l'administrateur.",
        };
      }

      await signInWithEmailAndPassword(auth, resolved.email, password);
      return { success: true };
    } catch (error: any) {
      const msg =
        error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential'
          ? 'Mot de passe incorrect.'
          : error.code === 'auth/user-not-found'
          ? 'Aucun compte Firebase trouvé. Contactez l\'administrateur.'
          : error.code === 'auth/too-many-requests'
          ? 'Trop de tentatives. Réessayez dans quelques minutes.'
          : error.message || 'Erreur de connexion.';
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('[AuthContext] logout error:', error);
    }
  }, []);

  /**
   * Crée Firebase Auth + Firestore + liens RTDB.
   * Une instance Auth secondaire préserve la session de l'administrateur.
   */
  const createUserWithRole = useCallback(async (
    email: string,
    password: string,
    role: UserRole,
    profileData: { id: string; name: string; [key: string]: any }
  ) => {
    let createdUser: FirebaseUser | null = null;
    let accountWritten = false;
    let provisioningAuth = auth;

    try {
      if (auth.currentUser && user?.role !== 'admin') {
        return { success: false, error: 'Seul un administrateur peut créer un autre compte.' };
      }

      if (auth.currentUser) provisioningAuth = await getProvisioningAuth();
      const userCredential = await createUserWithEmailAndPassword(
        provisioningAuth,
        email.trim().toLowerCase(),
        password
      );
      createdUser = userCredential.user;
      if (!createdUser) throw new Error("Firebase Auth n'a pas retourné le compte créé.");

      const accountProfile: AccountProfile = {
        uid: createdUser.uid,
        email: email.trim().toLowerCase(),
        displayName: profileData.name,
        role,
        profileId: profileData.id,
        username: profileData.username,
        contestId: profileData.contestId,
      };

      await saveAccountProfile(accountProfile);
      accountWritten = true;
      await saveLegacyUserNode(accountProfile);

      // Mise à jour de la collection métier avec firebaseUid
      const collectionMap: Record<UserRole, string | null> = {
        student: 'models',
        jury: 'juryMembers',
        registration: 'registrationStaff',
        admin: null,
        'jury-contest': null,
      };
      const collection = collectionMap[role];
      if (collection) {
        await update(ref(rtdb, `${collection}/${profileData.id}`), {
          firebaseUid: createdUser.uid,
          email: accountProfile.email,
          password: null,
          accountCreatedAt: new Date().toISOString(),
        });
      }

      if (provisioningAuth === auth) {
        setUser(await resolveUserRole(createdUser));
      }
      if (provisioningAuth !== auth) await signOut(provisioningAuth);
      return { success: true };
    } catch (error: any) {
      if (accountWritten && createdUser) {
        await deleteDoc(doc(db, 'accounts', createdUser.uid)).catch(() => {});
      }
      if (createdUser) await deleteUser(createdUser).catch(() => {});
      if (provisioningAuth !== auth) await signOut(provisioningAuth).catch(() => {});

      if (error.code === 'auth/email-already-in-use') {
        return { success: false, error: 'Cet email est déjà utilisé par un compte Firebase.' };
      }
      return { success: false, error: error.message || 'Erreur lors de la création du compte.' };
    }
  }, [user?.role]);

  /** Migration d'un mannequin legacy (password stocké en RTDB) vers Firebase Auth */
  const migrateModelToAuth = useCallback(async (
    modelId: string,
    email: string,
    newPassword: string,
    legacyPassword?: string
  ) => {
    let accountUser: FirebaseUser | null = null;
    let createdNewUser = false;
    let accountWritten = false;
    let provisioningAuth = auth;

    try {
      const modelSnap = await get(ref(rtdb, `models/${modelId}`));
      if (!modelSnap.exists()) return { success: false, error: 'Mannequin non trouvé.' };

      const modelData = modelSnap.val();
      const isAdminProvisioning = user?.role === 'admin' && Boolean(auth.currentUser);

      if (!isAdminProvisioning) {
        if (!legacyPassword || !modelData.password || modelData.password !== legacyPassword) {
          return { success: false, error: 'Ancien mot de passe incorrect.' };
        }
      }

      provisioningAuth = isAdminProvisioning ? await getProvisioningAuth() : auth;
      const normalizedEmail = email.trim().toLowerCase();

      try {
        const credential = await createUserWithEmailAndPassword(
          provisioningAuth,
          normalizedEmail,
          newPassword
        );
        accountUser = credential.user;
        createdNewUser = true;
      } catch (error: any) {
        if (error.code !== 'auth/email-already-in-use') throw error;
        const credential = await signInWithEmailAndPassword(
          provisioningAuth,
          normalizedEmail,
          newPassword
        );
        accountUser = credential.user;
      }
      if (!accountUser) throw new Error("Firebase Auth n'a pas retourné le compte migré.");

      const existingAccount = await getDoc(doc(db, 'accounts', accountUser.uid));
      if (
        existingAccount.exists() &&
        existingAccount.data().profileId &&
        existingAccount.data().profileId !== modelId
      ) {
        throw new Error('Cet email est déjà lié à un autre profil.');
      }

      const accountProfile: AccountProfile = {
        uid: accountUser.uid,
        email: normalizedEmail,
        displayName: modelData.name,
        role: 'student',
        profileId: modelId,
        username: modelData.username,
        migrationSource: 'legacy-rtdb',
      };

      await saveAccountProfile(accountProfile);
      accountWritten = true;
      await saveLegacyUserNode(accountProfile);

      // Mise à jour RTDB
      await update(ref(rtdb, `models/${modelId}`), {
        email: normalizedEmail,
        firebaseUid: accountUser.uid,
        password: null,
        migratedAt: new Date().toISOString(),
      });

      if (provisioningAuth === auth) {
        setUser(await resolveUserRole(accountUser));
      }
      if (provisioningAuth !== auth) await signOut(provisioningAuth);
      return { success: true };
    } catch (error: any) {
      if (createdNewUser && accountUser) {
        if (accountWritten) {
          await deleteDoc(doc(db, 'accounts', accountUser.uid)).catch(() => {});
        }
        await deleteUser(accountUser).catch(() => {});
      }
      if (provisioningAuth !== auth) await signOut(provisioningAuth).catch(() => {});

      if (error.code === 'auth/invalid-credential') {
        return { success: false, error: 'Cet email existe déjà avec un autre mot de passe.' };
      }
      if (error.code === 'auth/weak-password') {
        return { success: false, error: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' };
      }
      return { success: false, error: error.message || 'Erreur lors de la migration.' };
    }
  }, [user?.role]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erreur lors de la réinitialisation.' };
    }
  }, []);

  const signInWithPhone = useCallback(async (phone: string, containerId = 'recaptcha-container') => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {},
      });
      const result = await firebaseSignInWithPhoneNumber(auth, phone, recaptchaVerifier);
      confirmationResultRef.current = result;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Échec de l'envoi du SMS." };
    }
  }, []);

  const confirmPhoneCode = useCallback(async (code: string) => {
    if (!confirmationResultRef.current) {
      return { success: false, error: 'Aucune vérification en attente.' };
    }
    try {
      await confirmationResultRef.current.confirm(code);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Code de vérification invalide.' };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        createUserWithRole,
        migrateModelToAuth,
        resetPassword,
        signInWithPhone,
        confirmPhoneCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
