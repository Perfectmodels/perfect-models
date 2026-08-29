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

const tones: Record<Tone, { shell: string; orb: string; accent: string; chip: string }> = {
  wine: {
    shell: 'bg-[linear-gradient(135deg,#541d42_0%,#7d1f4d_48%,#a72b64_100%)] text-white',
    orb: 'bg-pm-gold-light',
    accent: 'text-pm-gold-light',
    chip: 'border-white/20 bg-white/10 text-white',
  },
  coral: {
    shell: 'bg-[linear-gradient(135deg,#ef5e4d_0%,#e64c78_55%,#8b285d_100%)] text-white',
    orb: 'bg-pm-sun',
    accent: 'text-pm-sun',
    chip: 'border-white/25 bg-white/10 text-white',
  },
  teal: {
    shell: 'bg-[linear-gradient(135deg,#0f625f_0%,#147d75_48%,#2a9c82_100%)] text-white',
    orb: 'bg-pm-peach',
    accent: 'text-pm-peach',
    chip: 'border-white/20 bg-white/10 text-white',
  },
  gold: {
    shell: 'bg-[linear-gradient(135deg,#f2a43a_0%,#f5ba59_42%,#ef7054_100%)] text-pm-ink',
    orb: 'bg-pm-wine',
    accent: 'text-pm-wine',
    chip: 'border-pm-ink/15 bg-white/35 text-pm-ink',
  },
};

export default function VisualMasthead({
  eyebrow,
  title,
  accent,
  description,
  images = [],
  tone = 'wine',
  primary,
  secondary,
  meta = [],
}: Props) {
  const palette = tones[tone];
  const pool = images.filter(Boolean);
  const visual = (index: number) => pool[index % Math.max(pool.length, 1)] || FALLBACK;

  return (
    <section className={`relative isolate overflow-hidden ${palette.shell}`}>
      <div aria-hidden="true" className={`absolute -left-28 -top-24 h-80 w-80 rounded-full opacity-35 blur-3xl ${palette.orb}`} />
      <div aria-hidden="true" className="absolute -bottom-40 right-[24%] h-96 w-96 rounded-full bg-white/15 blur-3xl" />
      <div aria-hidden="true" className="absolute inset-0 opacity-[.09] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative mx-auto grid max-w-[1700px] gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:min-h-[650px] lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-12 lg:py-20 xl:px-16">
        <div className="relative z-10 max-w-4xl">
          <p className="text-[10px] font-black uppercase tracking-[.32em] opacity-70 sm:text-xs">{eyebrow}</p>
          <h1 className="mt-5 font-playfair text-[clamp(4rem,7vw,8rem)] font-semibold leading-[.82] tracking-[-.055em]">
            {title}<br />
            <em className={`font-normal ${palette.accent}`}>{accent}</em>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 opacity-78 sm:text-lg">{description}</p>

          {(primary || secondary) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {primary && <Link href={primary.href} className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-extrabold text-pm-ink shadow-[0_12px_35px_rgba(37,27,32,.18)] transition hover:-translate-y-0.5 hover:bg-pm-gold-light">{primary.label} <span className="ml-2" aria-hidden="true">↗</span></Link>}
              {secondary && <Link href={secondary.href} className="inline-flex min-h-12 items-center justify-center rounded-full border border-current/25 bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur-sm transition hover:bg-white hover:text-pm-ink">{secondary.label}</Link>}
            </div>
          )}

          {meta.length > 0 && (
            <div className="mt-9 flex flex-wrap gap-2">
              {meta.map((item) => <span key={item} className={`rounded-full border px-3 py-2 text-[9px] font-black uppercase tracking-[.16em] backdrop-blur-sm ${palette.chip}`}>{item}</span>)}
            </div>
          )}
        </div>

        <div className="relative mx-auto grid w-full max-w-[760px] grid-cols-12 grid-rows-12 gap-3 lg:h-[560px]">
          <div className="relative col-span-7 row-span-9 overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-[0_28px_70px_rgba(37,27,32,.24)] lg:rotate-[-2deg]">
            <Image src={visual(0)} alt="Univers Perfect Models Management" fill priority sizes="(max-width: 1024px) 58vw, 36vw" className="object-cover" />
          </div>
          <div className="relative col-span-5 row-span-6 mt-8 overflow-hidden rounded-[1.6rem] border border-white/20 bg-white/10 shadow-[0_20px_55px_rgba(37,27,32,.18)] lg:rotate-[2.5deg]">
            <Image src={visual(1)} alt="Création et talents Perfect Models Management" fill sizes="(max-width: 1024px) 42vw, 25vw" className="object-cover" />
          </div>
          <div className="relative col-span-5 row-span-6 overflow-hidden rounded-[1.6rem] border border-white/20 bg-white/10 shadow-[0_20px_55px_rgba(37,27,32,.18)] lg:-translate-y-3 lg:rotate-[-1.5deg]">
            <Image src={visual(2)} alt="Mode et production Perfect Models Management" fill sizes="(max-width: 1024px) 42vw, 25vw" className="object-cover" />
          </div>
          <div className="col-span-7 row-span-3 flex items-end rounded-[1.6rem] border border-white/15 bg-white/10 p-5 backdrop-blur-md lg:translate-x-6">
            <div className="flex w-full items-end justify-between gap-4">
              <div><p className="text-[8px] font-black uppercase tracking-[.28em] opacity-60">Perfect Models Management</p><p className="mt-2 font-playfair text-2xl font-semibold">Talent · Image · Culture</p></div>
              <span className="font-playfair text-5xl italic opacity-45">PMM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
