import { redirect } from 'next/navigation';
import CompCardDocument from '@/components/profile/CompCardDocument';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type Params = Record<string,string|string[]|undefined>;
const one=(value:string|string[]|undefined)=>Array.isArray(value)?value[0]||'':value||'';

export default async function CompCardsAdminPage({searchParams}:{searchParams:Promise<Params>}){
  const profile=await getCurrentAppProfile();
  if(!profile) redirect('/login?next=/admin/comp-cards');
  if(!['admin','manager'].includes(profile.role)) redirect('/profil');
  if(!hasAdminPermission(profile,'models')) redirect(profile.role==='manager'?'/manager':'/profil');
  const supabase=createSupabaseAdminClient() as any;
  const params=await searchParams;
  const {data:modelList,error:listError}=await supabase.from('models').select('id,name,username,is_active').eq('is_active',true).order('name');
  if(listError) throw new Error(listError.message);
  const requested=one(params.model);
  const selectedId=requested || String(modelList?.[0]?.id||'');
  const {data:model,error:modelError}=selectedId?await supabase.from('models').select('id,name,username,image_url,height_cm,chest_cm,waist_cm,hips_cm,shoe_size,hair_color,eye_color,location,categories,instagram_url').eq('id',selectedId).maybeSingle():{data:null,error:null};
  if(modelError) throw new Error(modelError.message);
  const {data:portfolio}=model?.id?await supabase.from('model_portfolio_images').select('url,position').eq('model_id',model.id).order('position').limit(12):{data:[]};
  const images=(portfolio||[]).map((row:any)=>String(row.url)).filter(Boolean);
  return <div className="space-y-6 pb-12"><header className="rounded-[2rem] bg-pm-wine p-7 text-white sm:p-9"><p className="text-[10px] font-black uppercase tracking-[.2em] text-pm-gold-light">Talents · Documents</p><h1 className="mt-3 font-playfair text-5xl font-semibold">Studio Comp Cards</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">Générez une comp card cohérente avec la fiche 360° du talent. Les mensurations et le portfolio proviennent directement de Supabase.</p></header><form className="control-card flex flex-col gap-3 sm:flex-row sm:items-end"><label className="flex-1"><span className="mb-2 block text-xs font-bold">Mannequin</span><select name="model" defaultValue={selectedId} className="min-h-11 w-full rounded-xl border border-pm-ink/15 bg-white px-3 text-sm outline-none focus:border-pm-coral focus:ring-4 focus:ring-pm-coral/10">{(modelList||[]).map((item:any)=><option key={item.id} value={item.id}>{item.name} {item.username?`· ${item.username}`:''}</option>)}</select></label><button className="min-h-11 rounded-full bg-pm-ink px-6 text-xs font-black uppercase tracking-[.08em] text-white">Charger la fiche</button></form>{model?<CompCardDocument model={{id:String(model.id),name:String(model.name),username:model.username,imageUrl:model.image_url,heightCm:model.height_cm===null?null:Number(model.height_cm),chestCm:model.chest_cm===null?null:Number(model.chest_cm),waistCm:model.waist_cm===null?null:Number(model.waist_cm),hipsCm:model.hips_cm===null?null:Number(model.hips_cm),shoeSize:model.shoe_size,hairColor:model.hair_color,eyeColor:model.eye_color,location:model.location,categories:Array.isArray(model.categories)?model.categories:[],instagramUrl:model.instagram_url}} images={images}/>:<div className="control-card text-center text-sm text-pm-ink/45">Aucun talent actif à afficher.</div>}</div>;
}
