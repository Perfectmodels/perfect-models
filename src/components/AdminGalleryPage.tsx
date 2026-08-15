'use client';

import { FormEvent, useMemo, useState } from 'react';
import Image from 'next/image';
import { Edit3, ImagePlus, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataStore, type GalleryAlbum } from '@/hooks/useDataStore';

const categories: GalleryAlbum['category'][] = ['Collaborations', 'Shooting', 'Défilés', 'Événements', 'Backstage', 'Autres'];
const emptyForm = { title: '', slug: '', category: 'Collaborations' as GalleryAlbum['category'], description: '', date: '', location: '', coverImage: '', images: [] as string[], featured: false, published: true };
function slugify(value: string) { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export default function AdminGalleryPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, saveGalleryAlbums, isInitialized } = useDataStore();
  const [form, setForm] = useState(emptyForm); const [editingId, setEditingId] = useState<string | null>(null); const [uploading, setUploading] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const albums = useMemo(() => [...(data?.galleryAlbums || [])].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))), [data?.galleryAlbums]);
  const reset = () => { setForm(emptyForm); setEditingId(null); setError(''); };

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return; setUploading(true); setError('');
    try { const uploaded: string[] = []; for (const file of Array.from(files)) { const body = new FormData(); body.append('file', file); body.append('scope', 'gallery'); const response = await fetch('/api/media/upload', { method: 'POST', body, credentials: 'include' }); const json = await response.json().catch(() => ({})); if (!response.ok) throw new Error(json.error || `Upload impossible pour ${file.name}`); uploaded.push(String(json.url)); } setForm((current) => ({ ...current, images: [...current.images, ...uploaded], coverImage: current.coverImage || uploaded[0] || '' })); }
    catch (e: any) { setError(e?.message || 'Erreur pendant l’upload.'); } finally { setUploading(false); }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (!form.title.trim()) return setError('Le titre est obligatoire.'); if (!form.images.length) return setError('Ajoutez au moins une image à l’album.'); setSaving(true); setError('');
    try { const now = new Date().toISOString(); const previous = data?.galleryAlbums || []; const existing = editingId ? previous.find((item) => item.id === editingId) : undefined; const album: GalleryAlbum = { id: editingId || `gallery-${Date.now()}`, title: form.title.trim(), slug: form.slug.trim() || slugify(form.title), category: form.category, description: form.description.trim() || undefined, date: form.date || undefined, location: form.location.trim() || undefined, coverImage: form.coverImage || form.images[0], images: form.images, featured: form.featured, published: form.published, participants: existing?.participants || [], createdAt: existing?.createdAt || now, updatedAt: now }; await saveGalleryAlbums(editingId ? previous.map((item) => item.id === editingId ? album : item) : [album, ...previous]); reset(); }
    catch (e: any) { setError(e?.message || 'Impossible d’enregistrer l’album.'); } finally { setSaving(false); }
  };
  const startEdit = (album: GalleryAlbum) => { setForm({ title: album.title, slug: album.slug, category: album.category, description: album.description || '', date: album.date || '', location: album.location || '', coverImage: album.coverImage, images: album.images || [], featured: Boolean(album.featured), published: album.published !== false }); setEditingId(album.id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async (id: string) => { if (!window.confirm('Supprimer définitivement cet album de la galerie ?')) return; await saveGalleryAlbums((data?.galleryAlbums || []).filter((album) => album.id !== id)); if (editingId === id) reset(); };
  const removeImage = (url: string) => setForm((current) => ({ ...current, images: current.images.filter((image) => image !== url), coverImage: current.coverImage === url ? (current.images.find((image) => image !== url) || '') : current.coverImage }));

  if (authLoading) return <div className="p-10 text-white/50">Vérification des droits administrateur…</div>;
  if (!user || user.role !== 'admin') return <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center text-red-200">Accès administrateur requis.</div>;

  return <div className="space-y-8">
    <div><p className="text-xs font-semibold uppercase tracking-[.25em] text-[#D4AF37]">Contenu public</p><h1 className="mt-2 text-3xl font-semibold text-white">Galerie de l&apos;agence</h1><p className="mt-2 max-w-2xl text-sm text-white/50">Créez des albums pour les collaborations, shootings, défilés, événements et backstage. Chaque modification est enregistrée dans Firebase Realtime Database.</p></div>
    <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[.03] p-6">
      <div className="mb-6 flex items-center justify-between gap-4"><h2 className="text-xl font-semibold text-white">{editingId ? 'Modifier l’album' : 'Nouvel album'}</h2>{editingId && <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/60"><X size={16}/>Annuler</button>}</div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-white/60">Titre<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]" /></label>
        <label className="text-sm text-white/60">Catégorie<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as GalleryAlbum['category'] })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]">{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="text-sm text-white/60">Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" /></label>
        <label className="text-sm text-white/60">Lieu<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Libreville, Gabon" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" /></label>
        <label className="text-sm text-white/60 md:col-span-2">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none" /></label>
      </div>
      <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-black/20 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="font-medium text-white">Photos de l&apos;album</h3><p className="mt-1 text-xs text-white/40">JPG, PNG, WebP, GIF ou AVIF — 4,5 Mo maximum par image.</p></div><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black"><ImagePlus size={17}/>{uploading ? 'Upload…' : 'Ajouter des photos'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple className="hidden" onChange={(e) => uploadImages(e.target.files)} disabled={uploading}/></label></div>
        {form.images.length > 0 && <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{form.images.map((url, index) => <div key={`${url}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl bg-black"><Image src={url} alt="Photo de l’album" fill className="object-cover" unoptimized/><button type="button" onClick={() => removeImage(url)} className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition group-hover:opacity-100" aria-label="Retirer"><Trash2 size={14}/></button>{form.coverImage === url && <span className="absolute inset-x-2 bottom-2 rounded-lg bg-[#D4AF37] px-2 py-1 text-center text-[10px] font-bold uppercase text-black">Couverture</span>}<button type="button" onClick={() => setForm({ ...form, coverImage: url })} className="absolute inset-x-2 top-2 rounded-lg bg-black/70 px-2 py-1 text-[10px] uppercase text-white opacity-0 transition group-hover:opacity-100">Définir couverture</button></div>)}</div>}
      </div>
      <div className="mt-5 flex flex-wrap gap-5 text-sm text-white/65"><label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}/>Mettre en avant</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })}/>Publier immédiatement</label></div>
      {error && <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      <button disabled={saving || uploading || !isInitialized} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={17}/> : <Save size={17}/>} {saving ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : 'Créer l’album'}</button>
    </form>
    <section className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-white">Albums ({albums.length})</h2><span className="text-xs text-white/35">Synchronisés en temps réel</span></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{albums.map((album) => <article key={album.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.03]"><div className="relative aspect-video bg-black">{album.coverImage && <Image src={album.coverImage} alt={album.title} fill className="object-cover" unoptimized/>}<span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] uppercase tracking-wider text-white">{album.category}</span></div><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-white">{album.title}</h3><p className="mt-1 text-xs text-white/40">{album.images.length} photos · {album.published === false ? 'Brouillon' : 'Publié'}</p></div><div className="flex gap-1"><button onClick={() => startEdit(album)} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Modifier"><Edit3 size={16}/></button><button onClick={() => remove(album.id)} className="rounded-lg p-2 text-white/50 hover:bg-red-500/10 hover:text-red-300" aria-label="Supprimer"><Trash2 size={16}/></button></div></div></div></article>)}</div>{albums.length === 0 && <div className="rounded-2xl border border-white/10 p-10 text-center text-white/40"><Plus className="mx-auto mb-3"/>Aucun album. Créez le premier ci-dessus.</div>}</section>
  </div>;
}
