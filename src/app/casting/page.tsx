import Link from 'next/link';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const metadata = buildPageMetadata(MARKETING_PAGES.casting);

const steps = [
  ['01', 'Candidature en ligne', 'Renseignez vos informations, mensurations, expérience et photos récentes.'],
  ['02', 'Étude du profil', 'L’équipe examine directement le dossier enregistré dans Supabase.'],
  ['03', 'Convocation', 'Les profils retenus reçoivent les informations du casting physique.'],
  ['04', 'Intégration', 'Les candidats acceptés peuvent être rattachés à un profil mannequin et à Supabase Auth.'],
];

export default function Page() {
  return (
    <main className="min-h-screen bg-pm-dark text-pm-off-white">
      <section className="border-b border-white/10 bg-black px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="mx-auto max-w-7xl"><p className="text-[9px] font-black uppercase tracking-[.38em] text-pm-gold">Casting Perfect Models Management</p><h1 className="mt-5 max-w-5xl font-playfair text-6xl font-black italic leading-[.9] sm:text-8xl">Votre carrière commence par un profil réel.</h1><p className="mt-7 max-w-2xl text-base leading-8 text-white/45">Aucune fiche de démonstration : chaque candidature est enregistrée dans la base de production et suivie depuis le back-office de l’agence.</p><Link href="/casting-formulaire" className="mt-8 inline-flex bg-pm-gold px-6 py-4 text-[10px] font-black uppercase tracking-[.2em] text-black">Déposer ma candidature</Link></div></section>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24"><div className="grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-4">{steps.map(([number,title,description]) => <article key={number} className="bg-pm-dark p-7"><span className="font-playfair text-4xl text-pm-gold/35">{number}</span><h2 className="mt-8 font-playfair text-2xl font-bold">{title}</h2><p className="mt-4 text-sm leading-7 text-white/40">{description}</p></article>)}</div></section>
    </main>
  );
}
