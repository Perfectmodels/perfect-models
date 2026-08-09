import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, TrashIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { ArticleComment } from '../types';
import { useFirebaseCollection, invalidateCache } from '../hooks/useFirebaseCollection';
import { ref, remove } from 'firebase/database';
import { db } from '../realtimedbConfig';

const AdminComments: React.FC = () => {
  const { data } = useData();
  const { items: comments, isLoading, refresh } = useFirebaseCollection<ArticleComment>('articleComments', {
    pageSize: 200,
    orderBy: 'createdAt',
  });
  const articles = data?.articles ?? [];
  const [selected, setSelected] = useState<ArticleComment | null>(null);
  const [filterSlug, setFilterSlug] = useState('Tous');
  const [search, setSearch] = useState('');

  const slugs = ['Tous', ...Array.from(new Set(comments.map(c => c.articleSlug)))];

  const filtered = comments.filter(c => {
    const matchSlug = filterSlug === 'Tous' || c.articleSlug === filterSlug;
    const matchSearch = !search || c.authorName.toLowerCase().includes(search.toLowerCase()) || c.content.toLowerCase().includes(search.toLowerCase());
    return matchSlug && matchSearch;
  });

  const getArticleTitle = (slug: string) => articles.find(a => a.slug === slug)?.title ?? slug;

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    await remove(ref(db, `articleComments/${id}`));
    invalidateCache('articleComments');
    refresh();
    if (selected?.id === id) setSelected(null);
  };

  const handleDeleteAll = async (slug: string) => {
    if (!window.confirm('Supprimer tous les commentaires de cet article ?')) return;
    const toDelete = comments.filter(c => c.articleSlug === slug);
    await Promise.all(toDelete.map(c => remove(ref(db, `articleComments/${c.id}`))));
    invalidateCache('articleComments');
    refresh();
  };

  return (
    <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
      <SEO title="Admin - Commentaires" noIndex />
      <div className="container mx-auto px-6">
        <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold mb-4 hover:underline">
          <ChevronLeftIcon className="w-5 h-5" /> Retour au Tableau de Bord
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-playfair text-pm-gold">Modération des Commentaires</h1>
          <p className="text-pm-off-white/40 text-sm mt-1">{comments.length} commentaire(s)</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher auteur ou contenu..."
            className="flex-1 bg-black border border-pm-gold/20 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
          <select value={filterSlug} onChange={e => setFilterSlug(e.target.value)}
            className="bg-black border border-pm-gold/20 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold">
            {slugs.map(s => <option key={s} value={s}>{s === 'Tous' ? 'Tous les articles' : getArticleTitle(s)}</option>)}
          </select>
          {filterSlug !== 'Tous' && (
            <button onClick={() => handleDeleteAll(filterSlug)} className="text-xs text-red-400 border border-red-400/30 px-3 py-2 rounded hover:bg-red-400/10 whitespace-nowrap">
              Tout supprimer
            </button>
          )}
        </div>

        <div className="bg-black border border-pm-gold/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-pm-dark/50">
                <tr className="border-b border-pm-gold/20">
                  <th className="p-4 uppercase text-xs tracking-wider">Auteur</th>
                  <th className="p-4 uppercase text-xs tracking-wider hidden sm:table-cell">Article</th>
                  <th className="p-4 uppercase text-xs tracking-wider hidden md:table-cell">Date</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Contenu</th>
                  <th className="p-4 uppercase text-xs tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-pm-dark hover:bg-pm-dark/50">
                    <td className="p-4 font-semibold">{c.authorName}</td>
                    <td className="p-4 hidden sm:table-cell text-xs text-pm-off-white/50 max-w-[150px] truncate">{getArticleTitle(c.articleSlug)}</td>
                    <td className="p-4 hidden md:table-cell text-xs text-pm-off-white/40">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4 text-sm text-pm-off-white/70 max-w-xs truncate">{c.content}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelected(c)} className="text-pm-gold/60 hover:text-pm-gold"><EyeIcon className="w-5 h-5" /></button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-500/70 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isLoading && <p className="text-center p-8 text-pm-off-white/40 animate-pulse">Chargement...</p>}
            {!isLoading && filtered.length === 0 && <p className="text-center p-8 text-pm-off-white/60">Aucun commentaire.</p>}
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-pm-dark border border-pm-gold/30 rounded-lg w-full max-w-lg">
            <header className="p-4 flex justify-between items-center border-b border-pm-gold/20">
              <h2 className="text-xl font-playfair text-pm-gold">Commentaire de {selected.authorName}</h2>
              <button onClick={() => setSelected(null)} className="text-pm-off-white/60 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
            </header>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1">Article</p>
                <p className="text-sm text-pm-gold/80">{getArticleTitle(selected.articleSlug)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1">Date</p>
                <p className="text-sm">{new Date(selected.createdAt).toLocaleString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1">Contenu</p>
                <p className="text-sm text-pm-off-white/80 whitespace-pre-wrap bg-black/30 rounded p-3">{selected.content}</p>
              </div>
            </div>
            <footer className="p-4 border-t border-pm-gold/20 flex justify-end">
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

export default AdminComments;
