export const metadata = { title: 'Politique de confidentialité | Perfect Models Management' };

const sections = [
  ['01', 'Données collectées', 'Perfect Models Management collecte uniquement les informations utiles à la gestion des candidatures, bookings, formations, communications et comptes utilisateurs. Selon le formulaire utilisé, ces données peuvent inclure des coordonnées, mensurations, photos et informations professionnelles.'],
  ['02', 'Utilisation des don~ées', 'Ces informations permettent d’examiner les candidatures, gérer les profils représentés, répondre aux demandes, organiser les prestations et assurer le fonctionnement des espaces privés.'],
  ['03', 'Stockage et sécurité', 'Les informations transmises sont conservées dans l’infrastructure sécurisée utilisée par l’agence. Les images peuvent être hébergées auprès d’un prestataire spécialisé et reliées au dossier correspondant.'],
  ['04', 'Vos droits', 'Vous pouvez demander l’accès, la rectification ou la suppression des informations vous concernant en contactant Perfect Models Management via la page Contact.'],
];

export default function Page() {
  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <section className="border-b border-black/10 px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="editorial-kicker text-pm-wine">Informations légales</p>
          <h1 className="mt-5 max-w-5xl font-playfair text-[clamp(3.4rem,8vw,7rem)] font-black italic leading-[.88] tracking-[-.04em]">Politique de confidentialité</h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-black/50">Comment Perfect Models Management collecte, utilise et protège les informations transmises sur le site.</p>
        </div>
      </section>
      <article className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-20">
        <div className="grid border-t border-black/15 md:grid-cols-2">
          {sections.map(([number, title, text]) => (
            <section key={number} className="border-b border-black/15 py-8 md:border-l md:px-8 md:py-10">
              <div className="flex items-baseline justify-between gap-5"><h2 className="font-playfair text-2xl font-bold sm:text-3xl">{title}</h2><span className="text-[8px] font-black tracking-[.22em] text-pm-wine/50">{number}</span></div>
              <p className="mt-5 text-sm leading-8 text-black/55">{text}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
