import Link from 'next/link';
import { redirect } from 'next/navigation';
import CastingPipelineBoard from '@/components/admin/CastingPipelineBoard';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
type Params = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] || '' : value || '';

export default async function CastingPipelinePage({ searchParams }: { searchParams: Promise<Params> }) {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/casting-pipeline');
  if (!['admin','manager'].includes(profile.role) || !hasAdminPermission(profile,'castingApplications')) redirect(profile.role === 'manager' ? '/manager' : '/profil');
  const supabase = createSupabaseAdminClient() as any;
  const { data: castings, error } = await supabase.from('castings').select('id,title,status,starts_at').order('starts_at', { ascending: false, nullsFirst: false }).limit(100);
  if (error) throw new Error(error.message);
  const params = await searchParams;
  const castingId = one(params.casting) || String(castings?.[0]?.id || '');
  const casting = (castings || []).find((row: any) => String(row.id) === castingId);
  if (!casting) return <div className="control-card"><h1 className="font-playfair text-4xl font-semibold">Aucun casting disponible</h1><Link href="/admin/castings" className="mt-5 inline-flex max-w-full rounded-full bg-pm-ink px-6 py-3 text-center text-xs font-black text-white">Créer un casting</Link></div>;
  const [{ data: pipeline, error: pipeError }, { data: models }] = await Promise.all([
    supabase.from('casting_talents').select('id,model_id,stage,match_score').eq('casting_id', castingId).order('match_score', { ascending: false, nullsFirst: false }),
    supabase.from('models').select('id,name,image_url').eq('is_active', true),
  ]);
  if (pipeError) throw new Error(pipeError.message);
  const modelMap = new Map((models || []).map((model: any) => [String(model.id), model]));
  const items = (pipeline || []).map((item: any) => {
    const model: any = modelMap.get(String(item.model_id));
    return { id: String(item.id), modelId: String(item.model_id), name: String(model?.name || item.model_id), imageUrl: model?.image_url ? String(model.image_url) : null, stage: String(item.stage), score: item.match_score == null ? null : Number(item.match_score) };
  });

  return <div className="min-w-0 space-y-6 pb-12">
    <header className="min-w-0 overflow-hidden rounded-[2rem] bg-pm-wine p-6 text-white sm:p-7">
      <p className="text-[10px] font-black uppercase tracking-[.2em] text-pm-gold-light">Casting CRM</p>
      <h1 className="mt-3 break-words font-playfair text-4xl font-semibold sm:text-5xl">Pipeline & shortlists</h1>
      <p className="mt-4 break-words text-sm leading-6 text-white/65">Invités → confirmés → présence → shortlist → callback → sélection → booking.</p>
    </header>
    <form className="control-card grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
      <label className="min-w-0 sm:col-span-2 lg:col-span-1"><span className="mb-2 block text-xs font-bold">Casting</span><select name="casting" defaultValue={castingId} className="min-h-12 w-full min-w-0 rounded-xl border border-pm-ink/15 bg-white px-4 text-sm">{(castings || []).map((row: any) => <option key={row.id} value={row.id}>{row.title} · {row.status}</option>)}</select></label>
      <button className="min-h-12 w-full rounded-full bg-pm-ink px-6 text-xs font-black uppercase tracking-[.08em] text-white lg:w-auto">Afficher</button>
      <Link href={`/admin/casting-matching?casting=${castingId}`} className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-pm-ink/15 bg-white px-6 text-center text-xs font-black uppercase tracking-[.08em] lg:w-auto">Matching</Link>
    </form>
    <section className="min-w-0 overflow-hidden rounded-[2rem] border border-pm-ink/10 bg-white p-4 sm:p-6">
      <div className="mb-5 min-w-0"><p className="control-kicker">{casting.status}</p><h2 className="mt-1 break-words font-playfair text-3xl font-semibold">{casting.title}</h2></div>
      <CastingPipelineBoard castingId={castingId} initialItems={items}/>
    </section>
  </div>;
}
