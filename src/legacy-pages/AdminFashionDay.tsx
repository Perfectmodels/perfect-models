import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, TrashIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { FashionDayApplication } from '../types';
import { useFirebaseCollection, invalidateCache } from '../hooks/useFirebaseCollection';
import { ref, update, remove } from 'firebase/database';
import { db } from '../realtimedbConfig';

const STATUS_COLORS: Record<FashionDayApplication['status'], string> = {
  'Nouveau': 'bg-blue-500/20 text-blue-300 border-blue-500',
  'En attente': 'bg-yellow-500/20 text-yellow-300 border-yellow-500',
  'Accepté': 'bg-green-500/20 text-green-300 border-green-500',
  'Refusé': 'bg-red-500/20 text-red-300 border-red-500',
};

const ROLE_COLORS: Record<string, string> = {
  'Mannequin': 'text-pm-gold',
  'Styliste': 'text-purple-400',
  'Photographe': 'text-blue-400',
  'MUA': 'text-pink-400',
  'Partenaire': 'text-green-400',
  'Autre': 'text-white/50',
};

const AdminFashionDay: React.FC = () => {
  const { items: applications, isLoading, refresh } = useFirebaseCollection<FashionDayApplication>('fashionDayApplications', {
    pageSize: 200,
    orderBy: 'submissionDate',
  });
  const [selected, setSelected] = useState<FashionDayApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<FashionDayApplication['status'] | 'Tous'>('Tous');
  const [filterRole, setFilterRole] = useState<string>('Tous');

  const roles = ['Tous', ...Array.from(new Set(applications.map(a => a.role)))];
  const statuses = ['Tous', 'Nouveau', 'En attente', 'Accepté', 'Refusé'] as const;

  const filtered = applications.filter(a => {
    const matchStatus = filterStatus === 'Tous' || a.status === filterStatus;
    const matchRole = filterRole === 'Tous' || a.role === filterRole;
    return matchStatus && matchRole;
  });

  const counts = {
    Nouveau: applications.filter(a => a.status === 'Nouveau').length,
    total: applications.length,
  };

  const handleStatus = async (id: string, status: FashionDayApplication['status']) => {
    await update(ref(db, `fashionDayApplications/${id}`), { status });
    invalidateCache('fashionDayApplications');
    refresh();
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette candidature ?')) return;
    await remove(ref(db, `fashionDayApplications/${id}`));
    invalidateCache('fashionDayApplications');
    refresh();
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
      <SEO title="Admin - Candidatures Fashion Day" noIndex />
      <div className="container mx-auto px-6">
        <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold mb-4 hover:underline">
          <ChevronLeftIcon className="w-5 h-5" /> Retour au Tableau de Bord
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-playfair text-pm-gold">Candidatures Fashion Day</h1>
            <p className="text-pm-off-white/40 text-sm mt-1">{counts.total} candidature(s) — {counts.Nouveau} nouvelle(s)</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {statuses.map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${filterStatus === s ? 'bg-pm-gold text-pm-dark border-pm-gold font-bold' : 'border-pm-gold/30 text-pm-off-white/60 hover:border-pm-gold/60'}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.map(r => (
              <button key={r} onClick={() => setFilterRole(r)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${filterRole === r ? 'bg-white/10 text-white border-white/30 font-bold' : 'border-white/10 text-pm-off-white/40 hover:border-white/20'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-black border border-pm-gold/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-pm-dark/50">
                <tr className="border-b border-pm-gold/20">
                  <th className="p-4 uppercase text-xs tracking-wider">Nom</th>
                  <th className="p-4 uppercase text-xs tracking-wider hidden sm:table-cell">Contact</th>
                  <th className="p-4 uppercase text-xs tracking-wider hidden md:table-cell">Rôle</th>
                  <th className="p-4 uppercase text-xs tracking-wider hidden lg:table-cell">Date</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Statut</th>
                  <th className="p-4 uppercase text-xs tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} className={`border-b border-pm-dark hover:bg-pm-dark/50 ${a.status === 'Nouveau' ? 'border-l-2 border-l-blue-500' : ''}`}>
                    <td className="p-4 font-semibold">{a.name}</td>
                    <td className="p-4 hidden sm:table-cell text-sm">
                      <div className="text-pm-off-white/80">{a.email}</div>
                      <div className="text-pm-off-white/40 text-xs">{a.phone}</div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`text-xs font-bold ${ROLE_COLORS[a.role] ?? 'text-white/50'}`}>{a.role}</span>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-xs text-pm-off-white/40">
                      {new Date(a.submissionDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4">
                      <select value={a.status} onChange={e => handleStatus(a.id, e.target.value as FashionDayApplication['status'])}
                        className={`text-xs font-bold rounded-full border px-2 py-1 bg-transparent cursor-pointer ${STATUS_COLORS[a.status]}`}>
                        {(['Nouveau', 'En attente', 'Accepté', 'Refusé'] as const).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelected(a)} className="text-pm-gold/60 hover:text-pm-gold"><EyeIcon className="w-5 h-5" /></button>
                        <button onClick={() => handleDelete(a.id)} className="text-red-500/70 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isLoading && <p className="text-center p-8 text-pm-off-white/40 animate-pulse">Chargement...</p>}
            {!isLoading && filtered.length === 0 && <p className="text-center p-8 text-pm-off-white/60">Aucune candidature.</p>}
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-pm-dark border border-pm-gold/30 rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col">
            <header className="p-4 flex justify-between items-center border-b border-pm-gold/20 flex-shrink-0">
              <div>
                <h2 className="text-xl font-playfair text-pm-gold">{selected.name}</h2>
                <span className={`text-xs font-bold ${ROLE_COLORS[selected.role] ?? ''}`}>{selected.role}</span>
              </div>
              <button onClick={() => setSelected(null)} className="text-pm-off-white/60 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
            </header>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <Row label="Email" value={selected.email} />
              <Row label="Téléphone" value={selected.phone} />
              <Row label="Date de candidature" value={new Date(selected.submissionDate).toLocaleDateString('fr-FR')} />
              {selected.message && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1">Message</p>
                  <p className="text-sm text-pm-off-white/80 whitespace-pre-wrap bg-black/30 rounded p-3">{selected.message}</p>
                </div>
              )}
            </div>
            <footer className="p-4 border-t border-pm-gold/20 flex items-center justify-between flex-shrink-0">
              <select value={selected.status} onChange={e => handleStatus(selected.id, e.target.value as FashionDayApplication['status'])}
                className={`text-xs font-bold rounded-full border px-3 py-1.5 bg-transparent cursor-pointer ${STATUS_COLORS[selected.status]}`}>
                {(['Nouveau', 'En attente', 'Accepté', 'Refusé'] as const).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => handleDelete(selected.id)} className="text-red-500/70 hover:text-red-500 flex items-center gap-1 text-sm">
                <TrashIcon className="w-4 h-4" /> Supprimer
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-0.5">{label}</p>
    <p className="text-sm text-pm-off-white/90">{value || '—'}</p>
  </div>
);

export default AdminFashionDay;
