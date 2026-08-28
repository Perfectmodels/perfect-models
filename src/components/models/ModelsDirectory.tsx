'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Model } from '@/types';

type Props = { models: Model[] };

export default function ModelsDirectory({ models }: Props) {
  const [query, setQuery] = useState('');
  const [gender, setGender] = useState<'Tous' | Model['gender']>('Tous');
  const [level, setLevel] = useState<'Tous' | 'Pro' | 'Débutant'>('Tous');
  const [category, setCategory] = useState('Toutes');
  const categories = useMemo(() => Array.from(new Set(models.flatMap((m) => m.categories || []))).sort(), [models]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models.filter((model) => {
      const haystack = [model.name, model.location, model.experience, model.journey, ...(model.categories || [])].filter(Boolean).join(' ').toLowerCase();
      return (!q || haystack.includes(q)) && (gender === 'Tous' || model.gender === gender) && (level === 'Tous' || model.level === level) && (category === 'Toutes' || model.categories?.includes(category));
    });
  }, [models, query, gender, level, category]);

  const reset = () => {
    setQuery('');
    setGender('Tous');
    setLevel('Tous');
    setCategory('Toutes');
  };

  return (
    <section className="bg-pm-ivory">
      <div className="mx-auto max-w-[1550px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
        <div className="grid gap-8 border-b border-pm-ink/15 pb-9 lg:grid-cols-[1.1fr_1.9fr] lg:items-end">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[.36em] text-pm-wine">Répertoire</p>
            <p className="mt-4 text-sm leading-7 text-pm-ink/48">Filtrez les profils par genre, niveau ou spécialité.</p>
          </div>
          <div className="grid gap-px border border-pm-ink/15 bg-pm-ink/15 md:grid-cols-[1.5fr_repeat(3,1fr)]">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un talent" className="min-h-14 bg-pm-ivory px-4 text-sm text-pm-ink outline-none placeholder:text-pm-ink/30 focus:bg-white" />
            <Select value={gender} onChange={(v) => setGender(v as typeof gender)} options={['Tous', 'Femme', 'Homme']} label="Genre" />
            <Select value={level} onChange={(v) => setLevel(v as typeof level)} options={['Tous', 'Pro', 'Débutant']} label="Niveau" />
            <Select value={category} onChange={setCategory} options={['Toutes', ...categories]} label="Spécialité" />
          </div>
        </div>

        <div className="flex items-center justify-between py-7 text-[8px] font-black uppercase tracking-[.26em] text-pm-ink/38 sm:text-[9px]">
          <span>{filtered.length} talent{filtered.length > 1 ? 's' : ''}</span>
          <button onClick={reset} className="border-b border-transparent pb-1 transition hover:border-pm-wine hover:text-pm-wine">Réinitialiser</button>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:gap-x-7">
            {filtered.map((model, index) => (
              <Link key={model.id} href={`/mannequins/${model.id}`} className={`group block ${index % 3 === 1 ? 'lg:pt-12' : ''}`}>
                <div className="relative aspect-[3/4.15] overflow-hidden bg-pm-ink/8">
                  {model.imageUrl ? (
                    <img src={model.imageUrl} alt={model.name} loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025]" />
                  ) : (
                    <div className="grid h-full place-items-center bg-pm-sand"><span className="font-playfair text-5xl text-pm-ink/15">PMM</span></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-65" />
                  <span className="absolute left-4 top-4 text-[8px] font-black uppercase tracking-[.24em] text-white/62">PMM · {String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className="mt-4 flex items-start justify-between gap-4 border-t border-pm-ink/15 pt-4">
                  <div>
                    <h2 className="font-playfair text-xl font-semibold leading-tight sm:text-2xl">{model.name}</h2>
                    <p className="mt-1.5 text-[8px] font-black uppercase tracking-[.22em] text-pm-wine">{model.categories?.slice(0, 2).join(' · ') || 'Model'}</p>
                    <p className="mt-2 text-[8px] font-bold uppercase tracking-[.18em] text-pm-ink/36">{model.location || 'Libreville'} {model.height ? `· ${model.height}` : ''}</p>
                  </div>
                  <span className="text-pm-wine transition group-hover:translate-x-1">↗</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border-y border-pm-ink/15 py-16 text-center">
            <p className="font-playfair text-4xl font-semibold text-pm-ink/65">Aucun profil à afficher.</p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-pm-ink/45">Les profils apparaissent ici uniquement après publication par l’agence.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (value: string) => void; options: string[]; label: string }) {
  return (
    <label className="flex min-h-14 items-center gap-3 bg-pm-ivory px-4 focus-within:bg-white">
      <span className="text-[8px] font-black uppercase tracking-[.18em] text-pm-ink/32">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-pm-ink outline-none">
        {options.map((option) => <option key={option} className="bg-pm-ivory">{option}</option>)}
      </select>
    </label>
  );
}
