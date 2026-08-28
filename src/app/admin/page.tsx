import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const cards = [
  ['Mannequins', 'models', '/admin/models'],
  ['Candidatures casting', 'casting_applications', '/admin/casting-applications'],
  ['Bookings', 'booking_requests', '/admin/bookings'],
  ['Fashion Day', 'fashion_day_events', '/admin/fashion-day-events'],
  ['Magazine', 'blog_posts', '/admin/magazine'],
  ['Médiathèque', 'media_library', '/admin/media-library'],
  ['Mailing', 'mailing_contacts', '/admin/mailing'],
  ['Notifications', 'notifications', '/admin/messages'],
] as const;

export default async function AdminPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin');
  if (!['admin', 'manager'].includes(profile.role)) redirect('/profil');

  const supabase = createSupabaseAdminClient() as any;
  const counts = await Promise.all(cards.map(async ([, table]) => {
    const { count } = await supabase.from(table).select('*', { head: true, count: 'exact' });
    return Number(count || 0);
  }));

  const { count: newCasting } = await supabase.from('casting_applications').select('*', { head: true, count: 'exact' }).in('status', ['new', 'Nouveau']);
  const { count: unread } = await supabase.from('notifications').select('*', { head: true, count: 'exact' }).eq('is_read', false);

  return (
    <main className="min-h-screen bg-pm-dark px-5 py-10 text-pm-off-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <div className="border-b border-white/10 pb-8">
          <p className="text-[9px] font-black uppercase tracking-[.38em] text-pm-gold">Administration · Supabase</p>
          <h1 className="mt-3 font-playfair text-5xl font-bold sm:text-6xl">Tableau de bord</h1>
          <p className="mt-4 text-sm text-white/45">Connecté en tant que {profile.name || profile.email}. Toutes les métriques ci-dessous sont calculées directement depuis les tables normalisées.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-pm-gold/25 bg-pm-gold/[.05] p-6"><p className="text-[9px] font-black uppercase tracking-[.25em] text-pm-gold">Nouvelles candidatures</p><p className="mt-3 font-playfair text-5xl font-bold">{Number(newCasting || 0)}</p></div>
          <div className="border border-white/10 bg-black/20 p-6"><p className="text-[9px] font-black uppercase tracking-[.25em] text-white/45">Notifications non lues</p><p className="mt-3 font-playfair text-5xl font-bold">{Number(unread || 0)}</p></div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map(([label, , href], index) => (
            <Link key={href} href={href} className="group border border-white/10 bg-black/20 p-6 transition hover:border-pm-gold/45 hover:bg-pm-gold/[.035]">
              <p className="text-[9px] font-black uppercase tracking-[.24em] text-white/35 group-hover:text-pm-gold">{label}</p>
              <p className="mt-5 font-playfair text-4xl font-bold">{counts[index]}</p>
              <p className="mt-5 text-xs text-white/35">Ouvrir la gestion →</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
