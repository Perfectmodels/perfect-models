import Link from 'next/link';
import { redirect } from 'next/navigation';
import CompCardDocument from '@/components/profile/CompCardDocument';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic='force-dynamic';

export default async function ModelCompCardPage(){
  const profile=await getCurrentAppProfile();
  if(!profile) redirect('/login?next=/profil/comp-card');
  if(profile.role!=='student') redirect(profile.role==='manager'?'/manager':'/admin');
  const supabase=createSupabaseAdminClient() as any;
  const {data:model}=await supabase.from('models').select('id,name,username,image_url,height_cm,chest_cm,waist_cm,hips_cm,shoe_size,hair_color,eye_color,location,categories,instagram_url,auth_user_id').eq('id',profile.profileId).eq('auth_user_id',profile.userId).maybeSingle();
  if(!model?.id) redirect('/profil');
  const {data:portfolio}=await supabase.from('model_portfolio_images').select('url,position').eq('model_id',model.id).order('position').limit(12);
  const images=(portfolio||[]).map((row:any)=>String(row.url)).filter(Boolean);
  return <main className="min-h-screen bg-pm-ivory px-4 py-7 text-pm-ink sm:px-6 lg:px-10"><div className="mx-auto max-w-7xl space-y-6"><header className="flex flex-wrap items-end justify-between gap-4 rounded-[2rem] bg-pm-wine p-7 text-white sm:p-9"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-pm-gold-light">Mon outil professionnel</p><h1 className="mt-3 font-playfair text-5xl font-semibold">Ma Comp Card</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">Votre carte est construite depuis les informations validées par l’agence et votre portfolio.</p></div><Link href="/profil/agency" className="rounded-full border border-white/30 px-5 py-2.5 text-xs font-black uppercase tracking-[.08em]">Retour à ma carrière</Link></header><CompCardDocument model={{id:String(model.id),name:String(model.name),username:model.username,imageUrl:model.image_url,heightCm:model.height_cm===null?null:Number(model.height_cm),chestCm:model.chest_cm===null?null:Number(model.chest_cm),waistCm:model.waist_cm===null?null:Number(model.waist_cm),hipsCm:model.hips_cm===null?null:Number(model.hips_cm),shoeSize:model.shoe_size,hairColor:model.hair_color,eyeColor:model.eye_color,location:model.location,categories:Array.isArray(model.categories)?model.categories:[],instagramUrl:model.instagram_url}} images={images}/></div></main>;
}
