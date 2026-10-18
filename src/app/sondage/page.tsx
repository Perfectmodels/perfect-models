import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sondage anonyme | Votre voix compte | Perfect Models Management',
  description: 'Donnez anonymement votre avis sur Perfect Models Management. Participez au sondage et consultez publiquement les résultats et témoignages.',
  alternates: { canonical: '/sondage' },
  openGraph: {
    title: 'Votre voix compte — Sondage anonyme Perfect Models Management',
    description: 'Ce qui fonctionne, ce qui doit changer. Donnez votre avis anonymement et consultez les résultats publics.',
    url: 'https://perfectmodels.online/sondage',
  },
};

const themes = [
  ['01', 'Le fonctionnement', 'Organisation, communication, décisions et transparence.'],
  ['02', 'Les personnes', 'Accompagnement, conditions de collaboration, écoute et respect.'],
  ['03', 'Les perspectives', 'Opportunités, événements, qualité des services et améliorations.'],
];

export default function SurveyHubPage() {
  return <main className="min-h-screen bg-[#F8F6F1] text-[#171717]">
    <section className="relative isolate overflow-hidden bg-[#151515] px-5 py-16 text-white sm:py-24 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full bg-[#C5A467]/10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        <p className="text-[10px] font-extrabold uppercase tracking-[.3em] text-[#CFB17E]">Perfect Models Management · Sondage public</p>
        <h1 className="mt-6 max-w-5xl font-playfair text-[clamp(3.5rem,8vw,7rem)] font-semibold leading-[.92]">
          Votre voix <em className="text-[#CFB17E]">compte.</em>
        </h1>
        <p className="mt-7 max-w-3xl text-base leading-8 text-white/75 sm:text-lg">Une agence se construit aussi avec les critiques. Dites-nous ce qui fonctionne, ce qui pose problème et ce qu’il faut changer. Le questionnaire est anonyme et les résultats sont consultables par tous.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/sondage/participer" className="inline-flex min-h-14 items-center rounded-full bg-[#C5A467] px-8 text-sm font-extrabold text-black hover:bg-[#E0C38B]">Répondre au sondage ↗</Link>
          <Link href="/sondage/resultats" className="inline-flex min-h-14 items-center rounded-full border border-white/35 px-8 text-sm font-bold text-white hover:border-[#C5A467]">Voir les résultats publics →</Link>
        </div>
        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/65"><span>Sans compte</span><span>Aucun nom ni email demandé</span><span>Statistiques publiques</span><span>Commentaires publiés automatiquement</span></div>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#9A783F]">Pourquoi participer ?</p>
      <h2 className="mt-3 max-w-4xl font-playfair text-4xl font-semibold leading-tight sm:text-5xl">Une démarche de transparence, pas un questionnaire de façade.</h2>
      <div className="mt-9 grid gap-4 md:grid-cols-3">
        {themes.map(([number,title,description])=><article key={number} className="rounded-2xl border border-black/10 bg-white p-7">
          <span className="text-xs font-black text-[#A07B42]">{number}</span>
          <h3 className="mt-6 font-playfair text-2xl font-semibold">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-black/60">{description}</p>
        </article>)}
      </div>
    </section>

    <section className="bg-[#ECE5D9] px-5 py-16 sm:py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl"><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#9A783F]">Des avis visibles par tous</p><h2 className="mt-3 font-playfair text-4xl font-semibold">Des résultats publics, sans tri des critiques.</h2>
          <p className="mt-4 text-sm leading-8 text-black/65">Les réponses et leurs pourcentages sont calculés automatiquement. Les textes libres sont publiés sans approbation après masquage automatique de certaines coordonnées. Pour limiter l’identification des répondants, leur affichage commence dès cinq participations, et les résultats d’une question sont visibles dès cinq réponses à celle-ci.</p></div>
        <Link href="/sondage/resultats" className="inline-flex min-h-14 shrink-0 items-center justify-center rounded-full bg-[#171717] px-7 text-sm font-bold text-white">Accéder aux statistiques ↗</Link>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <h2 className="font-playfair text-4xl">Exprimez-vous librement.</h2>
      <p className="mt-4 max-w-3xl text-sm leading-8 text-black/60">Les textes soumis sont destinés à être publiés. N’y indiquez aucun nom, adresse, numéro, information médicale ou détail qui pourrait identifier quelqu’un. Le masquage automatique des coordonnées ne peut pas garantir à lui seul l’anonymat d’un texte libre.</p>
      <Link href="/sondage/participer" className="mt-8 inline-flex min-h-14 items-center rounded-full bg-[#171717] px-8 text-sm font-bold text-white">Participer maintenant →</Link>
    </section>
  </main>;
}
