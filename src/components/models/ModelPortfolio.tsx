'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Props = { name: string; images: string[] };

export default function ModelPortfolio({ name, images }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (active === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
      if (event.key === 'ArrowLeft') setActive((current) => current === null ? null : (current - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight') setActive((current) => current === null ? null : (current + 1) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [active, images.length]);

  if (!images.length) return <div className="rounded-2xl border border-white/10 p-8 text-sm text-white/45">Portfolio en cours de constitution.</div>;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Agrandir la photo ${index + 1} du portfolio de ${name}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-white/5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-pm-gold"
          >
            <Image
              src={src}
              alt={`${name} — portfolio ${index + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              priority={index === 0}
              className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.025]"
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-white/85 backdrop-blur-sm">{String(index + 1).padStart(2, '0')}</span>
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${active + 1} du portfolio de ${name}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null); }}
        >
          <button ref={closeRef} type="button" aria-label="Fermer le portfolio" onClick={() => setActive(null)} className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">×</button>
          {images.length > 1 && <button type="button" aria-label="Photo précédente" onClick={() => setActive((active - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-3xl text-white/80 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">‹</button>}
          <div className="relative h-[86vh] w-[90vw] max-w-6xl">
            <Image src={images[active]} alt={`${name} — portfolio ${active + 1}`} fill sizes="90vw" className="object-contain" priority />
          </div>
          {images.length > 1 && <button type="button" aria-label="Photo suivante" onClick={() => setActive((active + 1) % images.length)} className="absolute right-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-3xl text-white/80 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">›</button>}
        </div>
      )}
    </>
  );
}
