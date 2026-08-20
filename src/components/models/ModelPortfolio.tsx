'use client';

import { useState } from 'react';

type Props = { name: string; images: string[] };

export default function ModelPortfolio({ name, images }: Props) {
  const [active, setActive] = useState<number | null>(null);
  if (!images.length) return <div className="border border-white/10 p-8 text-sm text-white/35">Portfolio en cours de constitution.</div>;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((src, index) => <button key={`${src}-${index}`} type="button" onClick={() => setActive(index)} className="group relative aspect-[3/4] overflow-hidden bg-white/5 text-left"><img src={src} alt={`${name} — portfolio ${index + 1}`} loading={index > 2 ? 'lazy' : 'eager'} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><span className="absolute bottom-3 left-3 text-[9px] font-black uppercase tracking-widest text-white/70">{String(index + 1).padStart(2, '0')}</span></button>)}
      </div>
      {active !== null && <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4" onClick={() => setActive(null)}>
        <button type="button" aria-label="Fermer" onClick={() => setActive(null)} className="absolute right-5 top-5 z-10 text-2xl text-white/70 hover:text-white">×</button>
        <button type="button" aria-label="Photo précédente" onClick={(e) => { e.stopPropagation(); setActive((active - 1 + images.length) % images.length); }} className="absolute left-3 top-1/2 -translate-y-1/2 px-4 py-3 text-3xl text-white/70 hover:text-white">‹</button>
        <img src={images[active]} alt={`${name} — portfolio ${active + 1}`} className="max-h-[90vh] max-w-[92vw] object-contain" onClick={(e) => e.stopPropagation()} />
        <button type="button" aria-label="Photo suivante" onClick={(e) => { e.stopPropagation(); setActive((active + 1) % images.length); }} className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-3 text-3xl text-white/70 hover:text-white">›</button>
      </div>}
    </>
  );
}
