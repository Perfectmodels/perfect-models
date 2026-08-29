import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { parseTalentQuery } from '@/lib/talent-query-parser';

export const dynamic = 'force-dynamic';

type Params = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] || '' : value || '';
const num = (value: string) => value ? Number(value) : null;
const norm = (value: unknown) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

export default async function TalentSearchPage({ searchParams }: { searchParams: Promise<Params> }) {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/talent-search');
  if (!['admin','manager'].includes(profile.role)) redirect('/profil');
  if (!hasAdminPermission(profile, 'models')) redirect(profile.role === 'manager' ? '/manager' : '/profil');

  const p = await searchParams;
  const smart = one(p.smart);
  const parsed = parseTalentQuery(smart);
  const q = one(p.q);
  const gender = one(p.gender) || parsed.gender || '';
  const location = one(p.location) || parsed.location || '';
  const category = one(p.category) || parsed.category || '';
  const hair = one(p.hair) || parsed.hair || '';
  const eyes = one(p.eyes) || parsed.eyes || '';
  const ageMinText = one(p.ageMin) || (parsed.ageMin !== undefined ? String(parsed.ageMin) : '');
  const ageMaxText = one(p.ageMax) || (parsed.ageMax !== undefined ? String(parsed.ageMax) : '');
  const heightMinText = one(p.heightMin) || (parsed.heightMin !== undefined ? String(parsed.heightMin) : '');
  const heightMaxText = one(p.heightMax) || (parsed.heightMax !== undefined ? String(parsed.heightMax) : '');
  const ageMin = num(ageMinText); const ageMax = num(ageMaxText);
  const heightMin = num(heightMinText); const heightMax = num(heightMaxText);
  const from = one(p.from) || parsed.from || '';
  const to = one(p.to) || parsed.to || '';
  const resultLimit = parsed.limit || 100;

  const supabase = createSupabaseAdminClient() as any;
  const { data: rawModels, error } = await supabase.from('models').select('id,name,username,image_url,gender,age,height,height_cm,location,level,categories,hair_color,eye_color,chest_cm,waist_cm,hips_cm,shoe_size,mobility,is_public,is_active').eq('is_active', true).order('name');
  if (error) throw new Error(error.message);

  let unavailable = new Set<string>();
  if (from && to) {
    const start = `${from}T00:00:00`; const end = `${to}T23:59:59`;
    const [blocks, bookings, options] = await Promise.all([
      supabase.from('model_availability').select('model_id').in('status',['unavailable','travel']).lt('starts_at', end).gt('ends_at', start),
      supabase.from('bookings').select('model_id').in('status',['confirmed','in_production']).lt('starts_at', end).gt('ends_at', start),
      supabase.from('booking_options').select('model_id').eq('status','active').lt('starts_at', end).gt('ends_at', start),
    ]);
    unavailable = new Set([...(blocks.data || []), ...(bookings.data || []), ...(options.data || [])].map((row: any) => String(row.model_id)));
  }

  const allMatches = (rawModels || []).filter((model: any) => {
    if (q && !norm(`${model.name} ${model.username || ''}`).includes(norm(q))) return false;
    if (gender && !norm(model.gender).includes(norm(gender))) return false;
    if (location && !norm(model.location).includes(norm(location))) return false;
    if (category && !(model.categories || []).some((item: string) => norm(item).includes(norm(category)))) return false;
    if (hair && !norm(model.hair_color).includes(norm(hair))) return false;
    if (eyes && !norm(model.eye_color).includes(norm(eyes))) return false;
    if (ageMin !== null && Number(model.age || 0) < ageMin) return false;
    if (ageMax !== null && Number(model.age || 0) > ageMax) return false;
    if (heightMin !== null && Number(model.height_cm || 0) < heightMin) return false;
    if (heightMax !== null && Number(model.height_cm || 0) > heightMax) return false;
    if (from && to && unavailable.has(String(model.id))) return false;
    return true;
  });
  const models = allMatches.slice(0, resultLimit);

  const field = 'min-h-11 rounded-xl border border-pm-ink/15 bg-white px-3 text-sm outline-none focus:border-pm-coral focus:ring-4 focus:ring-pm-coral/10';
  return <div className="space-y-6 pb-12">
    <header className="rounded-[2rem] bg-pm-wine p-7 text-white sm:p-9"><p className="text-[10px] font-black uppercase tracking-[.2em] text-pm-gold-light">Smart Talent Search</p><h1 className="mt-3 font-playfair text-5xl font-semibold">Décrivez le casting, le roster répond.</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">Écrivez votre besoin en langage naturel ou utilisez les filtres professionnels. La disponibilité est contrôlée contre les indisponibilités, options et bookings confirmés.</p></header>

    <form className="control-card space-y-5">
      <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] text-pm-wine"><Sparkles size={15}/> Recherche intelligente</span><textarea name="smart" defaultValue={smart} rows={3} className={`${field} w-full resize-y py-3`} placeholder="Ex. 15 femmes beauty, 170–180 cm, cheveux noirs, Libreville, disponibles jeudi"/><span className="mt-2 block text-xs leading-5 text-pm-ink/45">Le système reconnaît notamment le nombre de profils, genre, catégorie, âge, taille, cheveux, yeux, ville et dates relatives comme « demain » ou « jeudi ».</span></label>
      {smart && <div className="rounded-2xl bg-pm-peach/60 p-4"><p className="text-[9px] font-black uppercase tracking-[.14em] text-pm-wine">Interprétation du besoin</p><div className="mt-3 flex flex-wrap gap-2">{parsed.interpretation.length ? parsed.interpretation.map((item) => <span key={item} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-pm-ink/65">{item}</span>) : <span className="text-sm text-pm-ink/50">Aucun critère structuré détecté. Utilisez les filtres ci-dessous pour préciser la demande.</span>}</div></div>}
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <label className="md:col-span-2"><span className="mb-2 block text-xs font-bold">Nom / identifiant</span><div className="relative"><Search size={16} className="absolute left-3 top-3.5 text-pm-ink/35"/><input name="q" defaultValue={q} className={`${field} w-full pl-9`} placeholder="Rechercher…"/></div></label>
        <label><span className="mb-2 block text-xs font-bold">Genre</span><select name="gender" defaultValue={gender} className={`${field} w-full`}><option value="">Tous</option><option>Femme</option><option>Homme</option><option>Autre</option></select></label>
        <label><span className="mb-2 block text-xs font-bold">Ville</span><input name="location" defaultValue={location} className={`${field} w-full`} placeholder="Libreville…"/></label>
        <label><span className="mb-2 block text-xs font-bold">Catégorie</span><select name="category" defaultValue={category} className={`${field} w-full`}><option value="">Toutes</option><option>fashion</option><option>commercial</option><option>beauty</option><option>runway</option><option>fitness</option><option>e-commerce</option><option>influence</option></select></label>
        <label><span className="mb-2 block text-xs font-bold">Âge min.</span><input name="ageMin" type="number" min="0" defaultValue={ageMinText} className={`${field} w-full`}/></label>
        <label><span className="mb-2 block text-xs font-bold">Âge max.</span><input name="ageMax" type="number" min="0" defaultValue={ageMaxText} className={`${field} w-full`}/></label>
        <label><span className="mb-2 block text-xs font-bold">Taille min. cm</span><input name="heightMin" type="number" min="100" defaultValue={heightMinText} className={`${field} w-full`}/></label>
        <label><span className="mb-2 block text-xs font-bold">Taille max. cm</span><input name="heightMax" type="number" min="100" defaultValue={heightMaxText} className={`${field} w-full`}/></label>
        <label><span className="mb-2 block text-xs font-bold">Cheveux</span><input name="hair" defaultValue={hair} className={`${field} w-full`} placeholder="Noirs…"/></label>
        <label><span className="mb-2 block text-xs font-bold">Yeux</span><input name="eyes" defaultValue={eyes} className={`${field} w-full`} placeholder="Marron…"/></label>
        <label><span className="mb-2 block text-xs font-bold">Disponible du</span><input name="from" type="date" defaultValue={from} className={`${field} w-full`}/></label>
        <label><span className="mb-2 block text-xs font-bold">Au</span><input name="to" type="date" min={from || undefined} defaultValue={to} className={`${field} w-full`}/></label>
        <div className="flex items-end gap-2"><button className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-pm-ink px-5 text-xs font-black uppercase tracking-[.08em] text-white"><SlidersHorizontal size={15}/>Rechercher</button><Link href="/admin/talent-search" className="grid h-11 place-items-center rounded-full border border-pm-ink/15 px-4 text-xs font-bold">Effacer</Link></div>
      </div>
    </form>

    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="control-kicker">Résultats</p><h2 className="font-playfair text-3xl font-semibold">{models.length} talent{models.length > 1 ? 's' : ''}{parsed.limit && allMatches.length > parsed.limit ? ` sur ${allMatches.length} correspondances` : ''}</h2></div><div className="flex gap-2"><Link href="/admin/comp-cards" className="rounded-full border border-pm-ink/10 bg-white px-4 py-2 text-xs font-bold">Créer une comp card</Link><Link href="/admin/models" className="rounded-full border border-pm-ink/10 bg-white px-4 py-2 text-xs font-bold">Gérer le roster</Link></div></div>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{models.map((model: any) => <article key={model.id} className="overflow-hidden rounded-[1.7rem] border border-pm-ink/10 bg-white shadow-[0_18px_45px_rgba(70,40,35,.06)]"><div className="relative aspect-[4/5] bg-pm-peach"><Image src={model.image_url || '/logo.svg'} alt={model.name} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover"/></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-playfair text-2xl font-bold">{model.name}</h3><p className="mt-1 text-xs text-pm-ink/45">{[model.gender, model.age ? `${model.age} ans` : '', model.location].filter(Boolean).join(' · ')}</p></div>{model.is_public && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700">PUBLIC</span>}</div><div className="mt-4 grid grid-cols-2 gap-2 text-xs text-pm-ink/60"><span>Taille <b>{model.height_cm || model.height || '—'}</b></span><span>Pointure <b>{model.shoe_size || '—'}</b></span><span>Cheveux <b>{model.hair_color || '—'}</b></span><span>Yeux <b>{model.eye_color || '—'}</b></span></div><div className="mt-4 flex flex-wrap gap-1.5">{(model.categories || []).slice(0,4).map((cat: string) => <span key={cat} className="rounded-full bg-pm-peach px-2.5 py-1 text-[9px] font-bold text-pm-wine">{cat}</span>)}</div><div className="mt-5 grid grid-cols-2 gap-2"><Link href={`/mannequins/${model.id}`} target="_blank" className="inline-flex min-h-10 items-center justify-center rounded-full border border-pm-ink/10 text-xs font-bold">Fiche publique</Link><Link href={`/admin/comp-cards?model=${encodeURIComponent(model.id)}`} className="inline-flex min-h-10 items-center justify-center rounded-full bg-pm-ink text-xs font-bold text-white">Comp card</Link></div></div></article>)}</section>
    {!models.length && <div className="control-card text-center text-sm text-pm-ink/45">Aucun talent ne correspond à l’ensemble de ces critères.</div>}
  </div>;
}
