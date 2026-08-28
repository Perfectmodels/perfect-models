import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const modules = [
  ['Talents', 'models', '/admin/models', 'bg-pm-peach'],
  ['Candidatures', 'casting_applications', '/admin/casting-applications', 'bg-pm-gold-light/40'],
  ['Bookings', 'booking_requests', '/admin/bookings', 'bg-pm-sage'],
  ['Médiathèque', 'media_library', '/admin/media-library', 'bg-white'],
  ['Journal', 'blog_posts', '/admin/blog', 'bg-pm-peach'],
  ['Contacts', 'mailing_contacts', '/admin/mailing', 'bg-pm-gold-light/40'],
] as const;

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function AdminPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin');
  if (profile.role === 'manager') redirect('/manager');
  if (profile.role !== 'admin') redirect('/profil');

  const supabase = createSupabaseAdminClient() as any;
  const [counts, publicModels, newCasting, unread, published, recentCasting, recentPosts, recentNotifications] = await Promise.all([
    Promise.all(modules.map(async ([, table]) => {
      const { count } = await supabase.from(table).select('*', { head: true, count: 'exact' });
      return Number(count || 0);
    })),
    supabase.from('models').select('*', { head: true, count: 'exact' }).eq('is_public', true).eq('is_active', true),
    supabase.from('casting_applications').select('*', { head: true, count: 'exact' }).in('status', ['new', 'Nouveau']),
    supabase.from('notifications').select('*', { head: true, count: 'exact' }).eq('is_read', false),
    supabase.from('blog_posts').select('*', { head: true, count: 'exact' }).eq('status', 'published'),
    supabase.from('casting_applications').select('id,full_name,first_name,last_name,status,created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('blog_posts').select('id,title,status,created_at,published_at').order('created_at', { ascending: false }).limit(4),
    supabase.from('notifications').select('id,title,audience_role,is_read,created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  const signals = [
    { label: 'Talents actifs en vitrine', value: Number(publicModels.count || 0), href: '/admin/models', tone: 'bg-pm-coral text-white' },
    { label: 'Candidatures à traiter', value: Number(newCasting.count || 0), href: '/admin/casting-applications', tone: 'bg-pm-gold-light text-pm-ink' },
    { label: 'Notifications non lues', value: Number(unread.count || 0), href: '/admin/messages', tone: 'bg-pm-sage text-pm-ink' },
    { label: 'Articles publiés', value: Number(published.count || 0), href: '/admin/blog', tone: 'bg-pm-wine text-white' },
  ];
  const pipeline = [
    ['Talents', counts[0]], ['Casting', counts[1]], ['Bookings', counts[2]], ['Journal', counts[4]],
  ] as const;
  const maxPipeline = Math.max(1, ...pipeline.map(([, value]) => value));

  return (
    <div className="space-y-7 pb-12">
      <section className="relative overflow-hidden rounded-[2.2rem] bg-pm-wine px-6 py-8 text-white shadow-[0_28px_80px_rgba(98,37,58,.18)] sm:px-9 sm:py-10 lg:px-12">
        <div aria-hidden="true" className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-pm-coral/80 blur-2xl" />
        <div aria-hidden="true" className="absolute bottom-0 right-[25%] h-40 w-40 rounded-full bg-pm-gold-light/40 blur-2xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-[9px] font-black uppercase tracking-[.28em] text-pm-gold-light">Tour de contrôle · Données Supabase</p><h2 className="mt-4 max-w-4xl font-playfair text-5xl font-semibold leading-[.9] tracking-[-.04em] sm:text-6xl lg:text-7xl">Bonjour {profile.name?.split(' ')[0] || 'Direction'},<br /><em className="font-normal text-pm-peach">la Maison est en mouvement.</em></h2><p className="mt-5 max-w-2xl text-sm leading-7 text-white/68">Une lecture immédiate de l’agence, des talents, des demandes et des contenus — sans données fictives.</p></div>
          <div className="flex flex-wrap gap-2"><Link href="/admin/models" className="rounded-full bg-white px-5 py-3 text-[9px] font-black uppercase tracking-[.18em] text-pm-wine">Ajouter un talent</Link><Link href="/admin/blog" className="rounded-full border border-white/35 px-5 py-3 text-[9px] font-black uppercase tracking-[.18em] text-white">Publier</Link></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Signaux prioritaires">
        {signals.map(signal => <Link key={signal.label} href={signal.href} className={`group rounded-[1.7rem] p-5 shadow-[0_18px_50px_rgba(91,46,37,.07)] transition hover:-translate-y-1 sm:p-6 ${signal.tone}`}><div className="flex items-start justify-between"><p className="max-w-[12rem] text-[9px] font-black uppercase leading-5 tracking-[.2em] opacity-70">{signal.label}</p><span className="transition group-hover:translate-x-1">↗</span></div><p className="mt-6 font-playfair text-6xl font-semibold leading-none">{signal.value}</p></Link>)}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="control-card">
          <div className="flex items-end justify-between gap-4"><div><p className="control-kicker">Architecture opérationnelle</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Les grands flux de la Maison</h2></div><span className="rounded-full bg-pm-peach px-3 py-2 text-[8px] font-black uppercase tracking-[.15em] text-pm-wine">Temps réel</span></div>
          <div className="mt-8 space-y-5">{pipeline.map(([label, value], index) => <div key={label}><div className="mb-2 flex items-end justify-between text-sm"><span className="font-bold">{label}</span><span className="font-playfair text-2xl font-semibold">{value}</span></div><div className="h-3 overflow-hidden rounded-full bg-pm-sand"><div className={`h-full rounded-full ${index === 0 ? 'bg-pm-coral' : index === 1 ? 'bg-pm-gold' : index === 2 ? 'bg-pm-teal' : 'bg-pm-wine'}`} style={{ width: `${Math.max(5, (value / maxPipeline) * 100)}%` }} /></div></div>)}</div>
        </div>

        <div className="control-card">
          <p className="control-kicker">Accès rapide</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Ouvrir un module</h2>
          <div className="mt-6 grid grid-cols-2 gap-3">{modules.map(([label, , href, tone], index) => <Link key={href} href={href} className={`group rounded-[1.35rem] border border-pm-ink/[.06] p-4 transition hover:-translate-y-0.5 ${tone}`}><p className="text-[8px] font-black uppercase tracking-[.18em] text-pm-wine/65">0{index + 1}</p><p className="mt-4 font-playfair text-xl font-semibold">{label}</p><p className="mt-2 text-[8px] font-black uppercase tracking-[.14em] text-pm-ink/35">{counts[index]} entrées ↗</p></Link>)}</div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <ActivityPanel title="Dernières candidatures" href="/admin/casting-applications" empty="Aucune candidature récente.">
          {(recentCasting.data || []).map((item: any) => <ActivityRow key={item.id} title={item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Candidat'} meta={`${item.status || 'new'} · ${formatDate(item.created_at)}`} />)}
        </ActivityPanel>
        <ActivityPanel title="Journal éditorial" href="/admin/blog" empty="Aucun article récent.">
          {(recentPosts.data || []).map((item: any) => <ActivityRow key={item.id} title={item.title || 'Article sans titre'} meta={`${item.status || 'brouillon'} · ${formatDate(item.published_at || item.created_at)}`} />)}
        </ActivityPanel>
        <ActivityPanel title="Centre de notifications" href="/admin/messages" empty="Aucune notification récente.">
          {(recentNotifications.data || []).map((item: any) => <ActivityRow key={item.id} title={item.title || 'Notification'} meta={`${item.audience_role || 'équipe'} · ${item.is_read ? 'lue' : 'à lire'}`} accent={!item.is_read} />)}
        </ActivityPanel>
      </section>
    </div>
  );
}

function ActivityPanel({ title, href, empty, children }: { title: string; href: string; empty: string; children: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return <section className="control-card min-h-[22rem]"><div className="flex items-center justify-between gap-3"><div><p className="control-kicker">Activité</p><h2 className="mt-2 font-playfair text-2xl font-semibold">{title}</h2></div><Link href={href} className="text-lg text-pm-coral">↗</Link></div><div className="mt-5 divide-y divide-pm-ink/[.08]">{hasChildren ? children : <p className="py-8 text-sm text-pm-ink/40">{empty}</p>}</div></section>;
}

function ActivityRow({ title, meta, accent = false }: { title: string; meta: string; accent?: boolean }) {
  return <div className="flex items-start gap-3 py-4"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${accent ? 'bg-pm-coral' : 'bg-pm-gold'}`} /><div className="min-w-0"><p className="truncate text-sm font-bold">{title}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.13em] text-pm-ink/38">{meta}</p></div></div>;
}
