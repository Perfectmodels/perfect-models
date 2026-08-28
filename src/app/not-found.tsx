import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-[70svh] place-items-center bg-pm-dark px-5 py-16 text-pm-off-white">
      <section className="mx-auto max-w-3xl text-center">
        <p className="editorial-kicker text-pm-gold">Erreur 404</p>
        <h1 className="mt-5 font-playfair text-[clamp(4.5rem,14vw,10rem)] font-black italic leading-[.8] tracking-[-.06em]">Hors cadre.</h1>
        <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-white/45">La page que vous recherchez n’existe plus ou a été déplacée.</p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="pmm-button border-pm-gold bg-pm-gold text-black hover:bg-pm-gold-light">Retour à l’accueil</Link>
          <Link href="/contact" className="pmm-button pmm-button--ghost">Nous contacter</Link>
        </div>
      </section>
    </main>
  );
}
