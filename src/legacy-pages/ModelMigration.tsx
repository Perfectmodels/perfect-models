import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LockClosedIcon, UserIcon, XMarkIcon, EnvelopeIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { rtdb } from '../firebase';
import { ref, get, update } from 'firebase/database';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { notifyAdmin } from '../utils/adminNotify';

const sanitizeForEmail = (name: string) => {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f']/g, '').replace(/[^a-z0-9-]/g, '');
};

const MigrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isInitialized, saveData } = useData();
  const [modelName, setModelName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundModel, setFoundModel] = useState<any>(null);

  const searchModel = async () => {
    if (!modelName.trim() || !isInitialized || !data) return;
    
    const normalized = modelName.toLowerCase().trim();
    const modelsSnap = await get(ref(rtdb, 'models'));
    
    if (modelsSnap.exists()) {
      const models = modelsSnap.val();
      for (const [mid, mdata] of Object.entries(models)) {
        const model = mdata as any;
        if (model.username?.toLowerCase() === normalized || 
            model.name?.toLowerCase() === normalized) {
          setFoundModel({ ...model, id: mid });
          setEmail(model.email || `${sanitizeForEmail(model.name)}.${sanitizeForEmail(model.firstName || model.name.split(' ')[0] || '')}@perfectmodels.online`);
          return;
        }
      }
    }
    
    setFoundModel(null);
    setError('Mannequin non trouvé avec ce nom ou identifiant.');
  };

  const handleMigrate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundModel || !email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify legacy password
      if (foundModel.password !== password) {
        setError('Mot de passe incorrect');
        return;
      }

      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update model in RTDB
      await update(ref(rtdb, `models/${foundModel.id}`), {
        email: email,
        firebaseUid: userCredential.user.uid,
        migratedAt: new Date().toISOString()
      });

      // Update local data
      const updatedModels = (data?.models || []).map((m: any) => 
        m.id === foundModel.id ? { ...m, email, firebaseUid: userCredential.user.uid, migratedAt: new Date().toISOString() } : m
      );
      await saveData({ ...data, models: updatedModels });

      setSuccess(`Compte migré avec succès! Vous pouvez maintenant vous connecter avec ${email}`);
      
      notifyAdmin('migration', `Compte migré: ${foundModel.name} (${email})`, '/admin/model-access').catch(() => {});
      
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Cet email existe déjà. Veuillez en choisir un autre.');
      } else if (err.code === 'auth/weak-password') {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
      } else {
        setError(err.message || 'Erreur lors de la migration');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Migration Compte Mannequin" noIndex />
      <div className="bg-cover bg-center min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: `url(${data?.siteImages.castingBg})` }}>
        <div className="absolute inset-0 bg-pm-dark/80 backdrop-blur-sm"></div>
        <div className="relative w-full max-w-md">
          <div className="bg-black/50 border border-pm-gold/20 p-8 rounded-lg shadow-2xl shadow-black/50">
            <Link to="/" className="block text-center mb-6">
              <img src={data?.siteConfig.logo} alt="Logo" className="h-16 w-auto mx-auto bg-black rounded-full border-2 border-pm-gold p-1" />
            </Link>
            <h1 className="text-2xl font-playfair text-pm-gold mb-2 text-center">Migration Compte</h1>
            <p className="text-pm-off-white/70 text-sm mb-6 text-center">
              Liez votre compte mannequin à Firebase Auth pour une meilleure sécurité.
            </p>

            {!foundModel ? (
              <div className="space-y-4">
                <div className="relative">
                  <UserIcon className="h-5 w-5 text-pm-off-white/50 absolute top-1/2 left-4 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={modelName}
                    onChange={e => setModelName(e.target.value)}
                    placeholder="Votre nom ou identifiant"
                    className="w-full bg-pm-dark/70 border-2 border-pm-off-white/20 rounded-full py-3 px-12 focus:outline-none focus:border-pm-gold transition-colors"
                  />
                </div>
                <button
                  onClick={searchModel}
                  disabled={!modelName.trim() || !isInitialized}
                  className="w-full px-8 py-3 bg-pm-gold text-pm-dark font-bold uppercase tracking-widest rounded-full transition-all duration-300 hover:bg-white disabled:opacity-50"
                >
                  Rechercher mon compte
                </button>
              </div>
            ) : (
              <form onSubmit={handleMigrate} className="space-y-4">
                <div className="p-3 bg-pm-dark/50 border border-pm-gold/20 rounded-lg">
                  <p className="text-sm text-pm-off-white/70">Mannequin trouvé:</p>
                  <p className="font-bold text-white">{foundModel.name}</p>
                  <p className="text-xs text-pm-gold/70">{foundModel.username}</p>
                </div>
                
                <div className="relative">
                  <EnvelopeIcon className="h-5 w-5 text-pm-off-white/50 absolute top-1/2 left-4 transform -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre.email@exemple.com"
                    className="w-full bg-pm-dark/70 border-2 border-pm-off-white/20 rounded-full py-3 px-12 focus:outline-none focus:border-pm-gold transition-colors"
                    required
                  />
                </div>
                
                <div className="relative">
                  <LockClosedIcon className="h-5 w-5 text-pm-off-white/50 absolute top-1/2 left-4 transform -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Votre mot de passe actuel"
                    className="w-full bg-pm-dark/70 border-2 border-pm-off-white/20 rounded-full py-3 px-12 focus:outline-none focus:border-pm-gold transition-colors"
                    required
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}
                {success && <p className="text-green-400 text-sm">{success}</p>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFoundModel(null)}
                    className="px-4 py-2 border border-pm-gold/30 text-pm-off-white rounded-full hover:bg-pm-dark/50"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-pm-gold text-pm-dark font-bold rounded-full hover:bg-white disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Migration...' : <>Migrer<ArrowRightIcon className="w-4 h-4" /></>}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <button onClick={() => navigate('/login')} className="text-xs text-pm-off-white/60 hover:text-pm-gold hover:underline">
                Retour à la connexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MigrationPage;