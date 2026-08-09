import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, TrashIcon, EyeIcon, LockClosedIcon, LockOpenIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { Model } from '../types';
import ModelForm from '../components/ModelForm';

const EMPTY_MODEL: Model = {
  id: '',
  name: '',
  username: '',
  password: '',
  email: '',
  phone: '',
  age: undefined,
  height: '',
  gender: 'Femme',
  location: '',
  imageUrl: '',
  portfolioImages: [],
  distinctions: [],
  isPublic: false,
  level: 'Débutant',
  measurements: { chest: '', waist: '', hips: '', shoeSize: '' },
  categories: [],
  experience: '',
  journey: '',
  quizScores: {},
};

const generateMatricule = (name: string, existingUsernames: string[]): string => {
  const initial = name.trim().charAt(0).toUpperCase();
  const prefix = `Man-PMM${initial}`;
  const existing = existingUsernames
    .filter(u => u && u.startsWith(prefix))
    .map(u => parseInt(u.replace(prefix, ''), 10) || 0);
  const nextNumber = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${prefix}${String(nextNumber).padStart(2, '0')}`;
};

const AdminModels: React.FC = () => {
  const { data, saveData } = useData();
  const models = data?.models ?? [];
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterGender, setFilterGender] = useState<'Tous' | 'Homme' | 'Femme'>('Tous');

  const filtered = filterGender === 'Tous' ? models : models.filter(m => m.gender === filterGender);

  const handleTogglePublic = (id: string) => {
    if (!data) return;
    saveData({ ...data, models: data.models.map(m => m.id === id ? { ...m, isPublic: !m.isPublic } : m) });
  };

  const handleDelete = (id: string) => {
    if (!data || !window.confirm('Supprimer ce mannequin définitivement ?')) return;
    saveData({ ...data, models: data.models.filter(m => m.id !== id) });
  };

  const handleSave = (model: Model) => {
    if (!data) return;
    if (isCreating) {
      const id = model.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
      saveData({ ...data, models: [...data.models, { ...model, id }] });
    } else {
      saveData({ ...data, models: data.models.map(m => m.id === model.id ? model : m) });
    }
    setEditingModel(null);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingModel({ ...EMPTY_MODEL });
  };

  const handleGenerateMissingMatricules = () => {
    if (!data) return;
    const missing = data.models.filter(m => !m.username?.trim());
    if (missing.length === 0) { alert('Tous les mannequins ont déjà un matricule.'); return; }
    if (!window.confirm(`Générer automatiquement ${missing.length} matricule(s) manquant(s) ?`)) return;
    const existingUsernames = data.models.map(m => m.username).filter(Boolean);
    const updated = data.models.map(m => {
      if (!m.username?.trim()) {
        const matricule = generateMatricule(m.name, existingUsernames);
        existingUsernames.push(matricule);
        return { ...m, username: matricule };
      }
      return m;
    });
    saveData({ ...data, models: updated });
  };

  const handleEdit = (model: Model) => {
    setIsCreating(false);
    setEditingModel({ ...model });
  };

  if (editingModel) {
    return (
      <ModelForm
        model={editingModel}
        onSave={handleSave}
        onCancel={() => { setEditingModel(null); setIsCreating(false); }}
        isCreating={isCreating}
        mode="admin"
      />
    );
  }

  return (
    <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
      <SEO title="Admin - Mannequins" noIndex />
      <div className="container mx-auto px-6">
        <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold mb-4 hover:underline">
          <ChevronLeftIcon className="w-5 h-5" /> Retour au Tableau de Bord
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl font-playfair text-pm-gold">Mannequins ({models.length})</h1>
          <div className="flex items-center gap-3">
            {models.some(m => !m.username?.trim()) && (
              <button onClick={handleGenerateMissingMatricules} className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-sm font-bold rounded-full hover:bg-amber-500/30 transition-colors">
                ⚠ Générer matricules manquants ({models.filter(m => !m.username?.trim()).length})
              </button>
            )}
            <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-pm-gold text-pm-dark text-sm font-bold rounded-full hover:bg-pm-gold/80">
              <PlusIcon className="w-4 h-4" /> Ajouter un Mannequin
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6">
          {(['Tous', 'Femme', 'Homme'] as const).map(g => (
            <button key={g} onClick={() => setFilterGender(g)} className={`text-xs px-4 py-1.5 rounded-full border transition-colors ${filterGender === g ? 'bg-pm-gold text-pm-dark border-pm-gold font-bold' : 'border-pm-gold/30 text-pm-off-white/60 hover:border-pm-gold/60'}`}>
              {g}
            </button>
          ))}
        </div>

        <div className="bg-black border border-pm-gold/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-pm-dark/50">
                <tr className="border-b border-pm-gold/20">
                  <th className="p-4 uppercase text-xs tracking-wider">Nom</th>
                  <th className="p-4 uppercase text-xs tracking-wider hidden sm:table-cell">Genre</th>
                  <th className="p-4 uppercase text-xs tracking-wider hidden sm:table-cell">Taille</th>
                  <th className="p-4 uppercase text-xs tracking-wider hidden md:table-cell">Niveau</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Statut</th>
                  <th className="p-4 uppercase text-xs tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-b border-pm-dark hover:bg-pm-dark/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {m.imageUrl && <img src={m.imageUrl} alt={m.name} className="w-8 h-8 rounded-full object-cover hidden sm:block" />}
                        <div>
                          <div className="font-semibold">{m.name}</div>
                          {m.username?.trim()
                            ? <div className="text-xs text-pm-off-white/40 font-mono">{m.username}</div>
                            : <div className="text-xs text-amber-400/80 font-bold">⚠ Sans matricule</div>
                          }
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell text-sm">{m.gender}</td>
                    <td className="p-4 hidden sm:table-cell text-sm">{m.height}</td>
                    <td className="p-4 hidden md:table-cell text-sm">{m.level ?? '—'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full border ${m.isPublic ? 'bg-green-500/20 text-green-300 border-green-500' : 'bg-gray-500/20 text-gray-300 border-gray-500'}`}>
                        {m.isPublic ? 'Public' : 'Privé'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => handleTogglePublic(m.id)} title={m.isPublic ? 'Rendre privé' : 'Rendre public'} className="text-pm-gold/70 hover:text-pm-gold">
                          {m.isPublic ? <LockOpenIcon className="w-5 h-5" /> : <LockClosedIcon className="w-5 h-5" />}
                        </button>
                        <button onClick={() => handleEdit(m)} className="text-pm-gold/70 hover:text-pm-gold"><PencilIcon className="w-5 h-5" /></button>
                        <Link to={`/mannequins/${m.id}`} className="text-pm-gold/70 hover:text-pm-gold"><EyeIcon className="w-5 h-5" /></Link>
                        <button onClick={() => handleDelete(m.id)} className="text-red-500/70 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center p-8 text-pm-off-white/60">Aucun mannequin.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminModels;
