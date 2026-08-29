import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertTriangle, CalendarDays } from 'lucide-react';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type EventRow = { id: string; model_id: string | null; title: string; event_type: string; starts_at: string; ends_at: string; location: string | null; status: string };
type OptionRow = { id: string; model_id: string; title: string; starts_at: string; ends_at: string; option_rank: number; status: string };

export default async function AgencyCalendarPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/calendar');
  if (!['admin','manager'].includes(profile.role) || !hasAdminPermission(profile,'bookings')) redirect(profile.role === 'manager' ? '/manager' : '/profil');
  const supabase = createSupabaseAdminClient() as any;
  const now = new Date(); const until = new Date(now.getTime() + 60*24*60*60*1000);
  const [{ data: events, error }, { data: options }, { data: models }] = await Promise.all([
    supabase.from('agency_calendar_events').select('id,model_id,title,event_type,starts_at,ends_at,location,status').gte('ends_at', now.toISOString()).lte('starts_at', until.toISOString()).neq('status','cancelled').order('starts_at'),
    supabase.from('booking_options').select('id,model_id,title,starts_at,ends_at,option_rank,status').eq('status','active').gte('ends_at', now.toISOString()).order('starts_at'),
    supabase.from('models').select('id,name').eq('is_active',true),
  ]);
  if (error) throw new Error(error.message);
  const modelMap = new Map<string,string>((models || []).map((model: any):[string,string] => [String(model.id), String(model.name)]));
  const activeOptions: OptionRow[] = options || [];
  const conflicts: Array<{ modelId: string; first: OptionRow; second: OptionRow }> = [];
  for (let i=0;i<activeOptions.length;i++) for (let j=i+1;j<activeOptions.length;j++) { const a=activeOptions[i], b=activeOptions[j]; if (a.model_id===b.model_id && new Date(a.starts_at)<new Date(b.ends_at) && new Date(b.starts_at)<new Date(a.ends_at)) conflicts.push({ modelId:a.model_id, first:a, second:b }); }
  const grouped = new Map<string,EventRow[]>();
  for (const event of (events || []) as EventRow[]) { const key = new Date(event.starts_at).toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long'}); grouped.set(key,[...(grouped.get(key)||[]),event]); }
  const badge: Record<string,string> = { casting:'bg-violet-50 text-violet-800', option:'bg-amber-50 text-amber-800', booking:'bg-emerald-50 text-emerald-800', shooting:'bg-blue-50 text-blue-800', travel:'bg-sky-50 text-sky-800', unavailable:'bg-red-50 text-red-800', meeting:'bg-stone-100 text-stone-700' };
  return <div className="space-y-6 pb-12"><header className="rounded-[2rem] bg-pm-wine p-7 text-white sm:p-9"><p className="text-[10px] font-black uppercase tracking-[.2em] text-pm-gold-light">Agenda agence</p><h1 className="mt-3 font-playfair text-5xl font-semibold">Calendrier & conflits</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">Castings, options, bookings, voyages et indisponibilités sont regroupés dans une vue unique. Les bookings/options sont synchronisés automatiquement.</p></header>{conflicts.length > 0 && <section className="rounded-[1.7rem] border border-amber-200 bg-amber-50 p-5"><div className="flex items-center gap-3 text-amber-900"><AlertTriangle/><div><p className="text-xs font-black uppercase tracking-[.12em]">Conflits détectés</p><h2 className="font-playfair text-2xl font-bold">{conflicts.length} chevauchement{conflicts.length>1?'s':''} d’options</h2></div></div><div className="mt-4 grid gap-2">{conflicts.slice(0,10).map((conflict)=><div key={`${conflict.first.id}-${conflict.second.id}`} className="rounded-xl bg-white/70 p-3 text-sm"><b>{String(modelMap.get(conflict.modelId) || conflict.modelId)}</b> : Option {conflict.first.option_rank} « {conflict.first.title} » chevauche Option {conflict.second.option_rank} « {conflict.second.title} ».</div>)}</div><Link href="/admin/booking-options" className="mt-4 inline-flex rounded-full bg-amber-900 px-5 py-2.5 text-xs font-black uppercase tracking-[.08em] text-white">Gérer les options</Link></section>}
  <div className="grid gap-5 xl:grid-cols-[1fr_18rem]"><section className="space-y-4">{[...grouped.entries()].map(([date,rows])=><article key={date} className="control-card"><h2 className="mb-4 font-playfair text-2xl font-semibold capitalize">{date}</h2><div className="space-y-2">{rows.map((event)=><div key={event.id} className="grid gap-3 rounded-xl border border-pm-ink/[.07] bg-pm-ivory p-3 sm:grid-cols-[7rem_1fr_auto] sm:items-center"><div><p className="text-sm font-black">{new Date(event.starts_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</p><p className="text-[10px] text-pm-ink/40">→ {new Date(event.ends_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</p></div><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${badge[event.event_type]||'bg-white text-pm-ink'}`}>{event.event_type}</span><h3 className="text-sm font-bold">{event.title}</h3></div><p className="mt-1 text-xs text-pm-ink/45">{[event.model_id ? String(modelMap.get(event.model_id) || '') : '',event.location].filter(Boolean).join(' · ')}</p></div><span className="text-[10px] font-bold uppercase text-pm-ink/35">{event.status}</span></div>)}</div></article>)}{!grouped.size && <div className="control-card text-center text-sm text-pm-ink/45">Aucun événement dans les 60 prochains jours.</div>}</section><aside className="space-y-3"><Link href="/admin/calendar-events" className="control-card block"><CalendarDays className="text-pm-coral"/><p className="mt-4 font-playfair text-xl font-bold">Ajouter un événement</p><p className="mt-2 text-xs leading-5 text-pm-ink/45">Réunion, voyage, shooting ou indisponibilité.</p></Link><Link href="/admin/bookings" className="control-card block"><p className="control-kicker">Production</p><p className="mt-2 font-playfair text-xl font-bold">Bookings</p></Link><Link href="/admin/talent-availability" className="control-card block"><p className="control-kicker">Roster</p><p className="mt-2 font-playfair text-xl font-bold">Disponibilités</p></Link></aside></div></div>;
}