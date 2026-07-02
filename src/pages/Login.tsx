import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LockClosedIcon, UserIcon, XMarkIcon, PhoneIcon, ArrowRightIcon, CogIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { RecoveryRequest } from '../types';
import { motion } from 'framer-motion';
import { notifyAdmin } from '../utils/adminNotify';
import { rtdb } from '../firebase';
import { ref, get, update } from 'firebase/database';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateEmail, updatePassword } from 'firebase/auth';

interface ActiveUser {
  name: string;
  role: string;
  loginTime: number;
}

const updateUserActivity = (name: string, role: string) => {
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;
    const currentActivityJSON = localStorage.getItem('pmm_active_users');
    let activeUsers: ActiveUser[] = currentActivityJSON ? JSON.parse(currentActivityJSON) : [];
    activeUsers = activeUsers.filter(user => user.name !== name);
    activeUsers.push({ name, role, loginTime: now });
    activeUsers = activeUsers.filter(user => (now - user.loginTime) < fifteenMinutes);
    localStorage.setItem('pmm_active_users', JSON.stringify(activeUsers));
};

const sanitizeForEmail = (name: string) => {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f']/g, '').replace(/[^a-z0-9-]/g, '');
};

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  const [migrationModel, setMigrationModel] = useState<any>(null);
  const [migrationEmail, setMigrationEmail] = useState('');
  const [migrationPassword, setMigrationPassword] = useState('');
  const navigate = useNavigate();
  const { data, isInitialized, saveData } = useData();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isInitialized || !data) {
        setError('Service indisponible. Veuillez réessayer dans un instant.');
        return;
    }

    const timestamp = new Date().toISOString();
    const normalizedUsername = username.toLowerCase().trim();

    // ── 1. Jury concours beauté (RTDB beautyContests/{id}/juries) ─────────────
    try {
      const contestsSnap = await get(ref(rtdb, 'beautyContests'));
      if (contestsSnap.exists()) {
        const contestsData = contestsSnap.val() as Record<string, any>;
        for (const [contestId, contestVal] of Object.entries(contestsData)) {
          if (!contestVal?.juries) continue;
          for (const [juryId, juryVal] of Object.entries(contestVal.juries as Record<string, any>)) {
            if (
              juryVal.username?.toLowerCase() === normalizedUsername &&
              juryVal.password === password
            ) {
              sessionStorage.setItem('classroom_access', 'granted');
              sessionStorage.setItem('classroom_role', 'jury-contest');
              sessionStorage.setItem('userId', juryId);
              sessionStorage.setItem('userName', juryVal.name);
              sessionStorage.setItem('contestId', contestId);
              updateUserActivity(juryVal.name, 'jury-contest');
              notifyAdmin('visit', `Connexion Jury Concours: ${juryVal.name} (${contestVal.name || contestId})`, '/concours/jury').catch(() => {});
              navigate('/concours/jury');
              return;
            }
          }
        }
      }
    } catch {
      // Continue with standard auth
    }

    // ── 2. Try Firebase Auth ───────────────────────────────────────────────────
    const modelsSnap = await get(ref(rtdb, 'models'));
    const jurySnap = await get(ref(rtdb, 'juryMembers'));
    const staffSnap = await get(ref(rtdb, 'registrationStaff'));
    
    let foundUser = null;
    let userType = null;
    let userId = null;
    let emailToUse = null;
    
    // Try models first (check if migrated to Firebase)
    if (modelsSnap.exists()) {
      const models = modelsSnap.val();
      for (const [mid, mdata] of Object.entries(models)) {
        const model = mdata as any;
        if (model.email?.toLowerCase() === normalizedUsername || 
            model.username?.toLowerCase() === normalizedUsername ||
            model.name?.toLowerCase() === normalizedUsername) {
          if (model.email) {
            emailToUse = model.email;
            foundUser = model;
            userType = 'student';
            userId = mid;
            break;
          }
        }
      }
    }
    
    // Try jury
    if (!foundUser && jurySnap.exists()) {
      const juryMembers = jurySnap.val();
      for (const [jid, jdata] of Object.entries(juryMembers)) {
        const jury = jdata as any;
        if (jury.username?.toLowerCase() === normalizedUsername || 
            jury.name?.toLowerCase() === normalizedUsername) {
          foundUser = jury;
          userType = 'jury';
          userId = jid;
          break;
        }
      }
    }
    
    // Try registration staff
    if (!foundUser && staffSnap.exists()) {
      const staff = staffSnap.val();
      for (const [sid, sdata] of Object.entries(staff)) {
        const st = sdata as any;
        if (st.username?.toLowerCase() === normalizedUsername || 
            st.name?.toLowerCase() === normalizedUsername) {
          foundUser = st;
          userType = 'registration';
          userId = sid;
          break;
        }
      }
    }


    // If found with Firebase email, try Firebase Auth
    if (emailToUse) {
      try {
        await import('firebase/auth').then(({ signInWithEmailAndPassword }) => 
          signInWithEmailAndPassword(auth, emailToUse!, password)
        );
        
        // Set session
        sessionStorage.setItem('classroom_access', 'granted');
        sessionStorage.setItem('classroom_role', 'student');
        sessionStorage.setItem('userId', userId!);
        sessionStorage.setItem('userName', foundUser!.name);
        
        // Update lastLogin
        if (foundUser && userId) {
          const updatedList = (data.models || []).map((item: any) => 
            item.id === userId ? { ...item, lastLogin: timestamp } : item
          );
          await saveData({ ...data, models: updatedList });
        }
        
        notifyAdmin('visit', `Connexion: ${foundUser!.name} (Mannequin)`, '/profil').catch(() => {});
        navigate('/profil');
        return;
      } catch (firebaseError: any) {
        // Firebase auth failed - continue to legacy check
      }
    }

    // ── 3. Legacy auth fallback ───────────────────────────────────────────────
    if (foundUser && foundUser.type !== 'student') {
        // Jury or registration staff - legacy only
        if (foundUser.password === password) {
            sessionStorage.setItem('classroom_access', 'granted');
            sessionStorage.setItem('classroom_role', userType!);
            sessionStorage.setItem('userId', userId!);
            sessionStorage.setItem('userName', foundUser.name);
            
            const roleLabels: Record<string, string> = {
                admin: 'Admin', student: 'Mannequin', jury: 'Jury', registration: 'Staff'
            };
            notifyAdmin('visit', `Connexion: ${foundUser.name} (${roleLabels[userType as string]})`, '/').catch(() => {});
            const redirectPath = userType === 'jury' ? '/jury/casting' : '/enregistrement/casting';
            navigate(redirectPath);
            return;
        }
    } else if (foundUser && foundUser.type === 'student') {
        // Model - check legacy password
        if (foundUser.password === password) {
            // Offer migration
            setMigrationModel(foundUser);
            setMigrationEmail(foundUser.email || `${sanitizeForEmail(foundUser.name)}@perfectmodels.online`);
            setMigrationPassword('');
            setIsMigrationModalOpen(true);
            return;
        }
    }


    setError('Identifiant ou mot de passe incorrect.');
    setPassword('');
  };

  const handleMigrateAccount = async () => {
    if (!migrationModel || !migrationEmail || !migrationPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, migrationEmail, migrationPassword);
      
      // Update model in RTDB with Firebase UID and email
      await update(ref(rtdb, `models/${migrationModel.id}`), {
        email: migrationEmail,
        firebaseUid: userCredential.user.uid,
        migratedAt: new Date().toISOString()
      });

      // Update local data
      const updatedModels = (data?.models || []).map((m: any) => 
        m.id === migrationModel.id ? { ...m, email: migrationEmail, firebaseUid: userCredential.user.uid } : m
      );
      await saveData({ ...data, models: updatedModels });

      // Set session and redirect
      sessionStorage.setItem('classroom_access', 'granted');
      sessionStorage.setItem('classroom_role', 'student');
      sessionStorage.setItem('userId', migrationModel.id);
      sessionStorage.setItem('userName', migrationModel.name);
      
      // Notify admin of successful migration
      notifyAdmin('migration', `Compte migré: ${migrationModel.name} (${migrationEmail})`, '/admin/model-access').catch(() => {});
      
      setSuccess(`Compte migré avec succès! Email: ${migrationEmail}`);
      setTimeout(() => {
        setIsMigrationModalOpen(false);
        navigate('/profil');
      }, 1500);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé. Veuillez en choisir un autre.');
      } else if (error.code === 'auth/weak-password') {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
      } else {
        setError(error.message || 'Erreur lors de la migration');
      }
    }
  };

  const handleSubmitRecovery = async (modelName: string, phone: string) => {
    if (!data) return;
    const newRequest: RecoveryRequest = {
      id: Date.now().toString(), modelName, phone, timestamp: new Date().toISOString(), status: 'Nouveau',
    };
    const updatedRequests = [...(data.recoveryRequests || []), newRequest];
    await saveData({ ...data, recoveryRequests: updatedRequests });
    
    notifyAdmin('contact', `Récupération accès: ${modelName}`, '/admin/recovery-requests').catch(() => {});
    
    setIsRecoveryModalOpen(false);
    alert('Votre demande a été envoyée. Vous serez contacté prochainement.');
  };

  const handleSkipMigration = () => {
    // Allow login without migration, but notify admin
    if (migrationModel) {
      sessionStorage.setItem('classroom_access', 'granted');
      sessionStorage.setItem('classroom_role', 'student');
      sessionStorage.setItem('userId', migrationModel.id);
      sessionStorage.setItem('userName', migrationModel.name);
      
      notifyAdmin('contact', `Connexion mannequin (non migré): ${migrationModel.name}`, '/admin/model-access').catch(() => {});
      setIsMigrationModalOpen(false);
      navigate('/profil');
    }
  };

  return (
    <>
      <SEO title="Accès Privé" noIndex />
      <div 
        className="bg-cover bg-center min-h-screen flex items-center justify-center p-4"
        style={{ backgroundImage: `url(${data?.siteImages.castingBg})` }}
      >
        <div className="absolute inset-0 bg-pm-dark/80 backdrop-blur-sm"></div>
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-sm"
        >
          <div className="bg-black/50 border border-pm-gold/20 p-8 rounded-lg shadow-2xl shadow-black/50 text-center">
            <Link to="/">
                <img src={data?.siteConfig.logo} alt="Logo" className="h-20 w-auto mx-auto mb-6 bg-black rounded-full border-2 border-pm-gold p-1" />
            </Link>
            <h1 className="text-3xl font-playfair text-pm-gold mb-2">Accès Privé</h1>
            <p className="text-pm-off-white/70 mb-8">
              Bienvenue sur votre espace personnel.
            </p>
            <form onSubmit={handleLogin} className="space-y-6">
                <div className="relative">
                   <UserIcon className="h-5 w-5 text-pm-off-white/50 absolute top-1/2 left-4 transform -translate-y-1/2" />
                   <input
                     type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(''); setSuccess(''); }}
                     placeholder="Identifiant ou Nom"
                     className="w-full bg-pm-dark/70 border-2 border-pm-off-white/20 rounded-full py-3 px-12 focus:outline-none focus:border-pm-gold transition-colors"
                     required
                   />
                </div>
                <div className="relative">
                   <LockClosedIcon className="h-5 w-5 text-pm-off-white/50 absolute top-1/2 left-4 transform -translate-y-1/2" />
                   <input
                     type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); setSuccess(''); }}
                     placeholder="Mot de passe"
                     className="w-full bg-pm-dark/70 border-2 border-pm-off-white/20 rounded-full py-3 px-12 focus:outline-none focus:border-pm-gold transition-colors"
                     required
                   />
                </div>
              {error && <p className="text-red-400 text-sm !mt-4">{error}</p>}
              {success && <p className="text-green-400 text-sm !mt-4">{success}</p>}
              <button
                type="submit" disabled={!isInitialized}
                className="w-full group flex items-center justify-center gap-2 px-8 py-3 bg-pm-gold text-pm-dark font-bold uppercase tracking-widest rounded-full transition-all duration-300 hover:bg-white !mt-8 disabled:opacity-50"
              >
                <span>{isInitialized ? 'Connexion' : 'Chargement...'}</span>
                <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </form>
            <div className="mt-6 space-y-2">
              <button onClick={() => setIsRecoveryModalOpen(true)} className="text-xs text-pm-off-white/60 hover:text-pm-gold hover:underline block">
                Coordonnées oubliées ?
              </button>
              <button onClick={() => navigate('/login/migration')} className="flex items-center justify-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline">
                <CogIcon className="w-3 h-3" />
                Migrer mon compte existant
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      
      {isRecoveryModalOpen && <RecoveryModal onClose={() => setIsRecoveryModalOpen(false)} onSubmit={handleSubmitRecovery} />}
      
      {isMigrationModalOpen && migrationModel && (
        <MigrationModal 
          model={migrationModel}
          email={migrationEmail}
          password={migrationPassword}
          onEmailChange={setMigrationEmail}
          onPasswordChange={setMigrationPassword}
          onMigrate={handleMigrateAccount}
          onSkip={handleSkipMigration}
          onClose={() => setIsMigrationModalOpen(false)}
        />
      )}
    </>
  );
};

const RecoveryModal: React.FC<{
  onClose: () => void; 
  onSubmit: (name: string, phone: string) => void;
}> = ({ onClose, onSubmit }) => {
  const [modelName, setModelName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(modelName, phone);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-pm-dark border border-pm-gold/30 rounded-lg shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-playfair text-pm-gold">Demande de Coordonnées</h2>
            <button onClick={onClose} className="text-pm-off-white/70 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-pm-off-white/70 mb-6">
            Entrez votre nom de mannequin et votre numéro de téléphone. L'administrateur vous contactera pour vous fournir vos accès.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="modelName" className="sr-only">Nom de mannequin</label>
              <div className="relative">
                <UserIcon className="h-5 w-5 text-pm-off-white/50 absolute top-1/2 left-4 transform -translate-y-1/2" />
                <input id="modelName" type="text" value={modelName} onChange={e => setModelName(e.target.value)} placeholder="Votre nom complet" className="admin-input pl-12" required />
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">Numéro de téléphone</label>
              <div className="relative">
                <PhoneIcon className="h-5 w-5 text-pm-off-white/50 absolute top-1/2 left-4 transform -translate-y-1/2" />
                <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Votre numéro de téléphone" className="admin-input pl-12" required />
              </div>
            </div>
            <button type="submit" className="w-full px-8 py-3 bg-pm-gold text-pm-dark font-bold uppercase tracking-widest rounded-full transition-all duration-300 hover:bg-white mt-4">
              Envoyer la demande
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const MigrationModal: React.FC<{
  model: any;
  email: string;
  password: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onMigrate: () => void;
  onSkip: () => void;
  onClose: () => void;
}> = ({ model, email, password, onEmailChange, onPasswordChange, onMigrate, onSkip, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-pm-dark border border-pm-gold/30 rounded-lg shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-playfair text-pm-gold">Migrer votre compte</h2>
            <button onClick={onClose} className="text-pm-off-white/70 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-start gap-3 mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300">
              Votre compte n'est pas encore lié à Firebase Auth. Migrer vous permettra de retrouver vos identifiants en cas de perte.
            </p>
          </div>
          <p className="text-sm text-pm-off-white/70 mb-4">
            Mannequin: <strong className="text-white">{model.name}</strong>
          </p>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onMigrate(); }}>
            <div>
              <label className="block text-xs uppercase tracking-widest text-pm-off-white/40 mb-1">Email Firebase *</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => onEmailChange(e.target.value)} 
                placeholder="votre.email@exemple.com" 
                className="w-full admin-input" 
                required 
              />
              <p className="text-xs text-pm-off-white/50 mt-1">Format recommandé: prenom.nom@perfectmodels.online</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-pm-off-white/40 mb-1">Nouveau mot de passe *</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => onPasswordChange(e.target.value)} 
                placeholder="Minimum 6 caractères" 
                className="w-full admin-input" 
                required 
                minLength={6}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 px-4 py-2.5 bg-pm-gold text-pm-dark font-bold rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2">
                <CheckCircleIcon className="w-4 h-4" />
                Migrer maintenant
              </button>
              <button type="button" onClick={onSkip} className="px-4 py-2.5 border border-pm-gold/30 text-pm-off-white rounded-lg hover:bg-pm-dark/50 transition-colors">
                Plus tard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;