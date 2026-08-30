import { redirect } from 'next/navigation';
import ModelProfileEditor from '@/components/profile/ModelProfileEditor';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function objectValue(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function value(value: unknown) {
  return value === null || value === undefined ? '' : String(value);
}

export default async function ModelProfileEditPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/profil/edition');
  if (profile.role !== 'student') redirect(profile.role === 'manager' ? '/manager' : '/admin');

  const supabase = createSupabaseAdminClient() as any;
  const { data: model, error } = await supabase
    .from('models')
    .select('id,auth_user_id,name,email,username,phone,gender,birth_date,nationality,instagram_url,location,height_cm,chest_cm,waist_cm,hips_cm,shoe_size,hair_color,eye_color,categories,mobility,experience,journey,image_url,raw_data')
    .eq('id', profile.profileId)
    .eq('auth_user_id', profile.userId)
    .maybeSingle();

  if (error || !model?.id) redirect('/profil');

  const { data: portfolio } = await supabase
    .from('model_portfolio_images')
    .select('id,url,position,caption')
    .eq('model_id', model.id)
    .order('position', { ascending: true });

  const raw = objectValue(model.raw_data);
  const initialModel = {
    name: value(model.name),
    email: value(model.email || profile.email),
    username: value(model.username || profile.identifier),
    phone: value(model.phone),
    gender: value(model.gender),
    birthDate: value(model.birth_date),
    nationality: value(model.nationality),
    instagramUrl: value(model.instagram_url),
    location: value(model.location),
    heightCm: value(model.height_cm),
    chestCm: value(model.chest_cm),
    waistCm: value(model.waist_cm),
    hipsCm: value(model.hips_cm),
    shoeSize: value(model.shoe_size),
    hairColor: value(model.hair_color),
    eyeColor: value(model.eye_color),
    categories: Array.isArray(model.categories) ? model.categories.map(String).join(', ') : '',
    mobility: Array.isArray(model.mobility) ? model.mobility.map(String).join(', ') : '',
    experience: value(model.experience),
    journey: value(model.journey),
    imageUrl: value(model.image_url),
    compCardUrl: value(raw.compCardUrl),
    compCardPublic: raw.compCardIsPublic === true,
  };

  const initialPortfolio = Array.isArray(portfolio)
    ? portfolio.map((item: any) => ({
        id: String(item.id),
        url: String(item.url || ''),
        position: Number(item.position || 0),
        caption: item.caption ? String(item.caption) : null,
      })).filter((item: any) => item.url)
    : [];

  return (
    <main className="min-h-screen min-w-0 overflow-x-clip px-3 py-5 sm:px-5 sm:py-7 xl:px-8">
      <div className="mx-auto min-w-0 max-w-[1500px]">
        <ModelProfileEditor modelId={String(model.id)} initialModel={initialModel} initialPortfolio={initialPortfolio} />
      </div>
    </main>
  );
}
