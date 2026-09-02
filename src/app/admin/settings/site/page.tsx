import { redirect } from 'next/navigation';
import SiteSettingsManager from '@/components/admin/SiteSettingsManager';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';

export default async function AdminSiteSettingsPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/settings/site');
  if (profile.role !== 'admin') redirect(profile.role === 'manager' ? '/manager' : '/profil');

  return <div className="space-y-6">
    <section className="overflow-hidden rounded-[2rem] bg-pm-peach p-6 sm:p-9 lg:p-11">
      <p className="text-[9px] font-black uppercase tracking-[.25em] text-pm-coral">Configuration dynamique</p>
      <h1 className="mt-3 max-w-5xl font-playfair text-5xl font-semibold leading-[.9] sm:text-6xl">Modifier le site sans toucher au code.</h1>
      <p className="mt-5 max-w-3xl text-sm leading-7 text-pm-ink/58">Identité, coordonnées et SEO disposent de formulaires dédiés. Tous les autres paramètres de <code>site_settings</code> restent accessibles dans l’éditeur avancé, afin qu’une nouvelle configuration puisse être ajoutée sans reconstruire le back-office.</p>
    </section>
    <SiteSettingsManager />
  </div>;
}
