import { redirect } from 'next/navigation';
import UserAccessManager from '@/components/admin/UserAccessManager';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';

export default async function AdminProfilesSettingsPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/settings/profiles');
  if (profile.role !== 'admin') redirect(profile.role === 'manager' ? '/manager' : '/profil');

  return <div className="space-y-6">
    <section className="rounded-[2rem] bg-pm-wine p-6 text-white sm:p-9 lg:p-11">
      <p className="text-[9px] font-black uppercase tracking-[.25em] text-pm-gold-light">Administration · Comptes</p>
      <h1 className="mt-3 max-w-5xl font-playfair text-5xl font-semibold leading-[.9] sm:text-6xl">Attribuer les rôles sans recréer les utilisateurs.</h1>
      <p className="mt-5 max-w-3xl text-sm leading-7 text-white/62">Un compte existant peut devenir administrateur, manager, mannequin, jury ou membre de l’équipe. Les rôles privilégiés sont synchronisés avec Supabase Auth et les managers peuvent recevoir des permissions module par module.</p>
    </section>
    <UserAccessManager />
  </div>;
}
