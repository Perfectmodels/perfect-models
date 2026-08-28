export const metadata = { title: 'Conditions d’utilisation | Perfect Models Management' };

const sections = [
  ['01', 'Objet du site', 'Le site présente les activités de Perfect Models Management et permet notamment de consulter des contenus publics, déposer des candidatures, envoyer des demandes et accéder à des espaces privés.'],
  ['02', 'Comptes et accès privés', 'Les identifiants d’accès sont personnels. Toute utilisation frauduleuse, partage non autorisé ou tentative de contournement des droits d’accès peut entraîner la suspension du compte.'],
  ['03', 'Candidatures et contenus', 'L’envoi d’une candidature ne garantit pas une sélection. L’utilisateur déclare disposer des droits nécessaires sur les informations et médias qu’il transmet.'],
  ['04', 'Propriété intellectuelle', 'Les marques, textes, visuels, interfaces et contenus éditoriaux du site ne peuvent être reproduits ou exploités sans autorisation lorsqu’ils sont protégés.'],
];

export default function Page() {
  return (
    <main className="min-h-screen bg-pm-dark text-pm-off-white">
      <section className="border-b border-white/10 px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="editorial-kicker text-pm-gold">Informations légales</p>
          <h1 className="mt-5 max-w-5xl font-playfair text-[clamp(3.4rem,8vw,7rem)] font-black italic leading-[.88] tracking-[-.04em]">Conditions d’utilisation</h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/45">Les règles essentielles qui encadrent l’utilisation du site et des services numériques Perfect Models Management.</p>
        </div>
      </section>
      <article className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-20">
        <div className="grid border-t border-white/12 md:grid-cols-2">
          {sections.map(([number, title, text]) => (
            <section key={number} className="border-b border-white/12 py-8 md:border-l md:px-8 md:py-10">
              <div className="flex items-baseline justify-between gap-5"><h2 className="font-playfair text-2xl font-bold sm:text-3xl">{title}</h2><span className="text-[8px] font-black tracking-[.22em] text-pm-gold/50">{number}</span></div>
              <p className="mt-5 text-sm leading-8 text-white/50">{text}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
