import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { Article, ArticleContent } from '../types';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import {
  ChevronLeftIcon, TrashIcon, PencilIcon, PlusIcon, StarIcon,
  SparklesIcon, XMarkIcon, PhotoIcon,
} from '@heroicons/react/24/outline';
import ImageUploader from '../components/ImageUploader';
import ArticleGenerator from '../components/ArticleGenerator';
import AIAssistant from '../components/AIAssistant';
import ArticlePreview from '../components/ArticlePreview';
import { uploadToImgbb } from '../utils/imgbbService';

// ── Helpers ──────────────────────────────────────────────────────────────────

const newArticle = (): Article => ({
  slug: '',
  title: '',
  category: 'Interview',
  excerpt: '',
  imageUrl: '',
  author: 'Focus Model 241',
  date: new Date().toISOString().split('T')[0],
  content: [{ type: 'paragraph', text: '' }],
  status: 'draft',
  tags: [],
  brands: [],
  photographer: '',
});

const CATEGORIES = ['Interview', 'Événement', 'Tendance', 'Conseils', 'Portrait'];

// ── Block Editor ─────────────────────────────────────────────────────────────

type BlockType = ArticleContent['type'];

interface BlockEditorProps {
  blocks: ArticleContent[];
  onChange: (blocks: ArticleContent[]) => void;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onChange }) => {
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingImageIdx, setPendingImageIdx] = useState<number | null>(null);

  const update = (idx: number, patch: Partial<ArticleContent>) =>
    onChange(blocks.map((b, i) => i === idx ? { ...b, ...patch } as ArticleContent : b));

  const addBlock = (type: BlockType, afterIdx: number) => {
    const blank: Record<BlockType, ArticleContent> = {
      paragraph: { type: 'paragraph', text: '' },
      heading: { type: 'heading', level: 2, text: '' },
      quote: { type: 'quote', text: '', author: '' },
      image: { type: 'image', src: '', alt: '', caption: '' },
      youtube: { type: 'youtube', url: '', caption: '' },
    };
    const next = [...blocks];
    next.splice(afterIdx + 1, 0, blank[type]);
    onChange(next);
  };

  const remove = (idx: number) => onChange(blocks.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...blocks];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const handleImageUpload = async (file: File, idx: number) => {
    setUploading(`Envoi de ${file.name}…`);
    try {
      const url = await uploadToImgbb(file, '');
      update(idx, { src: url, alt: file.name } as any);
    } catch { alert('Erreur upload image'); }
    setUploading(null);
  };

  return (
    <div className="space-y-3">
      {uploading && (
        <div className="text-xs text-pm-gold/70 bg-pm-gold/5 border border-pm-gold/20 rounded-lg px-4 py-2">{uploading}</div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => { if (e.target.files?.[0] && pendingImageIdx !== null) handleImageUpload(e.target.files[0], pendingImageIdx); }} />

      {blocks.map((block, idx) => (
        <div key={idx} className="group relative bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:border-pm-gold/20 transition-all">
          {/* Controls */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => move(idx, -1)} className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-white text-xs">↑</button>
            <button onClick={() => move(idx, 1)} className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-white text-xs">↓</button>
            <button onClick={() => remove(idx)} className="w-6 h-6 flex items-center justify-center text-red-500/50 hover:text-red-500"><XMarkIcon className="w-3.5 h-3.5" /></button>
          </div>

          {/* Block type label */}
          <span className="text-[9px] font-black uppercase tracking-widest text-pm-gold/30 mb-2 block">{block.type}</span>

          {/* Paragraph */}
          {block.type === 'paragraph' && (
            <textarea value={block.text} rows={3}
              onChange={e => update(idx, { text: e.target.value })}
              placeholder="Écrivez votre paragraphe…"
              className="w-full bg-transparent text-sm text-pm-off-white/80 placeholder-white/20 outline-none resize-none" />
          )}

          {/* Heading */}
          {block.type === 'heading' && (
            <div className="space-y-2">
              <select value={block.level} onChange={e => update(idx, { level: Number(e.target.value) as 2 | 3 })}
                className="bg-white/5 border border-white/10 text-xs text-white/60 rounded px-2 py-1 outline-none">
                <option value={2}>H2 — Titre principal</option>
                <option value={3}>H3 — Sous-titre</option>
              </select>
              <input value={block.text} onChange={e => update(idx, { text: e.target.value })}
                placeholder="Titre de section…"
                className={`w-full bg-transparent outline-none text-white placeholder-white/20 ${block.level === 2 ? 'text-xl font-bold' : 'text-lg font-semibold'}`} />
            </div>
          )}

          {/* Quote */}
          {block.type === 'quote' && (
            <div className="space-y-2 border-l-4 border-pm-gold/40 pl-4">
              <textarea value={block.text} rows={2} onChange={e => update(idx, { text: e.target.value })}
                placeholder="Citation…"
                className="w-full bg-transparent text-sm italic text-pm-off-white/70 placeholder-white/20 outline-none resize-none" />
              <input value={block.author ?? ''} onChange={e => update(idx, { author: e.target.value })}
                placeholder="Auteur de la citation (optionnel)"
                className="w-full bg-transparent text-xs text-pm-gold/50 placeholder-white/20 outline-none" />
            </div>
          )}

          {/* Image */}
          {block.type === 'image' && (
            <div className="space-y-2">
              {block.src ? (
                <div className="relative">
                  <img src={block.src} alt={block.alt} className="w-full max-h-48 object-cover rounded-lg" />
                  <button onClick={() => update(idx, { src: '' } as any)}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500/80">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setPendingImageIdx(idx); fileRef.current?.click(); }}
                  className="w-full h-24 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-pm-gold/40 transition-colors">
                  <PhotoIcon className="w-6 h-6 text-white/20" />
                   <span className="text-xs text-white/30">Ajouter une photo</span>
                </button>
              )}
              <input value={block.alt} onChange={e => update(idx, { alt: e.target.value })}
                placeholder="Texte alternatif (alt)" className="w-full bg-transparent text-xs text-white/50 placeholder-white/20 outline-none border-b border-white/10 pb-1" />
              <input value={block.caption ?? ''} onChange={e => update(idx, { caption: e.target.value })}
                placeholder="Légende (optionnel)" className="w-full bg-transparent text-xs text-white/50 placeholder-white/20 outline-none" />
            </div>
          )}

          {/* YouTube */}
          {block.type === 'youtube' && (
            <div className="space-y-2">
              <input value={block.url} onChange={e => update(idx, { url: e.target.value })}
                placeholder="URL YouTube (ex: https://youtu.be/xxxxx)"
                className="w-full bg-transparent text-sm text-pm-off-white/70 placeholder-white/20 outline-none border-b border-white/10 pb-1" />
              <input value={block.caption ?? ''} onChange={e => update(idx, { caption: e.target.value })}
                placeholder="Légende (optionnel)" className="w-full bg-transparent text-xs text-white/50 placeholder-white/20 outline-none" />
            </div>
          )}

          {/* Add block after */}
          <div className="flex gap-1 mt-3 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
            <span className="text-[9px] text-white/20 uppercase tracking-widest self-center mr-1">Ajouter ↓</span>
            {([
              ['paragraph', 'Texte', '¶'],
              ['heading', 'Titre', 'H'],
              ['quote', 'Citation', '"'],
              ['image', 'Image', '🖼'],
              ['youtube', 'YouTube', '▶'],
            ] as [BlockType, string, string][]).map(([type, label, icon]) => (
              <button key={type} onClick={() => addBlock(type, idx)}
                className="px-2 py-1 text-[10px] font-bold bg-white/5 hover:bg-pm-gold/10 border border-white/10 hover:border-pm-gold/30 text-white/40 hover:text-pm-gold rounded transition-all">
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Add first block if empty */}
      {blocks.length === 0 && (
        <button onClick={() => addBlock('paragraph', -1)}
          className="w-full py-8 border-2 border-dashed border-white/10 rounded-xl text-white/30 hover:border-pm-gold/30 hover:text-pm-gold/60 transition-all text-sm">
          + Ajouter un bloc
        </button>
      )}
    </div>
  );
};

// ── Article Form ─────────────────────────────────────────────────────────────

interface ArticleFormProps {
  article: Article;
  onSave: (article: Article) => void;
  onCancel: () => void;
  isCreating: boolean;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ article, onSave, onCancel, isCreating }) => {
  const [formData, setFormData] = useState<Article>(article);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [activeAIField, setActiveAIField] = useState<{ fieldName: string; prompt: string; schema?: any } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data, saveData } = useData();

  // Auto-save every 30s as draft
  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(async () => {
      if (!data || !formData.title) return;
      setAutoSaveStatus('saving');
      const draft = { ...formData, status: 'draft' as const };
      if (!draft.slug) draft.slug = draft.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '-' + Date.now();
      const existing = data.articles ?? [];
      const updated = isCreating
        ? existing.some(a => a.slug === draft.slug) ? existing.map(a => a.slug === draft.slug ? draft : a) : [draft, ...existing]
        : existing.map(a => a.slug === draft.slug ? draft : a);
      await saveData({ ...data, articles: updated });
      setFormData(draft);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 30000);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [formData]);

  const set = (patch: Partial<Article>) => setFormData(prev => ({ ...prev, ...patch }));

  const handlePublish = () => {
    const toSave = { ...formData, status: 'published' as const };
    if (!toSave.slug) toSave.slug = toSave.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '-' + Date.now();
    onSave(toSave);
  };

  const handleSaveDraft = () => {
    const toSave = { ...formData, status: 'draft' as const };
    if (!toSave.slug) toSave.slug = toSave.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '-' + Date.now();
    onSave(toSave);
  };

  const openAI = (fieldName: string, prompt: string, schema?: any) => {
    setActiveAIField({ fieldName, prompt, schema });
    setIsAIOpen(true);
  };

  const handleAIInsert = (content: string) => {
    if (!activeAIField) return;
    if (activeAIField.fieldName === 'content') {
      try { set({ content: JSON.parse(content) }); } catch { set({ content: [{ type: 'paragraph', text: content }] }); }
    } else if (activeAIField.fieldName === 'tags') {
      set({ tags: content.split(',').map(t => t.trim()) });
    } else {
      set({ [activeAIField.fieldName]: content });
    }
  };

  const tagInput = (val: string) => set({ tags: val.split(',').map(t => t.trim()).filter(Boolean) });
  const brandInput = (val: string) => set({ brands: val.split(',').map(t => t.trim()).filter(Boolean) });

  return (
    <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onCancel} className="inline-flex items-center gap-2 text-pm-gold hover:underline">
            <ChevronLeftIcon className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2">
            {autoSaveStatus === 'saving' && <span className="text-xs text-white/30">Sauvegarde…</span>}
            {autoSaveStatus === 'saved' && <span className="text-xs text-pm-gold/60">✓ Brouillon sauvegardé</span>}
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${formData.status === 'published' ? 'border-green-500/40 text-green-400 bg-green-500/10' : 'border-white/10 text-white/30'}`}>
              {formData.status === 'published' ? 'Publié' : 'Brouillon'}
            </span>
          </div>
        </div>

        <h1 className="admin-page-title mb-8">{isCreating ? 'Nouvel Article' : 'Modifier l\'Article'}</h1>

        <div className="space-y-6">
          {/* Métadonnées principales */}
          <div className="admin-section-wrapper space-y-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-pm-gold/40">Métadonnées</p>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="admin-label !mb-0">Titre *</label>
                <AIBtn onClick={() => openAI('title', 'Génère 5 titres accrocheurs pour un article de mode.')} />
              </div>
              <input value={formData.title} onChange={e => set({ title: e.target.value })} placeholder="Titre de l'article" className="admin-input" />
            </div>

            <ImageUploader label="Image de couverture" value={formData.imageUrl} onChange={v => set({ imageUrl: v })} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Catégorie</label>
                <select value={formData.category} onChange={e => set({ category: e.target.value })} className="admin-input">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="admin-label">Date</label>
                <input type="date" value={formData.date} onChange={e => set({ date: e.target.value })} className="admin-input" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Auteur</label>
                <input value={formData.author} onChange={e => set({ author: e.target.value })} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Photographe / Crédits</label>
                <input value={formData.photographer ?? ''} onChange={e => set({ photographer: e.target.value })} placeholder="Nom du photographe" className="admin-input" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="admin-label !mb-0">Extrait</label>
                <AIBtn onClick={() => openAI('excerpt', `Rédige un résumé de 2 phrases pour un article intitulé "${formData.title}".`)} />
              </div>
              <textarea value={formData.excerpt} onChange={e => set({ excerpt: e.target.value })} rows={3} placeholder="Résumé de l'article…" className="admin-input admin-textarea" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="admin-label !mb-0">Tags (virgule)</label>
                  <AIBtn onClick={() => openAI('tags', `Génère 5 tags SEO pour un article sur "${formData.title}". Sépare par des virgules.`)} />
                </div>
                <input value={(formData.tags ?? []).join(', ')} onChange={e => tagInput(e.target.value)} placeholder="mode, défilé, Libreville…" className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Marques citées (virgule)</label>
                <input value={(formData.brands ?? []).join(', ')} onChange={e => brandInput(e.target.value)} placeholder="Dior, Balenciaga…" className="admin-input" />
              </div>
            </div>
          </div>

          {/* Éditeur de blocs */}
          <div className="admin-section-wrapper space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-pm-gold/40">Contenu — Éditeur par blocs</p>
              <AIBtn onClick={() => openAI('content', `Rédige un article complet sur "${formData.title}" en JSON avec des blocs paragraph, heading, quote.`, { type: 'array' })} label="Générer avec IA" />
            </div>
            <BlockEditor blocks={formData.content} onChange={blocks => set({ content: blocks })} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pb-8">
            <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-white/20 text-white/60 text-xs font-black uppercase tracking-widest rounded-full hover:border-white/40 transition-all">
              Annuler
            </button>
            <button type="button" onClick={() => setIsPreviewOpen(true)} className="px-5 py-2.5 border border-pm-gold text-pm-gold text-xs font-black uppercase tracking-widest rounded-full hover:bg-pm-gold hover:text-pm-dark transition-all">
              Prévisualiser
            </button>
            <button type="button" onClick={handleSaveDraft} className="px-5 py-2.5 border border-white/20 text-white/60 text-xs font-black uppercase tracking-widest rounded-full hover:border-white/40 transition-all">
              Brouillon
            </button>
            <button type="button" onClick={handlePublish} className="px-6 py-2.5 bg-pm-gold text-pm-dark text-xs font-black uppercase tracking-widest rounded-full hover:bg-white transition-all">
              Publier
            </button>
          </div>
        </div>
      </div>

      {activeAIField && (
        <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} onInsertContent={handleAIInsert}
          fieldName={activeAIField.fieldName} initialPrompt={activeAIField.prompt} jsonSchema={activeAIField.schema} />
      )}

      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsPreviewOpen(false)}>
          <div className="bg-pm-dark border border-pm-gold/30 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <header className="p-4 flex justify-between items-center border-b border-pm-gold/20 shrink-0">
              <h2 className="text-lg font-playfair text-pm-gold">Prévisualisation</h2>
              <button onClick={() => setIsPreviewOpen(false)}><XMarkIcon className="w-6 h-6 text-white/50 hover:text-white" /></button>
            </header>
            <main className="overflow-y-auto flex-grow p-6"><ArticlePreview article={formData} /></main>
          </div>
        </div>
      )}
    </div>
  );
};

const AIBtn: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label = 'IA' }) => (
  <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-xs text-pm-gold/70 hover:text-pm-gold">
    <SparklesIcon className="w-3.5 h-3.5" /> {label}
  </button>
);

// ── Page principale ───────────────────────────────────────────────────────────

const AdminMagazine: React.FC = () => {
  const { data, saveData, isInitialized } = useData();
  const [localArticles, setLocalArticles] = useState<Article[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    if (data?.articles) {
      setLocalArticles([...data.articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  }, [data?.articles, isInitialized]);

  const handleFormSave = async (articleToSave: Article) => {
    if (!data) return;
    const existing = data.articles ?? [];
    const updatedArticles = isCreating
      ? existing.some(a => a.slug === articleToSave.slug)
        ? existing.map(a => a.slug === articleToSave.slug ? articleToSave : a)
        : [articleToSave, ...existing]
      : existing.map(a => a.slug === articleToSave.slug ? articleToSave : a);
    await saveData({ ...data, articles: updatedArticles });
    setEditingArticle(null);
    setIsCreating(false);
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm('Supprimer cet article ?') || !data) return;
    await saveData({ ...data, articles: (data.articles ?? []).filter(a => a.slug !== slug) });
  };

  const handleSetFeatured = async (slug: string) => {
    if (!data) return;
    await saveData({ ...data, articles: (data.articles ?? []).map(a => ({ ...a, isFeatured: a.slug === slug })) });
  };

  const handleToggleStatus = async (article: Article) => {
    if (!data) return;
    const updated = { ...article, status: article.status === 'published' ? 'draft' as const : 'published' as const };
    await saveData({ ...data, articles: (data.articles ?? []).map(a => a.slug === article.slug ? updated : a) });
  };

  const handleArticleGenerated = (generatedData: Partial<Article>) => {
    setIsCreating(true);
    setEditingArticle({ ...newArticle(), ...generatedData });
    setIsGeneratorOpen(false);
  };

  if (editingArticle) {
    return <ArticleForm article={editingArticle} onSave={handleFormSave} onCancel={() => { setEditingArticle(null); setIsCreating(false); }} isCreating={isCreating} />;
  }

  const visible = localArticles.filter(a =>
    filter === 'all' ? true : filter === 'published' ? a.status === 'published' : a.status !== 'published'
  );

  return (
    <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
      <SEO title="Admin - Magazine" noIndex />
      <div className="container mx-auto px-6">
        <div className="admin-page-header">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold mb-4 hover:underline">
              <ChevronLeftIcon className="w-5 h-5" /> Retour au Tableau de Bord
            </Link>
            <h1 className="admin-page-title">Gérer le Magazine</h1>
            <p className="admin-page-subtitle">CMS headless — articles Focus Model 241.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsGeneratorOpen(true)} className="action-btn-outline !flex !items-center !gap-2">
              <SparklesIcon className="w-5 h-5" /> Générer avec IA
            </button>
            <button onClick={() => { setIsCreating(true); setEditingArticle(newArticle()); }} className="action-btn !flex !items-center !gap-2">
              <PlusIcon className="w-5 h-5" /> Nouvel Article
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-1 mb-6 border-b border-white/5 pb-1">
          {(['all', 'published', 'draft'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 -mb-px transition-all ${filter === f ? 'border-pm-gold text-pm-gold' : 'border-transparent text-white/30 hover:text-white/60'}`}>
              {f === 'all' ? `Tous (${localArticles.length})` : f === 'published' ? `Publiés (${localArticles.filter(a => a.status === 'published').length})` : `Brouillons (${localArticles.filter(a => a.status !== 'published').length})`}
            </button>
          ))}
        </div>

        <div className="admin-section-wrapper">
          {visible.length === 0 && (
            <p className="text-center py-12 text-white/20 text-sm">Aucun article.</p>
          )}
          {visible.map(article => (
            <div key={article.slug} className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4 min-w-0">
                {article.isFeatured && <StarIcon className="w-4 h-4 text-pm-gold shrink-0" />}
                <img src={article.imageUrl} alt={article.title} className="w-20 h-14 object-cover rounded hidden sm:block shrink-0" />
                <div className="min-w-0">
                  <h2 className="font-bold truncate">{article.title}</h2>
                  <p className="text-xs text-pm-off-white/50">{article.category} · {new Date(article.date).toLocaleDateString()}</p>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${article.status === 'published' ? 'text-green-400' : 'text-white/30'}`}>
                    {article.status === 'published' ? '● Publié' : '○ Brouillon'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!article.isFeatured && (
                  <button onClick={() => handleSetFeatured(article.slug)} className="p-2 text-pm-gold/40 hover:text-pm-gold" title="Mettre à la une">
                    <StarIcon className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => handleToggleStatus(article)} className={`p-2 text-xs font-bold ${article.status === 'published' ? 'text-green-400/60 hover:text-green-400' : 'text-white/30 hover:text-white'}`} title={article.status === 'published' ? 'Dépublier' : 'Publier'}>
                  {article.status === 'published' ? '↓' : '↑'}
                </button>
                <button onClick={() => { setEditingArticle(article); setIsCreating(false); }} className="p-2 text-pm-gold/60 hover:text-pm-gold">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(article.slug)} className="p-2 text-red-500/50 hover:text-red-500">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ArticleGenerator isOpen={isGeneratorOpen} onClose={() => setIsGeneratorOpen(false)} onArticleGenerated={handleArticleGenerated} />
    </div>
  );
};

export default AdminMagazine;
