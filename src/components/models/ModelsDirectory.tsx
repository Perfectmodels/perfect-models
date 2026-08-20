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

  return (
    <div>
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-10 sm:px-8 lg:px-10">
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un mannequin..." className="min-h-12 rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-pm-gold/50" />
          <Select value={gender} onChange={(v) => setGender(v as typeof gender)} options={['Tous', 'Femme', 'Homme']} label="Genre" />
          <Select value={level} onChange={(v) => setLevel(v as typeof level)} options={['Tous', 'Pro', 'Débutant']} label="Niveau" />
          <Select value={category} onChange={setCategory} options={['Toutes', ...categories]} label="Spécialité" />
        </div>
        <div className="mt-5 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.25em] text-white/35"><span>{filtered.length} talent{filtered.length > 1 ? 's' : ''}</span><button onClick={() => { setQuery(''); setGender('Tous'); setLevel('Tous'); setCategory('Toutes'); }} className="hover:text-pm-gold">Réinitialiser</button></div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-3 gap-y-10 px-5 pb-24 sm:grid-cols-3 sm:gap-6 sm:px-8 lg:grid-cols-4 lg:px-10">
        {filtered.map((model) => (
          <Link key={model.id} href={`/mannequins/${model.id}`} className="group">
            <div className="relative aspect-[3/4] overflow-hidden bg-white/5">
              <img src={model.imageUrl} alt={model.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 pt-16 sm:p-5 sm:pt-20">
                <p className="font-playfair text-xl font-bold text-white sm:text-2xl">{model.name}</p>
                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-pm-gold">{model.categories?.slice(0, 2).join(' · ') || 'Model'}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {!filtered.length && <div className="mx-auto max-w-7xl px-5 pb-24 text-center text-white/40">Aucun mannequin ne correspond à votre recherche.</div>}
    </div>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (value: string) => void; options: string[]; label: string }) {
  return <label className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4"><span className="text-[9px] font-black uppercase tracking-widest text-white/25">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"><option className="bg-black">{options[0]}</option>{options.slice(1).map((option) => <option key={option} className="bg-black">{option}</option>)}</select></label>;
}
