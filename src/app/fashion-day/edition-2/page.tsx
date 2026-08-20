import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDaysIcon, MapPinIcon, ClockIcon, SparklesIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = buildPageMetadata({
  title: 'Perfect Fashion Day — Édition 2 | L’Art de se Révéler',
  description:
    'Programme officiel et rapport général de production de la 2e édition du Perfect Fashion Day, L’Art de se Révéler, le 31 janvier 2026 à la Gare du Nord, Libreville.',
  keywords: ['Perfect Fashion Day', 'PFD 2026', 'L’Art de se Révéler', 'Perfect Models Management', 'mode Gabon'],
});

const blocks = [
  {
    time: '20H15',
    label: 'BLOC 1',
    title: 'L’ÉCLOSION',
    theme: 'Diversité et Nouvelle Vision',
    items: [
      ['01', 'NAJMI', 'Groupe 1'],
      ['02', 'OXZA LONE', 'Groupe 2'],
      ['03', 'MAËVA CRÉATIONS', 'Groupe 3 · Accessoires perles'],
    ],
  },
  {
    time: '21H00',
    label: 'BLOC 2',
    title: 'L’AFFIRMATION',
    theme: 'Caractère et Technique',
    items: [
      ['04', 'VENTEX', 'Groupe 1 · Urbain'],
      ['05', 'MIGUEL FASHION STYLE', 'Groupe 2 · Sur-mesure'],
      ['06', 'TITO STYLE', 'Groupe 3 · Incontournable'],
    ],
  },
  {
    time: '21H45',
    label: 'BLOC 3',
    title: 'LE SACRE & FINAL',
    theme: 'Vision Singulière et Apothéose',
    items: [
      ['07', 'RAB’S COLLECTION', 'Groupe 1'],
      ['08', 'CYRLIE FASHION', 'Groupe 2 · Retour Ouaga'],
    ],
  },
];

const interludes = [
  {
    time: '20H40',
    title: 'Racines & Modernité',
    items: [
      ['GROUPE ESSI NGOMANE', 'Tradition · Ambiance solennelle et culturelle'],
      ['LÉO', 'Transition pop moderne · Pop / Variété'],
    ],
  },
  {
    time: '21H25',
    title: 'L’Ambiance',
    items: [
      ['TRACY MC', 'Flow urbain'],
      ['EVAN’S', 'Show festif'],
    ],
  },
];

const staff = [
  ['Animation', 'Lady Riaba'],
  ['Direction artistique', 'Fave Glao'],
  ['Assistance DA', 'AJ Caramela & Sephora'],
  ['Régie backstage', 'Perfect Models Management'],
  ['Coiffure', 'Fave Glao'],
  ['Make-up', 'AJ Caramela & Anna'],
];

const partners = [
  ['Hôtellerie', 'Yarden Hotel'],
  ['Média & visuel', 'Legrand TV'],
  ['Média & visuel', 'Darain Visuals'],
  ['Sponsor', 'Symbiose'],
  ['Sponsor', 'Vitri Clean'],
  ['Beauté', 'Indi Hair'],
];

const runningOrder = [
  ['20H00', 'Ouverture', 'La Fabrique d’une Étoile · scène des divinités · audio off'],
  ['20H15', 'Bloc 1', 'Najmi → Oxza Lone → Maëva Créations'],
  ['20H40', 'Interlude 1', 'Essi Ngomane → Léo'],
  ['21H00', 'Bloc 2', 'Ventex → Miguel Fashion Style → Tito Style'],
  ['21H25', 'Interlude 2', 'Tracy MC → Evan’s'],
  ['21H45', 'Bloc 3', 'Rab’s Collection → Cyrlie Fashion'],
  ['21H55', 'Pré-final', 'Mirage · montée en puissance vocale'],
  ['22H05', 'Grand final', 'Edele A · collection événement'],
  ['22H20', 'Clôture', 'Trophée JOEL · Révélation Mannequin 2025'],
];

export default function PFD2026ProductionPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${SITE_URL}/fashion-day/edition-2#event`,
    name: 'Perfect Fashion Day — Édition 2 : L’Art de se Révéler',
    startDate: '2026-01-31T20:00:00+01:00',
    endDate: '2026-01-31T22:20:00+01:00',
    eventStatus: 'https://schema.org/EventCompleted',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'Gare du Nord',
      address: { '@type': 'PostalAddress', addressLocality: 'Libreville', addressCountry: 'GA' },
    },
    organizer: { '@type': 'Organization', name: 'Perfect Models Management', url: SITE_URL },
    url: `${SITE_URL}/fashion-day/edition-2`,
  };

  return (
    <main className="min-h-screen bg-pm-dark text-pm-off-white">
      <JsonLd data={schema} />

      <section className="relative overflow-hidden border-b border-white/10 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,175,55,0.18),transparent_38%)]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-8 lg:px-10 lg:pb-28">
          <Link href="/fashion-day" className="text-[10px] font-black uppercase tracking-[0.35em] text-pm-gold/70 hover:text-pm-gold">← Perfect Fashion Day</Link>
          <div className="mt-10 max-w-5xl">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-pm-gold">2e édition · Rapport général de production</p>
            <h1 className="mt-4 font-playfair text-6xl font-black italic leading-[0.9] text-white sm:text-8xl lg:text-[9rem]">L’Art de se Révéler</h1>
            <p className="mt-8 max-w-2xl text-base leading-8 text-white/50 sm:text-lg">Une odyssée théâtrale du passage de l’ombre à la lumière, de la chrysalide au papillon.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <Info icon={CalendarDaysIcon} label="Date" value="Samedi 31 janvier 2026" />
            <Info icon={MapPinIcon} label="Lieu" value="Gare du Nord · Libreville" />
            <Info icon={UserGroupIcon} label="Cible / capacité" value="VIP · Presse · Influenceurs · 150 pax" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="eyebrow">Identité & vision</p>
            <h2 className="heading">Une révélation en trois actes.</h2>
            <p className="mt-6 max-w-3xl text-white/50 leading-8">Le PFD transforme le défilé en spectacle narratif : une progression de l’éclosion vers l’affirmation, puis le sacre. Le langage visuel repose sur le noir et l’or, entre prestige, mystère et révélation.</p>
          </div>
          <div className="grid gap-3">
            <Fact label="Concept" value="De l’ombre à la lumière · chrysalide → papillon" />
            <Fact label="Format" value="Défilé-spectacle · 3 blocs narratifs + ouverture scénographique" />
            <Fact label="Code couleur" value="Noir & Or · Prestige · Mystère · Révélation" />
            <Fact label="Organisation" value="Perfect Models Management" />
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-black/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <p className="eyebrow">20H00</p>
          <h2 className="heading">La Fabrique d’une Étoile</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Card title="Scénographie" text="Théâtralisation visuelle de la métamorphose d’un mannequin. Aucun chanteur : jeu d’acteur uniquement." />
            <Card title="Casting scène" text="1 Fille Landa en tenue de ville · 1 Mannequin Star en tenue de soirée · 4 Divinités représentant l’Agence, le Partenaire, le Styliste et la FEGAMOD." />
            <Card title="Audio" text="Bande son instrumentale épique + voix off de Lady Riaba." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="flex items-end justify-between gap-6">
          <div><p className="eyebrow">Programmation artistique</p><h2 className="heading">Les trois actes.</h2></div>
          <SparklesIcon className="hidden h-12 w-12 text-pm-gold/30 sm:block" />
        </div>
        <div className="mt-12 space-y-6">
          {blocks.map((block) => (
            <article key={block.label} className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><p className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold">{block.time} · {block.label}</p><h3 className="mt-2 font-playfair text-4xl font-black sm:text-5xl">{block.title}</h3><p className="mt-2 text-sm text-white/40">{block.theme}</p></div>
                <span className="rounded-full border border-pm-gold/20 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-pm-gold">Runway</span>
              </div>
              <div className="mt-7 grid gap-3 md:grid-cols-3">
                {block.items.map(([number, name, detail]) => <div key={number} className="border border-white/10 p-5"><span className="text-xs font-black text-pm-gold/60">{number}</span><h4 className="mt-2 font-playfair text-xl font-bold">{name}</h4><p className="mt-1 text-xs uppercase tracking-wider text-white/35">{detail}</p></div>)}
              </div>
              {block.label === 'BLOC 1' && <p className="mt-6 text-xs text-white/35">Note modèles : pantalon noir + T-shirt PMM obligatoire.</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/5 bg-black/20 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <p className="eyebrow">Interludes</p><h2 className="heading">Rythme, racines & montée en puissance.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {interludes.map((item) => <article key={item.time} className="rounded-2xl border border-white/10 p-6 sm:p-8"><span className="text-[10px] font-black tracking-[0.35em] text-pm-gold">{item.time}</span><h3 className="mt-2 font-playfair text-3xl font-black">{item.title}</h3><div className="mt-6 space-y-3">{item.items.map(([name, detail]) => <div key={name} className="border-l border-pm-gold/30 pl-4"><p className="font-playfair text-lg font-bold">{name}</p><p className="text-sm text-white/40">{detail}</p></div>)}</div></article>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2">
          <div><p className="eyebrow">Pré-final & grand final</p><h2 className="heading">L’Apothéose.</h2><div className="mt-8 space-y-5"><Card title="21H55 · MIRAGE" text="Show pré-final. Montée en puissance vocale, puis transition en lumière or plein feux." /><Card title="22H05 · EDELE A" text="Invitée d’honneur · collection événement · salut final de tous les créateurs." /></div></div>
          <div><p className="eyebrow">Clôture & protocole</p><h2 className="heading">22H20</h2><div className="mt-8 rounded-2xl border border-pm-gold/20 bg-pm-gold/5 p-7"><p className="font-playfair text-2xl font-bold text-pm-gold">Trophée JOEL</p><p className="mt-3 text-white/50 leading-7">Remise du trophée « Révélation Mannequin 2025 », suivie de l’invitation à l’After-Show VIP.</p></div></div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-black/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <p className="eyebrow">Production</p><h2 className="heading">Staff clé</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{staff.map(([role, person]) => <div key={role} className="rounded-xl border border-white/10 p-5"><p className="text-[9px] font-black uppercase tracking-[0.3em] text-pm-gold/60">{role}</p><p className="mt-2 font-playfair text-xl font-bold">{person}</p></div>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <p className="eyebrow">Partenaires officiels</p><h2 className="heading">Ils accompagnent le PFD.</h2>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{partners.map(([type, name]) => <div key={`${type}-${name}`} className="rounded-xl border border-white/10 p-5"><p className="text-[9px] font-black uppercase tracking-[0.3em] text-pm-gold/60">{type}</p><p className="mt-2 font-playfair text-xl font-bold">{name}</p></div>)}</div>
      </section>

      <section className="bg-pm-gold py-16 text-pm-dark sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50">Régie</p><h2 className="mt-2 font-playfair text-5xl font-black italic sm:text-7xl">Running Order</h2>
          <div className="mt-10 overflow-hidden rounded-2xl border border-pm-dark/10 bg-white/20">
            {runningOrder.map(([time, label, detail], index) => <div key={`${time}-${label}`} className={`grid gap-2 px-5 py-5 sm:grid-cols-[100px_180px_1fr] sm:items-center ${index ? 'border-t border-pm-dark/10' : ''}`}><span className="font-black tracking-widest">{time}</span><strong className="font-playfair text-lg">{label}</strong><span className="text-sm opacity-70">{detail}</span></div>)}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black py-12 text-center">
        <p className="font-playfair text-2xl font-bold text-white">Perfect Models Management</p>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/30">Perfect Fashion Day · Édition 2 · L’Art de se Révéler</p>
        <Link href="/fashion-day" className="mt-6 inline-block text-xs font-black uppercase tracking-widest text-pm-gold hover:underline">Voir toutes les éditions</Link>
      </footer>
    </main>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof CalendarDaysIcon; label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5"><Icon className="h-5 w-5 text-pm-gold" /><p className="mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/30">{label}</p><p className="mt-1 font-playfair text-lg font-bold">{value}</p></div>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="border-l border-pm-gold/30 pl-4"><p className="text-[9px] font-black uppercase tracking-[0.3em] text-pm-gold/50">{label}</p><p className="mt-1 text-sm leading-6 text-white/55">{value}</p></div>;
}

function Card({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.025] p-6"><h3 className="font-playfair text-2xl font-bold text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-white/45">{text}</p></div>;
}
