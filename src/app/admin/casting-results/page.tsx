import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/casting-results');
  if (!['admin', 'manager'].includes(profile.role)) redirect('/profil');
  if (!hasAdminPermission(profile, 'castingResults')) redirect(profile.role === 'manager' ? '/manager' : '/profil');
  const supabase = createSupabaseAdminClient() as any;
  const [{ data: apps }, { data: scores }] = await Promise.all([
    supabase.from('casting_applications').select('id,full_name,first_name,last_name,email,status,created_at').order('created_at', { ascending: false }),
    supabase.from('casting_scores').select('*'),
  ]);
  const grouped = new Map<string, any[]>();
  for (const score of scores || []) { const list = grouped.get(score.casting_application_id) || []; list.push(score); grouped.set(score.casting_application_id, list); }
  return <section className="control-card"><p className="control-kicker">Casting · Supabase</p><h2 className="mt-2 font-playfair text-4xl font-semibold">Résultats du jury</h2><p className="mt-3 text-sm text-pm-ink/45">Consolidation des évaluations enregistrées par les membres du jury.</p><div className="mt-7 overflow-x-auto rounded-[1.4rem] border border-pm-ink/[.08]"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-pm-ink/10 bg-pm-peach text-[8px] font-black uppercase tracking-[.16em] text-pm-wine/65"><tr><th className="p-4">Candidat</th><th className="p-4">Statut</th><th className="p-4">Jurés</th><th className="p-4">Moyenne</th></tr></thead><tbody>{apps?.map((app: any) => { const rows = grouped.get(app.id) || []; const avg = rows.length ? rows.reduce((sum: number, row: any) => sum + Number(row.overall || 0), 0) / rows.length : 0; return <tr key={app.id} className="border-b border-pm-ink/[.06] bg-white/55"><td className="p-4"><p className="font-bold">{app.full_name || `${app.first_name || ''} ${app.last_name || ''}`}</p><p className="mt-1 text-xs text-pm-ink/35">{app.email || '—'}</p></td><td className="p-4 text-pm-ink/55">{app.status}</td><td className="p-4">{rows.length}</td><td className="p-4 font-playfair text-2xl text-pm-wine">{rows.length ? avg.toFixed(2) : '—'}{rows.length ? '/10' : ''}</td></tr>; })}</tbody></table></div></section>;
}
