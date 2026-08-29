import Link from 'next/link';
import { Clock3, ShieldCheck } from 'lucide-react';
import ModelSignupForm from '@/components/auth/ModelSignupForm';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Inscription mannequin | Perfect Models Management', robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  if (status === 'pending-review') {
    return <main className="grid min-h-screen place-items-center bg-pm-ivory px-5 text-pm-ink"><section className="w-full max-w-2xl rounded-[2rem] border border-pm-ink/10 bg-white p-7 text-center shadow-[0_22px_65px_rgba(91,46,37,.08)] sm:p-10"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-pm-peach text-pm-wine"><Clock3 size={28}/></div><p className="mt-6 text-xs font-extrabold uppercase tracking-[.14em] text-pm-coral">E-mail confirmé</p><h1 className="mt-3 font-playfair text-4xl font-bold">Votre compte est en validation agence</h1><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-pm-ink/60">Votre adresse e-mail a bien été confirmée. Votre ancien dossier mannequin ne contenait pas suffisamment d’informations concordantes pour autoriser un rattachement automatique. L’agence doit maintenant valider que le profil sélectionné vous appartient.</p><div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-pm-ivory px-4 py-3 text-sm font-semibold text-pm-wine"><ShieldCheck size={17}/> Votre profil public reste protégé pendant ce contrôle.</div><Link href="/" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-pm-ink px-6 text-xs font-extrabold uppercase tracking-[.1em] text-white">Retour au site</Link></section></main>;
  }

  const supabase = createSupabaseAdminClient() as any;
  const { data, error } = await supabase.from('models').select('id,name,username,image_url,location,auth_user_id,claim_status').is('auth_user_id', null).order('name', { ascending: true });
  if (error) throw new Error(error.message);
  const blocked = new Set(['pending_email_confirmation', 'pending_agency_review', 'claimed', 'claim_in_progress']);
  const models = (Array.isArray(data) ? data : []).filter((model: any) => !blocked.has(String(model.claim_status || ''))).map((model: any) => ({ id: String(model.id), name: String(model.name || 'Mannequin PMM'), username: model.username ? String(model.username) : null, imageUrl: model.image_url ? String(model.image_url) : null, location: model.location ? String(model.location) : null }));
  return <main className="min-h-screen bg-pm-ivory px-4 py-8 text-pm-ink sm:px-6 lg:px-10 lg:py-12"><div className="mx-auto max-w-6xl"><div className="mb-10 max-w-3xl"><p className="editorial-kicker text-pm-coral">Perfect Models Management</p><h1 className="mt-4 font-playfair text-5xl font-black italic leading-[.95] sm:text-6xl">Activez votre espace mannequin.</h1><p className="mt-5 text-sm leading-7 text-pm-ink/60">Cette inscription est réservée aux mannequins déjà enregistrés dans la base de l’agence et dont le profil n’est pas encore rattaché à un compte.</p></div><ModelSignupForm models={models}/></div></main>;
}
