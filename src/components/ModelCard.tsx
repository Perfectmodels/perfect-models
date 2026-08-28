import Image from 'next/image';
import Link from 'next/link';
import { Model } from '../types';

interface ModelCardProps {
  model: Model;
}

export default function ModelCard({ model }: ModelCardProps) {
  const image = model.imageUrl || '/images/grace-elsa.jpg';

  return (
    <article className="group relative h-[420px] overflow-hidden rounded-[1.5rem] border border-pm-ink/10 bg-pm-sand shadow-sm sm:h-[520px] lg:h-[650px]">
      <Link href={`/mannequins/${model.id}`} className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-pm-coral" aria-label={`Voir le profil de ${model.name}`}>
        <Image
          src={image}
          alt={model.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.025]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pm-ink/90 via-pm-ink/10 to-transparent" />

        <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
          {(model.fashionDayEditions?.length ?? 0) > 0 && <span className="rounded-full bg-pm-gold-light px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.1em] text-pm-ink shadow">PFD Talent</span>}
          {model.level === 'Pro' && <span className="rounded-full border border-white/35 bg-pm-ink/75 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.1em] text-white backdrop-blur-sm">PRO</span>}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
          <h3 className="font-playfair text-3xl font-semibold tracking-tight text-white sm:text-4xl">{model.name}</h3>
          <div className="mt-5 flex items-center justify-between gap-5 border-t border-white/20 pt-5">
            <span className="text-xs font-extrabold uppercase tracking-[.1em] text-pm-gold-light">{model.height || 'Taille à confirmer'} · {model.gender}</span>
            <span className="text-xs font-extrabold text-white/75" aria-hidden="true">Profil ↗</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
