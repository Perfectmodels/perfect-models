import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, TrashIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { Absence } from '../types';
import { useFirebaseCollection, invalidateCache } from '../hooks/useFirebaseCollection';
import { ref, update, remove, push, set } from 'firebase/database';
import { db } from '../realtimedbConfig';

const REASONS: Absence['reason'][] = ['Maladie', 'Personnel', 'Non justifié', 'Autre'];
const EMPTY: Omit<Absence, 'id'> = { modelId: '', modelName: '', date: '', reason: 'Autre', notes: '', isExcused: false };

const REASON_COLORS: Record<Absence['reason'], string> = {
  'Maladie': 'text-blue-300',
  'Personnel': 'text-yellow-300',
  'Non justifié': 'text-red-300',
  'Autre': 'text-white/50',
};

const AdminAbsences: React.FC = () => {
  const { data } = useData();
  const { items: absences, isLoading, refresh } = useFirebaseCollection<Absence>('absences', {
    pageSize: 200,
    orderBy: 'date',
  });
  const models = data?.models ?? [];
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [filterModel, setFilterModel] = useState('Tous');
  const [filterExcused, setFilterExcused] = useState<'Tous' | 'Justifiée' | 'Non justifiée'>('Tous');

  const modelOptions = ['Tous', ...Array.from(new Set(absences.map(a => a.modelName))).sort()];

  const filtered = absences.filter(a => {
    const matchModel = filterModel === 'Tous' || a.modelName === filterModel;
    const matchExcused = filterExcused === 'Tous' || (filterExcused === 'Justifiée' ? a.isExcused : !a.isExcused);
    return matchModel && matchExcused;
  });

  const stats = models.map(m => ({
    name: m.name,
    total: absences.filter(a => a.modelId === m.id).length,
    nonJustified: absences.filter(a => a.modelId === m.id && !a.isExcused).length,
  })).filter(s => s.total > 0).sort((a, b) => b.total - a.total);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.modelId || !form.date) return;
    const model = models.find(m => m.id === form.modelId);
    const newRef = push(ref(db, 'absences'));
    await set(newRef, { ...form, id: newRef.key, modelName: model?.name ?? form.modelId });
    invalidateCache('absences');
    refresh();
    setForm(EMPTY);
    setShowForm(false);
  };

  const handleToggleExcused = async (id: string, current: boolean) => {
    await update(ref(db, `absences/${id}`), { isExcused: !current });
    invalidateCache('absences');
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette absence ?')) return;
    await remove(ref(db, `absences/${id}`));
    invalidateCache('absences');
    refresh();
  };

  return (
    <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
      <SEO title="Admin - Absences" noIndex />
      <div className="container mx-auto px-6">
        <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold mb-4 hover:underline">
          <ChevronLeftIcon className="w-5 h-5" /> Retour au Tableau de Bord
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-playfair text-pm-gold">Absences</h1>
            <p className="text-pm-off-white/40 text-sm mt-1">{absences.length} absence(s) enregistrée(s)</p>
          </div>
          <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-pm-gold text-pm-dark text-sm font-bold rounded-full hover:bg-pm-gold/80">
            <PlusIcon className="w-4 h-4" /> Enregistrer une absence
          </button>
        </div>

        {stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {stats.slice(0, 4).map(s => (
              <div key={s.name} className="bg-black/40 border border-pm-gold/20 rounded-lg p-3">
                <p className="text-xs text-pm-off-white/40 truncate">{s.name}</p>
                <p className="text-xl font-black text-pm-gold">{s.total}</p>
                {s.nonJustified > 0 && <p className="text-xs text-red-400">{s.nonJustified} non justifiée(s)</p>}
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleAdd} className="bg-black border border-pm-gold/20 rounded-lg p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1 block">Mannequin *</label>
              <select required value={form.modelId} onChange={e => setForm(f => ({ ...f, modelId: e.target.value }))}
                className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold">
                <option value="">-- Sélectionner --</option>
                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1 block">Date *</label>
              <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1 block">Motif</label>
              <select value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value as Absence['reason'] }))}
                className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold">
                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="excused" checked={form.isExcused} onChange={e => setForm(f => ({ ...f, isExcused: e.target.checked }))} className="w-4 h-4 accent-pm-gold" />
              <label htmlFor="excused" className="text-sm text-pm-off-white/70">Absence justifiée</label>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1 block">Notes</label>
              <textarea placeholder="Notes optionnelles..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="px-4 py-2 bg-pm-gold text-pm-dark text-sm font-bold rounded-full">Enregistrer</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-pm-gold/30 text-pm-off-white text-sm rounded-full">Annuler</button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <FunnelIcon className="w-4 h-4 text-pm-off-white/30" />
          <select value={filterModel} onChange={e => setFilterModel(e.target.value)}
            className="bg-black border border-pm-gold/20 rounded px-3 py-1.5 text-xs text-pm-off-white focus:outline-none focus:border-pm-gold">
            {modelOptions.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {(['Tous', 'Justifiée', 'Non justifiée'] as const).map(s => (
            <button key={s} onClick={() => setFilterExcused(s)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${filterExcused === s ? 'bg-pm-gold text-pm-dark border-pm-gold font-bold' : 'border-pm-gold/30 text-pm-off-white/60 hover:border-pm-gold/60'}`}>
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
                  <th className="p-4 uppercase text-xs tracking-wider hidden sm:table-cell">Date</th>
                  <th className="p-4 uppercase text-xs tracking-wider hidden md:table-cell">Motif</th>
                  <th className="p-4 uppercase text-xs tracking-wider hidden lg:table-cell">Notes</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Statut</th>
                  <th className="p-4 uppercase text-xs tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} className="border-b border-pm-dark hover:bg-pm-dark/50">
                    <td className="p-4 font-semibold">{a.modelName}</td>
                    <td className="p-4 hidden sm:table-cell text-sm">{a.date}</td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`text-xs font-semibold ${REASON_COLORS[a.reason]}`}>{a.reason}</span>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-xs text-pm-off-white/40 max-w-[150px] truncate">{a.notes || '—'}</td>
                    <td className="p-4">
                      <button onClick={() => handleToggleExcused(a.id, a.isExcused)}
                        className={`px-2 py-1 text-xs font-bold rounded-full border transition-all ${a.isExcused ? 'bg-green-500/20 text-green-300 border-green-500' : 'bg-red-500/20 text-red-300 border-red-500'}`}>
                        {a.isExcused ? 'Justifiée' : 'Non justifiée'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(a.id)} className="text-red-500/70 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isLoading && <p className="text-center p-8 text-pm-off-white/40 animate-pulse">Chargement...</p>}
            {!isLoading && filtered.length === 0 && <p className="text-center p-8 text-pm-off-white/60">Aucune absence.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAbsences;
