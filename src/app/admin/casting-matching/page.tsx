import Link from 'next/link';
import { redirect } from 'next/navigation';
import CastingMatchingBoard from '@/components/admin/CastingMatchingBoard';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
type Params = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] || '' : value || '';
const norm = (value: unknown) => String(value || '').trim().toLowerCase();

function genderMatch(requirement: string, actual: string) {
  if (!requirement) return true;
  const req = norm(requirement); const got = norm(actual);
  return got.includes(req) || (req === 'femme' && got === 'female') || (req === 'homme' && got === 'male');
}

export default async function CastingMatchingPage({ searchParams }: { searchParams: Promise<Params> }) {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/casting-matching');
  if (!['admin','manager'].includes(profile.role) || !hasAdminPermission(profile, 'castingApplications')) redirect(profile.role === 'manager' ? '/manager' : '/profil');
  const supabase = createSupabaseAdminClient() as any;
  const { data: castings, error: castingError } = await supabase.from('castings').select('id,title,status,client_id,project_type,starts_at,ends_at,location,gender_requirement,age_min,age_max,height_min_cm,height_max_cm,hair_colors,eye_colors,categories').in('status',['draft','open','matching','shortlist','callback']).order('starts_at', { ascending: true, nullsFirst: false });
  if (castingError) throw new Error(castingError.message);
  const p = await searchParams;
  const castingId = one(p.casting) || String(castings?.[0]?.id || '');
  const casting = (castings || []).find((item: any) => String(item.id) === castingId) || null;

  if (!casting) return <div className="control-card"><p className="control-kicker">Matching</p><h1 className="mt-2 font-playfair text-4xl font-semibold">Aucun casting actif</h1><p className="mt-4 text-sm text-pm-ink/55">Créez d’abord un casting client avec ses critères de recherche.</p><Link href="/admin/castings" className="mt-6 inline-flex rounded-full bg-pm-ink px-6 py-3 text-xs font-black uppercase tracking-[.08em] text-white">Créer un casting</Link></div>;

  const [{ data: models, error: modelsError }, { data: currentTalents }] = await Promise.all([
    supabase.from('models').select('id,name,image_url,gender,age,height_cm,location,categories,hair_color,eye_color,is_active').eq('is_active', true).order('name'),
    supabase.from('casting_talents').select('model_id').eq('casting_id', casting.id),
  ]);
  if (modelsError) throw new Error(modelsError.message);

  let unavailable = new Set<string>();
  if (casting.starts_at && casting.ends_at) {
    const [blocks, bookings, options] = await Promise.all([
      supabase.from('model_availability').select('model_id').in('status',['unavailable','travel']).lt('starts_at', casting.ends_at).gt('ends_at', casting.starts_at),
      supabase.from('bookings').select('model_id').in('status',['confirmed','in_production']).lt('starts_at', casting.ends_at).gt('ends_at', casting.starts_at),
      supabase.from('booking_options').select('model_id').eq('status','active').lt('starts_at', casting.ends_at).gt('ends_at', casting.starts_at),
    ]);
    unavailable = new Set([...blocks.data || [], ...bookings.data || [], ...options.data || []].map((row: any) => String(row.model_id)));
  }
  const already = new Set((currentTalents || []).map((row: any) => String(row.model_id)));

  const candidates = (models || []).map((model: any) => {
    let score = 20; const reasons: string[] = [];
    if (casting.gender_requirement) { if (genderMatch(casting.gender_requirement, model.gender)) { score += 15; reasons.push('genre'); } else score -= 20; }
    if (casting.age_min != null || casting.age_max != null) { const age = Number(model.age); if (age && (casting.age_min == null || age >= casting.age_min) && (casting.age_max == null || age <= casting.age_max)) { score += 12; reasons.push('âge'); } else score -= 10; }
    if (casting.height_min_cm != null || casting.height_max_cm != null) { const height = Number(model.height_cm); if (height && (casting.height_min_cm == null || height >= Number(casting.height_min_cm)) && (casting.height_max_cm == null || height <= Number(casting.height_max_cm))) { score += 18; reasons.push('taille'); } else score -= 15; }
    const requiredCats: string[] = casting.categories || []; const modelCats: string[] = model.categories || [];
    if (requiredCats.length) { const matches = requiredCats.filter((cat) => modelCats.some((own) => norm(own) === norm(cat))).length; score += Math.round(15 * matches / requiredCats.length); if (matches) reasons.push('catégories'); }
    const hair: string[] = casting.hair_colors || []; if (hair.length && hair.some((item) => norm(model.hair_color).includes(norm(item)))) { score += 8; reasons.push('cheveux'); }
    const eyes: string[] = casting.eye_colors || []; if (eyes.length && eyes.some((item) => norm(model.eye_color).includes(norm(item)))) { score += 5; reasons.push('yeux'); }
    if (casting.location && model.location && norm(model.location).includes(norm(casting.location))) { score += 5; reasons.push('localisation'); }
    const conflict = unavailable.has(String(model.id)); if (!conflict) { score += 10; reasons.push('disponible'); } else score -= 25;
    return { id: String(model.id), name: String(model.name), imageUrl: model.image_url ? String(model.image_url) : null, gender: model.gender, age: model.age, heightCm: model.height_cm ? Number(model.height_cm) : null, location: model.location, categories: modelCats, hairColor: model.hair_color, eyeColor: model.eye_color, score: Math.max(0, Math.min(100, Math.round(score))), unavailable: conflict, reasons, alreadyAdded: already.has(String(model.id)) };
  }).sort((a: any,b: any) => b.score - a.score);

  return <div className="space-y-6 pb-12">
    <header className="rounded-[2rem] bg-pm-wine p-7 text-white sm:p-9"><p className="text-[10px] font-black uppercase tracking-[.2em] text-pm-gold-light">Matching intelligent</p><h1 className="mt-3 font-playfair text-5xl font-semibold">Trouver les bons profils en quelques secondes</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">Le score combine critères physiques, catégories, localisation et disponibilité réelle. Il reste une aide au booker : la décision finale reste humaine.</p></header>
    <form className="control-card flex flex-col gap-3 sm:flex-row sm:items-end"><label className="flex-1"><span className="mb-2 block text-xs font-bold">Casting à matcher</span><select name="casting" defaultValue={castingId} className="min-h-12 w-full rounded-xl border border-pm-ink/15 bg-white px-4 text-sm">{(castings || []).map((item: any) => <option key={item.id} value={item.id}>{item.title} · {item.status}</option>)}</select></label><button className="min-h-12 rounded-full bg-pm-ink px-6 text-xs font-black uppercase tracking-[.08em] text-white">Analyser</button><Link href={`/admin/casting-pipeline?casting=${castingId}`} className="inline-flex min-h-12 items-center justify-center rounded-full border border-pm-ink/15 bg-white px-6 text-xs font-black uppercase tracking-[.08em]">Pipeline</Link></form>
    <section className="control-card"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="control-kicker">{casting.project_type}</p><h2 className="mt-2 font-playfair text-3xl font-semibold">{casting.title}</h2><p className="mt-2 text-sm text-pm-ink/50">{[casting.location, casting.starts_at ? new Date(casting.starts_at).toLocaleDateString('fr-FR') : ''].filter(Boolean).join(' · ')}</p></div><div className="flex flex-wrap gap-2">{casting.gender_requirement && <span className="rounded-full bg-pm-peach px-3 py-2 text-xs font-bold">{casting.gender_requirement}</span>}{casting.height_min_cm && <span className="rounded-full bg-pm-peach px-3 py-2 text-xs font-bold">{casting.height_min_cm}–{casting.height_max_cm || '∞'} cm</span>}{casting.age_min && <span className="rounded-full bg-pm-peach px-3 py-2 text-xs font-bold">{casting.age_min}–{casting.age_max || '∞'} ans</span>}</div></div></section>
    <CastingMatchingBoard castingId={castingId} candidates={candidates}/>
  </div>;
}
