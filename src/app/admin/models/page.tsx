import Link from 'next/link';
import { redirect } from 'next/navigation';
import ResponsiveResourceManager from '@/components/admin/ResponsiveResourceManager';
import ModelVisibilityPanel from '@/components/admin/ModelVisibilityPanel';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { MODEL_ADMIN_COLUMNS, MODEL_ADMIN_FIELDS } from '@/lib/model-admin-fields';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 15;

const workspace = [
  ['Profil & mensurations', 'Identité, coordonnées, mensurations, niveau, mobilité et statut agence.'],
  ['Portfolio & Comp Card', 'Photo principale, visibilité publique, médias et outils de présentation.'],
  ['Accès & sécurité', 'Compte mannequin, récupération, activation et suspension des accès.'],
  ['Carrière & disponibilité', 'Palmarès, collaborations, disponibilités, castings et bookings.'],
  ['Classroom', 'Lecture, quiz, progression, incidents et validation des formations.'],
  ['Contrats & finance', 'Contrats, droits d’image, cachets et suivi administratif.'],
] as const;

export default async function ModelsAdminPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/models');
  if (!['admin','manager'].includes(profile.role) || !hasAdminPermission(profile,'models')) redirect(profile.role === 'manager' ? '/manager' : '/profil');
  const supabase = createSupabaseAdminClient() as any;
  const [{ data, error, count }, { data: visibilityRows, error: visibilityError }] = await Promise.all([
    supabase.from('models').select('*', { count: 'exact' }).order('name', { ascending: true }).range(0,PAGE_SIZE-1),
    supabase.from('models').select('id,name,username,image_url,is_public,is_active,status').order('name', { ascending: true }).limit(500),
  ]);
  if (error) throw new Error(error.message);
  if (visibilityError) throw new Error(visibilityError.message);

  return <div className="space-y-5">
    <section className="rounded-[1.7rem] border border-pm-ink/10 bg-white p-5 sm:p-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div><p className="control-kicker">Talents · cockpit métier</p><h1 className="mt-1 font-playfair text-3xl font-semibold">Fiches Talent 360°</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-pm-ink/55">Le mannequin devient l’objet métier central. Les informations, accès, médias, carrière, Classroom et opérations associées doivent être pilotables depuis sa fiche, sans chercher la même personne dans plusieurs modules.</p></div>
        <div className="flex flex-wrap gap-2"><Link href="/admin/talent-search" className="rounded-full bg-pm-ink px-5 py-2.5 text-xs font-black uppercase tracking-[.08em] text-white">Rechercher un talent</Link><Link href="/admin/casting-applications" className="rounded-full border border-pm-ink/15 px-5 py-2.5 text-xs font-black uppercase tracking-[.08em]">Candidatures</Link></div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{workspace.map(([title,description]) => <article key={title} className="rounded-2xl border border-pm-ink/[.08] bg-[#FBF7F2] p-4"><h2 className="text-sm font-black text-pm-ink">{title}</h2><p className="mt-1 text-xs leading-5 text-pm-ink/50">{description}</p></article>)}</div>
    </section>

    <section className="rounded-[1.7rem] border border-pm-ink/10 bg-white p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="control-kicker">Accès rapide</p><h2 className="mt-1 font-playfair text-2xl font-semibold">Ouvrir une fiche Talent 360°</h2><p className="mt-1 text-sm text-pm-ink/50">Les opérations restent disponibles globalement, mais le mannequin devient le point d’entrée principal.</p></div><span className="rounded-full bg-pm-peach px-4 py-2 text-xs font-black">{Number(count||0)} talents</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{(data||[]).slice(0,6).map((model:any)=><article key={model.id} className="flex items-center gap-4 rounded-2xl border border-pm-ink/[.08] bg-[#FBF7F2] p-4">{model.image_url ? <img src={model.image_url} alt="" className="h-16 w-14 rounded-xl object-cover"/> : <div className="h-16 w-14 rounded-xl bg-pm-peach"/>}<div className="min-w-0 flex-1"><h3 className="truncate font-bold">{model.name}</h3><p className="mt-1 text-xs text-pm-ink/45">{model.height_cm ? model.height_cm+' cm · ' : ''}{model.level || 'Niveau non renseigné'}</p><div className="mt-3 flex flex-wrap gap-2"><Link href={`/admin/talents/${model.id}`} className="rounded-full bg-pm-ink px-3 py-1.5 text-[10px] font-black uppercase tracking-[.06em] text-white">Ouvrir la fiche</Link><Link href={`/models/${model.username || model.id}`} className="rounded-full border border-pm-ink/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.06em]">Profil public</Link></div></div></article>)}</div></section>

    <section className="rounded-[1.7rem] border border-pm-ink/10 bg-white p-5"><div className="mb-4"><p className="control-kicker">Visibilité & statut</p><h2 className="mt-1 font-playfair text-2xl font-semibold">Pilotage du roster</h2><p className="mt-1 text-sm text-pm-ink/50">La publication et l’activation du mannequin se gèrent ici, au même endroit que sa fiche métier.</p></div><ModelVisibilityPanel initialModels={Array.isArray(visibilityRows) ? visibilityRows : []}/></section>

    <section className="rounded-[1.7rem] border border-pm-ink/10 bg-white p-2 sm:p-4"><ResponsiveResourceManager resource="models" title="Talents de l’agence" primaryKey="id" columns={MODEL_ADMIN_COLUMNS} fields={MODEL_ADMIN_FIELDS} initialRows={data || []} initialTotal={Number(count || 0)}/></section>
  </div>;
}
