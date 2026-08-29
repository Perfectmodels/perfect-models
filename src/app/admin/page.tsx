import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const money = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(value || 0);
const dateLabel = (value?: string | null) => value ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—';

export default async function AdminPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin');
  if (profile.role === 'manager') redirect('/manager');
  if (profile.role !== 'admin') redirect('/profil');

  const supabase = createSupabaseAdminClient() as any;
  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);
  const in30 = new Date(now.getTime() + 30 * 86400000);
  const in60 = new Date(now.getTime() + 60 * 86400000);

  const [
    activeTalents, openCastings, weekBookings, activeOptions, newApplications,
    monthBookings, overdueInvoices, expiringContracts, pendingClaims, optionsToday,
    expiringRights, recentCastings, recentBookings, recentClients,
  ] = await Promise.all([
    supabase.from('models').select('*', { head: true, count: 'exact' }).eq('is_active', true),
    supabase.from('castings').select('*', { head: true, count: 'exact' }).in('status', ['open','matching','shortlist','callback']),
    supabase.from('bookings').select('*', { head: true, count: 'exact' }).in('status',['confirmed','in_production']).gte('starts_at', now.toISOString()).lte('starts_at', weekEnd.toISOString()),
    supabase.from('booking_options').select('*', { head: true, count: 'exact' }).eq('status','active'),
    supabase.from('casting_applications').select('*', { head: true, count: 'exact' }).in('status',['new','Nouveau','En étude']),
    supabase.from('bookings').select('fee_gross,agency_commission_amount,status,starts_at').gte('starts_at', monthStart).lt('starts_at', monthEnd).neq('status','cancelled'),
    supabase.from('invoices').select('id,invoice_number,total,amount_paid,due_at,status').neq('status','paid').neq('status','cancelled').lt('due_at', now.toISOString().slice(0,10)).order('due_at').limit(20),
    supabase.from('contracts').select('id,title,expires_at,status').in('status',['sent','viewed','signed']).gte('expires_at',now.toISOString()).lte('expires_at',in30.toISOString()).order('expires_at').limit(20),
    supabase.from('models').select('id,name,claim_status').eq('claim_status','pending_agency_review').limit(20),
    supabase.from('booking_options').select('id,title,model_id,expires_at').eq('status','active').gte('expires_at',now.toISOString()).lte('expires_at',todayEnd.toISOString()).order('expires_at').limit(20),
    supabase.from('image_rights').select('id,campaign,ends_on,status').in('status',['active','expiring']).gte('ends_on',now.toISOString().slice(0,10)).lte('ends_on',in60.toISOString().slice(0,10)).order('ends_on').limit(20),
    supabase.from('castings').select('id,title,status,starts_at,location').order('updated_at',{ascending:false}).limit(5),
    supabase.from('bookings').select('id,title,status,starts_at,model_id').order('updated_at',{ascending:false}).limit(5),
    supabase.from('agency_clients').select('id,name,status,client_type,updated_at').order('updated_at',{ascending:false}).limit(5),
  ]);

  const revenue = (monthBookings.data || []).reduce((sum: number, row: any) => sum + Number(row.fee_gross || 0), 0);
  const commission = (monthBookings.data || []).reduce((sum: number, row: any) => sum + Number(row.agency_commission_amount || 0), 0);
  const outstanding = (overdueInvoices.data || []).reduce((sum: number, row: any) => sum + Math.max(0, Number(row.total || 0) - Number(row.amount_paid || 0)), 0);

  const metrics = [
    ['Talents actifs', Number(activeTalents.count || 0), '/admin/models', 'Roster agence'],
    ['Castings ouverts', Number(openCastings.count || 0), '/admin/castings', 'Projets clients'],
    ['Bookings · 7 jours', Number(weekBookings.count || 0), '/admin/calendar', 'Confirmés / production'],
    ['Options actives', Number(activeOptions.count || 0), '/admin/booking-options', 'À arbitrer'],
  ] as const;
  const finance = [
    ['Volume du mois', money(revenue), '/admin/finance'],
    ['Commission agence', money(commission), '/admin/finance'],
    ['Impayés échus', money(outstanding), '/admin/invoices'],
    ['Nouvelles candidatures', String(newApplications.count || 0), '/admin/casting-applications'],
  ] as const;
  const tasks = [
    { label: 'Factures clients en retard', count: (overdueInvoices.data || []).length, href: '/admin/invoices', detail: outstanding ? money(outstanding) : '' },
    { label: 'Contrats expirant sous 30 jours', count: (expiringContracts.data || []).length, href: '/admin/contracts', detail: '' },
    { label: 'Profils mannequin à valider', count: (pendingClaims.data || []).length, href: '/admin/model-access', detail: '' },
    { label: 'Options expirant aujourd’hui', count: (optionsToday.data || []).length, href: '/admin/booking-options', detail: '' },
    { label: 'Droits d’image expirant sous 60 jours', count: (expiringRights.data || []).length, href: '/admin/image-rights', detail: '' },
  ].filter((task) => task.count > 0);

  return <div className="space-y-6 pb-12">
    <section className="relative overflow-hidden rounded-[2.2rem] bg-pm-wine px-6 py-8 text-white shadow-[0_28px_80px_rgba(98,37,58,.18)] sm:px-9 sm:py-10 lg:px-12"><div aria-hidden className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-pm-coral/70 blur-3xl"/><div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.28em] text-pm-gold-light">Agency ERP · Données Supabase</p><h1 className="mt-4 max-w-4xl font-playfair text-5xl font-semibold leading-[.92] sm:text-6xl">Piloter les talents, les castings et le revenu <em className="font-normal text-pm-peach">depuis un seul flux.</em></h1><p className="mt-5 max-w-2xl text-sm leading-7 text-white/68">Les candidatures recrutent les talents. Les castings répondent aux briefs clients. Les bookings, options, contrats et factures poursuivent ensuite le même dossier métier.</p></div><div className="flex flex-wrap gap-2"><Link href="/admin/castings" className="rounded-full bg-white px-5 py-3 text-[9px] font-black uppercase tracking-[.18em] text-pm-wine">Nouveau casting</Link><Link href="/admin/talent-search" className="rounded-full border border-white/35 px-5 py-3 text-[9px] font-black uppercase tracking-[.18em] text-white">Trouver un talent</Link></div></div></section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label,value,href,meta]) => <Link key={label} href={href} className="rounded-[1.6rem] border border-pm-ink/[.07] bg-white p-5 shadow-[0_18px_45px_rgba(70,40,35,.05)] transition hover:-translate-y-0.5"><p className="control-kicker">{label}</p><p className="mt-5 font-playfair text-5xl font-semibold">{value}</p><p className="mt-2 text-xs text-pm-ink/40">{meta}</p></Link>)}</section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{finance.map(([label,value,href]) => <Link key={label} href={href} className="rounded-[1.6rem] bg-pm-ink p-5 text-white transition hover:-translate-y-0.5"><p className="text-[9px] font-black uppercase tracking-[.16em] text-pm-gold-light">{label}</p><p className="mt-5 font-playfair text-3xl font-semibold">{value}</p><span className="mt-4 block text-[9px] font-black uppercase tracking-[.12em] text-white/45">Ouvrir ↗</span></Link>)}</section>

    <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><div className="control-card"><p className="control-kicker">À traiter aujourd’hui</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Priorités opérationnelles</h2><div className="mt-6 space-y-2">{tasks.length ? tasks.map((task) => <Link key={task.label} href={task.href} className="flex items-center gap-3 rounded-xl border border-pm-ink/[.06] bg-pm-ivory p-3 transition hover:border-pm-coral/30"><span className="grid h-8 w-8 place-items-center rounded-full bg-pm-coral text-xs font-black text-white">{task.count}</span><span className="min-w-0 flex-1"><b className="block text-sm">{task.label}</b>{task.detail && <small className="text-pm-ink/45">{task.detail}</small>}</span><span>↗</span></Link>) : <div className="rounded-xl bg-emerald-50 p-5 text-sm font-semibold text-emerald-800">Aucune alerte opérationnelle remontée par les données actuelles.</div>}</div></div>
      <div className="control-card"><p className="control-kicker">Flux métier</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Du brief au paiement</h2><div className="mt-6 grid gap-3 sm:grid-cols-3">{[
        ['01','Casting','/admin/castings','Créer le brief et matcher les talents'],['02','Shortlist','/admin/casting-pipeline','Faire évoluer les profils dans le pipeline'],['03','Booking','/admin/bookings','Confirmer le job et synchroniser le calendrier'],['04','Contrat','/admin/contracts','Centraliser les accords et signatures'],['05','Facture','/admin/invoices','Facturer le client et suivre l’échéance'],['06','Paiement','/admin/finance','Calculer commission et net mannequin'],
      ].map(([n,title,href,desc]) => <Link key={n} href={href} className="rounded-2xl bg-pm-peach p-4"><span className="text-[9px] font-black text-pm-coral">{n}</span><h3 className="mt-3 font-playfair text-xl font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-pm-ink/45">{desc}</p></Link>)}</div></div></section>

    <section className="grid gap-5 lg:grid-cols-3"><Activity title="Castings récents" href="/admin/castings" rows={(recentCastings.data || []).map((row:any)=>({title:row.title,meta:`${row.status} · ${dateLabel(row.starts_at)}`}))}/><Activity title="Bookings récents" href="/admin/bookings" rows={(recentBookings.data || []).map((row:any)=>({title:row.title,meta:`${row.status} · ${dateLabel(row.starts_at)}`}))}/><Activity title="Clients CRM" href="/admin/clients" rows={(recentClients.data || []).map((row:any)=>({title:row.name,meta:`${row.client_type} · ${row.status}`}))}/></section>
  </div>;
}

function Activity({ title, href, rows }: { title: string; href: string; rows: Array<{ title: string; meta: string }> }) {
  return <section className="control-card"><div className="flex items-center justify-between"><div><p className="control-kicker">Activité</p><h2 className="mt-1 font-playfair text-2xl font-semibold">{title}</h2></div><Link href={href}>↗</Link></div><div className="mt-5 divide-y divide-pm-ink/[.07]">{rows.length ? rows.map((row,index)=><div key={`${row.title}-${index}`} className="py-3"><p className="truncate text-sm font-bold">{row.title || 'Sans titre'}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.12em] text-pm-ink/38">{row.meta}</p></div>) : <p className="py-8 text-sm text-pm-ink/40">Aucune donnée pour le moment.</p>}</div></section>;
}
