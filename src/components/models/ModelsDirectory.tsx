'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Model } from '@/types';

type DirectoryModel = Pick<Model, 'id' | 'name' | 'gender' | 'location' | 'experience' | 'journey' | 'categories' | 'level' | 'imageUrl' | 'height'>;
type Props = { models: DirectoryModel[] };

const cardColors = ['bg-pm-peach', 'bg-pm-mint', 'bg-pm-lilac', 'bg-pm-sky', 'bg-pm-gold-light/65', 'bg-pm-coral-soft/60'];

export default function ModelsDirectory({ models }: Props) {
  const [query, setQuery] = useState('');
  const [gender, setGender] = useState<'Tous' | DirectoryModel['gender']>('Tous');
  const [level, setLevel] = useState<'Tous' | 'Pro' | 'Débutant'>('Tous');
  const [category, setCategory] = useState('Toutes');
  const categories = useMemo(() => Array.from(new Set(models.flatMap((model) => model.categories || []))).sort(), [models]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return models.filter((model) => {
      const haystack = [model.name, model.location, model.experience, model.journey, ...(model.categories || [])].filter(Boolean).join(' ').toLowerCase();
      return (!needle || haystack.includes(needle)) && (gender === 'Tous' || model.gender === gender) && (level === 'Tous' || model.level === level) && (category === 'Toutes' || model.categories?.includes(category));
    });
  }, [models, query, gender, level, category]);

  const reset = () => { setQuery(''); setGender('Tous'); setLevel('Tous'); setCategory('Toutes'); };

  return (
    <section className="soft-section py-14 sm:py-20">
      <div className="relative mx-auto max-w-[1550px] px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid gap-6 rounded-[2rem] border border-pm-ink/[.07] bg-white/80 p-5 shadow-[0_22px_65px_rgba(91,46,37,.08)] backdrop-blur-sm lg:grid-cols-[.8fr_1.2fr] lg:items-end lg:p-7">
          <div><p className="text-[9px] font-black uppercase tracking-[.28em] text-pm-coral">Répertoire intelligent</p><h2 className="mt-3 font-playfair text-4xl font-semibold sm:text-5xl">Trouver le bon profil.</h2><p className="mt-3 max-w-lg text-sm leading-7 text-pm-ink/52">Recherchez par nom, genre, niveau ou spécialité. Chaque carte ouvre la fiche complète du talent.</p></div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un talent" className="min-h-12 rounded-xl border border-pm-ink/10 bg-pm-ivory px-4 text-sm outline-none placeholder:text-pm-ink/30 focus:border-pm-coral" />
            <Select value={gender} onChange={(value) => setGender(value as typeof gender)} options={['Tous', 'Femme', 'Homme']} label="Genre" />
            <Select value={level} onChange={(value) => setLevel(value as typeof level)} options={['Tous', 'Pro', 'Débutant']} label="Niveau" />
            <Select value={category} onChange={setCategory} options={['Toutes', ...categories]} label="Spécialité" />
          </div>
        </div>

        <div className="flex items-center justify-between py-7 text-[9px] font-black uppercase tracking-[.2em] text-pm-ink/42"><span>{filtered.length} talent{filtered.length > 1 ? 's' : ''}</span><button onClick={reset} className="rounded-full bg-pm-peach px-4 py-2 text-pm-wine transition hover:bg-pm-gold-light">Réinitialiser</button></div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {filtered.map((model, index) => (
              <Link key={model.id} href={`/mannequins/${model.id}`} className={`group block ${index % 4 === 1 || index % 4 === 3 ? 'lg:pt-10' : ''}`}>
                <div className={`rounded-[1.7rem] p-2.5 shadow-[0_18px_50px_rgba(91,46,37,.08)] ${cardColors[index % cardColors.length]}`}>
                  <div className="relative aspect-[3/4.15] overflow-hidden rounded-[1.35rem] bg-pm-sand">
                    {model.imageUrl ? <Image src={model.imageUrl} alt={model.name} fill sizes="(max-width: 768px) 50vw, (max-width: 1100px) 33vw, 25vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" /> : <div className="grid h-full place-items-center font-playfair text-6xl text-pm-wine/18">PMM</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    <div className="absolute left-3 top-3 rounded-full bg-white/88 px-3 py-1.5 text-[8px] font-black uppercase tracking-[.16em] text-pm-wine backdrop-blur">PMM · {String(index + 1).padStart(2, '0')}</div>
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white"><h3 className="font-playfair text-2xl font-semibold leading-tight">{model.name}</h3><p className="mt-1 text-[8px] font-black uppercase tracking-[.16em] text-white/68">{model.location || 'Libreville'} {model.height ? `· ${model.height}` : ''}</p></div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 px-1"><p className="text-[8px] font-black uppercase tracking-[.18em] text-pm-wine">{model.categories?.slice(0, 2).join(' · ') || model.level || 'Talent PMM'}</p><span className="grid h-9 w-9 place-items-center rounded-full border border-pm-ink/10 bg-white text-pm-wine transition group-hover:bg-pm-wine group-hover:text-white">↗</span></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] bg-pm-peach px-6 py-16 text-center"><p className="font-playfair text-4xl font-semibold text-pm-ink/65">Aucun profil à afficher.</p><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-pm-ink/48">Modifiez les filtres ou revenez plus tard pour découvrir les nouveaux talents publiés.</p></div>
        )}
      </div>
    </section>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (value: string) => void; options: string[]; label: string }) {
  return <label className="flex min-h-12 items-center gap-2 rounded-xl border border-pm-ink/10 bg-pm-ivory px-3"><span className="text-[8px] font-black uppercase tracking-[.14em] text-pm-ink/35">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none">{options.map((option) => <option key={option} className="bg-pm-ivory">{option}</option>)}</select></label>;
}
