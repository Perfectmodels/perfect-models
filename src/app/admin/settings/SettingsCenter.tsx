'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { AppData } from '@/hooks/useRealtimeDB';
import SEO from '@/components/SEO';
import { CheckIcon, ChevronRightIcon, MagnifyingGlassIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

type EditableData = Pick<AppData, 'contactInfo' | 'siteConfig' | 'siteImages' | 'socialLinks' | 'agencyPartners' | 'testimonials' | 'faqData'>;
type Section = 'general' | 'branding' | 'contact' | 'social' | 'content' | 'integrations' | 'security';

const sections: Array<{ id: Section; label: string; description: string }> = [
  { id: 'general', label: 'Général', description: 'Identité, langue et informations principales' },
  { id: 'branding', label: 'Identité visuelle', description: 'Logo, images et présence de marque' },
  { id: 'contact', label: 'Contact', description: 'Coordonnées affichées publiquement' },
  { id: 'social', label: 'Réseaux sociaux', description: 'Liens officiels de Perfect Models' },
  { id: 'content', label: 'Contenus', description: 'Partenaires, témoignages et FAQ' },
  { id: 'integrations', label: 'Intégrations', description: 'État des services gérés côté serveur' },
  { id: 'security', label: 'Sécurité', description: 'Bonnes pratiques et protection des accès' },
];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export default function SettingsCenter() {
  const { data, saveData, isInitialized } = useData();
  const [draft, setDraft] = useState<EditableData | null>(null);
  const [active, setActive] = useState<Section>('general');
  const [query, setQuery] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isInitialized && data) {
      const { contactInfo, siteConfig, siteImages, socialLinks, agencyPartners, testimonials, faqData } = data;
      setDraft(clone({ contactInfo, siteConfig, siteImages, socialLinks, agencyPartners, testimonials, faqData }));
      setDirty(false);
    }
  }, [isInitialized, data]);

  const update = (section: keyof EditableData, key: string, value: unknown) => {
    setDraft(prev => prev ? ({ ...prev, [section]: { ...(prev[section] as object), [key]: value } }) : prev);
    setDirty(true); setSaved(false);
  };

  const save = () => {
    if (!data || !draft) return;
    const payload = clone(draft);
    payload.agencyPartners = (payload.agencyPartners || []).filter(Boolean);
    payload.testimonials = (payload.testimonials || []).filter(Boolean);
    payload.faqData = (payload.faqData || []).filter(Boolean).map((c: any) => ({ ...c, items: (c.items || []).filter(Boolean) }));
    saveData({ ...data, ...payload });
    setDirty(false); setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter(s => `${s.label} ${s.description}`.toLowerCase().includes(q));
  }, [query]);

  if (!draft || !data) return <div className="min-h-[60vh] grid place-items-center text-white/50">Chargement de la configuration…</div>;

  return (
    <>
      <SEO title="Paramètres — Perfect Models Management" noIndex />
      <div className="space-y-8 pb-20">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-pm-gold">Centre de configuration</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-playfair font-black text-white">Paramètres</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/45">Une configuration centralisée pour piloter l’identité, les contenus et les intégrations du site sans parcourir plusieurs modules.</p>
          </div>
          <button onClick={save} disabled={!dirty} className="btn-premium !py-3 !px-8 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2">
            {saved ? <CheckIcon className="w-4 h-4" /> : null}{saved ? 'Enregistré' : dirty ? 'Enregistrer les changements' : 'Configuration à jour'}
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6">
          <aside className="glass-card p-3 h-fit xl:sticky xl:top-6">
            <div className="relative mb-3">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher un paramètre…" className="admin-input !pl-10" />
            </div>
            <nav className="space-y-1">
              {filteredSections.map(section => (
                <button key={section.id} onClick={() => setActive(section.id)} className={`w-full text-left rounded-xl px-4 py-3 transition ${active === section.id ? 'bg-pm-gold/10 text-pm-gold' : 'text-white/55 hover:bg-white/[.03] hover:text-white'}`}>
                  <div className="flex items-center justify-between"><span className="text-xs font-bold">{section.label}</span><ChevronRightIcon className="w-4 h-4 opacity-40" /></div>
                  <span className="block mt-1 text-[10px] text-white/25 leading-4">{section.description}</span>
                </button>
              ))}
            </nav>
            <div className="mt-4 rounded-xl border border-white/5 bg-black/15 p-4">
              <div className="flex items-center gap-2 text-pm-gold"><ShieldCheckIcon className="w-4 h-4" /><span className="text-[9px] font-black uppercase tracking-widest">Mode administrateur</span></div>
              <p className="mt-2 text-[10px] leading-4 text-white/25">Les modifications restent en brouillon jusqu’à l’action Enregistrer.</p>
            </div>
          </aside>

          <main className="min-w-0">
            {active === 'general' && <General draft={draft} update={update} />}
            {active === 'branding' && <Branding draft={draft} update={update} />}
            {active === 'contact' && <Contact draft={draft} update={update} />}
            {active === 'social' && <Social draft={draft} update={update} />}
            {active === 'content' && <Content draft={draft} setDraft={setDraft} markDirty={() => { setDirty(true); setSaved(false); }} />}
            {active === 'integrations' && <Integrations />}
            {active === 'security' && <Security />}
          </main>
        </div>
      </div>
    </>
  );
}

function Panel({ title, description, children, icon }: { title: string; description?: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return <section className="glass-card p-6 md:p-8 space-y-7"><div className="flex items-start gap-4">{icon && <div className="p-3 rounded-xl bg-pm-gold/10 text-pm-gold">{icon}</div>}<div><h2 className="text-sm font-black uppercase tracking-[.22em] text-white">{title}</h2>{description && <p className="mt-2 text-xs text-white/35 max-w-2xl">{description}</p>}</div></div>{children}</section>;
}

function Field({ label, value, onChange, placeholder, type = 'text', help }: any) {
  return <label className="block"><span className="admin-label">{label}</span><input type={type} value={value ?? ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="admin-input" />{help && <span className="block mt-2 text-[10px] text-white/25">{help}</span>}</label>;
}

function Area({ label, value, onChange, placeholder }: any) {
  return <label className="block"><span className="admin-label">{label}</span><textarea value={value ?? ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} rows={4} className="admin-input resize-y" /></label>;
}

function General({ draft, update }: any) {
  return <Panel title="Configuration générale" description="Les informations structurantes utilisées par les pages publiques et les métadonnées."><div className="grid md:grid-cols-2 gap-6"><Field label="Nom de l'agence" value={draft.siteConfig?.name} onChange={(v: string) => update('siteConfig','name',v)} /><Field label="Slogan" value={draft.siteConfig?.tagline} onChange={(v: string) => update('siteConfig','tagline',v)} /><Field label="Email principal" value={draft.contactInfo?.email} onChange={(v: string) => update('contactInfo','email',v)} /><Field label="Téléphone principal" value={draft.contactInfo?.phone} onChange={(v: string) => update('contactInfo','phone',v)} /></div><Area label="Description de l'agence" value={draft.siteConfig?.description} onChange={(v: string) => update('siteConfig','description',v)} /></Panel>;
}

function Branding({ draft, update }: any) {
  return <Panel title="Identité visuelle" description="Centralisez les ressources visuelles principales du site. Les URL peuvent provenir de votre médiathèque."><div className="grid md:grid-cols-2 gap-6"><Field label="Logo" value={draft.siteConfig?.logo} onChange={(v: string) => update('siteConfig','logo',v)} /><Field label="Image héros" value={draft.siteImages?.hero} onChange={(v: string) => update('siteImages','hero',v)} /><Field label="Image À propos" value={draft.siteImages?.about} onChange={(v: string) => update('siteImages','about',v)} /><Field label="Fond Fashion Day" value={draft.siteImages?.fashionDayBg} onChange={(v: string) => update('siteImages','fashionDayBg',v)} /><Field label="Image histoire agence" value={draft.siteImages?.agencyHistory} onChange={(v: string) => update('siteImages','agencyHistory',v)} /><Field label="Fond Classroom" value={draft.siteImages?.classroomBg} onChange={(v: string) => update('siteImages','classroomBg',v)} /><Field label="Fond Casting" value={draft.siteImages?.castingBg} onChange={(v: string) => update('siteImages','castingBg',v)} /></div></Panel>;
}

function Contact({ draft, update }: any) {
  return <Panel title="Coordonnées publiques" description="Ces informations sont destinées aux visiteurs, aux candidats et aux partenaires."><div className="grid md:grid-cols-2 gap-6"><Field label="Email" value={draft.contactInfo?.email} onChange={(v: string) => update('contactInfo','email',v)} type="email" /><Field label="Téléphone" value={draft.contactInfo?.phone} onChange={(v: string) => update('contactInfo','phone',v)} /><Field label="Adresse" value={draft.contactInfo?.address} onChange={(v: string) => update('contactInfo','address',v)} /><Field label="Ville / pays" value={draft.contactInfo?.city} onChange={(v: string) => update('contactInfo','city',v)} /></div></Panel>;
}

function Social({ draft, update }: any) {
  return <Panel title="Réseaux sociaux" description="Une seule source de vérité pour les liens affichés dans le site."><div className="grid md:grid-cols-2 gap-6"><Field label="Facebook" value={draft.socialLinks?.facebook} onChange={(v: string) => update('socialLinks','facebook',v)} /><Field label="Instagram" value={draft.socialLinks?.instagram} onChange={(v: string) => update('socialLinks','instagram',v)} /><Field label="YouTube" value={draft.socialLinks?.youtube} onChange={(v: string) => update('socialLinks','youtube',v)} /><Field label="TikTok" value={draft.socialLinks?.tiktok} onChange={(v: string) => update('socialLinks','tiktok',v)} /><Field label="LinkedIn" value={draft.socialLinks?.linkedin} onChange={(v: string) => update('socialLinks','linkedin',v)} /><Field label="X / Twitter" value={draft.socialLinks?.twitter} onChange={(v: string) => update('socialLinks','twitter',v)} /></div></Panel>;
}

function Content({ draft, setDraft, markDirty }: any) {
  const [open, setOpen] = useState<string | null>(null);
  const partners = draft.agencyPartners || [];
  const testimonials = draft.testimonials || [];
  const faq = draft.faqData || [];
  const mutate = (key: string, value: any) => { setDraft((p: any) => ({ ...p, [key]: value })); markDirty(); };
  return <div className="space-y-6"><Panel title="Partenaires" description="Gérez les partenaires affichés par l'agence."><ArrayList items={partners} onChange={(v: any[]) => mutate('agencyPartners',v)} labelKey="name" empty={{ name: 'Nouveau partenaire' }} /></Panel><Panel title="Témoignages" description="Ajoutez des preuves sociales sans quitter le centre de configuration."><ArrayList items={testimonials} onChange={(v: any[]) => mutate('testimonials',v)} labelKey="name" empty={{ name: 'Nouveau témoin', role: '', quote: '', imageUrl: '' }} /></Panel><Panel title="FAQ" description="Structurez les questions fréquentes par catégories."><ArrayList items={faq} onChange={(v: any[]) => mutate('faqData',v)} labelKey="category" empty={{ category: 'Nouvelle catégorie', items: [] }} nested open={open} setOpen={setOpen} /></Panel></div>;
}

function ArrayList({ items, onChange, labelKey, empty, nested, open, setOpen }: any) {
  const update = (i: number, patch: any) => onChange(items.map((x: any, n: number) => n === i ? { ...x, ...patch } : x));
  return <div className="space-y-3">{items.map((item: any, i: number) => <div key={i} className="rounded-xl border border-white/5 bg-black/10 p-4"><div className="flex gap-2"><input className="admin-input flex-1" value={item[labelKey] || ''} onChange={e => update(i,{ [labelKey]: e.target.value })} /><button type="button" className="px-3 rounded-lg text-xs text-red-300/70 hover:bg-red-400/10" onClick={() => onChange(items.filter((_: any,n:number)=>n!==i))}>Supprimer</button></div>{nested && <div className="mt-4 space-y-3"><button type="button" className="text-[10px] uppercase tracking-widest text-pm-gold" onClick={() => setOpen(open === String(i) ? null : String(i))}>{open === String(i) ? 'Réduire' : 'Gérer les questions'}</button>{open === String(i) && <div className="space-y-3">{(item.items || []).map((q:any,j:number)=><div key={j} className="grid md:grid-cols-2 gap-3"><input className="admin-input" value={q.question || ''} onChange={e => update(i,{items:item.items.map((x:any,n:number)=>n===j?{...x,question:e.target.value}:x)})} /><input className="admin-input" value={q.answer || ''} onChange={e => update(i,{items:item.items.map((x:any,n:number)=>n===j?{...x,answer:e.target.value}:x)})} /></div>)}<button type="button" className="text-xs text-pm-gold" onClick={() => update(i,{items:[...(item.items||[]),{question:'Nouvelle question ?',answer:''}]})}>+ Ajouter une question</button></div>}</div>}</div>)}<button type="button" onClick={() => onChange([...items,empty])} className="text-xs font-bold text-pm-gold hover:text-white">+ Ajouter</button></div>;
}

function Integrations() {
  const services = [
    ['Supabase Auth', 'Sessions, profils et rôles synchronisés côté serveur.'],
    ['Emails transactionnels', 'Brevo est appelé par une fonction Edge journalisée et protégée.'],
    ['ImgBB', 'Les téléversements passent par une route serveur authentifiée.'],
    ['Secrets applicatifs', 'Les clés sont administrées dans Vercel ou Supabase, jamais dans le navigateur.'],
  ];
  return <Panel title="Intégrations" description="Les secrets techniques ne sont plus éditables depuis le site. Cette page indique seulement l’architecture active."><div className="grid md:grid-cols-2 gap-4">{services.map(([title,text]) => <div key={title} className="rounded-xl border border-emerald-400/15 bg-emerald-400/[.04] p-5"><p className="text-xs font-bold text-emerald-300">{title}</p><p className="mt-2 text-[11px] leading-5 text-white/40">{text}</p></div>)}</div></Panel>;
}

function Security() {
  return <div className="space-y-6"><Panel title="Sécurité" description="État de la nouvelle architecture d’accès."><div className="grid md:grid-cols-2 gap-4"><SecurityCard title="Sessions Supabase SSR" text="Les sessions sont conservées dans des cookies sécurisés et renouvelées par le serveur." ok /><SecurityCard title="Rôles protégés" text="Les rôles viennent des métadonnées administrateur ; un membre ne peut plus promouvoir son propre compte." ok /><SecurityCard title="Secrets hors navigateur" text="Les clés Brevo, Supabase et ImgBB ne sont jamais intégrées au bundle client." ok /><SecurityCard title="Emails traçables" text="Chaque envoi transactionnel est journalisé et protégé contre les doublons." ok /></div></Panel><Panel title="Socle technique" description="Les parcours sensibles utilisent désormais une seule chaîne de confiance."><div className="rounded-xl border border-pm-gold/10 bg-pm-gold/[.04] p-5 flex gap-4"><SparklesIcon className="w-5 h-5 text-pm-gold shrink-0" /><p className="text-xs leading-6 text-white/45">Vercel reçoit les requêtes, Supabase Auth valide l’identité, Postgres applique les règles d’accès et la fonction Edge orchestre les emails transactionnels.</p></div></Panel></div>;
}

function SecurityCard({ title, text, ok }: { title:string; text:string; ok?:boolean }) { return <div className="rounded-xl border border-white/5 p-5"><div className="flex items-center gap-2">{ok ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <ShieldCheckIcon className="w-4 h-4 text-pm-gold" />}<span className="text-xs font-bold text-white">{title}</span></div><p className="mt-2 text-[11px] leading-5 text-white/30">{text}</p></div>; }
