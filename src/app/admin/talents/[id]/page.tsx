import { notFound, redirect } from 'next/navigation';
import Talent360Workspace, { type TalentActivity, type TalentCourse, type TalentDocument, type TalentResourcePanel } from '@/components/admin/Talent360Workspace';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { RESOURCE_DEFINITIONS, type ResourceName } from '@/lib/agency-resource-registry';
import { hydrateAdminRelationOptions } from '@/lib/admin-relation-options';
import { MODEL_ADMIN_COLUMNS, MODEL_ADMIN_FIELDS } from '@/lib/model-admin-fields';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatEventType, formatPaymentType, formatProjectType, formatStatus } from '@/lib/admin-formatters';

export const dynamic='force-dynamic';
type Params=Promise<{id:string}>;
type SearchParams=Promise<Record<string,string|string[]|undefined>>;

function one(value:string|string[]|undefined){return Array.isArray(value)?value[0]||'':value||'';}
function objectValue(value:unknown){return value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,any>:{};}
function list(value:unknown){return Array.isArray(value)?value:[];}
function hasValue(value:unknown){return value!==null&&value!==undefined&&value!==''&&(!Array.isArray(value)||value.length>0);}
function timestamp(row:any){return row?.updated_at||row?.created_at||row?.submitted_at||row?.paid_at||row?.starts_at||row?.event_date||null;}
function classroomPercent(value:unknown,completed=false){if(completed)return 100;const data=objectValue(value);for(const key of ['percent','progress','value','readPercent']){const candidate=Number(data[key]);if(Number.isFinite(candidate))return Math.max(0,Math.min(100,Math.round(candidate)));}return 0;}

export default async function Talent360Page({params,searchParams}:{params:Params;searchParams:SearchParams}){
  const profile=await getCurrentAppProfile();
  if(!profile)redirect('/login?next=/admin/models');
  if(!['admin','manager'].includes(profile.role)||!hasAdminPermission(profile,'models'))redirect(profile.role==='manager'?'/manager':'/profil');
  const [{id},query]=await Promise.all([params,searchParams]);
  const supabase=createSupabaseAdminClient() as any;
  const {data:model,error:modelError}=await supabase.from('models').select('*').eq('id',id).maybeSingle();
  if(modelError)throw new Error(`Lecture de la fiche talent impossible : ${modelError.message}`);
  if(!model)notFound();

  const authUserId=String(model.auth_user_id||'');
  const email=String(model.email||'').trim();
  const identifier=String(model.username||'').trim();
  const now=new Date();
  const in60=new Date(now);in60.setDate(in60.getDate()+60);
  const canViewCastings=hasAdminPermission(profile,'castingApplications')||hasAdminPermission(profile,'castingResults');
  const canViewBookings=hasAdminPermission(profile,'bookings');
  const canViewFinance=hasAdminPermission(profile,'payments');
  const canViewClassroom=hasAdminPermission(profile,'classroom')||hasAdminPermission(profile,'classroomProgress');
  const canViewAccess=profile.role==='admin'||hasAdminPermission(profile,'modelAccess');
  const canViewRecovery=profile.role==='admin'||hasAdminPermission(profile,'recovery');

  const [
    portfolioRes,collaborationsRes,eventsRes,availabilityRes,castingTalentsRes,bookingsRes,optionsRes,
    contractsRes,rightsRes,paymentsRes,ledgerRes,profileRes,coursesRes,progressRes,
    academyModulesRes,academyChaptersRes,academyProgressRes,recoveryRes,
  ]=await Promise.all([
    supabase.from('model_portfolio_images').select('id,url,position,caption').eq('model_id',id).order('position',{ascending:true}),
    supabase.from('model_collaborations').select('*').eq('model_id',id).order('collaboration_date',{ascending:false,nullsFirst:false}),
    supabase.from('model_events').select('*').eq('model_id',id).order('event_date',{ascending:false,nullsFirst:false}),
    supabase.from('model_availability').select('*').eq('model_id',id).order('starts_at',{ascending:false}).limit(100),
    canViewCastings?supabase.from('casting_talents').select('*').eq('model_id',id).order('updated_at',{ascending:false}).limit(100):Promise.resolve({data:[]}),
    canViewBookings?supabase.from('bookings').select('*').eq('model_id',id).order('starts_at',{ascending:false,nullsFirst:false}).limit(100):Promise.resolve({data:[]}),
    canViewBookings?supabase.from('booking_options').select('*').eq('model_id',id).order('starts_at',{ascending:false}).limit(100):Promise.resolve({data:[]}),
    canViewFinance?supabase.from('contracts').select('*').eq('model_id',id).order('updated_at',{ascending:false}).limit(100):Promise.resolve({data:[]}),
    canViewFinance?supabase.from('image_rights').select('*').eq('model_id',id).order('ends_on',{ascending:false}).limit(100):Promise.resolve({data:[]}),
    canViewFinance?supabase.from('monthly_payments').select('*').eq('model_id',id).order('created_at',{ascending:false}).limit(100):Promise.resolve({data:[]}),
    canViewFinance?supabase.from('finance_transactions').select('*').eq('model_id',id).order('transaction_date',{ascending:false}).limit(100):Promise.resolve({data:[]}),
    canViewAccess?(authUserId?supabase.from('profiles').select('*').eq('user_id',authUserId).maybeSingle():supabase.from('profiles').select('*').eq('model_id',id).maybeSingle()):Promise.resolve({data:null}),
    canViewClassroom?supabase.from('courses').select('id,title,description,is_active,position').eq('is_active',true).order('position'):Promise.resolve({data:[]}),
    canViewClassroom&&authUserId?supabase.from('course_progress').select('*').eq('user_id',authUserId):Promise.resolve({data:[]}),
    canViewClassroom?supabase.from('academy_modules').select('id,slug,title,description,position').eq('is_active',true).order('position'):Promise.resolve({data:[]}),
    canViewClassroom?supabase.from('academy_chapters').select('id,module_id,slug,title,position').eq('is_active',true).order('position'):Promise.resolve({data:[]}),
    canViewClassroom&&authUserId?supabase.from('academy_chapter_progress').select('chapter_id,read_percent,status,best_score,updated_at').eq('user_id',authUserId):Promise.resolve({data:[]}),
    canViewRecovery&&email?supabase.from('recovery_requests').select('*').eq('email',email).order('created_at',{ascending:false}).limit(20):canViewRecovery&&identifier?supabase.from('recovery_requests').select('*').eq('identifier',identifier).order('created_at',{ascending:false}).limit(20):Promise.resolve({data:[]}),
  ]);

  const portfolio=list(portfolioRes.data) as any[];
  const collaborations=list(collaborationsRes.data) as any[];
  const events=list(eventsRes.data) as any[];
  const availability=list(availabilityRes.data) as any[];
  const castingTalents=list(castingTalentsRes.data) as any[];
  const bookings=list(bookingsRes.data) as any[];
  const options=list(optionsRes.data) as any[];
  const contracts=list(contractsRes.data) as any[];
  const rights=list(rightsRes.data) as any[];
  const payments=list(paymentsRes.data) as any[];
  const ledger=list(ledgerRes.data) as any[];
  const accountRow=profileRes.data||null;

  const castingIds=[...new Set(castingTalents.map((row)=>String(row.casting_id||'')).filter(Boolean))];
  const {data:castingDossiers}=castingIds.length?await supabase.from('castings').select('id,title,status,starts_at,documents,updated_at').in('id',castingIds):{data:[]};

  async function panel(resource:ResourceName,rows:any[],overrides:Partial<TalentResourcePanel>={}):Promise<TalentResourcePanel>{
    const definition=RESOURCE_DEFINITIONS[resource];
    const hydrated=await hydrateAdminRelationOptions(supabase,definition.fields);
    const fixedValues={model_id:id,...(overrides.fixedValues||{})};
    return {
      resource,
      title:overrides.title||definition.title,
      description:overrides.description,
      rows,
      fields:hydrated.filter((field)=>!Object.prototype.hasOwnProperty.call(fixedValues,field.name)),
      columns:[...definition.columns],
      fixedValues,
      canCreate:overrides.canCreate??definition.canCreate,
      canEdit:overrides.canEdit??true,
      canDelete:overrides.canDelete??false,
      createLabel:overrides.createLabel,
      emptyLabel:overrides.emptyLabel,
    };
  }

  const panels=await Promise.all([
    panel('model-collaborations',collaborations,{title:'Collaborations',description:'Marques, clients, partenaires et campagnes associés au talent.',canDelete:true,createLabel:'Ajouter une collaboration'}),
    panel('model-events',events,{title:'Palmarès, shootings & défilés',description:'Expériences publiques et preuves visuelles du parcours.',canDelete:true,createLabel:'Ajouter au palmarès'}),
    panel('availability',availability,{title:'Disponibilités',description:'Périodes disponibles, indisponibles ou à confirmer.',canDelete:true,createLabel:'Ajouter une période'}),
    panel('casting-talents',castingTalents,{title:'Castings',description:'Pipeline, invitations, shortlist, callbacks et décisions.',canCreate:canViewCastings,canEdit:canViewCastings,canDelete:canViewCastings,createLabel:'Lier à un casting'}),
    panel('bookings',bookings,{title:'Bookings',description:'Options confirmées, productions et cachets du talent.',canCreate:canViewBookings,canEdit:canViewBookings,canDelete:false,createLabel:'Créer un booking'}),
    panel('booking-options',options,{title:'Options',description:'Priorités, échéances et conflits de dates.',canCreate:canViewBookings,canEdit:canViewBookings,canDelete:false,createLabel:'Créer une option'}),
    panel('contracts',contracts,{title:'Contrats',description:'Contrats de management, booking, release et signatures.',canCreate:canViewFinance,canEdit:canViewFinance,canDelete:false,createLabel:'Ajouter un contrat'}),
    panel('image-rights',rights,{title:'Droits d’image',description:'Campagnes, territoires, supports et dates d’expiration.',canCreate:canViewFinance,canEdit:canViewFinance,canDelete:false,createLabel:'Ajouter des droits'}),
    panel('payments',payments,{title:'Cotisations & paiements',description:'Objet, montant, moyen, référence, date et statut en lecture métier.',canCreate:canViewFinance,canDelete:false,canEdit:false,createLabel:'Déclarer un paiement',fixedValues:{model_id:id,status:'pending'}}),
    panel('finance-transactions',ledger,{title:'Mouvements financiers',description:'Recettes, dépenses et transferts directement rattachés au talent.',canCreate:canViewFinance,canEdit:canViewFinance,canDelete:false,createLabel:'Ajouter un mouvement'}),
  ]);
  const [collaborationsPanel,eventsPanel,availabilityPanel,castingsPanel,bookingsPanel,optionsPanel,contractsPanel,rightsPanel,paymentsPanel,ledgerPanel]=panels;
  const profilePanel:TalentResourcePanel={resource:'models',title:'Profil, informations personnelles & mensurations',description:'Toutes les informations professionnelles normalisées du talent.',rows:[model],fields:MODEL_ADMIN_FIELDS.filter((field)=>field.name!=='id'),columns:[...MODEL_ADMIN_COLUMNS],fixedValues:{},canCreate:false,canEdit:true,canDelete:false};
  const resources={profile:profilePanel,collaborations:collaborationsPanel,events:eventsPanel,availability:availabilityPanel,castings:castingsPanel,bookings:bookingsPanel,options:optionsPanel,contracts:contractsPanel,rights:rightsPanel,payments:paymentsPanel,ledger:ledgerPanel};

  const required:[string,string,unknown][]=[
    ['name','nom',model.name],['email','e-mail',model.email],['phone','téléphone',model.phone],['birth_date','date de naissance',model.birth_date],['gender','genre',model.gender],['location','localisation',model.location],['height_cm','taille',model.height_cm],['chest_cm','poitrine',model.chest_cm],['waist_cm','tour de taille',model.waist_cm],['hips_cm','hanches',model.hips_cm],['shoe_size','pointure',model.shoe_size],['image_url','photo principale',model.image_url],['categories','catégories',model.categories],['experience','expérience',model.experience],['journey','parcours',model.journey],
  ];
  const completed=required.filter(([, ,value])=>hasValue(value)).length;
  const missingFields=required.filter(([, ,value])=>!hasValue(value)).map(([,label])=>label);
  const validatedPayments=payments.filter((row)=>row.status==='validated');
  const stats={
    completion:Math.round(completed/required.length*100),portfolio:portfolio.length,collaborations:collaborations.length,events:events.length,
    castings:castingTalents.filter((row)=>!['rejected','declined'].includes(String(row.stage))).length,
    bookings:bookings.length,
    paymentsTotal:validatedPayments.reduce((sum,row)=>sum+Number(row.amount||0),0),
    paymentsPending:payments.filter((row)=>row.status==='pending').length,
    rightsExpiring:rights.filter((row)=>row.ends_on&&new Date(row.ends_on)>=now&&new Date(row.ends_on)<=in60&&['active','expiring'].includes(String(row.status))).length,
  };

  const raw=objectValue(model.raw_data);
  const composite={url:String(raw.compCardUrl||''),isPublic:raw.compCardIsPublic===true};

  const academyModules=list(academyModulesRes.data) as any[];
  const academyChapters=list(academyChaptersRes.data) as any[];
  const academyProgress=list(academyProgressRes.data) as any[];
  const academyProgressMap=new Map(academyProgress.map((row)=>[String(row.chapter_id),row]));
  let courses:TalentCourse[]=academyModules.map((module)=>{
    const chapters=academyChapters.filter((chapter)=>String(chapter.module_id)===String(module.id));
    const reading=chapters.length?Math.round(chapters.reduce((sum,chapter)=>sum+Math.min(100,Number(academyProgressMap.get(String(chapter.id))?.read_percent||0)),0)/chapters.length):0;
    const passed=chapters.filter((chapter)=>academyProgressMap.get(String(chapter.id))?.status==='passed');
    const latest=chapters.map((chapter)=>academyProgressMap.get(String(chapter.id))?.updated_at).filter(Boolean).sort().reverse()[0]||null;
    return {id:String(module.id),title:String(module.title||module.slug||'Formation'),description:module.description?String(module.description):null,progress:chapters.length&&passed.length===chapters.length?100:reading,completedAt:chapters.length&&passed.length===chapters.length?latest:null,updatedAt:latest};
  });
  if(!courses.length){
    const legacyProgress=list(progressRes.data) as any[];const map=new Map(legacyProgress.map((row)=>[String(row.course_id),row]));
    courses=(list(coursesRes.data) as any[]).map((course)=>{const progress=map.get(String(course.id));return {id:String(course.id),title:String(course.title||course.id),description:course.description?String(course.description):null,progress:classroomPercent(progress?.progress,Boolean(progress?.completed_at)),completedAt:progress?.completed_at||null,updatedAt:progress?.updated_at||null};});
  }

  const documents:TalentDocument[]=[];
  for(const contract of contracts)documents.push({id:`contract-${contract.id}`,title:String(contract.title||'Contrat'),type:'Contrat',status:contract.status,date:contract.signed_at||contract.updated_at,url:contract.document_url||null});
  for(const casting of list(castingDossiers) as any[]){
    for(const [index,document] of list(casting.documents).entries()){
      const data=typeof document==='string'?{url:document,title:`Document ${index+1}`}:objectValue(document);
      documents.push({id:`casting-${casting.id}-${index}`,title:String(data.title||data.name||`Document ${index+1}`),type:`Casting · ${casting.title||'Dossier'}`,status:casting.status,date:casting.starts_at||casting.updated_at,url:String(data.url||data.href||'')||null});
    }
  }

  const activities:TalentActivity[]=[
    {id:'model-updated',title:'Fiche talent mise à jour',meta:`Profil professionnel · ${model.name}`,date:model.updated_at,tab:'profil',status:model.status},
    ...collaborations.map((row)=>({id:`collab-${row.id}`,title:'Collaboration',meta:`${row.collaborator_name}${row.project_title?` · ${row.project_title}`:''}`,date:timestamp(row),tab:'carriere',status:null})),
    ...events.map((row)=>({id:`event-${row.id}`,title:formatEventType(row.event_type),meta:String(row.name||'Événement du palmarès'),date:timestamp(row),tab:'carriere',status:null})),
    ...castingTalents.map((row)=>({id:`casting-${row.id}`,title:'Casting',meta:`${formatStatus(row.stage)} · ${row.match_score!=null?`${row.match_score}% de matching`:'matching non renseigné'}`,date:timestamp(row),tab:'planning',status:row.stage})),
    ...bookings.map((row)=>({id:`booking-${row.id}`,title:'Booking',meta:`${row.title||formatProjectType(row.project_type)} · ${formatStatus(row.status)}`,date:timestamp(row),tab:'planning',status:row.status})),
    ...contracts.map((row)=>({id:`contract-${row.id}`,title:'Contrat',meta:`${row.title||'Document'} · ${formatStatus(row.status)}`,date:timestamp(row),tab:'juridique',status:row.status})),
    ...payments.map((row)=>({id:`payment-${row.id}`,title:formatPaymentType(row.transaction_type),meta:`${Number(row.amount||0).toLocaleString('fr-FR')} FCFA · ${formatStatus(row.status)}`,date:timestamp(row),tab:'finance',status:row.status})),
    ...courses.filter((course)=>course.updatedAt).map((course)=>({id:`course-${course.id}`,title:'Progression Classroom',meta:`${course.title} · ${course.progress}%`,date:course.updatedAt,tab:'classroom',status:course.completedAt?'completed':'active'})),
  ].sort((a,b)=>new Date(String(b.date||0)).getTime()-new Date(String(a.date||0)).getTime()).slice(0,60);

  const account=accountRow?{uid:String(accountRow.user_id),email:String(accountRow.email||model.email||''),name:String(accountRow.display_name||model.name),identifier:String(accountRow.identifier||model.username||''),role:String(accountRow.role||'student'),isActive:accountRow.is_active!==false,mustChangePassword:Boolean(accountRow.must_change_password),updatedAt:accountRow.updated_at||null}:null;

  return <Talent360Workspace model={model} initialTab={one(query.tab)} initialAction={one(query.action)} stats={stats} missingFields={missingFields} portfolio={portfolio.map((item)=>({id:String(item.id),url:String(item.url||''),position:Number(item.position||0),caption:item.caption?String(item.caption):null})).filter((item)=>item.url)} composite={composite} resources={resources} courses={courses} documents={documents} activity={activities} account={account} recoveryRequests={list(recoveryRes.data) as any[]} canManageAccess={profile.role==='admin'} capabilities={{castings:canViewCastings,bookings:canViewBookings,finance:canViewFinance,classroom:canViewClassroom,access:canViewAccess}}/>;
}
