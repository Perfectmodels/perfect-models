import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, TrashIcon, CheckCircleIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { RecoveryRequest } from '../types';
import { useFirebaseCollection, invalidateCache } from '../hooks/useFirebaseCollection';
import { ref, update, remove } from 'firebase/database';
import { db } from '../realtimedbConfig';

const AdminRecovery: React.FC = () => {
  const { data } = useData();
  const { items: requests, isLoading, refresh } = useFirebaseCollection<RecoveryRequest>('recoveryRequests', {
    pageSize: 200,
    orderBy: 'timestamp',
  });
  const models = data?.models ?? [];
  const [selected, setSelected] = useState<RecoveryRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<'Tous' | 'Nouveau' | 'Traité'>('Nouveau');

  const filtered = filterStatus === 'Tous' ? requests : requests.filter(r => r.status === filterStatus);
  const newCount = requests.filter(r => r.status === 'Nouveau').length;

  const handleMarkTreated = async (id: string) => {
    await update(ref(db, `recoveryRequests/${id}`), { status: 'Traité' });
    invalidateCache('recoveryRequests');
    refresh();
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: 'Traité' } : null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette demande ?')) return;
    await remove(ref(db, `recoveryRequests/${id}`));
    invalidateCache('recoveryRequests');
    refresh();
    if (selected?.id === id) setSelected(null);
  };

  const findModelCredentials = (req: RecoveryRequest) => {
    const model = models.find(m =>
      m.name.toLowerCase().includes(req.modelName.toLowerCase()) || m.phone === req.phone
    );
    return model ? { username: model.username, password: model.password, found: true } : { username: '—', password: '—', found: false };
  };

  return (
    <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
      <SEO title="Admin - Récupération de Compte" noIndex />
      <div className="container mx-auto px-6">
        <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold mb-4 hover:underline">
          <ChevronLeftIcon className="w-5 h-5" /> Retour au Tableau de Bord
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-playfair text-pm-gold">Récupération de Compte</h1>
          <p className="text-pm-off-white/40 text-sm mt-1">{requests.length} demande(s) — {newCount} nouvelle(s)</p>
        </div>

        <div className="flex gap-2 mb-6">
          {(['Tous', 'Nouveau', 'Traité'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${filterStatus === s ? 'bg-pm-gold text-pm-dark border-pm-gold font-bold' : 'border-pm-gold/30 text-pm-off-white/60 hover:border-pm-gold/60'}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="bg-black border border-pm-gold/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-pm-dark/50">
                <tr className="border-b border-pm-gold/20">
                  <th className="p-4 uppercase text-xs tracking-wider">Mannequin</th>
                  <th className="p-4 uppercase text-xs tracking-wider hidden sm:table-cell">Téléphone</th>
                  <th className="p-4 uppercase text-xs tracking-wider hidden md:table-cell">Date</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Statut</th>
                  <th className="p-4 uppercase text-xs tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const creds = findModelCredentials(r);
                  return (
                    <tr key={r.id} className={`border-b border-pm-dark hover:bg-pm-dark/50 ${r.status === 'Nouveau' ? 'border-l-2 border-l-blue-500' : ''}`}>
                      <td className="p-4">
                        <div className="font-semibold">{r.modelName}</div>
                        {creds.found && <div className="text-xs text-pm-gold/60 font-mono">{creds.username}</div>}
                      </td>
                      <td className="p-4 hidden sm:table-cell text-sm">{r.phone}</td>
                      <td className="p-4 hidden md:table-cell text-sm text-pm-off-white/50">{new Date(r.timestamp).toLocaleString('fr-FR')}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full border ${r.status === 'Nouveau' ? 'bg-blue-500/20 text-blue-300 border-blue-500' : 'bg-green-500/20 text-green-300 border-green-500'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setSelected(r)} className="text-pm-gold/60 hover:text-pm-gold"><EyeIcon className="w-5 h-5" /></button>
                          {r.status === 'Nouveau' && (
                            <button onClick={() => handleMarkTreated(r.id)} className="text-green-400/70 hover:text-green-400">
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(r.id)} className="text-red-500/70 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {isLoading && <p className="text-center p-8 text-pm-off-white/40 animate-pulse">Chargement...</p>}
            {!isLoading && filtered.length === 0 && <p className="text-center p-8 text-pm-off-white/60">Aucune demande.</p>}
          </div>
        </div>
      </div>

      {selected && (() => {
        const creds = findModelCredentials(selected);
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-pm-dark border border-pm-gold/30 rounded-lg w-full max-w-md">
              <header className="p-4 flex justify-between items-center border-b border-pm-gold/20">
                <h2 className="text-xl font-playfair text-pm-gold">Demande de récupération</h2>
                <button onClick={() => setSelected(null)} className="text-pm-off-white/60 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
              </header>
              <div className="p-6 space-y-4">
                <Row label="Mannequin" value={selected.modelName} />
                <Row label="Téléphone" value={selected.phone} />
                <Row label="Date" value={new Date(selected.timestamp).toLocaleString('fr-FR')} />
                {creds.found ? (
                  <div className="bg-pm-gold/10 border border-pm-gold/30 rounded-lg p-4 space-y-2">
                    <p className="text-xs uppercase tracking-widest text-pm-gold mb-2">Identifiants trouvés</p>
                    <Row label="Identifiant" value={creds.username} />
                    <Row label="Mot de passe" value={creds.password} />
                  </div>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-sm text-red-300">Aucun mannequin correspondant trouvé.</p>
                  </div>
                )}
              </div>
              <footer className="p-4 border-t border-pm-gold/20 flex items-center justify-between">
                {selected.status === 'Nouveau' && (
                  <button onClick={() => handleMarkTreated(selected.id)} className="flex items-center gap-2 text-sm text-green-400 border border-green-400/30 px-3 py-1.5 rounded-full hover:bg-green-400/10">
                    <CheckCircleIcon className="w-4 h-4" /> Marquer traité
                  </button>
                )}
                <button onClick={() => handleDelete(selected.id)} className="text-red-500/70 hover:text-red-500 flex items-center gap-1 text-sm ml-auto">
                  <TrashIcon className="w-4 h-4" /> Supprimer
                </button>
              </footer>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-0.5">{label}</p>
    <p className="text-sm font-mono text-pm-off-white/90">{value || '—'}</p>
  </div>
);

export default AdminRecovery;
