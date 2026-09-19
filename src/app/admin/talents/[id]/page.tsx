import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const money=(v:number)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'XAF',maximumFractionDigits:0}).format(v||0);
const date=(v?:string|null)=>v?new Date(v).toLocaleDateString('fr-FR'):'—';

export default async function Talent360Page({params}:{params:Promise<{id:string}>}) {
 const profile=await getCurrentAppProfile();
 if(!profile) redirect('/login?next=/admin/models');
 if(!['admin','manager'].includes(profile.role)||!hasAdminPermission(profile,'models')) redirect(profile.role==='manager'?'/manager':'/profil');
 const {id}=await params; const supabase=createSupabaseAdminClient() as any;
 const [{data:model},{data:payments},{data:bookings},{data:contracts},{data:availability},{data:castings}] = await Promise.all([
  supabase.from('models').select('*').eq('id',id).maybeSingle(),
  supabase.from('monthly_payments').select('id,amount,status,transaction_type,payment_method,reference,paid_at,submitted_at').eq('model_id',id).order('created_at',{ascending:false}).limit(12),
  supabase.from('bookings').select('id,title,status,starts_at,fee_gross,model_net_amount').eq('model_id',id).order('starts_at',{ascending:false}).limit(8),
  supabase.from('contracts').select('id,title,status,signed_at,expires_at').eq('model_id',id).order('updated_at',{ascending:false}).limit(8),
  supabase.from('model_availability').select('id,status,starts_at,ends_at,reason').eq('model_id',id).order('starts_at',{ascending:false}).limit(8),
  supabase.from('casting_talents').select('id,stage,match_score,casting_id').eq('model_id',id).order('updated_at',{ascending:false}).limit(8),
 ]);
 if(!model) notFound();
 const paid=(payments||[]).filter((x:any)=>x.status==='validated').reduce((s:number,x:any)=>s+Number(x.amount||0),0);
 const tabs=[['Profil & mensurations','#profil'],['Portfolio & composite',`/admin/models?talent=${id}`],['Disponibilités','#disponibilites'],['Castings','#castings'],['Bookings','#bookings'],['Contrats','#contrats'],['Finance & cotisations','#finance'],['Classroom',`/admin/classroom-progress?talent=${id}`],['Accès & sécurité','/admin/model-access']];
 return <div className="space-y-5 pb-12"><section className="rounded-[2rem] bg-pm-wine p-6 text-white sm:p-8"><Link href="/admin/models" className="text-xs font-black uppercase tracking-[.08em] text-pm-gold-light">← Tous les talents</Link><div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">{model.image_url?<img src={model.image_url} alt="" className="h-32 w-28 rounded-2xl object-cover"/>:<div className="h-32 w-28 rounded-2xl bg-white/10"/>}<div><p className="text-xs font-black uppercase tracking-[.14em] text-pm-gold-light">Talent 360°</p><h1 className="mt-2 font-playfair text-4xl font-semibold sm:text-5xl">{model.name}</h1><p className="mt-2 text-sm text-white/65">{model.location||'Localisation non renseignée'} · {model.height_cm?model.height_cm+' cm':'Taille non renseignée'} · {model.status||'—'}</p></div></div></section>
 <nav className="flex gap-2 overflow-x-auto pb-1">{tabs.map(([label,href])=><Link key={label} href={href} className="whitespace-nowrap rounded-full border border-pm-ink/10 bg-white px-4 py-2 text-xs font-black">{label}</Link>)}</nav>
 <section id="profil" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Poitrine',model.chest_cm&&model.chest_cm+' cm'],['Taille',model.waist_cm&&model.waist_cm+' cm'],['Hanches',model.hips_cm&&model.hips_cm+' cm'],['Pointure',model.shoe_size]].map(([l,v])=><div key={l as string} className="control-card"><p className="control-kicker">{l}</p><p className="mt-3 font-playfair text-3xl font-semibold">{v||'—'}</p></div>)}</section>
 <section id="finance" className="control-card"><div className="flex justify-between gap-4"><div><p className="control-kicker">Finance & cotisations</p><h2 className="mt-1 font-playfair text-2xl font-semibold">{money(paid)} validés</h2></div><Link href="/admin/payments" className="text-xs font-black text-pm-coral">Gérer →</Link></div><div className="mt-5 grid gap-2">{(payments||[]).map((p:any)=><div key={p.id} className="grid gap-2 rounded-xl bg-pm-ivory p-3 sm:grid-cols-[1fr_auto_auto]"><div><b>{p.transaction_type||'Paiement'}</b><p className="text-xs text-pm-ink/45">{p.payment_method||'—'} · {p.reference||'sans référence'}</p></div><span>{date(p.paid_at||p.submitted_at)}</span><b>{money(Number(p.amount||0))}</b></div>)}</div></section>
 <div className="grid gap-5 xl:grid-cols-2"><Panel id="bookings" title="Bookings" rows={bookings||[]} render={(r:any)=><><b>{r.title}</b><span>{r.status} · {date(r.starts_at)} · {money(Number(r.model_net_amount||r.fee_gross||0))}</span></>}/><Panel id="contrats" title="Contrats" rows={contracts||[]} render={(r:any)=><><b>{r.title}</b><span>{r.status} · signé {date(r.signed_at)} · expire {date(r.expires_at)}</span></>}/><Panel id="disponibilites" title="Disponibilités" rows={availability||[]} render={(r:any)=><><b>{r.status}</b><span>{date(r.starts_at)} → {date(r.ends_at)} {r.reason?'· '+r.reason:''}</span></>}/><Panel id="castings" title="Castings" rows={castings||[]} render={(r:any)=><><b>{r.stage}</b><span>{r.match_score!=null?r.match_score+'% de matching':'Matching non renseigné'}</span></>}/></div>
 </div>
}
function Panel({id,title,rows,render}:{id:string,title:string,rows:any[],render:(r:any)=>React.ReactNode}){return <section id={id} className="control-card"><p className="control-kicker">{title}</p><h2 className="mt-1 font-playfair text-2xl font-semibold">{rows.length} dossier{rows.length!==1?'s':''}</h2><div className="mt-4 grid gap-2">{rows.length?rows.map((r:any)=><div key={r.id} className="flex flex-col gap-1 rounded-xl bg-pm-ivory p-3 text-sm">{render(r)}</div>):<p className="text-sm text-pm-ink/45">Aucune donnée.</p>}</div></section>}
