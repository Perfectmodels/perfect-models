'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowPathIcon, ArrowTopRightOnSquareIcon, CheckCircleIcon, PhotoIcon, RectangleStackIcon } from '@heroicons/react/24/outline';
import ImgBBUploader from '@/components/ImgBBUploader';
import { useToast } from '@/components/ui/Toast';
import type { SiteImagePage, SiteImageSlot } from '@/lib/site-image-registry';

type Collection = { label: string; description: string; href: string };
type Payload = {
  pages: SiteImagePage[];
  collections: Collection[];
  values: Record<string, string>;
  effective: Record<string, string>;
  updatedAt: string | null;
};

function formatUpdated(value: string | null) {
  if (!value) return 'Aucune modification récente';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Synchronisé';
  return `Dernière mise à jour ${date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
}

export default function SiteVisualSettings() {
  const { success, error } = useToast();
  const [payload, setPayload] = useState<Payload | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [selectedPage, setSelectedPage] = useState('home');
  const [busyKey, setBusyKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/admin/site-images', { credentials: 'include', cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body?.error || 'Chargement impossible.');
        return body as Payload;
      })
      .then((data) => {
        if (!active) return;
        setPayload(data);
        setDrafts(Object.fromEntries(Object.entries(data.values || {}).map(([key, value]) => [key, String(value || '')])));
        setSelectedPage(data.pages?.some((page) => page.id === 'home') ? 'home' : data.pages?.[0]?.id || 'home');
      })
      .catch((cause) => { if (active) setLoadError(cause instanceof Error ? cause.message : 'Chargement impossible.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const page = useMemo(() => payload?.pages.find((item) => item.id === selectedPage) || payload?.pages[0], [payload, selectedPage]);
  const sections = useMemo(() => {
    if (!page) return [];
    return Array.from(new Set(page.slots.map((item) => item.section))).map((name) => ({ name, slots: page.slots.filter((item) => item.section === name) }));
  }, [page]);

  const save = async (slot: SiteImageSlot, nextValue: string) => {
    const normalized = nextValue.trim();
    setBusyKey(slot.key);
    try {
      const response = await fetch('/api/admin/site-images', {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: slot.key, value: normalized }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.error || 'Enregistrement impossible.');
      setDrafts((current) => {
        const next = { ...current };
        if (normalized) next[slot.key] = normalized; else delete next[slot.key];
        return next;
      });
      setPayload((current) => current ? {
        ...current,
        values: normalized ? { ...current.values, [slot.key]: normalized } : Object.fromEntries(Object.entries(current.values).filter(([key]) => key !== slot.key)),
        effective: { ...current.effective, [slot.key]: String(body.effective || '') },
        updatedAt: String(body.updatedAt || new Date().toISOString()),
      } : current);
      success(normalized ? `${slot.label} mise à jour via ImgBB.` : `${slot.label} revient à sa source automatique.`);
      window.dispatchEvent(new Event('pmm-site-images-changed'));
    } catch (cause) {
      error(cause instanceof Error ? cause.message : 'Enregistrement impossible.');
    } finally {
      setBusyKey('');
    }
  };

  if (loading) return <div className="grid min-h-[420px] place-items-center rounded-[2rem] bg-white/60"><div className="text-center"><ArrowPathIcon className="mx-auto h-7 w-7 animate-spin text-pm-coral"/><p className="mt-3 text-sm font-semibold text-pm-ink/45">Cartographie du site public…</p></div></div>;
  if (loadError || !payload || !page) return <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-sm font-semibold text-red-900">{loadError || 'Le centre de visuels n’a pas pu être chargé.'}</div>;

  const overrides = Object.keys(payload.values).filter((key) => payload.pages.some((entry) => entry.slots.some((slot) => slot.key === key))).length;

  return <div className="min-w-0 space-y-7">
    <section className="min-w-0 overflow-hidden rounded-[2.2rem] bg-pm-wine p-6 text-white sm:p-8 lg:p-10">
      <div className="grid min-w-0 gap-7 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
        <div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.26em] text-pm-gold-light">Site public · Contrôle visuel</p><h1 className="mt-3 break-words font-playfair text-4xl font-semibold sm:text-5xl lg:text-6xl">Les images, page par page.</h1><p className="mt-5 max-w-3xl text-sm leading-7 text-white/65">Chaque nouveau visuel est téléversé par le proxy ImgBB serveur puis appliqué au bloc public. Le contrôle du domaine ImgBB reste strict sans transformer un délai de propagation du CDN en faux échec.</p></div>
        <div className="grid min-w-0 grid-cols-2 gap-3"><div className="min-w-0 rounded-[1.4rem] bg-white/10 p-4"><p className="font-playfair text-4xl font-semibold">{payload.pages.reduce((sum, item) => sum + item.slots.length, 0)}</p><p className="mt-2 break-words text-[8px] font-black uppercase tracking-[.18em] text-white/50">Emplacements</p></div><div className="min-w-0 rounded-[1.4rem] bg-pm-coral p-4"><p className="font-playfair text-4xl font-semibold">{overrides}</p><p className="mt-2 break-words text-[8px] font-black uppercase tracking-[.18em] text-white/65">Overrides actifs</p></div></div>
      </div><p className="mt-6 text-[9px] font-semibold text-white/40">{formatUpdated(payload.updatedAt)}</p>
    </section>

    <section className="min-w-0 rounded-[1.8rem] border border-pm-ink/[.08] bg-white/70 p-3 shadow-[0_16px_45px_rgba(37,24,32,.05)]"><div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">{payload.pages.map((item) => <button key={item.id} type="button" onClick={() => setSelectedPage(item.id)} className={`min-w-0 break-words rounded-2xl px-3 py-3 text-[10px] font-black uppercase tracking-[.08em] transition ${item.id === page.id ? 'bg-pm-ink text-white' : 'bg-pm-ivory text-pm-ink/55 hover:bg-pm-peach hover:text-pm-wine'}`}>{item.label}</button>)}</div></section>

    <section className="min-w-0 rounded-[2rem] bg-pm-peach/60 p-5 sm:p-7"><div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><p className="break-words text-[9px] font-black uppercase tracking-[.22em] text-pm-coral">{page.path}</p><h2 className="mt-2 break-words font-playfair text-4xl font-semibold">{page.label}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-pm-ink/55">{page.description}</p></div><Link href={page.path} target="_blank" className="inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-center text-[10px] font-black uppercase tracking-[.08em] text-pm-wine shadow-sm sm:w-auto">Voir la page <ArrowTopRightOnSquareIcon className="h-4 w-4 shrink-0"/></Link></div></section>

    {sections.map((section) => <section key={section.name} className="min-w-0 rounded-[2rem] border border-pm-ink/[.08] bg-white p-5 shadow-[0_18px_55px_rgba(37,24,32,.05)] sm:p-7">
      <div className="mb-6 flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pm-peach text-pm-wine"><RectangleStackIcon className="h-5 w-5"/></span><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.2em] text-pm-coral">Section publique</p><h3 className="break-words font-playfair text-2xl font-semibold">{section.name}</h3></div></div>
      <div className="grid min-w-0 gap-5 xl:grid-cols-2">{section.slots.map((slot) => {
        const override = String(drafts[slot.key] || '');
        const current = override || String(payload.effective[slot.key] || '');
        const isBusy = busyKey === slot.key;
        return <article key={slot.key} className="min-w-0 overflow-hidden rounded-[1.6rem] border border-pm-ink/[.08] bg-pm-ivory"><div className="grid min-h-[280px] min-w-0 sm:grid-cols-[.9fr_1.1fr]">
          <div className="relative min-h-56 min-w-0 bg-pm-sand sm:min-h-full">{current ? <img src={current} alt={slot.label} className="absolute inset-0 h-full w-full object-cover"/> : <div className="grid h-full min-h-56 place-items-center"><PhotoIcon className="h-12 w-12 text-pm-ink/15"/></div>}<span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] break-words rounded-full bg-black/65 px-3 py-1.5 text-[8px] font-black uppercase tracking-[.14em] text-white">Format {slot.ratio}</span></div>
          <div className="flex min-w-0 flex-col p-5"><div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="break-all text-[8px] font-black uppercase tracking-[.12em] text-pm-wine/45">{slot.key}</p><h4 className="mt-1 break-words font-playfair text-2xl font-semibold">{slot.label}</h4></div><span className={`w-fit max-w-full break-words rounded-full px-3 py-1.5 text-[8px] font-black uppercase tracking-[.08em] ${override ? 'bg-pm-coral text-white' : 'bg-pm-sage text-pm-teal'}`}>{override ? 'Personnalisée' : 'Automatique'}</span></div><p className="mt-3 text-xs leading-5 text-pm-ink/50">{slot.description}</p>
            <div className={`mt-5 min-w-0 ${isBusy ? 'pointer-events-none opacity-50' : ''}`}><ImgBBUploader value="" onChange={(url) => { if (url) void save(slot, url); }} folder="site-images" scope={`site-images/${slot.key}`} compact /></div>
            {override && <button type="button" onClick={() => void save(slot, '')} disabled={isBusy} className="mt-3 min-h-10 w-full min-w-0 break-words rounded-full border border-pm-ink/12 bg-white px-4 text-[9px] font-black uppercase tracking-[.08em] text-pm-ink/55 disabled:opacity-35">Revenir à l’image automatique</button>}
            {override && <div className="mt-auto flex min-w-0 items-start gap-2 pt-4 text-[9px] font-bold text-emerald-700"><CheckCircleIcon className="h-4 w-4 shrink-0"/><span className="min-w-0 break-words">Image ImgBB enregistrée pour ce bloc</span></div>}
          </div>
        </div></article>;
      })}</div>
    </section>)}

    <section className="min-w-0 rounded-[2rem] bg-pm-ink p-6 text-white sm:p-8"><div className="grid min-w-0 gap-8 lg:grid-cols-[.7fr_1.3fr]"><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.22em] text-pm-gold-light">Images liées au contenu</p><h2 className="mt-3 break-words font-playfair text-3xl font-semibold">Une seule source de vérité.</h2><p className="mt-4 text-sm leading-6 text-white/55">Les portraits, couvertures d’articles et galeries restent attachés à leur fiche métier. Leurs formulaires utilisent eux aussi le téléversement ImgBB pour éviter l’enregistrement de liens externes cassés.</p></div><div className="grid min-w-0 gap-3 sm:grid-cols-2">{payload.collections.map((item) => <Link key={item.href} href={item.href} className="min-w-0 rounded-[1.4rem] border border-white/10 bg-white/[.06] p-5 transition hover:bg-white/[.1]"><p className="break-words text-sm font-extrabold">{item.label}</p><p className="mt-2 break-words text-xs leading-5 text-white/45">{item.description}</p><span className="mt-4 inline-flex max-w-full break-words text-[9px] font-black uppercase tracking-[.1em] text-pm-gold-light">Gérer les images ↗</span></Link>)}</div></div></section>
  </div>;
}
