import Link from 'next/link';
import { redirect } from 'next/navigation';
import FirstLoginSecurityPrompt from '@/components/auth/FirstLoginSecurityPrompt';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/profil');
  if (profile.role === 'admin' || profile.role === 'manager') redirect('/admin');
  if (profile.role === 'jury') redirect('/jury/casting');
  if (profile.role === 'registration') redirect('/enregistrement/casting');

  const supabase = createSupabaseAdminClient() as any;
  const { data: model } = await supabase.from('models').select('*').eq('id', profile.profileId).maybeSingle();
  const { data: images } = model ? await supabase.from('model_portfolio_images').select('url,position').eq('model_id', profile.profileId).order('position') : { data: [] };

  return (
    <main className="min-h-screen bg-pm-dark px-5 py-12 text-pm-off-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-white/10 pb-8"><p className="text-[9px] font-black uppercase tracking-[.35em] text-pm-gold">Espace mannequin · Supabase</p><h1 className="mt-3 font-playfair text-5xl font-bold">{model?.name || profile.name}</h1><p className="mt-3 text-sm text-white/40">{profile.email} · {model?.username || profile.identifier}</p></div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
          <div>{model?.image_url ? <img src={model.image_url} alt={model.name || profile.name} className="aspect-[3/4] w-full object-cover" /> : <div className="grid aspect-[3/4] place-items-center border border-white/10 text-sm text-white/30">Photo de profil non définie</div>}</div>
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[['Taille', model?.height],['Niveau', model?.level],['Localisation', model?.location],['Statut', model?.status],['Profil public', model?.is_public ? 'Oui' : 'Non'],['Catégories', Array.isArray(model?.categories) ? model.categories.join(', ') : '']].map(([label,value]) => <div key={label} className="border border-white/10 bg-black/20 p-4"><p className="text-[8px] font-black uppercase tracking-[.2em] text-pm-gold">{label}</p><p className="mt-2 text-sm text-white/60">{String(value || '—')}</p></div>)}</div>
            <div className="flex flex-wrap gap-3"><Link href="/profil/classroom" className="bg-pm-gold px-5 py-3 text-[9px] font-black uppercase tracking-wider text-black">Classroom</Link><Link href="/profil/formation" className="border border-white/15 px-5 py-3 text-[9px] font-black uppercase tracking-wider">Formation</Link><Link href="/formations/forum" className="border border-white/15 px-5 py-3 text-[9px] font-black uppercase tracking-wider">Forum</Link></div>
            {Array.isArray(images) && images.length > 0 && <section><h2 className="font-playfair text-3xl font-bold">Portfolio</h2><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{images.map((image:any) => <img key={`${image.position}-${image.url}`} src={image.url} alt="Portfolio" className="aspect-[3/4] w-full object-cover" />)}</div></section>}
          </div>
        </div>
      </div>
      <FirstLoginSecurityPrompt />
    </main>
  );
}
