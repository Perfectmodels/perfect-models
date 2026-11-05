'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Activity, ArrowLeft, BookOpenCheck, BriefcaseBusiness, CalendarDays,
  CheckCircle2, CircleAlert, ContactRound, ExternalLink, FileText, FolderKanban,
  Images, Landmark, LockKeyhole, Ruler, ShieldCheck, Sparkles, UserRound,
} from 'lucide-react';
import TalentAccessPanel from '@/components/admin/TalentAccessPanel';
import TalentMediaManager from '@/components/admin/TalentMediaManager';
import TalentRecordsPanel from '@/components/admin/TalentRecordsPanel';
import type { CrudField } from '@/lib/resource-registry';
import { formatDate, formatGender, formatMoney, formatStatus, statusTone } from '@/lib/admin-formatters';

type Row=Record<string,unknown>;
export type TalentResourcePanel={resource:string;title:string;description?:string;rows:Row[];fields:CrudField[];columns:string[];fixedValues:Record<string,unknown>;canCreate?:boolean;canEdit?:boolean;canDelete?:boolean;createLabel?:string;emptyLabel?:string};
export type TalentCourse={id:string;title:string;description?:string|null;progress:number;completedAt?:string|null;updatedAt?:string|null};
export type TalentActivity={id:string;title:string;meta:string;date?:string|null;tab:string;status?:string|null};
export type TalentDocument={id:string;title:string;type:string;status?:string|null;date?:string|null;url?:string|null};

type Props={
  model:Row;
  initialTab:string;
  initialAction:string;
  stats:{completion:number;portfolio:number;collaborations:number;events:number;castings:number;bookings:number;paymentsTotal:number;paymentsPending:number;rightsExpiring:number};
  missingFields:string[];
  portfolio:Array<{id:string;url:string;position:number;caption?:string|null}>;
  composite:{url:string;isPublic:boolean};
  resources:Record<string,TalentResourcePanel>;
  courses:TalentCourse[];
  documents:TalentDocument[];
  activity:TalentActivity[];
  account:any;
  recoveryRequests:Row[];
  canManageAccess:boolean;
  capabilities:{castings:boolean;bookings:boolean;finance:boolean;classroom:boolean;access:boolean};
};

const TABS=[
  ['overview','Vue d’ensemble',Sparkles],['profil','Profil & mensurations',UserRound],['medias','Portfolio & composite',Images],
  ['carriere','Palmarès & carrière',BriefcaseBusiness],['planning','Disponibilités & missions',CalendarDays],['juridique','Contrats & documents',FileText],
  ['finance','Finance & cotisations',Landmark],['classroom','Classroom',BookOpenCheck],['acces','Accès & sécurité',LockKeyhole],['historique','Historique',Activity],
] as const;
const TAB_KEYS=new Set(TABS.map(([key])=>key));

export default function Talent360Workspace(props:Props){
  const {model,stats}=props;
  const availableTabs=useMemo(()=>TABS.filter(([key])=>{
    if(key==='juridique'||key==='finance')return props.capabilities.finance;
    if(key==='classroom')return props.capabilities.classroom;
    if(key==='acces')return props.capabilities.access;
    return true;
  }),[props.capabilities.access,props.capabilities.classroom,props.capabilities.finance]);
  const availableTabKeys=useMemo(()=>new Set(availableTabs.map(([key])=>key)),[availableTabs]);
  const [tab,setTab]=useState(()=>TAB_KEYS.has(props.initialTab as any)&&availableTabKeys.has(props.initialTab as any)?props.initialTab:'overview');
  const selectTab=(next:string)=>{if(availableTabKeys.has(next as any))setTab(next);};
  const name=String(model.name||'Talent');
  const publicHref=`/mannequins/${encodeURIComponent(String(model.username||model.id))}`;
  const headerMeta=[formatGender(model.gender),model.height_cm?`${Number(model.height_cm).toLocaleString('fr-FR')} cm`:String(model.height||'Taille non renseignée'),String(model.location||'Localisation non renseignée')];
  const upcomingBooking=(props.resources.bookings?.rows||[]).filter((row)=>row.starts_at&&new Date(String(row.starts_at))>=new Date()).sort((a,b)=>new Date(String(a.starts_at)).getTime()-new Date(String(b.starts_at)).getTime())[0];
  const profileFields=useMemo(()=>props.resources.profile.fields.filter((field)=>field.name!=='id'),[props.resources.profile.fields]);

  return <div className="space-y-5 pb-14">
    <header className="relative overflow-hidden rounded-[2rem] bg-pm-wine p-5 text-white sm:p-7 lg:p-9">
      <div aria-hidden="true" className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-pm-coral/25 blur-3xl"/>
      <div className="relative">
        <Link href="/admin/models" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.09em] text-pm-gold-light"><ArrowLeft size={13}/>Retour au roster</Link>
        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-[1.4rem] bg-white/10">{model.image_url?<Image src={String(model.image_url)} alt={`Portrait de ${name}`} fill priority sizes="112px" className="object-cover"/>:<div className="grid h-full place-items-center font-playfair text-4xl font-semibold">{name.slice(0,1).toLocaleUpperCase('fr')}</div>}</div>
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-[10px] font-black uppercase tracking-[.17em] text-pm-gold-light">Talent 360°</p><span className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[.07em] ${statusTone(model.status)}`}>{formatStatus(model.status)}</span></div><h1 className="mt-2 truncate font-playfair text-4xl font-semibold sm:text-5xl">{name}</h1><p className="mt-2 text-sm text-white/60">{headerMeta.join(' · ')}</p><p className="mt-1 text-xs text-white/40">{String(model.username||'Identifiant agence non renseigné')} · {model.email?String(model.email):'E-mail non renseigné'}</p></div>
          </div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={()=>selectTab('profil')} className="rounded-full bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-[.07em] text-pm-wine">Modifier la fiche</button><Link href={publicHref} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[10px] font-black uppercase tracking-[.07em] text-white"><ExternalLink size={13}/>Profil public</Link></div>
        </div>
      </div>
    </header>

    <nav aria-label="Sections de la fiche Talent 360°" className="sticky top-2 z-30 overflow-x-auto rounded-[1.5rem] border border-pm-ink/[.08] bg-white/95 p-2 shadow-lg backdrop-blur"><div className="flex min-w-max gap-1">{availableTabs.map(([key,label,Icon])=><button key={key} type="button" aria-current={tab===key?'page':undefined} onClick={()=>selectTab(key)} className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-[10px] font-black uppercase tracking-[.05em] transition ${tab===key?'bg-pm-ink text-white':'text-pm-ink/55 hover:bg-pm-ivory hover:text-pm-ink'}`}><Icon size={14}/>{label}</button>)}</div></nav>

    {tab==='overview'&&<Overview model={model} stats={stats} missingFields={props.missingFields} upcomingBooking={upcomingBooking} setTab={selectTab} resources={props.resources} capabilities={props.capabilities} />}
    {tab==='profil'&&<div className="space-y-5"><MeasurementStrip model={model}/><TalentRecordsPanel {...props.resources.profile} rows={[model]} fields={profileFields} canCreate={false} canDelete={false} autoEdit={props.initialAction==='edit'}/></div>}
    {tab==='medias'&&<TalentMediaManager modelId={String(model.id)} modelName={name} initialCover={String(model.image_url||'')} initialPortfolio={props.portfolio} initialComposite={props.composite}/>} 
    {tab==='carriere'&&<div className="grid gap-5 xl:grid-cols-2"><TalentRecordsPanel {...props.resources.collaborations}/><TalentRecordsPanel {...props.resources.events}/></div>}
    {tab==='planning'&&<div className="grid gap-5 xl:grid-cols-2"><TalentRecordsPanel {...props.resources.availability}/>{props.capabilities.castings&&<TalentRecordsPanel {...props.resources.castings}/>} {props.capabilities.bookings&&<><TalentRecordsPanel {...props.resources.bookings}/><TalentRecordsPanel {...props.resources.options}/></>}</div>}
    {tab==='juridique'&&<div className="space-y-5"><div className="grid gap-5 xl:grid-cols-2"><TalentRecordsPanel {...props.resources.contracts}/><TalentRecordsPanel {...props.resources.rights}/></div><DocumentsPanel documents={props.documents}/></div>}
    {tab==='finance'&&<div className="space-y-5"><FinanceSummary stats={stats} bookings={props.resources.bookings.rows}/><div className="grid gap-5 xl:grid-cols-2"><TalentRecordsPanel {...props.resources.payments}/><TalentRecordsPanel {...props.resources.ledger}/></div></div>}
    {tab==='classroom'&&<ClassroomPanel courses={props.courses}/>} 
    {tab==='acces'&&<TalentAccessPanel account={props.account} model={{authUserId:String(model.auth_user_id||''),claimStatus:String(model.claim_status||''),email:String(model.email||''),username:String(model.username||'')}} canManage={props.canManageAccess} recoveryRequests={props.recoveryRequests}/>} 
    {tab==='historique'&&<ActivityPanel items={props.activity} setTab={selectTab}/>} 
  </div>;
}

function Overview({model,stats,missingFields,upcomingBooking,setTab,resources,capabilities}:{model:Row;stats:Props['stats'];missingFields:string[];upcomingBooking:Row|undefined;setTab:(tab:string)=>void;resources:Props['resources'];capabilities:Props['capabilities']}){
  const cards=[
    {label:'Profil complété',value:`${stats.completion}%`,meta:missingFields.length?`${missingFields.length} information(s) à compléter`:'Fiche opérationnelle',tab:'profil',tone:'bg-pm-peach'},
    {label:'Portfolio',value:String(stats.portfolio),meta:'photos enregistrées',tab:'medias',tone:'bg-white'},
    ...(capabilities.castings?[{label:'Castings actifs',value:String(stats.castings),meta:'dossiers liés au talent',tab:'planning',tone:'bg-white'}]:[]),
    ...(capabilities.bookings?[{label:'Bookings',value:String(stats.bookings),meta:upcomingBooking?`Prochain : ${formatDate(upcomingBooking.starts_at)}`:'Aucune mission prochaine',tab:'planning',tone:'bg-pm-sage'}]:[]),
    ...(capabilities.finance?[{label:'Paiements confirmés',value:formatMoney(stats.paymentsTotal),meta:stats.paymentsPending?`${stats.paymentsPending} paiement(s) à vérifier`:'Aucun paiement en attente',tab:'finance',tone:'bg-white'},{label:'Droits à surveiller',value:String(stats.rightsExpiring),meta:'expiration dans les 60 jours',tab:'juridique',tone:'bg-pm-gold-light/45'}]:[]),
  ];
  return <div className="space-y-5"><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{cards.map((card)=><button key={card.label} type="button" onClick={()=>setTab(card.tab)} className={`rounded-[1.5rem] border border-pm-ink/[.06] p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${card.tone}`}><p className="control-kicker">{card.label}</p><p className="mt-4 font-playfair text-4xl font-semibold">{card.value}</p><p className="mt-2 text-xs text-pm-ink/45">{card.meta}</p></button>)}</section><div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><section className="rounded-[1.7rem] border border-pm-ink/[.08] bg-white p-5 sm:p-7"><div className="flex items-center gap-3"><ContactRound className="text-pm-coral"/><div><p className="control-kicker">Synthèse métier</p><h2 className="font-playfair text-2xl font-semibold">Identité & positionnement</h2></div></div><dl className="mt-6 grid gap-3 sm:grid-cols-2">{[
      ['Nom complet',model.name],['Identifiant',model.username],['Genre',formatGender(model.gender)],['Niveau',model.level],['Localisation',model.location],['Mobilité',Array.isArray(model.mobility)?model.mobility.join(', '):'Non renseignée'],['Catégories',Array.isArray(model.categories)?model.categories.join(', '):'Non renseignées'],['Tarif de base',model.base_rate?formatMoney(model.base_rate,String(model.rate_currency||'XAF')):'Non renseigné'],
    ].map(([label,value])=><div key={String(label)} className="rounded-xl bg-pm-ivory p-3"><dt className="text-[9px] font-black uppercase tracking-[.07em] text-pm-ink/35">{String(label)}</dt><dd className="mt-1 text-sm font-semibold">{value?String(value):'Non renseigné'}</dd></div>)}</dl></section><section className="rounded-[1.7rem] border border-pm-ink/[.08] bg-white p-5 sm:p-7"><div className="flex items-center gap-3"><CircleAlert className="text-pm-coral"/><div><p className="control-kicker">À traiter</p><h2 className="font-playfair text-2xl font-semibold">Prochaines actions</h2></div></div><div className="mt-6 grid gap-2">{missingFields.length?<button type="button" onClick={()=>setTab('profil')} className="flex items-center justify-between rounded-xl bg-pm-peach p-4 text-left text-sm font-bold"><span>Compléter : {missingFields.slice(0,3).join(', ')}</span><span>→</span></button>:<StatusAction label="Profil professionnel complet" value="Prêt" tab="profil" setTab={setTab}/>} {capabilities.finance&&<><StatusAction label="Paiements à vérifier" value={String(stats.paymentsPending)} tab="finance" setTab={setTab}/><StatusAction label="Droits expirant bientôt" value={String(stats.rightsExpiring)} tab="juridique" setTab={setTab}/></>} {capabilities.bookings&&<StatusAction label="Options actives" value={String((resources.options?.rows||[]).filter((row)=>row.status==='active').length)} tab="planning" setTab={setTab}/>}</div></section></div></div>;
}

function MeasurementStrip({model}:{model:Row}){const items=[['Taille',model.height_cm&&`${model.height_cm} cm`],['Poitrine',model.chest_cm&&`${model.chest_cm} cm`],['Tour de taille',model.waist_cm&&`${model.waist_cm} cm`],['Hanches',model.hips_cm&&`${model.hips_cm} cm`],['Pointure',model.shoe_size],['Cheveux',model.hair_color],['Yeux',model.eye_color]];return <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">{items.map(([label,value])=><div key={String(label)} className="rounded-[1.35rem] border border-pm-ink/[.07] bg-white p-4"><div className="flex items-center gap-2 text-pm-coral"><Ruler size={14}/><p className="text-[9px] font-black uppercase tracking-[.08em]">{String(label)}</p></div><p className="mt-3 font-playfair text-2xl font-semibold">{value?String(value):'—'}</p></div>)}</section>}
function StatusAction({label,value,tab,setTab}:{label:string;value:string;tab:string;setTab:(tab:string)=>void}){return <button type="button" onClick={()=>setTab(tab)} className="flex items-center justify-between rounded-xl bg-pm-ivory p-4 text-left text-sm"><span>{label}</span><b className="rounded-full bg-white px-3 py-1 text-pm-wine">{value}</b></button>}

function FinanceSummary({stats,bookings}:{stats:Props['stats'];bookings:Row[]}){const gross=bookings.reduce((sum,row)=>sum+Number(row.fee_gross||0),0);const commission=bookings.reduce((sum,row)=>sum+Number(row.agency_commission_amount||0),0);const net=bookings.reduce((sum,row)=>sum+Number(row.model_net_amount||0),0);return <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['Cotisations validées',formatMoney(stats.paymentsTotal)],['Cachets bruts',formatMoney(gross)],['Commission agence',formatMoney(commission)],['Net talent',formatMoney(net)]].map(([label,value])=><article key={label} className="rounded-[1.5rem] border border-pm-ink/[.07] bg-white p-5"><p className="control-kicker">{label}</p><p className="mt-4 font-playfair text-3xl font-semibold">{value}</p></article>)}</section>}

function ClassroomPanel({courses}:{courses:TalentCourse[]}){const completed=courses.filter((course)=>course.completedAt||course.progress>=100).length;const average=courses.length?Math.round(courses.reduce((sum,course)=>sum+course.progress,0)/courses.length):0;return <div className="space-y-5"><section className="grid gap-3 sm:grid-cols-3"><Metric icon={<BookOpenCheck/>} label="Formations suivies" value={String(courses.length)}/><Metric icon={<CheckCircle2/>} label="Terminées" value={String(completed)}/><Metric icon={<Activity/>} label="Progression moyenne" value={`${average}%`}/></section><section className="rounded-[1.7rem] border border-pm-ink/[.08] bg-white p-5 sm:p-7"><div><p className="control-kicker">Classroom / formations</p><h2 className="mt-1 font-playfair text-3xl font-semibold">Progression de la mannequin</h2><p className="mt-2 text-sm text-pm-ink/45">Les données sont liées au compte de ce talent, sans afficher d’identifiant technique.</p></div><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{courses.map((course)=><article key={course.id} className="rounded-2xl bg-pm-ivory p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-black">{course.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-pm-ink/45">{course.description||'Formation Perfect Models Management'}</p></div>{course.completedAt&&<ShieldCheck size={18} className="shrink-0 text-emerald-700"/>}</div><div className="mt-4 h-2 overflow-hidden rounded-full bg-pm-ink/10"><div className="h-full rounded-full bg-pm-coral" style={{width:`${Math.max(0,Math.min(100,course.progress))}%`}}/></div><div className="mt-2 flex items-center justify-between text-[10px] font-bold"><span>{course.progress}%</span><span className="text-pm-ink/35">{course.completedAt?'Terminée':`Actualisée ${formatDate(course.updatedAt)}`}</span></div></article>)}{!courses.length&&<p className="text-sm text-pm-ink/40">Aucune progression Classroom enregistrée pour ce talent.</p>}</div></section></div>}

function DocumentsPanel({documents}:{documents:TalentDocument[]}){return <section className="rounded-[1.7rem] border border-pm-ink/[.08] bg-white p-5 sm:p-7"><div className="flex items-center gap-3"><FolderKanban className="text-pm-coral"/><div><p className="control-kicker">Documents liés</p><h2 className="font-playfair text-2xl font-semibold">Bibliothèque du dossier talent</h2></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{documents.map((document)=><article key={document.id} className="rounded-xl bg-pm-ivory p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[.07em] text-pm-coral">{document.type}</p><h3 className="mt-1 text-sm font-black">{document.title}</h3></div>{document.status&&<span className={`rounded-full px-2 py-1 text-[8px] font-black uppercase ${statusTone(document.status)}`}>{formatStatus(document.status)}</span>}</div><p className="mt-3 text-xs text-pm-ink/40">{formatDate(document.date)}</p>{document.url?<Link href={document.url} target="_blank" className="mt-3 inline-flex items-center gap-1 text-xs font-black text-pm-coral"><ExternalLink size={12}/>Ouvrir le document</Link>:<p className="mt-3 text-xs font-semibold text-pm-ink/35">Aucun fichier joint</p>}</article>)}{!documents.length&&<p className="text-sm text-pm-ink/40">Aucun document rattaché à ce talent.</p>}</div></section>}

function ActivityPanel({items,setTab}:{items:TalentActivity[];setTab:(tab:string)=>void}){return <section className="rounded-[1.7rem] border border-pm-ink/[.08] bg-white p-5 sm:p-7"><div className="flex items-center gap-3"><Activity className="text-pm-coral"/><div><p className="control-kicker">Historique 360°</p><h2 className="font-playfair text-3xl font-semibold">Activité récente du dossier</h2></div></div><div className="mt-6 grid gap-2">{items.map((item)=><button key={item.id} type="button" onClick={()=>setTab(item.tab)} className="grid gap-2 rounded-2xl bg-pm-ivory p-4 text-left sm:grid-cols-[auto_1fr_auto] sm:items-center"><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-pm-coral"><Activity size={15}/></span><span><b className="block text-sm">{item.title}</b><span className="mt-1 block text-xs text-pm-ink/45">{item.meta}</span></span><span className="text-[10px] font-bold text-pm-ink/35">{formatDate(item.date,true)}</span></button>)}{!items.length&&<p className="text-sm text-pm-ink/40">Aucune activité récente.</p>}</div></section>}
function Metric({icon,label,value}:{icon:React.ReactNode;label:string;value:string}){return <article className="rounded-[1.5rem] border border-pm-ink/[.07] bg-white p-5"><div className="text-pm-coral">{icon}</div><p className="mt-4 font-playfair text-4xl font-semibold">{value}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[.08em] text-pm-ink/40">{label}</p></article>}
