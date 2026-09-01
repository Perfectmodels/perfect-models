import Image from 'next/image';
import Link from 'next/link';

type Tone = 'wine' | 'coral' | 'teal' | 'gold';

type Props = {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  images?: string[];
  tone?: Tone;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  meta?: string[];
};

const FALLBACK = '/images/grace-elsa.jpg';

export default function VisualMasthead({
  eyebrow,
  title,
  accent,
  description,
  images = [],
  primary,
  secondary,
  meta = [],
}: Props) {
  const pool = images.filter(Boolean);
  const visual = (index: number) => pool[index % Math.max(pool.length, 1)] || FALLBACK;

  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      <div aria-hidden="true" className="african-pattern absolute inset-0 opacity-[.09]" />
      <div aria-hidden="true" className="absolute inset-y-0 right-0 w-px bg-pm-gold/40" />
      <div className="relative mx-auto grid max-w-[1700px] gap-12 px-5 py-14 sm:px-8 sm:py-18 lg:min-h-[660px] lg:grid-cols-[.88fr_1.12fr] lg:items-center lg:px-12 lg:py-20 xl:px-16">
        <div className="relative z-10 max-w-4xl">
          <p className="text-[9px] font-black uppercase tracking-[.34em] text-pm-gold-light sm:text-[10px]">{eyebrow}</p>
          <h1 className="mt-6 font-playfair text-[clamp(4rem,7vw,8.2rem)] font-semibold leading-[.82] tracking-[-.055em]">
            {title}<br />
            <em className="font-normal text-pm-gold-light">{accent}</em>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">{description}</p>

          {(primary || secondary) && (
            <div className="mt-9 flex flex-wrap gap-3">
              {primary && <Link href={primary.href} className="inline-flex min-h-12 items-center justify-center bg-pm-gold px-6 py-3 text-sm font-extrabold text-black transition hover:bg-pm-gold-light">{primary.label} <span className="ml-2" aria-hidden="true">↗</span></Link>}
              {secondary && <Link href={secondary.href} className="inline-flex min-h-12 items-center justify-center border border-white/25 bg-transparent px-6 py-3 text-sm font-bold text-white transition hover:border-pm-gold hover:text-pm-gold-light">{secondary.label}</Link>}
            </div>
          )}

          {meta.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-y border-white/12 py-4">
              {meta.map((item) => <span key={item} className="text-[8px] font-black uppercase tracking-[.2em] text-white/45">{item}</span>)}
            </div>
          )}
        </div>

        <div className="relative mx-auto grid w-full max-w-[760px] grid-cols-12 grid-rows-12 gap-3 lg:h-[560px]">
          <div className="relative col-span-8 row-span-12 overflow-hidden border border-white/15 bg-white/5">
            <Image src={visual(0)} alt="Univers Perfect Models Management" fill priority sizes="(max-width: 1024px) 66vw, 40vw" className="object-cover grayscale-[10%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          </div>
          <div className="relative col-span-4 row-span-6 overflow-hidden border border-pm-gold/35 bg-white/5">
            <Image src={visual(1)} alt="Création et talents Perfect Models Management" fill sizes="(max-width: 1024px) 34vw, 20vw" className="object-cover grayscale-[15%]" />
          </div>
          <div className="relative col-span-4 row-span-6 overflow-hidden border border-white/15 bg-white/5">
            <Image src={visual(2)} alt="Mode et production Perfect Models Management" fill sizes="(max-width: 1024px) 34vw, 20vw" className="object-cover grayscale-[15%]" />
          </div>
          <div className="absolute -bottom-5 -left-5 border border-pm-gold/45 bg-black px-5 py-4 text-pm-gold-light shadow-xl">
            <p className="text-[8px] font-black uppercase tracking-[.3em]">PMM · Libreville</p>
          </div>
        </div>
      </div>
      <div className="african-trim h-2 w-full" aria-hidden="true" />
    </section>
  );
}
