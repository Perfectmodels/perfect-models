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
  return <section className="control-card min-w-0"><p className="control-kicker">Casting · Supabase</p><h2 className="mt-2 break-words font-playfair text-4xl font-semibold">Résultats du jury</h2><p className="mt-3 text-sm text-pm-ink/45">Consolidation des évaluations enregistrées par les membres du jury.</p>
    <div className="mt-7 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {apps?.map((app: any) => {
        const rows = grouped.get(app.id) || [];
        const avg = rows.length ? rows.reduce((sum: number, row: any) => sum + Number(row.overall || 0), 0) / rows.length : 0;
        return <article key={app.id} className="min-w-0 rounded-[1.4rem] border border-pm-ink/[.08] bg-white/70 p-4">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1"><h3 className="break-words font-playfair text-xl font-bold">{app.full_name || `${app.first_name || ''} ${app.last_name || ''}`}</h3><p className="mt-1 break-all text-xs text-pm-ink/40">{app.email || '—'}</p></div>
            <span className="shrink-0 rounded-full bg-pm-peach px-3 py-1.5 text-[10px] font-black text-pm-wine">{app.status || '—'}</span>
          </div>
          <dl className="mt-4 grid min-w-0 grid-cols-2 gap-2">
            <div className="rounded-xl bg-pm-ivory p-3"><dt className="text-[9px] font-black uppercase tracking-[.1em] text-pm-ink/40">Jurés</dt><dd className="mt-1 text-xl font-bold">{rows.length}</dd></div>
            <div className="rounded-xl bg-pm-ivory p-3"><dt className="text-[9px] font-black uppercase tracking-[.1em] text-pm-ink/40">Moyenne</dt><dd className="mt-1 font-playfair text-2xl text-pm-wine">{rows.length ? avg.toFixed(2) : '—'}{rows.length ? '/10' : ''}</dd></div>
          </dl>
        </article>;
      })}
    </div>
    {!apps?.length && <p className="mt-7 rounded-2xl bg-pm-ivory p-6 text-center text-sm text-pm-ink/40">Aucun résultat de casting disponible.</p>}
  </section>;
}
