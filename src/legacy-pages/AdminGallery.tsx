import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeftIcon, TrashIcon, PlusIcon, PhotoIcon,
  PlayIcon, XMarkIcon, FolderPlusIcon, ArrowUpTrayIcon,
  CheckIcon, PencilIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { GalleryAlbum, GalleryCategory, GalleryItem, GalleryMediaType } from '../types';
import { uploadToImgbb, validateFile } from '../utils/imgbbService';
import { ref as dbRef, push, set, update, remove } from 'firebase/database';
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

// ── Modale création / édition album ─────────────────────────────────────────

interface AlbumModalProps {
  initial?: GalleryAlbum;
  onClose: () => void;
  onSave: (name: string, description: string, category: GalleryCategory, files: File[]) => void;
}

const AlbumModal: React.FC<AlbumModalProps> = ({ initial, onClose, onSave }) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState<GalleryCategory>(initial?.category ?? 'Défilés');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ file: File; url: string; type: GalleryMediaType }[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!initial;

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const valid = arr.filter(f => !validateFile(f, 'auto'));
    setFiles(prev => [...prev, ...valid]);
    valid.forEach(f => {
      const type: GalleryMediaType = f.type.startsWith('video/') ? 'video' : 'image';
      setPreviews(prev => [...prev, { file: f, url: type === 'image' ? URL.createObjectURL(f) : '', type }]);
    });
  }, []);

  const removeFile = (idx: number) => {
    const p = previews[idx];
    if (p.url) URL.revokeObjectURL(p.url);
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const canSubmit = name.trim().length > 0 && (isEdit || files.length > 0);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d0d] border border-pm-gold/20 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-black/60" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-pm-gold/10 flex items-center justify-center">
              <FolderPlusIcon className="w-5 h-5 text-pm-gold" />
            </div>
            <div>
              <h2 className="text-base font-playfair font-black text-white">{isEdit ? 'Modifier l\'album' : 'Nouvel Album'}</h2>
              <p className="text-[10px] text-white/30 uppercase tracking-widest">{isEdit ? 'Mettre à jour' : 'Créer et uploader'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Nom */}
          <div>
            <label className="admin-label">Nom de l'album *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Défilé Printemps 2025"
              className="admin-input mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="admin-label">Description <span className="text-white/20">(optionnel)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Décrivez cet album..."
              rows={3}
              className="admin-input mt-1 resize-none"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="admin-label">Catégorie *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => setCategory(c)}
                  className={`px-3 py-2.5 rounded-lg border text-left text-xs font-bold transition-all ${
                    category === c ? 'border-pm-gold bg-pm-gold/10 text-pm-gold' : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/70'
                  }`}>
                  <span className="flex items-center gap-2">
                    {category === c && <CheckIcon className="w-3 h-3 shrink-0" />}
                    {c}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Zone de drop */}
          {!isEdit && (
            <div>
              <label className="admin-label">Médias ({files.length} fichier{files.length !== 1 ? 's' : ''})</label>
              <div
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onClick={() => inputRef.current?.click()}
                className={`mt-2 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragging ? 'border-pm-gold bg-pm-gold/5' : 'border-white/10 hover:border-pm-gold/40 hover:bg-white/[0.02]'
                }`}
              >
                <ArrowUpTrayIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/40">Glissez vos fichiers ici ou <span className="text-pm-gold underline">parcourir</span></p>
                <p className="text-[10px] text-white/20 mt-1">JPG, PNG, WEBP (10 Mo max) · MP4, MOV (100 Mo max)</p>
              </div>
              <input ref={inputRef} type="file" multiple accept="image/*,video/*" className="hidden"
                onChange={e => e.target.files && addFiles(e.target.files)} />
            </div>
          )}

          {/* Prévisualisations */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {previews.map((p, i) => (
                <div key={i} className="relative group aspect-square bg-white/5 rounded-lg overflow-hidden border border-white/5">
                  {p.type === 'image' && p.url
                    ? <img src={p.url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <PlayIcon className="w-6 h-6 text-pm-gold/50" />
                        <span className="text-[9px] text-white/30 px-1 truncate w-full text-center">{p.file.name}</span>
                      </div>}
                  <button type="button" onClick={() => removeFile(i)}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <XMarkIcon className="w-5 h-5 text-red-400" />
                  </button>
                  <span className="absolute bottom-1 left-1 text-[8px] font-black uppercase tracking-widest bg-black/70 text-pm-gold/70 px-1.5 py-0.5 rounded">
                    {p.type === 'video' ? 'VID' : 'IMG'}
                  </span>
                </div>
              ))}
              <button type="button" onClick={() => inputRef.current?.click()}
                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg hover:border-pm-gold/40 hover:bg-pm-gold/5 transition-all group">
                <PlusIcon className="w-6 h-6 text-white/20 group-hover:text-pm-gold transition-colors" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            {isEdit ? category : files.length > 0 ? `${files.length} fichier${files.length > 1 ? 's' : ''} · ${category}` : 'Aucun fichier sélectionné'}
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white border border-white/10 hover:border-white/30 rounded-full transition-all">
              Annuler
            </button>
            <button
              onClick={() => canSubmit && onSave(name.trim(), description.trim(), category, files)}
              disabled={!canSubmit}
              className="px-6 py-2.5 text-xs font-black uppercase tracking-widest bg-pm-gold text-pm-dark rounded-full hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isEdit ? <><PencilIcon className="w-4 h-4" /> Enregistrer</> : <><ArrowUpTrayIcon className="w-4 h-4" /> Créer ({files.length})</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Page principale ──────────────────────────────────────────────────────────

const AdminGallery: React.FC = () => {
  const { items: gallery, refresh: refreshGallery } = useFirebaseCollection<GalleryItem>('gallery', { orderBy: 'createdAt' });
  const { items: albums, refresh: refreshAlbums } = useFirebaseCollection<GalleryAlbum>('galleryAlbums', { orderBy: 'createdAt' });

  const [activeTab, setActiveTab] = useState<GalleryCategory | 'Tout' | 'Sans Album'>('Tout');
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [captionMap, setCaptionMap] = useState<Record<string, string>>({});
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editAlbum, setEditAlbum] = useState<GalleryAlbum | null>(null);
  const [assignItem, setAssignItem] = useState<GalleryItem | null>(null);
  
  // Mode sélection multiple
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showCreateAlbumFromSelection, setShowCreateAlbumFromSelection] = useState(false);

  const filtered = activeTab === 'Tout' 
    ? gallery 
    : activeTab === 'Sans Album'
      ? gallery.filter(i => !i.albumId)
      : gallery.filter(i => i.category === activeTab);

  // Trouver l'album d'un item
  const getAlbum = (item: GalleryItem) => albums.find(a => a.id === item.albumId);

  const handleAlbumSave = async (name: string, description: string, category: GalleryCategory, files: File[]) => {
    setShowModal(false);

    // Créer l'album d'abord
    const albumRef = push(dbRef(db, 'galleryAlbums'));
    const albumId = albumRef.key!;
    let coverUrl: string | undefined;

    for (const file of files) {
      const uid = `${Date.now()}-${file.name}`;
      const mediaType: GalleryMediaType = file.type.startsWith('video/') ? 'video' : 'image';
      setUploading(p => [...p, { id: uid, name: file.name, mediaType, progress: 0, done: false }]);

      try {
        const url = await uploadToImgbb(file, '', (pct) => {
          setUploading(p => p.map(u => u.id === uid ? { ...u, progress: pct } : u));
        });

        if (!coverUrl && mediaType === 'image') coverUrl = url;

        const newRef = push(dbRef(db, 'gallery'));
        const newItem: GalleryItem = {
          id: newRef.key!,
          url,
          mediaType,
          category,
          albumId,
          createdAt: new Date().toISOString(),
        };
        await set(newRef, newItem);
        invalidateCache('gallery');
        setUploading(p => p.map(u => u.id === uid ? { ...u, progress: 100, done: true } : u));
        setTimeout(() => setUploading(p => p.filter(u => u.id !== uid)), 1500);
      } catch (e: any) {
        setUploading(p => p.map(u => u.id === uid ? { ...u, error: e.message ?? 'Erreur upload' } : u));
      }
    }

    // Sauvegarder l'album avec la cover
    const newAlbum: GalleryAlbum = {
      id: albumId,
      name,
      description: description || '',
      category,
      coverUrl,
      createdAt: new Date().toISOString(),
    };
    await set(albumRef, newAlbum);
    invalidateCache('galleryAlbums');
    refreshAlbums();
    refreshGallery();
  };

  const handleAlbumEdit = async (name: string, description: string, category: GalleryCategory) => {
    if (!editAlbum) return;
    await update(dbRef(db, `galleryAlbums/${editAlbum.id}`), { name, description: description || '', category });
    invalidateCache('galleryAlbums');
    refreshAlbums();
    setEditAlbum(null);
  };

  const handleDeleteAlbum = async (album: GalleryAlbum) => {
    if (!window.confirm(`Supprimer l'album "${album.name}" et tous ses médias ?`)) return;
    // Supprimer les médias liés
    const linked = gallery.filter(i => i.albumId === album.id);
    for (const item of linked) {
      await remove(dbRef(db, `gallery/${item.id}`));
    }
    await remove(dbRef(db, `galleryAlbums/${album.id}`));
    invalidateCache('gallery');
    invalidateCache('galleryAlbums');
    refreshGallery();
    refreshAlbums();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce média ?')) return;
    await remove(dbRef(db, `gallery/${id}`));
    invalidateCache('gallery');
    refreshGallery();
  };

  const handleAssignToAlbum = async (itemId: string, albumId: string) => {
    await update(dbRef(db, `gallery/${itemId}`), { albumId });
    invalidateCache('gallery');
    refreshGallery();
    setAssignItem(null);
  };

  // Gestion sélection multiple
  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedItems(new Set(filtered.map(i => i.id)));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Supprimer ${selectedItems.size} média(s) ?`)) return;
    for (const id of selectedItems) {
      await remove(dbRef(db, `gallery/${id}`));
    }
    invalidateCache('gallery');
    refreshGallery();
    setSelectedItems(new Set());
    setSelectionMode(false);
  };

  const createAlbumFromSelection = async (name: string, description: string, category: GalleryCategory) => {
    const albumId = push(dbRef(db, 'galleryAlbums')).key!;
    const albumRef = dbRef(db, `galleryAlbums/${albumId}`);
    
    // Trouver la première image comme cover
    const firstItem = gallery.find(i => selectedItems.has(i.id));
    const coverUrl = firstItem?.mediaType === 'video' ? firstItem.thumbnailUrl : firstItem?.url;

    const newAlbum: GalleryAlbum = {
      id: albumId,
      name,
      description: description || '',
      category,
      coverUrl: coverUrl || '',
      createdAt: new Date().toISOString(),
    };
    
    await set(albumRef, newAlbum);
    
    // Assigner tous les médias sélectionnés à cet album
    for (const itemId of selectedItems) {
      await update(dbRef(db, `gallery/${itemId}`), { albumId });
    }
    
    invalidateCache('galleryAlbums');
    invalidateCache('gallery');
    refreshAlbums();
    refreshGallery();
    setSelectedItems(new Set());
    setSelectionMode(false);
    setShowCreateAlbumFromSelection(false);
  };

  const handleSaveCaption = async (item: GalleryItem) => {
    const caption = captionMap[item.id] ?? item.caption ?? '';
    await update(dbRef(db, `gallery/${item.id}`), { caption });
    invalidateCache('gallery');
    refreshGallery();
    setCaptionMap(p => { const n = { ...p }; delete n[item.id]; return n; });
  };

  return (
    <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
      <SEO title="Admin - Galerie" noIndex />
      <div className="container mx-auto px-6 max-w-7xl">

        {/* Header */}
        <div className="admin-page-header">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold mb-4 hover:underline">
              <ChevronLeftIcon className="w-5 h-5" /> Retour au Tableau de Bord
            </Link>
            <h1 className="admin-page-title">Galerie Média</h1>
            <p className="admin-page-subtitle">Gérez les photos et vidéos de vos prestations, collaborations et entraînements.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {selectionMode ? (
              <>
                <button 
                  onClick={() => setShowCreateAlbumFromSelection(true)} 
                  disabled={selectedItems.size === 0}
                  className="action-btn !bg-pm-gold !text-pm-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Créer Album ({selectedItems.size})
                </button>
                <button onClick={selectAll} className="action-btn !bg-white/10">
                  Tout sélectionner
                </button>
                <button onClick={deselectAll} className="action-btn !bg-white/10">
                  Tout désélectionner
                </button>
                <button 
                  onClick={deleteSelected} 
                  disabled={selectedItems.size === 0}
                  className="action-btn !bg-red-500/20 !text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Supprimer ({selectedItems.size})
                </button>
                <button onClick={() => { setSelectionMode(false); deselectAll(); }} className="action-btn">
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setSelectionMode(true)} className="action-btn !flex !items-center !gap-2">
                  <CheckIcon className="w-5 h-5" /> Sélection Multiple
                </button>
                <button onClick={() => setShowModal(true)} className="action-btn !flex !items-center !gap-2">
                  <FolderPlusIcon className="w-5 h-5" /> Créer un album
                </button>
              </>
            )}
          </div>
        </div>

        {/* Albums */}
        {albums.length > 0 && (
          <div className="mb-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Albums ({albums.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {albums.map(album => {
                const count = gallery.filter(i => i.albumId === album.id).length;
                return (
                  <div key={album.id} className="group relative bg-white/5 rounded-xl overflow-hidden border border-white/5 hover:border-pm-gold/20 transition-all">
                    {/* Cover */}
                    <div className="aspect-video bg-black/40 overflow-hidden">
                      {album.coverUrl
                        ? <img src={album.coverUrl} alt={album.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center"><PhotoIcon className="w-8 h-8 text-white/10" /></div>}
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <p className="text-sm font-bold text-white truncate">{album.name}</p>
                      {album.description && <p className="text-[11px] text-white/40 mt-0.5 line-clamp-2">{album.description}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-pm-gold/50">{album.category} · {count} média{count !== 1 ? 's' : ''}</span>
                        <div className="flex gap-1">
                          <button onClick={() => setEditAlbum(album)} className="p-1 text-white/20 hover:text-pm-gold transition-colors" aria-label="Modifier">
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteAlbum(album)} className="p-1 text-white/20 hover:text-red-500 transition-colors" aria-label="Supprimer">
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Barre de progression */}
        {uploading.length > 0 && (
          <div className="mb-6 bg-black/40 border border-pm-gold/10 rounded-xl p-4 space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-pm-gold/60 mb-3">
              Upload en cours — {uploading.filter(u => !u.done && !u.error).length} restant{uploading.filter(u => !u.done && !u.error).length > 1 ? 's' : ''}
            </p>
            {uploading.map(u => (
              <div key={u.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${u.done ? 'bg-green-500/20' : u.error ? 'bg-red-500/20' : 'bg-pm-gold/10'}`}>
                  {u.done ? <CheckIcon className="w-3.5 h-3.5 text-green-400" />
                    : u.error ? <XMarkIcon className="w-3.5 h-3.5 text-red-400" />
                    : <span className="text-[8px] font-black text-pm-gold">{u.mediaType === 'video' ? 'V' : 'I'}</span>}
                </div>
                <span className="text-xs text-white/50 truncate flex-1 min-w-0">{u.name}</span>
                {u.error ? <span className="text-xs text-red-400 shrink-0">{u.error}</span>
                  : u.done ? <span className="text-xs text-green-400 shrink-0">Terminé</span>
                  : <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-pm-gold transition-all duration-300" style={{ width: `${u.progress}%` }} />
                    </div>}
                <button onClick={() => setUploading(p => p.filter(x => x.id !== u.id))} className="shrink-0">
                  <XMarkIcon className="w-4 h-4 text-white/20 hover:text-white transition-colors" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/5 mb-8 overflow-x-auto">
          {(['Tout', 'Sans Album', ...CATEGORIES] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`flex-shrink-0 px-5 py-3 text-[10px] font-black uppercase tracking-[0.3em] border-b-2 -mb-px transition-all ${
                activeTab === tab ? 'border-pm-gold text-pm-gold' : 'border-transparent text-white/30 hover:text-white/60'
              }`}>
              {tab}
              <span className="ml-2 text-white/20">
                {tab === 'Tout' 
                  ? gallery.length 
                  : tab === 'Sans Album'
                    ? gallery.filter(i => !i.albumId).length
                    : gallery.filter(i => i.category === tab).length}
              </span>
            </button>
          ))}
        </div>

        {/* Grid médias */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <PhotoIcon className="w-12 h-12 text-white/10 mx-auto" />
            <p className="text-white/20 text-sm">Aucun média dans cette catégorie.</p>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 text-pm-gold/60 hover:text-pm-gold text-xs uppercase tracking-widest font-black transition-colors">
              <PlusIcon className="w-4 h-4" /> Créer un album
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map(item => {
              const album = getAlbum(item);
              const isSelected = selectedItems.has(item.id);
              return (
                <div key={item.id} className="group relative bg-white/5 rounded-sm overflow-hidden">
                  {/* Checkbox en mode sélection */}
                  {selectionMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(item.id)}
                        className="w-5 h-5 rounded border-2 border-pm-gold/50 bg-black/60 checked:bg-pm-gold checked:border-pm-gold cursor-pointer"
                      />
                    </div>
                  )}
                  <div 
                    className={`aspect-square cursor-pointer ${isSelected ? 'ring-2 ring-pm-gold' : ''}`}
                    onClick={() => selectionMode ? toggleSelection(item.id) : setLightbox(item)}
                  >
                    {item.mediaType === 'video' ? (
                      <div className="w-full h-full relative bg-black/40">
                        {item.thumbnailUrl
                          ? <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><PlayIcon className="w-8 h-8 text-white/30" /></div>}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-9 h-9 rounded-full bg-pm-gold/80 flex items-center justify-center">
                            <PlayIcon className="w-4 h-4 text-pm-dark ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img src={item.url} alt={item.caption ?? ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <div className="p-2 space-y-1">
                    <input
                      type="text"
                      placeholder="Légende..."
                      value={captionMap[item.id] ?? item.caption ?? ''}
                      onChange={e => setCaptionMap(p => ({ ...p, [item.id]: e.target.value }))}
                      onBlur={() => handleSaveCaption(item)}
                      className="w-full bg-transparent text-xs text-white/50 placeholder-white/20 border-b border-white/10 focus:border-pm-gold/50 outline-none py-1"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[8px] font-black uppercase tracking-widest text-pm-gold/40 truncate">
                        {album ? album.name : item.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {!item.albumId && (
                          <button 
                            onClick={() => setAssignItem(item)} 
                            className="text-pm-gold/40 hover:text-pm-gold transition-colors" 
                            aria-label="Assigner à un album"
                            title="Assigner à un album"
                          >
                            <FolderPlusIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(item.id)} className="text-red-500/40 hover:text-red-500 transition-colors" aria-label="Supprimer">
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modale création */}
      {showModal && (
        <AlbumModal onClose={() => setShowModal(false)} onSave={handleAlbumSave} />
      )}

      {/* Modale création depuis sélection */}
      {showCreateAlbumFromSelection && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateAlbumFromSelection(false)}>
          <div className="bg-[#0d0d0d] border border-pm-gold/20 rounded-2xl w-full max-w-2xl shadow-2xl shadow-black/60" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-pm-gold/10 flex items-center justify-center">
                  <FolderPlusIcon className="w-5 h-5 text-pm-gold" />
                </div>
                <div>
                  <h2 className="text-base font-playfair font-black text-white">Créer un Album</h2>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">{selectedItems.size} média(s) sélectionné(s)</p>
                </div>
              </div>
              <button onClick={() => setShowCreateAlbumFromSelection(false)} className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors rounded-full hover:bg-white/5">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createAlbumFromSelection(
                formData.get('name') as string,
                formData.get('description') as string,
                formData.get('category') as GalleryCategory
              );
            }} className="p-6 space-y-5">
              <div>
                <label className="admin-label">Nom de l'album *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="admin-input"
                  placeholder="Ex: Fashion Day 2024"
                />
              </div>
              <div>
                <label className="admin-label">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="admin-input"
                  placeholder="Description de l'album..."
                />
              </div>
              <div>
                <label className="admin-label">Catégorie *</label>
                <select name="category" required className="admin-input">
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="action-btn !bg-pm-gold !text-pm-dark flex-1">
                  Créer l'Album
                </button>
                <button type="button" onClick={() => setShowCreateAlbumFromSelection(false)} className="action-btn flex-1">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale édition */}
      {editAlbum && (
        <AlbumModal
          initial={editAlbum}
          onClose={() => setEditAlbum(null)}
          onSave={(name, description, category) => handleAlbumEdit(name, description, category)}
        />
      )}

      {/* Modale assignation à un album */}
      {assignItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setAssignItem(null)}>
          <div className="bg-[#0d0d0d] border border-pm-gold/20 rounded-2xl w-full max-w-md shadow-2xl shadow-black/60" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-pm-gold/10 flex items-center justify-center">
                  <FolderPlusIcon className="w-5 h-5 text-pm-gold" />
                </div>
                <div>
                  <h2 className="text-base font-playfair font-black text-white">Assigner à un album</h2>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">Choisir un album</p>
                </div>
              </div>
              <button onClick={() => setAssignItem(null)} className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors rounded-full hover:bg-white/5">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2">
              {albums.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-8">Aucun album disponible. Créez-en un d'abord.</p>
              ) : (
                albums.map(album => (
                  <button
                    key={album.id}
                    onClick={() => handleAssignToAlbum(assignItem.id, album.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-pm-gold/10 border border-white/5 hover:border-pm-gold/30 transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/40 flex-shrink-0">
                      {album.coverUrl ? (
                        <img src={album.coverUrl} alt={album.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PhotoIcon className="w-5 h-5 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white group-hover:text-pm-gold transition-colors truncate">{album.name}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest">{album.category}</p>
                    </div>
                    <ArrowUpTrayIcon className="w-4 h-4 text-pm-gold/40 group-hover:text-pm-gold transition-colors flex-shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modale édition */}
      {editAlbum && (
        <AlbumModal
          initial={editAlbum}
          onClose={() => setEditAlbum(null)}
          onSave={(name, description, category) => handleAlbumEdit(name, description, category)}
        />
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white" onClick={() => setLightbox(null)}>
            <XMarkIcon className="w-8 h-8" />
          </button>
          <div onClick={e => e.stopPropagation()} className="max-w-4xl w-full">
            {lightbox.mediaType === 'video'
              ? <video src={lightbox.url} controls autoPlay className="w-full max-h-[85vh] rounded-sm" />
              : <img src={lightbox.url} alt={lightbox.caption ?? ''} className="w-full max-h-[85vh] object-contain rounded-sm" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
