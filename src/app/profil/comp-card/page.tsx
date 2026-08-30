import Link from 'next/link';
import { redirect } from 'next/navigation';
import CompCardDocument from '@/components/profile/CompCardDocument';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function objectValue(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

export default async function ModelCompCardPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/profil/comp-card');
  if (profile.role !== 'student') redirect(profile.role === 'manager' ? '/manager' : '/admin');

  const supabase = createSupabaseAdminClient() as any;
  const { data: model } = await supabase
    .from('models')
    .select('id,name,username,image_url,height_cm,chest_cm,waist_cm,hips_cm,shoe_size,hair_color,eye_color,location,categories,instagram_url,auth_user_id,raw_data')
    .eq('id', profile.profileId)
    .eq('auth_user_id', profile.userId)
    .maybeSingle();
  if (!model?.id) redirect('/profil');

  const { data: portfolio } = await supabase.from('model_portfolio_images').select('url,position').eq('model_id', model.id).order('position').limit(12);
  const images = (portfolio || []).map((row: any) => String(row.url)).filter(Boolean);
  const raw = objectValue(model.raw_data);
  const officialComposite = String(raw.compCardUrl || '');
  const compositePublic = raw.compCardIsPublic === true;

  return (
    <main className="min-h-screen min-w-0 overflow-x-clip px-3 py-5 text-pm-ink sm:px-5 sm:py-7 xl:px-8">
      <div className="mx-auto min-w-0 max-w-[1400px] space-y-6">
        <header className="min-w-0 rounded-[2rem] bg-pm-wine p-6 text-white sm:p-8">
          <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-pm-gold-light">Mon outil professionnel</p>
              <h1 className="mt-3 break-words font-playfair text-4xl font-semibold sm:text-5xl">Ma Comp Card</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">Votre composite téléversé reste disponible dans votre espace. La version dynamique générée depuis vos informations reste accessible juste en dessous.</p>
            </div>
            <Link href="/profil/edition" className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/30 px-5 text-xs font-black uppercase tracking-[.08em] sm:w-auto">Gérer mes médias</Link>
          </div>
        </header>

        {officialComposite ? (
          <section className="grid min-w-0 gap-6 rounded-[2rem] border border-pm-ink/10 bg-white p-5 shadow-[0_18px_55px_rgba(37,24,32,.05)] sm:p-7 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 overflow-hidden rounded-[1.5rem] bg-pm-ivory">
              <img src={officialComposite} alt={`Composite officiel de ${String(model.name)}`} className="mx-auto h-auto max-h-[1100px] w-full max-w-full object-contain" />
            </div>
            <div className="min-w-0 self-start rounded-[1.5rem] bg-pm-ink p-5 text-white sm:p-6">
              <p className="text-[9px] font-black uppercase tracking-[.18em] text-pm-gold-light">Document téléversé</p>
              <h2 className="mt-2 break-words font-playfair text-3xl font-semibold">Composite officiel</h2>
              <p className="mt-4 text-sm leading-6 text-white/55">Ce fichier reste lié à votre compte et peut être remplacé à tout moment depuis « Mes informations & médias ».</p>
              <a href={officialComposite} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-pm-gold px-5 text-[10px] font-black uppercase tracking-[.1em] text-pm-ink">Ouvrir / télécharger</a>
              {compositePublic ? <Link href={`/composite/${encodeURIComponent(String(model.id))}`} target="_blank" className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/20 px-5 text-center text-[10px] font-black uppercase tracking-[.1em] text-white">Voir la version publique</Link> : <p className="mt-4 rounded-xl bg-white/7 p-3 text-xs leading-5 text-white/45">Ce composite est actuellement privé.</p>}
            </div>
          </section>
        ) : (
          <section className="min-w-0 rounded-[2rem] border border-dashed border-pm-wine/25 bg-white p-7 text-center sm:p-10">
            <p className="font-playfair text-3xl font-semibold">Aucun composite image téléversé</p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-pm-ink/50">Vous pouvez déposer votre composite vous-même et le conserver dans votre espace mannequin.</p>
            <Link href="/profil/edition" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-pm-wine px-6 text-[10px] font-black uppercase tracking-[.1em] text-white">Téléverser mon composite</Link>
          </section>
        )}

        <section className="min-w-0">
          <div className="mb-4"><p className="text-[9px] font-black uppercase tracking-[.18em] text-pm-coral">Version dynamique</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Comp Card générée depuis mon profil</h2></div>
          <CompCardDocument
            model={{
              id: String(model.id),
              name: String(model.name),
              username: model.username,
              imageUrl: model.image_url,
              heightCm: model.height_cm === null ? null : Number(model.height_cm),
              chestCm: model.chest_cm === null ? null : Number(model.chest_cm),
              waistCm: model.waist_cm === null ? null : Number(model.waist_cm),
              hipsCm: model.hips_cm === null ? null : Number(model.hips_cm),
              shoeSize: model.shoe_size,
              hairColor: model.hair_color,
              eyeColor: model.eye_color,
              location: model.location,
              categories: Array.isArray(model.categories) ? model.categories : [],
              instagramUrl: model.instagram_url,
            }}
            images={images}
          />
        </section>
      </div>
    </main>
  );
}
