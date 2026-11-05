import { redirect } from 'next/navigation';
import Link from 'next/link';
import TalentRoster, { type TalentRosterRow } from '@/components/admin/TalentRoster';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export default async function ModelsAdminPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/models');
  if (!['admin','manager'].includes(profile.role) || !hasAdminPermission(profile,'models')) redirect(profile.role === 'manager' ? '/manager' : '/profil');
  const supabase = createSupabaseAdminClient() as any;
  const now = new Date().toISOString();
  const [{ data, error }, { data: availabilityRows, error: availabilityError }] = await Promise.all([
    supabase.from('models').select('id,name,username,image_url,gender,categories,height,height_cm,status,level,location,is_public,is_active').order('name', { ascending: true }).limit(500),
    supabase.from('model_availability').select('model_id,status,starts_at,ends_at').lte('starts_at', now).gte('ends_at', now).order('starts_at', { ascending: false }).limit(1000),
  ]);
  if (error) throw new Error(error.message);
  if (availabilityError) throw new Error(availabilityError.message);
  const availabilityByModel = new Map<string,string>();
  for (const item of availabilityRows || []) if (!availabilityByModel.has(String(item.model_id))) availabilityByModel.set(String(item.model_id), String(item.status || 'tentative'));
  const talents: TalentRosterRow[] = (data || []).map((model:any) => ({ ...model, categories:Array.isArray(model.categories)?model.categories:[], availability:availabilityByModel.get(String(model.id)) || 'tentative' }));

  return <div className="space-y-5">
    <section className="rounded-[1.8rem] bg-pm-wine p-6 text-white sm:p-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-pm-gold-light">Talents · cockpit métier</p><h1 className="mt-2 font-playfair text-4xl font-semibold sm:text-5xl">Roster & fiches Talent 360°</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">Une seule entrée par mannequin pour piloter son profil, ses médias, sa carrière, ses opérations, ses finances, sa formation et ses accès.</p></div>
        <div className="flex flex-wrap gap-2"><Link href="/admin/talent-search" className="rounded-full bg-white px-5 py-2.5 text-xs font-black uppercase tracking-[.08em] text-pm-wine">Recherche avancée</Link><Link href="/admin/casting-applications" className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-black uppercase tracking-[.08em] text-white">Candidatures</Link></div>
      </div>
    </section>
    <TalentRoster initialTalents={talents}/>
  </div>;
}
