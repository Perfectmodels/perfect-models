import Link from 'next/link';
import { redirect } from 'next/navigation';
import ResponsiveResourceManager from '@/components/admin/ResponsiveResourceManager';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { MODEL_ADMIN_COLUMNS, MODEL_ADMIN_FIELDS } from '@/lib/model-admin-fields';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 15;

export default async function ModelsAdminPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/models');
  if (!['admin','manager'].includes(profile.role) || !hasAdminPermission(profile,'models')) redirect(profile.role === 'manager' ? '/manager' : '/profil');
  const supabase = createSupabaseAdminClient() as any;
  const { data, error, count } = await supabase.from('models').select('*', { count: 'exact' }).order('name', { ascending: true }).range(0,PAGE_SIZE-1);
  if (error) throw new Error(error.message);
  return <div className="space-y-5"><section className="flex flex-col gap-4 rounded-[1.7rem] border border-pm-ink/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="control-kicker">Fiche talent 360°</p><h1 className="mt-1 font-playfair text-3xl font-semibold">Roster professionnel</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-pm-ink/50">Mensurations, disponibilité, statut et informations métier sont présentés dans des champs lisibles et exploitables. Aucun JSON technique ni tableau large n’est demandé à l’administrateur ou au manager.</p></div><div className="flex flex-wrap gap-2"><Link href="/admin/talent-search" className="rounded-full bg-pm-ink px-5 py-2.5 text-xs font-black uppercase tracking-[.08em] text-white">Recherche avancée</Link><Link href="/admin/talent-availability" className="rounded-full border border-pm-ink/15 px-5 py-2.5 text-xs font-black uppercase tracking-[.08em]">Disponibilités</Link></div></section><ResponsiveResourceManager resource="models" title="Mannequins / Talents" primaryKey="id" columns={MODEL_ADMIN_COLUMNS} fields={MODEL_ADMIN_FIELDS} initialRows={data || []} initialTotal={Number(count || 0)}/></div>;
}
