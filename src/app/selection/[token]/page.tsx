import { notFound } from 'next/navigation';
import ClientSelectionPortal from '@/components/public/ClientSelectionPortal';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sélection talents | Perfect Models Management', robots: { index: false, follow: false } };

export default async function ClientSelectionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();
  const supabase = createSupabaseAdminClient() as any;
  const { data: selection, error } = await supabase.from('client_selections').select('id,title,status,expires_at,casting_id,client_id').eq('public_token',token).maybeSingle();
  if (error || !selection) notFound();
  const expired = selection.expires_at && new Date(selection.expires_at) < new Date();
  if (selection.status !== 'active' || expired) return <main className="grid min-h-screen place-items-center bg-pm-ivory px-5 text-center text-pm-ink"><div className="max-w-xl rounded-[2rem] bg-white p-9"><p className="editorial-kicker text-pm-coral">Perfect Models Management</p><h1 className="mt-4 font-playfair text-4xl font-bold">Cette sélection n’est plus disponible.</h1><p className="mt-4 text-sm leading-7 text-pm-ink/50">Le lien a été clôturé ou a atteint sa date d’expiration.</p></div></main>;
  const [{ data: items, error: itemsError }, { data: client }, { data: casting }] = await Promise.all([
    supabase.from('client_selection_items').select('id,model_id,decision,client_comment').eq('selection_id',selection.id).order('created_at'),
    selection.client_id ? supabase.from('agency_clients').select('name').eq('id',selection.client_id).maybeSingle() : Promise.resolve({data:null}),
    selection.casting_id ? supabase.from('castings').select('title,brief,starts_at,location').eq('id',selection.casting_id).maybeSingle() : Promise.resolve({data:null}),
  ]);
  if (itemsError) throw new Error(itemsError.message);
  const modelIds = (items || []).map((item:any)=>item.model_id);
  const { data: models } = modelIds.length ? await supabase.from('models').select('id,name,image_url,location,gender,height_cm,chest_cm,waist_cm,hips_cm,shoe_size,categories').in('id',modelIds) : {data:[]};
  const modelMap = new Map((models || []).map((model:any)=>[String(model.id),model]));
  const talents = (items || []).map((item:any)=>{const model:any=modelMap.get(String(item.model_id));return { itemId:String(item.id), modelId:String(item.model_id), name:String(model?.name || 'Talent PMM'), imageUrl:model?.image_url?String(model.image_url):null, location:model?.location?String(model.location):null, gender:model?.gender?String(model.gender):null, heightCm:model?.height_cm?Number(model.height_cm):null, chestCm:model?.chest_cm?Number(model.chest_cm):null, waistCm:model?.waist_cm?Number(model.waist_cm):null, hipsCm:model?.hips_cm?Number(model.hips_cm):null, shoeSize:model?.shoe_size?String(model.shoe_size):null, categories:Array.isArray(model?.categories)?model.categories.map(String):[], decision:String(item.decision||'pending'), comment:String(item.client_comment||'')};});
  return <main className="min-h-screen bg-pm-ivory px-4 py-8 text-pm-ink sm:px-6 lg:px-10"><div className="mx-auto max-w-[1500px]"><header className="mb-8 rounded-[2.2rem] bg-pm-wine p-7 text-white sm:p-10"><p className="text-[10px] font-black uppercase tracking-[.2em] text-pm-gold-light">Sélection privée · {client?.name || 'Client PMM'}</p><h1 className="mt-4 font-playfair text-5xl font-semibold sm:text-6xl">{selection.title}</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">{casting?.brief || 'Étudiez les profils proposés et indiquez vos favoris, votre shortlist ou les profils que vous ne souhaitez pas retenir.'}</p><div className="mt-5 flex flex-wrap gap-2 text-xs text-white/60">{casting?.title && <span>{casting.title}</span>}{casting?.starts_at && <span>· {new Date(casting.starts_at).toLocaleDateString('fr-FR')}</span>}{casting?.location && <span>· {casting.location}</span>}<span>· {talents.length} talent{talents.length>1?'s':''}</span></div></header><ClientSelectionPortal token={token} initialTalents={talents}/></div></main>;
}
