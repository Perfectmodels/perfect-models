import React, { useState, useRef, useCallback } from 'react';
import {
  PhotoIcon,
  VideoCameraIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  RectangleGroupIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { GalleryItem, GalleryCategory, GalleryMediaType } from '../types';
import { uploadToImgbb, validateFile } from '../utils/imgbbService';
import { ref as dbRef, push, set, remove, update } from 'firebase/database';
import { db } from '../realtimedbConfig';
import { invalidateCache, useFirebaseCollection } from '../hooks/useFirebaseCollection';

const CATEGORIES: GalleryCategory[] = [
  'Défilés', 'Shootings Photo', 'Campagnes Publicitaires', 'Fashion Day',
  'Collaborations', 'Entraînements', 'Backstage', 'Lookbook',
  'Événements', 'Presse & Médias', 'Autres',
];

interface UploadingFile {
  id: string;
  name: string;
  mediaType: GalleryMediaType;
  progress: number;
  done: boolean;
  error?: string;
}

const AdminMediaLibrary: React.FC = () => {
  const { items: gallery, isLoading, refresh } = useFirebaseCollection<GalleryItem>('gallery', { orderBy: 'createdAt' });

  const [activeCategory, setActiveCategory] = useState<GalleryCategory | 'Tout'>('Tout');
  const [activeType, setActiveType] = useState<'auto' | 'image' | 'video'>('auto');
  const [search, setSearch] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [layout, setLayout] = useState<'grid' | 'masonry'>('grid');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = gallery.filter(item => {
    const matchesCategory = activeCategory === 'Tout' || item.category === activeCategory;
    const matchesType = activeType === 'auto' || item.mediaType === activeType;
    const matchesSearch = !search || (item.caption?.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesType && matchesSearch;
  });

  const handleUpload = async (files: FileList) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const uid = `${Date.now()}-${file.name}`;
      const mediaType: GalleryMediaType = file.type.startsWith('video/') ? 'video' : 'image';

      setUploading(p => [...p, { id: uid, name: file.name, mediaType, progress: 0, done: false }]);

      try {
        const url = await uploadToImgbb(file, '', (pct) => {
          setUploading(p => p.map(u => u.id === uid ? { ...u, progress: pct } : u));
        });

        const newRef = push(dbRef(db, 'gallery'));
        const newItem: GalleryItem = {
          id: newRef.key!,
          url,
          mediaType,
          category: activeCategory === 'Tout' ? 'Autres' : activeCategory,
          createdAt: new Date().toISOString(),
        };

        await set(newRef, newItem);
        invalidateCache('gallery');
        setUploading(p => p.map(u => u.id === uid ? { ...u, progress: 100, done: true } : u));
        setTimeout(() => {
          setUploading(p => p.filter(u => u.id !== uid));
          refresh();
        }, 1500);
      } catch (e: any) {
        setUploading(p => p.map(u => u.id === uid ? { ...u, error: e.message ?? 'Erreur upload' } : u));
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce média ?')) return;
    await remove(dbRef(db, `gallery/${id}`));
    invalidateCache('gallery');
    refresh();
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Supprimer ${selectedItems.size} média(s) ?`)) return;
    for (const id of selectedItems) {
      await remove(dbRef(db, `gallery/${id}`));
    }
    invalidateCache('gallery');
    refresh();
    setSelectedItems(new Set());
    setSelectionMode(false);
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    await update(dbRef(db, `gallery/${editingItem.id}`), {
      caption: editingItem.caption || '',
      category: editingItem.category
    });

    invalidateCache('gallery');
    refresh();
    setEditingItem(null);
  };

  return (
    <div className="space-y-8 pb-20">
      <SEO title="Banque d'images - Administration" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold mb-2 block">Médiathèque</span>
          <h1 className="text-4xl font-playfair font-black text-white">Banque d'images</h1>
          <p className="text-xs text-white/40 mt-2">Gérez et organisez tous les médias utilisés sur le site.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectionMode ? (
            <>
              <button
                onClick={() => { setSelectionMode(false); setSelectedItems(new Set()); }}
                className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={deleteSelected}
                disabled={selectedItems.size === 0}
                className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 rounded-full hover:bg-red-500 hover:text-white transition-all disabled:opacity-30"
              >
                Supprimer ({selectedItems.size})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setSelectionMode(true)}
                className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white border border-white/10 hover:border-white/30 rounded-full transition-all"
              >
                Sélectionner
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-pm-gold text-pm-dark rounded-full hover:bg-white transition-all flex items-center gap-2"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                Uploader
              </button>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            multiple
             onChange={e => e.target.files && handleUpload(e.target.files)}
             className="hidden"
             accept="image/*"
          />
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-pm-dark/30 p-6 rounded-2xl border border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCategory('Tout')}
            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === 'Tout' ? 'bg-pm-gold text-pm-dark' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
          >
            Tout
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === c ? 'bg-pm-gold text-pm-dark' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-white focus:border-pm-gold/50 outline-none"
            />
          </div>
          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
            <button
              onClick={() => setActiveType('auto')}
              className={`p-1.5 rounded-full transition-all ${activeType === 'auto' ? 'bg-pm-gold text-pm-dark' : 'text-white/40'}`}
              title="Tous les types"
            >
              <RectangleGroupIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveType('image')}
              className={`p-1.5 rounded-full transition-all ${activeType === 'image' ? 'bg-pm-gold text-pm-dark' : 'text-white/40'}`}
              title="Images"
            >
              <PhotoIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveType('video')}
              className={`p-1.5 rounded-full transition-all ${activeType === 'video' ? 'bg-pm-gold text-pm-dark' : 'text-white/40'}`}
              title="Vidéos"
            >
              <VideoCameraIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Uploading Status */}
      {uploading.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {uploading.map(u => (
            <div key={u.id} className="bg-pm-dark/50 border border-white/10 p-4 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 rounded flex items-center justify-center shrink-0">
                {u.mediaType === 'video' ? <VideoCameraIcon className="w-5 h-5 text-pm-gold" /> : <PhotoIcon className="w-5 h-5 text-pm-gold" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/60 truncate">{u.name}</p>
                <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-pm-gold transition-all duration-300" style={{ width: `${u.progress}%` }} />
                </div>
              </div>
              {u.done && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
            </div>
          ))}
        </div>
      )}

      {/* Grid Section */}
      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <span className="loading loading-ring loading-lg text-pm-gold" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4 opacity-20">
          <PhotoIcon className="w-20 h-20" />
          <p className="text-sm font-black uppercase tracking-[0.3em]">Aucun média trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border-2 transition-all ${
                selectedItems.has(item.id) ? 'border-pm-gold' : 'border-transparent hover:border-white/20'
              }`}
              onClick={() => selectionMode ? toggleSelection(item.id) : setLightbox(item)}
            >
              {item.mediaType === 'video' ? (
                <div className="w-full h-full">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <VideoCameraIcon className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <VideoCameraIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <img src={item.url} alt={item.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              )}

              {/* Selection Checkbox */}
              {selectionMode && (
                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedItems.has(item.id) ? 'bg-pm-gold border-pm-gold text-pm-dark' : 'bg-black/20 border-white/40'
                }`}>
                  {selectedItems.has(item.id) && <CheckCircleIcon className="w-5 h-5" />}
                </div>
              )}

              {/* Action Overlay (only when not in selection mode) */}
              {!selectionMode && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingItem(item); }}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-pm-gold hover:text-pm-dark transition-all flex items-center justify-center"
                      title="Modifier"
                    >
                      <RectangleGroupIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                      title="Supprimer"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{item.category}</span>
                </div>
              )}

              {/* Caption Overlay */}
              {item.caption && !selectionMode && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] text-white truncate">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors" onClick={() => setLightbox(null)}>
            <XMarkIcon className="w-8 h-8" />
          </button>
          <div onClick={e => e.stopPropagation()} className="max-w-5xl w-full flex flex-col items-center">
            {lightbox.mediaType === 'video' ? (
              <video src={lightbox.url} controls autoPlay className="max-h-[80vh] rounded-lg shadow-2xl" />
            ) : (
              <img src={lightbox.url} alt={lightbox.caption} className="max-h-[80vh] object-contain rounded-lg shadow-2xl" />
            )}
            {lightbox.caption && (
              <p className="mt-6 text-sm text-white/70 italic text-center max-w-2xl">{lightbox.caption}</p>
            )}
            <div className="mt-4 px-4 py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-pm-gold">{lightbox.category}</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{new Date(lightbox.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setEditingItem(null)}>
          <div className="bg-[#0d0d0d] border border-pm-gold/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-base font-playfair font-black text-white">Modifier le média</h2>
              <button onClick={() => setEditingItem(null)} className="text-white/30 hover:text-white"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdateItem} className="p-6 space-y-6">
              <div>
                <label className="admin-label">Légende</label>
                <textarea
                  value={editingItem.caption || ''}
                  onChange={e => setEditingItem({...editingItem, caption: e.target.value})}
                  className="admin-input resize-none"
                  rows={3}
                  placeholder="Ajouter une description..."
                />
              </div>
              <div>
                <label className="admin-label">Catégorie</label>
                <select
                  value={editingItem.category}
                  onChange={e => setEditingItem({...editingItem, category: e.target.value as GalleryCategory})}
                  className="admin-input"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 px-6 py-3 bg-pm-gold text-pm-dark text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white transition-all">
                  Enregistrer
                </button>
                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 px-6 py-3 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMediaLibrary;
