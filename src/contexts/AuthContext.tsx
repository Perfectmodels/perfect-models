import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { rtdb } from '../firebase';
import { ref, get, set } from 'firebase/database';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'student' | 'jury' | 'registration' | 'jury-contest';
  userId: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  createModelAccount: (email: string, password: string, modelData: any) => Promise<{ success: boolean; error?: string }>;
  migrateModelToAuth: (modelId: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate email from name if needed
  const generateEmail = (name: string) => {
    const sanitized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f']/g, '').replace(/[^a-z0-9-]/g, '');
    return `${sanitized}@perfectmodels.online`;
  };

  // Fetch user role from database
  const fetchUserRole = async (firebaseUser: FirebaseUser): Promise<AuthUser | null> => {
    try {
      // Check models collection
      const modelsSnap = await get(ref(rtdb, 'models'));
      if (modelsSnap.exists()) {
        const models = modelsSnap.val();
        for (const [modelId, modelData] of Object.entries(models)) {
          if ((modelData as any).email === firebaseUser.email) {
            return {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: (modelData as any).name || firebaseUser.displayName,
              role: 'student',
              userId: modelId
            };
          }
        }
      }

      // Check juryMembers collection
      const jurySnap = await get(ref(rtdb, 'juryMembers'));
      if (jurySnap.exists()) {
        const juryMembers = jurySnap.val();
        for (const [juryId, juryData] of Object.entries(juryMembers)) {
          if ((juryData as any).email === firebaseUser.email) {
            return {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: (juryData as any).name || firebaseUser.displayName,
              role: 'jury',
              userId: juryId
            };
          }
        }
      }

      // Check registrationStaff collection
      const staffSnap = await get(ref(rtdb, 'registrationStaff'));
      if (staffSnap.exists()) {
        const staff = staffSnap.val();
        for (const [staffId, staffData] of Object.entries(staff)) {
          if ((staffData as any).email === firebaseUser.email) {
            return {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: (staffData as any).name || firebaseUser.displayName,
              role: 'registration',
              userId: staffId
            };
          }
        }
      }

      // Check admin (stored in localStorage)
      const adminAccess = localStorage.getItem('pmm_admin_access');
      if (adminAccess === 'granted') {
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: 'Admin',
          role: 'admin',
          userId: 'admin-id'
        };
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const authUser = await fetchUserRole(firebaseUser);
        if (authUser) {
          setUser(authUser);
          // Sync to sessionStorage for backward compatibility with ProtectedRoute
          sessionStorage.setItem('classroom_access', 'granted');
          sessionStorage.setItem('classroom_role', authUser.role);
          sessionStorage.setItem('userId', authUser.userId);
          sessionStorage.setItem('userName', authUser.displayName || '');
        } else {
          // User exists in Firebase but not in our DB - set basic session
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role: 'student',
            userId: 'unknown'
          });
          sessionStorage.setItem('classroom_access', 'granted');
          sessionStorage.setItem('classroom_role', 'student');
          sessionStorage.setItem('userId', 'unknown');
          sessionStorage.setItem('userName', firebaseUser.displayName || firebaseUser.email || '');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      const normalizedIdentifier = identifier.toLowerCase().trim();
      

      // Helper to find user and try legacy auth fallback
      const modelsSnap = await get(ref(rtdb, 'models'));
      const jurySnap = await get(ref(rtdb, 'juryMembers'));
      const staffSnap = await get(ref(rtdb, 'registrationStaff'));
      
      // Try models
      let foundUser = null;
      let userType = null;
      let userId = null;
      
      if (modelsSnap.exists()) {
        const models = modelsSnap.val();
        for (const [mid, mdata] of Object.entries(models)) {
          const model = mdata as any;
          if ((model.email?.toLowerCase() === normalizedIdentifier || 
               model.username?.toLowerCase() === normalizedIdentifier ||
               model.name?.toLowerCase() === normalizedIdentifier)) {
            if (model.email) {
              // Try Firebase Auth
              try {
                await signInWithEmailAndPassword(auth, model.email, password);
                return { success: true };
              } catch (firebaseError) {
                // Fall through to legacy check
              }
            }
            // Legacy password check
            if (model.password === password) {
              foundUser = model.name;
              userType = 'student';
              userId = mid;
              break;
            }
          }
        }
      }

      // Try jury (legacy only - no Firebase for jury)
      if (!foundUser && jurySnap.exists()) {
        const juryMembers = jurySnap.val();
        for (const [jid, jdata] of Object.entries(juryMembers)) {
          const jury = jdata as any;
          if (jury.username?.toLowerCase() === normalizedIdentifier || 
              jury.name?.toLowerCase() === normalizedIdentifier) {
            if (jury.password === password) {
              foundUser = jury.name;
              userType = 'jury';
              userId = jid;
              break;
            }
          }
        }
      }

      // Try registration staff (legacy only)
      if (!foundUser && staffSnap.exists()) {
        const staff = staffSnap.val();
        for (const [sid, sdata] of Object.entries(staff)) {
          const st = sdata as any;
          if (st.username?.toLowerCase() === normalizedIdentifier || 
              st.name?.toLowerCase() === normalizedIdentifier) {
            if (st.password === password) {
              foundUser = st.name;
              userType = 'registration';
              userId = sid;
              break;
            }
          }
        }
      }

      // If found via legacy auth, set session
      if (foundUser) {
        sessionStorage.setItem('classroom_access', 'granted');
        sessionStorage.setItem('classroom_role', userType!);
        sessionStorage.setItem('userId', userId!);
        sessionStorage.setItem('userName', foundUser);
        return { success: true };
      }

      return { success: false, error: 'Identifiant ou mot de passe incorrect.' };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Identifiant ou mot de passe incorrect.' 
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('pmm_admin_access');
      localStorage.removeItem('pmm_admin_role');
      sessionStorage.removeItem('classroom_access');
      sessionStorage.removeItem('classroom_role');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userName');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const createModelAccount = useCallback(async (email: string, password: string, modelData: any) => {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store model data in RTDB
      const modelId = modelData.id;
      await set(ref(rtdb, `models/${modelId}`), {
        ...modelData,
        firebaseUid: userCredential.user.uid,
        createdAt: new Date().toISOString()
      });

      return { success: true };
    } catch (error: any) {
      // If user already exists, try to update the model data
      if (error.code === 'auth/email-already-in-use') {
        try {
          const modelsSnap = await get(ref(rtdb, 'models'));
          if (modelsSnap.exists()) {
            const models = modelsSnap.val();
            for (const [modelId, model] of Object.entries(models)) {
              if ((model as any).email === email) {
                await set(ref(rtdb, `models/${modelId}`), {
                  ...model,
                  firebaseUid: (await get(ref(rtdb, `models/${modelId}/firebaseUid`))).val() || user?.uid,
                });
                return { success: true };
              }
            }
          }
        } catch (updateError) {
          return { success: false, error: 'Erreur lors de la mise à jour du compte existant' };
        }
      }
      return { 
        success: false, 
        error: error.message || 'Erreur lors de la création du compte' 
      };
    }
  }, [user?.uid]);

  const migrateModelToAuth = useCallback(async (modelId: string, email: string, password: string) => {
    try {
      const modelsSnap = await get(ref(rtdb, `models/${modelId}`));
      if (!modelsSnap.exists()) {
        return { success: false, error: 'Mannequin non trouvé' };
      }

      const modelData = modelsSnap.val();
      
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update model with Firebase UID
      await set(ref(rtdb, `models/${modelId}`), {
        ...modelData,
        email: email,
        firebaseUid: userCredential.user.uid,
        migratedAt: new Date().toISOString()
      });

      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Erreur lors de la migration du compte' 
      };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Erreur lors de la réinitialisation du mot de passe' 
      };
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      createModelAccount,
      migrateModelToAuth,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};