import Link from 'next/link';
import { redirect } from 'next/navigation';
import ModelAgencyPortal from '@/components/profile/ModelAgencyPortal';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const money = (value:number,currency='XAF') => new Intl.NumberFormat('fr-FR',{style:'currency',currency,maximumFractionDigits:0}).format(value||0);

export default async function ModelAgencyPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/profil/agency');
  if (profile.role !== 'student') redirect(profile.role === 'manager' ? '/manager' : '/admin');
  const supabase = createSupabaseAdminClient() as any;
  const { data:model } = await supabase.from('models').select('id,name,auth_user_id').eq('id',profile.profileId).eq('auth_user_id',profile.userId).maybeSingle();
  if(!model?.id) redirect('/profil');
  const now = new Date().toISOString();
  const [{data:availability},{data:castingRows},{data:bookings},{data:options},{data:contracts},{data:rights},{data:payments}] = await Promise.all([
    supabase.from('model_availability').select('id,starts_at,ends_at,status,reason,source').eq('model_id',model.id).gte('ends_at',now).order('starts_at'),
    supabase.from('casting_talents').select('id,casting_id,stage,match_score').eq('model_id',model.id).not('stage','in','("rejected")').order('created_at',{ascending:false}).limit(20),
    supabase.from('bookings').select('id,title,status,starts_at,ends_at,location,model_net_amount,currency').eq('model_id',model.id).neq('status','cancelled').order('starts_at',{ascending:true}).limit(20),
    supabase.from('booking_options').select('id,title,status,starts_at,ends_at,amount,currency,option_rank').eq('model_id',model.id).eq('status','active').order('starts_at').limit(20),
    supabase.from('contracts').select('id,title,contract_type,status,document_url,expires_at,signed_at').eq('model_id',model.id).order('created_at',{ascending:false}).limit(20),
    supabase.from('image_rights').select('id,campaign,status,territory,usage_channels,starts_on,ends_on').eq('model_id',model.id).order('ends_on',{ascending:true}).limit(20),
    supabase.from('monthly_payments').select('id,period,amount,currency,status,paid_at').eq('model_id',model.id).order('period',{ascending:false}).limit(12),
  ]);
  const castingIds = (castingRows||[]).map((row:any)=>row.casting_id);
  const { data:castingDefs } = castingIds.length ? await supabase.from('castings').select('id,title,starts_at,location,status').in('id',castingIds) : {data:[]};
  const castingMap = new Map((castingDefs||[]).map((row:any)=>[String(row.id),row]));
  const castings = (castingRows||[]).map((row:any)=>{const casting:any=castingMap.get(String(row.casting_id));return {id:String(row.id),castingId:String(row.casting_id),title:String(casting?.title||'Casting PMM'),startsAt:casting?.starts_at?String(casting.starts_at):null,location:casting?.location?String(casting.location):null,stage:String(row.stage)};});
  const upcomingJobs=(bookings||[]).filter((row:any)=>['confirmed','in_production'].includes(row.status)&&(!row.ends_at||new Date(row.ends_at)>=new Date()));
  const pendingCastings=(castingRows||[]).filter((row:any)=>['invited','confirmed'].includes(row.stage)).length;
  const pendingContracts=(contracts||[]).filter((row:any)=>['sent','viewed'].includes(row.status)).length;
  const paymentTotal=(payments||[]).filter((row:any)=>row.status==='paid').reduce((sum:number,row:any)=>sum+Number(row.amount||0),0);
  return <main className="min-h-screen bg-pm-ivory px-4 py-7 text-pm-ink sm:px-6 lg:px-10"><div className="mx-auto max-w-7xl space-y-6"><header className="rounded-[2rem] bg-pm-wine p-7 text-white sm:p-9"><p className="text-[10px] font-black uppercase tracking-[.2em] text-pm-gold-light">Portail mannequin · {model.name}</p><h1 className="mt-3 font-playfair text-5xl font-semibold">Ma carrière avec l’agence</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">Disponibilités, castings, options, bookings, contrats, droits d’image et paiements sont regroupés dans ce centre opérationnel.</p><div className="mt-5 flex flex-wrap gap-2"><Link href="/profil" className="inline-flex rounded-full border border-white/30 px-5 py-2.5 text-xs font-black uppercase tracking-[.08em]">Retour à mon profil</Link><Link href="/profil/comp-card" className="inline-flex rounded-full bg-white px-5 py-2.5 text-xs font-black uppercase tracking-[.08em] text-pm-wine">Ma comp card PDF</Link></div></header><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Jobs à venir",String(upcomingJobs.length)],["Castings en attente",String(pendingCastings)],["Contrats à traiter",String(pendingContracts)],["Paiements reçus",money(paymentTotal)]].map(([label,value])=><div key={label} className="rounded-[1.5rem] border border-pm-ink/10 bg-white p-5"><p className="text-[9px] font-black uppercase tracking-[.12em] text-pm-coral">{label}</p><p className="mt-4 font-playfair text-4xl font-semibold">{value}</p></div>)}</section><ModelAgencyPortal modelName={String(model.name)} initialAvailability={availability||[]} initialCastings={castings} initialContracts={contracts||[]}/><section className="grid gap-5 lg:grid-cols-2"><Panel title="Mes bookings">{(bookings||[]).map((row:any)=><Row key={row.id} title={row.title} meta={`${row.status} · ${row.starts_at?new Date(row.starts_at).toLocaleDateString('fr-FR'):'date à confirmer'}${row.model_net_amount?` · ${money(Number(row.model_net_amount),row.currency||'XAF')}`:''}`}/>)}</Panel><Panel title="Mes options">{(options||[]).map((row:any)=><Row key={row.id} title={`Option ${row.option_rank} · ${row.title}`} meta={`${new Date(row.starts_at).toLocaleDateString('fr-FR')} → ${new Date(row.ends_at).toLocaleDateString('fr-FR')}`}/>)}</Panel><Panel title="Droits d’image">{(rights||[]).map((row:any)=><Row key={row.id} title={row.campaign} meta={`${row.status} · ${row.starts_on} → ${row.ends_on} · ${(row.territory||[]).join(', ')||'territoire non précisé'}`}/>)}</Panel><Panel title="Mes paiements">{(payments||[]).map((row:any)=><Row key={row.id} title={`${row.period||'Période'} · ${money(Number(row.amount||0),row.currency||'XAF')}`} meta={`${row.status}${row.paid_at?` · payé ${new Date(row.paid_at).toLocaleDateString('fr-FR')}`:''}`}/>)}</Panel></section></div></main>;
}

function Panel({title,children}:{title:string;children:React.ReactNode}){const count=Array.isArray(children)?children.length:children?1:0;return <section className="rounded-[1.7rem] border border-pm-ink/10 bg-white p-5 sm:p-6"><h2 className="font-playfair text-2xl font-bold">{title}</h2><div className="mt-4">{count?children:<p className="rounded-xl bg-pm-ivory p-4 text-sm text-pm-ink/45">Aucune donnée pour le moment.</p>}</div></section>}
function Row({title,meta}:{title:string;meta:string}){return <div className="border-b border-pm-ink/[.07] py-3 last:border-0"><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs text-pm-ink/45">{meta}</p></div>}
