import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';

const SECTIONS = [
  { href: '/admin/settings/site', title: 'Configuration générale', description: 'Paramètres structurés du site dans site_settings.' },
  { href: '/admin/settings/social', title: 'Réseaux sociaux', description: 'Liens sociaux officiels stockés dans social_links.' },
  { href: '/admin/settings/navigation', title: 'Navigation', description: 'Menus et liens de navigation normalisés.' },
  { href: '/admin/settings/content', title: 'Contenus', description: 'Blocs de contenus publics stockés dans content_blocks.' },
  { href: '/admin/settings/profiles', title: 'Profils & rôles', description: 'Profils applicatifs reliés à Supabase Auth.' },
];

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/settings');
  if (profile.role !== 'admin') redirect(profile.role === 'manager' ? '/manager' : '/profil');

  return (
    <section className="text-pm-ink">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pm-coral">Configuration Supabase</p>
        <h1 className="mt-2 font-playfair text-4xl font-semibold md:text-5xl">Paramètres</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-pm-ink/45">Chaque domaine possède sa table Supabase et son interface Next.js dédiée.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {SECTIONS.map(section => (
            <Link key={section.href} href={section.href} className="rounded-[1.7rem] border border-pm-ink/[.08] bg-white/75 p-6 shadow-[0_18px_50px_rgba(91,46,37,.06)] transition hover:-translate-y-1 hover:border-pm-coral/35">
              <h2 className="font-playfair text-2xl font-semibold text-pm-wine">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-pm-ink/45">{section.description}</p>
              <span className="mt-5 inline-block text-[9px] font-black uppercase tracking-[0.2em] text-pm-coral">Ouvrir →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
