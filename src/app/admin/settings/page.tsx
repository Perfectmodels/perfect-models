import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';

const PUBLIC_PAGES = [
  ['Accueil', '/'], ['Agence', '/agence'], ['Mannequins', '/mannequins'], ['Services', '/services'],
  ['Journal', '/blog'], ['Contact', '/contact'], ['Fashion Day', '/fashion-day'], ['Galerie', '/galerie'],
];

const SETTINGS = [
  { href: '/admin/settings/navigation', title: 'Navigation', description: 'Ordre, libellés et visibilité des liens du site public.', kicker: 'Structure du site' },
  { href: '/admin/settings/content', title: 'Contenus structurés', description: 'Blocs éditoriaux publics qui ne disposent pas encore de leur propre module métier.', kicker: 'Contenu' },
  { href: '/admin/settings/social', title: 'Réseaux sociaux', description: 'Liens officiels affichés dans le site et les zones de contact.', kicker: 'Présence digitale' },
  { href: '/admin/settings/site', title: 'Configuration générale', description: 'Paramètres techniques et valeurs globales stockées dans site_settings.', kicker: 'Configuration' },
  { href: '/admin/settings/profiles', title: 'Profils & rôles', description: 'Comptes applicatifs, rôles et rattachements à Supabase Auth.', kicker: 'Accès' },
];

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/settings');
  if (profile.role !== 'admin') redirect(profile.role === 'manager' ? '/manager' : '/profil');

  return <section className="text-pm-ink">
    <div className="mx-auto max-w-[1450px] space-y-7">
      <section className="overflow-hidden rounded-[2.2rem] bg-pm-peach p-6 sm:p-9 lg:p-11">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div><p className="text-[9px] font-black uppercase tracking-[.26em] text-pm-coral">Paramètres · Perfect Models Management</p><h1 className="mt-3 font-playfair text-5xl font-semibold leading-[.9] sm:text-6xl">Piloter le site comme il est réellement construit.</h1><p className="mt-5 max-w-3xl text-sm leading-7 text-pm-ink/58">Les réglages sont organisés autour du site public et de ses usages. Les outils techniques restent accessibles, mais ils ne dictent plus la navigation de cette section.</p></div>
          <div className="rounded-[1.7rem] bg-white/65 p-5"><p className="text-[9px] font-black uppercase tracking-[.18em] text-pm-wine">Pages publiques</p><div className="mt-4 flex flex-wrap gap-2">{PUBLIC_PAGES.map(([label, path]) => <Link key={path} href={path} target="_blank" className="rounded-full border border-pm-ink/10 bg-white px-3 py-2 text-[9px] font-bold text-pm-ink/55 transition hover:border-pm-coral hover:text-pm-wine">{label} ↗</Link>)}</div></div>
        </div>
      </section>

      <Link href="/admin/settings/visuals" className="group block overflow-hidden rounded-[2.2rem] bg-pm-wine p-6 text-white shadow-[0_24px_70px_rgba(125,31,77,.16)] transition hover:-translate-y-0.5 sm:p-9 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-end"><div><p className="text-[9px] font-black uppercase tracking-[.25em] text-pm-gold-light">Site public · Images & visuels</p><h2 className="mt-3 font-playfair text-4xl font-semibold sm:text-5xl">Modifier chaque image, page par page.</h2><p className="mt-5 max-w-3xl text-sm leading-7 text-white/62">Héros, mosaïques, bandeaux et images de section sont cartographiés selon leur emplacement réel. Sélectionnez un média, publiez-le immédiatement et revenez à la source automatique à tout moment.</p></div><div className="rounded-[1.5rem] bg-white/10 p-5"><p className="font-playfair text-5xl font-semibold text-pm-gold-light">30+</p><p className="mt-2 text-[9px] font-black uppercase tracking-[.18em] text-white/55">Emplacements visuels contrôlables</p><span className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-[9px] font-black uppercase tracking-[.1em] text-pm-wine">Ouvrir le contrôle visuel →</span></div></div>
      </Link>

      <section className="rounded-[2rem] border border-pm-ink/[.08] bg-white/70 p-6 sm:p-8"><div className="grid gap-6 lg:grid-cols-[.55fr_1.45fr]"><div><p className="text-[9px] font-black uppercase tracking-[.22em] text-pm-coral">Réglages complémentaires</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Structure, contenu et accès.</h2><p className="mt-4 text-sm leading-6 text-pm-ink/45">Ces paramètres soutiennent le site sans mélanger la gestion visuelle avec les tables techniques.</p></div><div className="grid gap-3 sm:grid-cols-2">{SETTINGS.map((item) => <Link key={item.href} href={item.href} className="rounded-[1.5rem] border border-pm-ink/[.08] bg-pm-ivory p-5 transition hover:border-pm-coral/35 hover:bg-pm-peach/55"><p className="text-[8px] font-black uppercase tracking-[.16em] text-pm-coral">{item.kicker}</p><h3 className="mt-2 font-playfair text-2xl font-semibold text-pm-wine">{item.title}</h3><p className="mt-3 text-xs leading-5 text-pm-ink/48">{item.description}</p><span className="mt-4 inline-flex text-[9px] font-black uppercase tracking-[.1em] text-pm-wine">Ouvrir →</span></Link>)}</div></div></section>
    </div>
  </section>;
}
