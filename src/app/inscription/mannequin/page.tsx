import ModelSignupForm from '@/components/auth/ModelSignupForm';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Inscription mannequin | Perfect Models Management', robots: { index: false, follow: false } };

export default async function Page() {
  const supabase = createSupabaseAdminClient() as any;
  const { data, error } = await supabase.from('models').select('id,name,username,image_url,location,auth_user_id,claim_status').is('auth_user_id', null).order('name', { ascending: true });
  if (error) throw new Error(error.message);
  const blocked = new Set(['pending_email_confirmation', 'pending_agency_review', 'claimed', 'claim_in_progress']);
  const models = (Array.isArray(data) ? data : []).filter((model: any) => !blocked.has(String(model.claim_status || ''))).map((model: any) => ({ id: String(model.id), name: String(model.name || 'Mannequin PMM'), username: model.username ? String(model.username) : null, imageUrl: model.image_url ? String(model.image_url) : null, location: model.location ? String(model.location) : null }));

  return <main className="min-h-screen bg-pm-ivory px-4 py-8 text-pm-ink sm:px-6 lg:px-10 lg:py-12"><div className="mx-auto max-w-6xl"><div className="mb-10 max-w-3xl"><p className="editorial-kicker text-pm-coral">Perfect Models Management</p><h1 className="mt-4 font-playfair text-5xl font-black italic leading-[.95] sm:text-6xl">Activez votre espace mannequin.</h1><p className="mt-5 text-sm leading-7 text-pm-ink/60">Cette inscription est réservée aux mannequins déjà enregistrés dans la base de l’agence et dont le profil n’est pas encore rattaché à un compte.</p></div><ModelSignupForm models={models}/></div></main>;
}
