import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, TrashIcon, PlusIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { NewsItem } from '../types';

const EMPTY: Omit<NewsItem, 'id'> = { title: '', date: '', imageUrl: '', excerpt: '', link: '' };

const AdminNews: React.FC = () => {
  const { data, saveData } = useData();
  const newsItems = data?.newsItems ?? [];
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<NewsItem | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !form.title.trim()) return;
    const newItem: NewsItem = { ...form, id: `news-${Date.now()}` };
    saveData({ ...data, newsItems: [newItem, ...data.newsItems] });
    setForm(EMPTY);
    setShowForm(false);
  };

  const handleStartEdit = (item: NewsItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleSaveEdit = () => {
    if (!data || !editForm) return;
    saveData({ ...data, newsItems: data.newsItems.map(n => n.id === editForm.id ? editForm : n) });
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    if (!data || !window.confirm('Supprimer cette actualité ?')) return;
    saveData({ ...data, newsItems: data.newsItems.filter(n => n.id !== id) });
  };

  const sorted = [...newsItems].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
      <SEO title="Admin - Actualités" noIndex />
      <div className="container mx-auto px-6">
        <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold mb-4 hover:underline">
          <ChevronLeftIcon className="w-5 h-5" /> Retour au Tableau de Bord
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-playfair text-pm-gold">Actualités</h1>
            <p className="text-pm-off-white/40 text-sm mt-1">{newsItems.length} actualité(s)</p>
          </div>
          <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-pm-gold text-pm-dark text-sm font-bold rounded-full hover:bg-pm-gold/80">
            <PlusIcon className="w-4 h-4" /> Ajouter
          </button>
        </div>

        {/* Formulaire ajout */}
        {showForm && (
          <form onSubmit={handleAdd} className="bg-black border border-pm-gold/20 rounded-lg p-6 mb-8 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-pm-gold">Nouvelle actualité</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1 block">Titre *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1 block">Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1 block">URL Image</label>
                <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..."
                  className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1 block">Extrait</label>
                <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2}
                  className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1 block">Lien (optionnel)</label>
                <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://..."
                  className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 bg-pm-gold text-pm-dark text-sm font-bold rounded-full">Enregistrer</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-pm-gold/30 text-pm-off-white text-sm rounded-full">Annuler</button>
            </div>
          </form>
        )}

        {/* Liste */}
        <div className="space-y-3">
          {sorted.map(n => (
            <div key={n.id} className="bg-black border border-pm-gold/20 rounded-lg overflow-hidden">
              {editingId === n.id && editForm ? (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1 block">Titre</label>
                      <input value={editForm.title} onChange={e => setEditForm(f => f ? { ...f, title: e.target.value } : f)}
                        className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1 block">Date</label>
                      <input type="date" value={editForm.date} onChange={e => setEditForm(f => f ? { ...f, date: e.target.value } : f)}
                        className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1 block">URL Image</label>
                      <input value={editForm.imageUrl} onChange={e => setEditForm(f => f ? { ...f, imageUrl: e.target.value } : f)}
                        className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1 block">Extrait</label>
                      <textarea value={editForm.excerpt} onChange={e => setEditForm(f => f ? { ...f, excerpt: e.target.value } : f)} rows={2}
                        className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1 block">Lien</label>
                      <input value={editForm.link ?? ''} onChange={e => setEditForm(f => f ? { ...f, link: e.target.value } : f)}
                        className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleSaveEdit} className="flex items-center gap-1 px-4 py-2 bg-pm-gold text-pm-dark text-sm font-bold rounded-full">
                      <CheckIcon className="w-4 h-4" /> Sauvegarder
                    </button>
                    <button onClick={() => { setEditingId(null); setEditForm(null); }} className="flex items-center gap-1 px-4 py-2 border border-pm-gold/30 text-pm-off-white text-sm rounded-full">
                      <XMarkIcon className="w-4 h-4" /> Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  {n.imageUrl && <img src={n.imageUrl} alt={n.title} className="w-16 h-16 object-cover rounded flex-shrink-0 hidden sm:block" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{n.title}</p>
                    <p className="text-xs text-pm-off-white/40">{n.date}</p>
                    {n.excerpt && <p className="text-xs text-pm-off-white/50 truncate mt-0.5">{n.excerpt}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleStartEdit(n)} className="text-pm-gold/60 hover:text-pm-gold"><PencilIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(n.id)} className="text-red-500/70 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {newsItems.length === 0 && <p className="text-center p-8 text-pm-off-white/60">Aucune actualité.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminNews;
