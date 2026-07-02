import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, EyeIcon, EyeSlashIcon, KeyIcon, ArrowPathIcon, ArrowUpTrayIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const generateMatricule = (name: string, existingUsernames: string[]): string => {
  const initial = name.trim().charAt(0).toUpperCase();
  const prefix = `Man-PMM${initial}`;
  const existing = existingUsernames
    .filter(u => u && u.startsWith(prefix))
    .map(u => parseInt(u.replace(prefix, ''), 10) || 0);
  const nextNumber = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${prefix}${String(nextNumber).padStart(2, '0')}`;
};

const AdminModelAccess: React.FC = () => {
  const { data, saveData } = useData();
  const { migrateModelToAuth, createUserWithRole } = useAuth();
  const models = data?.models ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [syncing, setSyncing] = useState(false);
  const [migratingAll, setMigratingAll] = useState(false);

  const sanitizeForEmail = (name: string) => {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f']/g, '').replace(/[^a-z0-9-]/g, '');
  };

  const handleMigrateAllToFirebase = async () => {
    if (!data || !models.length) return;
    
    const needMigration = models.filter(m => !m.firebaseUid);
    if (needMigration.length === 0) {
      alert('✅ Tous les mannequins sont déjà migrés vers Firebase Auth.');
      return;
    }

    if (!window.confirm(`Migrer ${needMigration.length} mannequin(s) vers Firebase Auth ?\n\nCela créera des comptes utilisateurs pour ceux qui n'en ont pas encore.`)) return;

    setMigratingAll(true);
    let successCount = 0;
    let errorCount = 0;

    for (const model of needMigration) {
      const email = model.email || `${sanitizeForEmail(model.name)}@perfectmodels.online`;
      const password = model.password;
      
      if (!password) {
        errorCount++;
        continue;
      }

      const result = await createUserWithRole(email, password, 'student', {
        id: model.id,
        name: model.name,
      });

      if (result.success) {
        // Met à jour l'email dans le data local si généré automatiquement
        if (!model.email) {
          await saveData({
            ...data,
            models: data.models.map(m => m.id === model.id ? { ...m, email } : m),
          });
        }
        successCount++;
      } else {
        // Déjà dans Firebase Auth → tenter migrateModelToAuth pour lier l'uid
        const retryResult = await migrateModelToAuth(model.id, email, password);
        if (retryResult.success) successCount++;
        else errorCount++;
      }
    }

    alert(`Migration terminée : ${successCount} succès${errorCount > 0 ? `, ${errorCount} erreurs` : ''}`);
    setMigratingAll(false);
  };

  const handleSavePassword = (id: string) => {
    if (!data || !newPassword.trim()) return;
    saveData({ ...data, models: data.models.map(m => m.id === id ? { ...m, password: newPassword.trim() } : m) });
    setEditingId(null);
    setNewPassword('');
  };

  const toggleShow = (id: string) => setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));

  // Vérifie si un matricule respecte déjà le bon format Man-PMM{Initiale}{2 chiffres}
  const isValidFormat = (username: string, name: string): boolean => {
    const initial = name.trim().charAt(0).toUpperCase();
    return /^Man-PMM[A-Z]\d{2,}$/.test(username) && username.startsWith(`Man-PMM${initial}`);
  };

  // Synchronise TOUS les matricules : reformat les existants + crée les manquants
  const handleSyncAllMatricules = () => {
    if (!data) return;
    const toFix = data.models.filter(m => !m.username?.trim() || !isValidFormat(m.username, m.name));
    if (toFix.length === 0) {
      alert('✅ Tous les matricules sont déjà au bon format.');
      return;
    }
    if (!window.confirm(`Reformater ${toFix.length} matricule(s) vers le format Man-PMM{Initiale}{N} ?\n\nLes matricules déjà conformes ne seront pas modifiés.`)) return;

    setSyncing(true);
    // On garde uniquement les matricules déjà conformes comme base pour éviter les doublons
    const conformUsernames = data.models
      .filter(m => m.username?.trim() && isValidFormat(m.username, m.name))
      .map(m => m.username) as string[];

    const updated = data.models.map(m => {
      if (!m.username?.trim() || !isValidFormat(m.username, m.name)) {
        const matricule = generateMatricule(m.name, conformUsernames);
        conformUsernames.push(matricule);
        return { ...m, username: matricule };
      }
      return m;
    });
    saveData({ ...data, models: updated });
    setSyncing(false);
  };

  const handleGenerateOne = (id: string, name: string) => {
    if (!data) return;
    // Base = uniquement les matricules conformes pour éviter les doublons
    const conformUsernames = data.models
      .filter(m => m.id !== id && m.username?.trim() && isValidFormat(m.username, m.name))
      .map(m => m.username) as string[];
    const matricule = generateMatricule(name, conformUsernames);
    saveData({ ...data, models: data.models.map(m => m.id === id ? { ...m, username: matricule } : m) });
  };

  const missingCount = models.filter(m => !m.username?.trim() || !isValidFormat(m.username, m.name)).length;

  return (
    <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
      <SEO title="Admin - Acces Mannequins" noIndex />
      <div className="container mx-auto px-6">
<Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold mb-4 hover:underline">
           <ChevronLeftIcon className="w-5 h-5" /> Retour au Tableau de Bord
        </Link>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/firebase-setup"
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 text-purple-300 text-sm font-bold rounded-lg transition-colors shrink-0"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              Config Firebase Auth
            </Link>
            <button
              onClick={handleMigrateAllToFirebase}
              disabled={migratingAll}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm font-bold rounded-lg transition-colors disabled:opacity-50 shrink-0"
            >
              <ArrowUpTrayIcon className={`w-4 h-4 ${migratingAll ? 'animate-bounce' : ''}`} />
              Migrer vers Firebase Auth
            </button>
            <button
              onClick={handleSyncAllMatricules}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2.5 bg-pm-gold/10 hover:bg-pm-gold/20 border border-pm-gold/40 text-pm-gold text-sm font-bold rounded-lg transition-colors disabled:opacity-50 shrink-0"
            >
              <ArrowPathIcon className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              Synchroniser les matricules
              {missingCount > 0 && (
                <span className="bg-amber-500 text-pm-dark text-xs font-black px-1.5 py-0.5 rounded-full">{missingCount}</span>
              )}
            </button>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-playfair text-pm-gold mb-1">Acces Mannequins</h1>
            <p className="text-pm-off-white/50 text-sm">Gerez les identifiants de connexion des mannequins.</p>
          </div>
        </div>
        {missingCount > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 mb-6 text-amber-300 text-sm">
            ⚠ <strong>{missingCount}</strong> matricule(s) manquant(s) ou mal formaté(s) — cliquez sur "Synchroniser" pour tout corriger.
          </div>
        )}
        <div className="bg-black border border-pm-gold/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-pm-dark/50">
                <tr className="border-b border-pm-gold/20">
                  <th className="p-4 uppercase text-xs tracking-wider">Nom</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Identifiant</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Mot de passe</th>
                  <th className="p-4 uppercase text-xs tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.map(m => (
                  <tr key={m.id} className="border-b border-pm-dark hover:bg-pm-dark/50">
                    <td className="p-4 font-semibold">{m.name}</td>
                    <td className="p-4 text-sm font-mono text-pm-gold/80">
                      {m.username?.trim() && isValidFormat(m.username, m.name) ? (
                        m.username
                      ) : (
                        <div className="flex items-center gap-2">
                          {m.username?.trim()
                            ? <span className="text-orange-400/80 font-bold text-xs line-through opacity-60">{m.username}</span>
                            : null
                          }
                          <span className="text-amber-400/80 font-bold text-xs">
                            {m.username?.trim() ? '⚠ Format incorrect' : '⚠ Aucun'}
                          </span>
                          <button
                            onClick={() => handleGenerateOne(m.id, m.name)}
                            className="text-[10px] px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold rounded-full transition-colors"
                          >
                            Corriger
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm font-mono">
                      {editingId === m.id ? (
                        <div className="flex items-center gap-2">
                          <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe" className="bg-pm-dark border border-pm-gold/30 rounded px-2 py-1 text-sm text-pm-off-white w-40" autoFocus />
                          <button onClick={() => handleSavePassword(m.id)} className="text-xs px-2 py-1 bg-pm-gold text-pm-dark font-bold rounded">OK</button>
                          <button onClick={() => { setEditingId(null); setNewPassword(''); }} className="text-xs px-2 py-1 border border-pm-gold/30 rounded text-pm-off-white">X</button>
                        </div>
                      ) : (
                        <span className="text-pm-off-white/60">{showPasswords[m.id] ? m.password : '........'}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => toggleShow(m.id)} className="text-pm-gold/60 hover:text-pm-gold">
                          {showPasswords[m.id] ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                        <button onClick={() => { setEditingId(m.id); setNewPassword(m.password); }} className="text-pm-gold/60 hover:text-pm-gold">
                          <KeyIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {models.length === 0 && <p className="text-center p-8 text-pm-off-white/60">Aucun mannequin.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminModelAccess;
