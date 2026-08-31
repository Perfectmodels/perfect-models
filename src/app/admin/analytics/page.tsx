import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const money=(value:number)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'XAF',maximumFractionDigits:0}).format(value||0);

export default async function AnalyticsPage(){
 const profile=await getCurrentAppProfile(); if(!profile) redirect('/login?next=/admin/analytics'); if(profile.role!=='admin') redirect(profile.role==='manager'?'/manager':'/profil');
 const supabase=createSupabaseAdminClient() as any;
 const [{data:bookings},{data:castingTalents},{data:models},{data:clients},{data:invoices}]=await Promise.all([
  supabase.from('bookings').select('id,model_id,client_id,status,fee_gross,agency_commission_amount,starts_at').neq('status','cancelled'),
  supabase.from('casting_talents').select('model_id,casting_id,stage,match_score'),
  supabase.from('models').select('id,name').eq('is_active',true),
  supabase.from('agency_clients').select('id,name,status'),
  supabase.from('invoices').select('client_id,total,amount_paid,status,issued_at,due_at'),
 ]);
 const modelNames=new Map<string,string>((models||[]).map((row:any)=>[String(row.id),String(row.name)])); const clientNames=new Map<string,string>((clients||[]).map((row:any)=>[String(row.id),String(row.name)]));
 const talentStats=new Map<string,{bookings:number,revenue:number,requests:number}>();
 for(const row of bookings||[]){const key=String(row.model_id);const s=talentStats.get(key)||{bookings:0,revenue:0,requests:0};s.bookings++;s.revenue+=Number(row.fee_gross||0);talentStats.set(key,s)}
 for(const row of castingTalents||[]){const key=String(row.model_id);const s=talentStats.get(key)||{bookings:0,revenue:0,requests:0};s.requests++;talentStats.set(key,s)}
 const topTalents=[...talentStats.entries()].map(([id,s])=>({id,name:String(modelNames.get(id)||id),...s})).sort((a,b)=>b.bookings-a.bookings||b.revenue-a.revenue).slice(0,8);
 const clientStats=new Map<string,{bookings:number,revenue:number,outstanding:number}>();
 for(const row of bookings||[]){if(!row.client_id)continue;const key=String(row.client_id);const s=clientStats.get(key)||{bookings:0,revenue:0,outstanding:0};s.bookings++;s.revenue+=Number(row.fee_gross||0);clientStats.set(key,s)}
 for(const row of invoices||[]){if(!row.client_id)continue;const key=String(row.client_id);const s=clientStats.get(key)||{bookings:0,revenue:0,outstanding:0};s.outstanding+=Math.max(0,Number(row.total||0)-Number(row.amount_paid||0));clientStats.set(key,s)}
 const topClients=[...clientStats.entries()].map(([id,s])=>({id,name:String(clientNames.get(id)||id),...s})).sort((a,b)=>b.revenue-a.revenue).slice(0,8);
 const stages=(castingTalents||[]).reduce((acc:Record<string,number>,row:any)=>{acc[row.stage]=(acc[row.stage]||0)+1;return acc},{});
 const invitations=(castingTalents||[]).length; const attended=(stages.attended||0)+(stages.shortlist||0)+(stages.callback||0)+(stages.selected||0)+(stages.booked||0); const shortlisted=(stages.shortlist||0)+(stages.callback||0)+(stages.selected||0)+(stages.booked||0); const booked=stages.booked||0; const conversion=invitations?Math.round(booked/invitations*1000)/10:0;
 const totalRevenue=(bookings||[]).reduce((s:number,row:any)=>s+Number(row.fee_gross||0),0); const totalCommission=(bookings||[]).reduce((s:number,row:any)=>s+Number(row.agency_commission_amount||0),0); const avgBooking=(bookings||[]).length?Math.round(totalRevenue/(bookings||[]).length):0;
 const utilizationModels=new Set((bookings||[]).filter((row:any)=>['confirmed','in_production','completed'].includes(row.status)).map((row:any)=>String(row.model_id))).size; const utilization=(models||[]).length?Math.round(utilizationModels/(models||[]).length*1000)/10:0;
 const talentRows=topTalents.map((row)=>({title:row.name,metrics:[['Bookings',String(row.bookings)],['Demandes',String(row.requests)],['CA',money(row.revenue)]]}));
 const clientRows=topClients.map((row)=>({title:row.name,metrics:[['Bookings',String(row.bookings)],['CA',money(row.revenue)],['À encaisser',money(row.outstanding)]]}));
 return <div className="min-w-0 space-y-6 pb-12"><header className="min-w-0 rounded-[2rem] bg-pm-wine p-7 text-white sm:p-9"><p className="text-[10px] font-black uppercase tracking-[.2em] text-pm-gold-light">Analytics agence</p><h1 className="mt-3 break-words font-playfair text-4xl font-semibold sm:text-5xl">Mesurer ce qui transforme un talent en revenu.</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">Les indicateurs sont calculés uniquement à partir des castings, bookings, clients et factures réellement enregistrés.</p></header><section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-5">{[['Revenu',money(totalRevenue)],['Commission',money(totalCommission)],['Booking moyen',money(avgBooking)],['Conversion casting',`${conversion}%`],['Utilisation talents',`${utilization}%`]].map(([label,value])=><div key={label} className="control-card min-w-0"><p className="control-kicker">{label}</p><p className="mt-5 break-words font-playfair text-3xl font-semibold">{value}</p></div>)}</section>
 <section className="grid min-w-0 gap-5 lg:grid-cols-2"><Ranking title="Talents les plus performants" rows={talentRows}/><Ranking title="Clients les plus actifs" rows={clientRows}/></section>
 <section className="control-card min-w-0"><div className="flex min-w-0 flex-wrap items-end justify-between gap-4"><div className="min-w-0"><p className="control-kicker">Conversion casting</p><h2 className="mt-2 break-words font-playfair text-3xl font-semibold">Du premier contact au booking</h2></div><strong className="shrink-0 font-playfair text-4xl text-pm-wine">{conversion}%</strong></div><div className="mt-7 grid min-w-0 gap-3 sm:grid-cols-2 md:grid-cols-4">{[['Invitations',invitations],['Casting effectué',attended],['Shortlist',shortlisted],['Booké',booked]].map(([label,value],index)=><div key={label as string} className="min-w-0 rounded-2xl bg-pm-ivory p-4"><p className="text-[9px] font-black uppercase tracking-[.12em] text-pm-coral">0{index+1}</p><p className="mt-3 break-words font-playfair text-4xl font-semibold">{value}</p><p className="mt-1 break-words text-xs text-pm-ink/45">{label}</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-pm-ink/10"><div className="h-full rounded-full bg-pm-coral" style={{width:`${invitations?Math.max(3,Number(value)/invitations*100):0}%`}}/></div></div>)}</div></section></div>;
}

type RankingRow = { title:string; metrics:Array<[string,string]> };
function Ranking({title,rows}:{title:string;rows:RankingRow[]}){
 return <section className="control-card min-w-0"><h2 className="break-words font-playfair text-2xl font-semibold">{title}</h2><div className="mt-5 grid min-w-0 gap-3">{rows.length?rows.map((row,index)=><article key={`${row.title}-${index}`} className="min-w-0 rounded-2xl border border-pm-ink/[.07] bg-pm-ivory p-4"><div className="flex min-w-0 items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pm-peach text-xs font-black text-pm-wine">{index+1}</span><h3 className="min-w-0 flex-1 break-words text-sm font-bold">{row.title}</h3></div><dl className="mt-4 grid min-w-0 gap-2 sm:grid-cols-3">{row.metrics.map(([label,value])=><div key={label} className="min-w-0 rounded-xl bg-white p-3"><dt className="break-words text-[9px] font-black uppercase tracking-[.08em] text-pm-ink/40">{label}</dt><dd className="mt-1 break-words text-sm font-bold text-pm-ink">{value}</dd></div>)}</dl></article>):<div className="py-8 text-center text-pm-ink/40">Aucune donnée métier disponible pour le moment.</div>}</div></section>;
}
