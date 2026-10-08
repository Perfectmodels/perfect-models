import type { Metadata } from 'next';
import Link from 'next/link';
import { selectPublicRows } from '@/lib/public-content';

export const metadata: Metadata = {
  title: 'PERFECT MODEL — Édition 01 | Galerie',
  description: 'Une édition mode consacrée à l’attitude, au regard, au mouvement et à l’expression des mannequins. Perfect Models Management.',
};
export const revalidate = 60;

const chapters = [
  {
    title: 'L’attitude avant tout',
    kicker: 'L’art de poser',
    quote: 'Le mannequin ne cherche pas seulement une belle pose : il habite l’image.',
    paragraphs: [
      'Dans le monde du modèle photo, tout commence par l’attitude. Avant même de regarder la tenue ou le maquillage, l’objectif capte une énergie. Un regard assuré, un geste suspendu ou une posture maîtrisée peuvent transformer une simple présence en véritable image de mode.',
      'Le mannequin ne cherche pas seulement une belle pose : il habite l’image. Le corps devient un moyen d’expression et chaque mouvement participe à l’histoire imaginée par le photographe et la direction artistique.',
    ],
  },
  {
    title: 'Le détail qui captive le regard',
    kicker: 'Le sens du détail',
    quote: 'Un détail peut devenir le véritable sujet de l’image.',
    paragraphs: [
      'Dans une photographie de mode, le visage n’est pas toujours le centre de l’attention. Une chaussure, une jambe, un bijou ou un détail du vêtement peut devenir le véritable sujet de l’image.',
      'Savoir mettre en valeur un détail demande de la précision. Le mannequin doit comprendre comment orienter son corps, créer une ligne et laisser suffisamment d’espace pour que le regard du spectateur trouve naturellement le point fort de la photographie.',
    ],
  },
  {
    title: 'La force du collectif',
    kicker: 'Éditorial collectif',
    quote: 'Chaque modèle doit exister sans effacer les autres.',
    paragraphs: [
      'En photographie de mode, le collectif ouvre une autre dimension de l’image. Plusieurs silhouettes, plusieurs personnalités et plusieurs univers peuvent pourtant composer une seule scène. Ici, les couleurs, les matières et les attitudes se répondent pour créer une véritable identité visuelle.',
      'La force d’une photo de groupe repose sur l’équilibre. Chaque modèle doit exister sans effacer les autres. Les placements, les regards et les niveaux créent une composition vivante, où la mode devient une histoire racontée à plusieurs.',
    ],
  },
  {
    title: 'Le regard comme signature',
    kicker: 'Expression',
    quote: 'Face à l’objectif, le modèle doit transmettre une intention.',
    paragraphs: [
      'Le regard est l’un des outils les plus puissants du mannequin. Il peut être direct, mystérieux, doux, distant ou provocateur. Sans prononcer un seul mot, il peut donner une direction émotionnelle à toute une photographie.',
      'Face à l’objectif, le modèle ne doit pas simplement regarder l’appareil. Il doit transmettre une intention. C’est cette capacité à donner du sens à une expression qui permet à une image de rester dans la mémoire.',
    ],
  },
  {
    title: 'Quand les modèles racontent ensemble',
    kicker: 'Dialogue visuel',
    quote: 'Deux modèles doivent construire une seule image.',
    paragraphs: [
      'Le posing à plusieurs demande une autre forme d’écoute. Deux modèles doivent construire une seule image : leurs corps, leurs regards, leurs vêtements et leurs attitudes doivent dialoguer.',
      'La réussite ne consiste pas à chercher qui prendra le plus de place. Elle consiste à créer un équilibre. L’un peut apporter la force, l’autre la douceur ; l’un peut attirer le regard tandis que l’autre complète la composition.',
    ],
  },
  {
    title: 'L’élégance dans la simplicité',
    kicker: 'Minimalisme',
    quote: 'L’élégance naît souvent de cette maîtrise invisible.',
    paragraphs: [
      'Une image forte n’a pas toujours besoin d’un mouvement spectaculaire. Parfois, une silhouette calme, un visage légèrement tourné et une lumière bien maîtrisée suffisent à créer une présence remarquable.',
      'Cette apparente simplicité demande pourtant beaucoup de contrôle. Le mannequin doit connaître ses angles, maîtriser son expression et comprendre comment son corps réagit à la lumière. L’élégance naît souvent de cette maîtrise invisible.',
    ],
  },
  {
    title: 'La mode dans la ville',
    kicker: 'Fashion in the city',
    quote: 'Le décor devient une extension de l’expression.',
    paragraphs: [
      'Le décor peut devenir un partenaire à part entière du modèle. Ici, l’environnement urbain, les lignes de la passerelle et l’obscurité donnent à la silhouette une dimension presque cinématographique. Le mannequin ne se contente plus de poser : il entre dans un univers.',
      'Pour réussir ce type d’image, il faut savoir utiliser son environnement. Les rambardes, les lignes, les profondeurs et les contrastes peuvent renforcer la posture et donner du mouvement à une photographie. Le modèle apprend ainsi à faire du décor une extension de son expression.',
    ],
  },
  {
    title: 'L’attitude, c’est aussi le style',
    kicker: 'Culture du style',
    quote: 'Porter une tenue, c’est aussi lui donner une histoire.',
    paragraphs: [
      'Une tenue forte peut immédiatement imposer une personnalité. Mais c’est le mannequin qui lui donne véritablement vie. Les couleurs, les lunettes, la silhouette et le décor créent ici une esthétique assumée, entre mode, caractère et culture urbaine.',
      'Le modèle doit comprendre que le stylisme ne s’arrête pas aux vêtements. Une attitude, une démarche, un regard ou une façon de tenir un accessoire peuvent transformer complètement la perception d’un look. Porter une tenue, c’est aussi lui donner une histoire.',
    ],
  },
];

function findMagazineAsset(rows: Record<string, unknown>[], fileName: string) {
  return rows.find(row => String(row.file_name || '').toLowerCase() === fileName.toLowerCase());
}

export default async function PerfectModelEditionOne() {
  const rows = await selectPublicRows('media_library?select=id,url,file_name&url=not.is.null&order=created_at.desc&limit=200');
  const pdf = findMagazineAsset(rows, 'PERFECT_MODEL_Magazine_Premium_Edition_01.pdf');
  const cover = findMagazineAsset(rows, 'PERFECT_MODEL_Couverture_Edition_01.png');
  const pdfUrl = pdf?.url ? String(pdf.url) : null;
  const coverUrl = cover?.url ? String(cover.url) : null;

  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <section className="relative overflow-hidden bg-[#11100f] text-[#f7f2e8]">
        <div className="pointer-events-none absolute inset-0 opacity-50" style={{ background: 'radial-gradient(circle at 82% 21%, rgba(203,163,92,.23), transparent 37%)' }} />
        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-9 sm:px-8 sm:pb-24 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-5 border-b border-white/20 pb-7">
            <Link href="/galerie" className="text-[11px] font-bold uppercase tracking-[.23em] text-white/70 transition hover:text-white">← Retour à la galerie</Link>
            <span className="text-[10px] font-bold uppercase tracking-[.28em] text-[#d9bb85]">Perfect Models Management · Édition 01</span>
          </div>
          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_.92fr] lg:items-center lg:gap-16">
            <div>
              <p className="text-[11px] uppercase tracking-[.35em] text-[#d9bb85]">Édition mode · Portfolio éditorial</p>
              <h1 className="mt-6 font-playfair text-[clamp(4rem,9vw,8rem)] font-black italic leading-[.88] tracking-[-.05em]">PERFECT<br />MODEL</h1>
              <div className="mt-8 h-px w-20 bg-[#d9bb85]" />
              <h2 className="mt-8 max-w-lg font-playfair text-3xl italic leading-tight sm:text-4xl">L’attitude avant tout.</h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/65">Huit regards sur le métier de mannequin : une exploration de l’expression, du style, de la silhouette et de l’art de raconter une histoire à travers la mode.</p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a href="#sommaire" className="inline-flex min-h-12 items-center justify-center bg-[#d9bb85] px-7 text-[11px] font-extrabold uppercase tracking-[.19em] text-[#11100f] transition hover:bg-[#f1d7aa]">Lire l’édition</a>
                {pdfUrl && <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center border border-white/50 px-7 text-[11px] font-extrabold uppercase tracking-[.19em] text-white transition hover:bg-white/10">Magazine PDF ↗</a>}
              </div>
            </div>
            <div className="mx-auto w-full max-w-[430px]">
              {coverUrl ? (
                <img src={coverUrl} alt="Couverture originale du magazine Perfect Model, édition 01" className="aspect-[.707] w-full object-cover shadow-[24px_30px_60px_rgba(0,0,0,.45)]" />
              ) : (
                <div className="relative flex aspect-[.707] flex-col justify-between overflow-hidden border border-[#c5ae80]/35 bg-gradient-to-br from-[#27231f] via-[#141312] to-[#0a0a0a] p-7 shadow-[24px_30px_60px_rgba(0,0,0,.45)] sm:p-10">
                  <span className="text-[10px] font-bold uppercase tracking-[.36em] text-[#ddc394]">PMM / Fashion journal</span>
                  <div><span className="block font-playfair text-[clamp(3.6rem,8vw,6.5rem)] font-black italic leading-[.8] tracking-[-.08em] text-[#f7f2e8]">PERFECT<br />MODEL</span><span className="mt-7 block max-w-[270px] text-[11px] font-bold uppercase tracking-[.28em] leading-loose text-[#ddc394]">L’expression de la mode<br />L’attitude avant tout</span></div>
                  <div className="flex items-center justify-between border-t border-white/25 pt-5 text-[9px] uppercase tracking-[.28em] text-white/60"><span>Édition 01</span><span>Mode / Image / Attitude</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="sommaire" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <p className="editorial-kicker text-pm-wine">Dans cette édition</p>
        <h2 className="mt-4 font-playfair text-5xl font-black italic tracking-tight sm:text-6xl">Sommaire.</h2>
        <div className="mt-10 grid gap-x-12 border-t border-black/15 sm:grid-cols-2">
          {chapters.map((chapter, index) => (
            <a key={chapter.title} href={'#chapitre-' + (index + 1)} className="group flex items-center gap-5 border-b border-black/15 py-5">
              <span className="w-10 shrink-0 font-playfair text-3xl italic text-pm-wine">{String(index + 1).padStart(2, '0')}</span>
              <span className="flex-1 font-playfair text-xl font-semibold transition group-hover:text-pm-wine">{chapter.title}</span>
              <span aria-hidden="true" className="text-pm-wine">↗</span>
            </a>
          ))}
        </div>
      </section>

      <div className="border-t border-black/10">
        {chapters.map((chapter, index) => (
          <article key={chapter.title} id={'chapitre-' + (index + 1)} className={'scroll-mt-8 border-b border-black/10 px-5 py-20 sm:px-8 sm:py-28 lg:px-10 ' + (index % 2 ? 'bg-[#ece7dd]' : 'bg-pm-ivory')}>
            <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.65fr_1fr] lg:gap-20">
              <div className="lg:sticky lg:top-16 lg:self-start">
                <div className="font-playfair text-7xl font-black italic tracking-tight text-pm-wine/35 sm:text-8xl">{String(index + 1).padStart(2, '0')}</div>
                <p className="mt-6 text-[11px] font-bold uppercase tracking-[.28em] text-pm-wine">{chapter.kicker}</p>
                <h2 className="mt-4 max-w-lg font-playfair text-[clamp(2.8rem,5.5vw,5.1rem)] font-black italic leading-[.95] tracking-[-.04em]">{chapter.title}</h2>
              </div>
              <div className="flex flex-col justify-center">
                <blockquote className="border-l-2 border-pm-wine pl-6 font-playfair text-3xl italic leading-snug sm:pl-8 sm:text-4xl">“{chapter.quote}”</blockquote>
                <div className="mt-10 max-w-2xl space-y-6 text-base leading-[1.95] text-black/70 sm:text-lg">
                  {chapter.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                <div className="mt-12 text-[10px] font-bold uppercase tracking-[.25em] text-black/40">Perfect Model · Édition 01 / {String(index + 1).padStart(2, '0')}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
      <footer className="bg-[#11100f] px-5 py-16 text-center text-[#f7f2e8] sm:py-24">
        <p className="text-[10px] font-bold uppercase tracking-[.35em] text-[#d9bb85]">Fin de l’édition 01</p>
        <h2 className="mt-5 font-playfair text-5xl font-black italic sm:text-7xl">La mode est une attitude.</h2>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-white/60">Une publication de Perfect Models Management. Retrouvez nos autres projets et nos photographies dans la Galerie.</p>
        <Link href="/galerie" className="mt-9 inline-flex min-h-12 items-center justify-center border border-white/50 px-8 text-xs font-bold uppercase tracking-[.22em] transition hover:bg-white hover:text-black">Retour à la galerie</Link>
      </footer>
    </main>
  );
}
