import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { getCollection, collectionToArray, KNOWN_COLLECTIONS } from '@/lib/app-data';
import {
  hasSupabasePrivilegedKey,
  privilegedSupabaseUpsert,
  setSupabaseLegacyCollection,
} from '@/lib/supabase-backend';

export const dynamic = 'force-dynamic';

const SECRET_KEY = /(password|passwd|secret|token|private[_-]?key|api[_-]?key|credential|refresh[_-]?token|id[_-]?token)/i;
const pick = (o:any,...keys:string[]) => keys.map(k=>o?.[k]).find(v=>v!==undefined&&v!==null&&v!=='');
const num = (v:any) => { const n=Number(String(v??'').replace(/[^0-9.,-]/g,'').replace(',','.')); return Number.isFinite(n)?n:null; };
const iso = (v:any) => { if(!v) return null; const d=new Date(v); return Number.isNaN(d.valueOf())?null:d.toISOString(); };
const dateOnly = (v:any) => { const x=iso(v); return x?.slice(0,10) || null; };
const legacyId = (item:any,index:number,prefix:string) => String(item?.id || item?.uid || item?.key || item?.legacyId || `${prefix}-${index}`);

function sanitize(value:any):any {
  if(Array.isArray(value)) return value.map(sanitize);
  if(value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value)
      .filter(([key]) => !SECRET_KEY.test(key))
      .map(([key,item]) => [key,sanitize(item)]));
  }
  return value;
}

async function archiveCollection(key:string,value:any){
  // Never persist legacy plaintext passwords, Firebase refresh/id tokens or API secrets.
  await setSupabaseLegacyCollection(key,sanitize(value));
}

async function upsertRows(table:string,rows:any[],onConflict='legacy_id'){
  if(!rows.length) return 0;
  const size=100;
  for(let i=0;i<rows.length;i+=size) await privilegedSupabaseUpsert(table,rows.slice(i,i+size),onConflict);
  return rows.length;
}

async function normalizeCollection(key:string,value:any){
  const items=collectionToArray(value);
  const rows=items.map((raw:any,index:number)=>({raw:sanitize(raw),rawOriginal:raw,index,id:legacyId(raw,index,key)}));
  switch(key){
    case 'castingApplications': return upsertRows('casting_applications',rows.map(({raw,rawOriginal,id})=>({
      legacy_id:id, full_name:pick(rawOriginal,'fullName','name','nomComplet','nom'), first_name:pick(rawOriginal,'firstName','prenom'), last_name:pick(rawOriginal,'lastName','nom'),
      email:pick(rawOriginal,'email','mail'), phone:pick(rawOriginal,'phone','telephone','whatsapp'), gender:pick(rawOriginal,'gender','sexe'), birth_date:dateOnly(pick(rawOriginal,'birthDate','dateNaissance')),
      age:num(rawOriginal?.age), city:pick(rawOriginal,'city','ville','location'), height_cm:num(pick(rawOriginal,'heightCm','height','taille')), status:String(pick(rawOriginal,'status','statut')||'new'),
      photos:pick(rawOriginal,'photos','images','portfolioImages')||[], measurements:pick(rawOriginal,'measurements','mensurations')||{}, experience:pick(rawOriginal,'experience','experienceLevel'), notes:pick(rawOriginal,'notes','motivation'),
      account_provisioned_at:iso(pick(rawOriginal,'accountProvisionedAt')), credentials_email_status:pick(rawOriginal,'credentialsEmailStatus'), raw_data:raw,
      created_at:iso(pick(rawOriginal,'createdAt','submittedAt','date'))||new Date().toISOString(), updated_at:iso(pick(rawOriginal,'updatedAt'))||new Date().toISOString()
    })));
    case 'fashionDayApplications': return upsertRows('fashion_day_applications',rows.map(({raw,rawOriginal,id})=>({legacy_id:id,applicant_name:pick(rawOriginal,'name','fullName','brandName','designerName'),email:pick(rawOriginal,'email','mail'),phone:pick(rawOriginal,'phone','telephone','whatsapp'),application_type:pick(rawOriginal,'type','applicationType','role','category'),status:String(pick(rawOriginal,'status','statut')||'new'),raw_data:raw,created_at:iso(pick(rawOriginal,'createdAt','submittedAt','date'))||new Date().toISOString(),updated_at:iso(pick(rawOriginal,'updatedAt'))||new Date().toISOString()})));
    case 'contactMessages': return upsertRows('contact_messages',rows.map(({raw,rawOriginal,id})=>({legacy_id:id,name:pick(rawOriginal,'name','fullName'),email:pick(rawOriginal,'email','mail'),phone:pick(rawOriginal,'phone','telephone'),subject:pick(rawOriginal,'subject','objet'),message:pick(rawOriginal,'message','body','content'),status:String(pick(rawOriginal,'status','statut')||'new'),raw_data:raw,created_at:iso(pick(rawOriginal,'createdAt','submittedAt','date'))||new Date().toISOString()})));
    case 'bookingRequests': return upsertRows('booking_requests',rows.map(({raw,rawOriginal,id})=>({legacy_id:id,name:pick(rawOriginal,'name','fullName','clientName'),email:pick(rawOriginal,'email','mail'),phone:pick(rawOriginal,'phone','telephone'),model_id:null,status:String(pick(rawOriginal,'status','statut')||'new'),raw_data:raw,created_at:iso(pick(rawOriginal,'createdAt','submittedAt','date'))||new Date().toISOString()})));
    case 'recoveryRequests': return upsertRows('recovery_requests',rows.map(({raw,rawOriginal,id})=>({legacy_id:id,email:pick(rawOriginal,'email','mail'),identifier:pick(rawOriginal,'identifier','username','matricule'),status:String(pick(rawOriginal,'status','statut')||'new'),raw_data:raw,created_at:iso(pick(rawOriginal,'createdAt','date'))||new Date().toISOString()})));
    case 'absences': return upsertRows('absences',rows.map(({raw,rawOriginal,id})=>({legacy_id:id,model_id:String(pick(rawOriginal,'modelId','profileId','studentId')||'' )||null,event_date:dateOnly(pick(rawOriginal,'date','eventDate')),reason:pick(rawOriginal,'reason','motif'),status:String(pick(rawOriginal,'status','statut')||'recorded'),notes:pick(rawOriginal,'notes','comment'),raw_data:raw,created_at:iso(pick(rawOriginal,'createdAt'))||new Date().toISOString()})));
    case 'monthlyPayments': return upsertRows('monthly_payments',rows.map(({raw,rawOriginal,id})=>({legacy_id:id,model_id:String(pick(rawOriginal,'modelId','profileId','studentId')||'')||null,period:dateOnly(pick(rawOriginal,'period','month','date')),amount:num(pick(rawOriginal,'amount','montant'))||0,currency:String(pick(rawOriginal,'currency','devise')||'XAF'),status:String(pick(rawOriginal,'status','statut')||'pending'),paid_at:iso(pick(rawOriginal,'paidAt','paymentDate')),raw_data:raw,created_at:iso(pick(rawOriginal,'createdAt'))||new Date().toISOString()})));
    case 'photoshootBriefs': return upsertRows('photoshoot_briefs',rows.map(({raw,rawOriginal,id})=>({legacy_id:id,title:pick(rawOriginal,'title','name','titre')||'Brief shooting',description:pick(rawOriginal,'description','content'),event_date:iso(pick(rawOriginal,'eventDate','date')),location:pick(rawOriginal,'location','lieu'),model_ids:Array.isArray(pick(rawOriginal,'modelIds','models'))?pick(rawOriginal,'modelIds','models'):[],attachments:pick(rawOriginal,'attachments','files','images')||[],status:String(pick(rawOriginal,'status','statut')||'active'),raw_data:raw,created_at:iso(pick(rawOriginal,'createdAt'))||new Date().toISOString(),updated_at:iso(pick(rawOriginal,'updatedAt'))||new Date().toISOString()})));
    case 'beautyContests': return upsertRows('beauty_contests',rows.map(({raw,rawOriginal,id})=>({legacy_id:id,name:pick(rawOriginal,'name','title','nom')||`Concours ${id}`,status:String(pick(rawOriginal,'status','statut')||'active'),configuration:pick(rawOriginal,'configuration','config','settings')||{},raw_data:raw,created_at:iso(pick(rawOriginal,'createdAt'))||new Date().toISOString(),updated_at:iso(pick(rawOriginal,'updatedAt'))||new Date().toISOString()})));
    case 'classroomRequests': return upsertRows('classroom_requests',rows.map(({raw,rawOriginal,id})=>({legacy_id:id,legacy_user_id:String(pick(rawOriginal,'userId','uid','firebaseUid')||'')||null,model_id:String(pick(rawOriginal,'modelId','profileId')||'')||null,request_type:pick(rawOriginal,'type','requestType'),status:String(pick(rawOriginal,'status','statut')||'new'),message:pick(rawOriginal,'message','body','content'),raw_data:raw,created_at:iso(pick(rawOriginal,'createdAt','date'))||new Date().toISOString(),updated_at:iso(pick(rawOriginal,'updatedAt'))||new Date().toISOString()})));
    case 'classroomMessages': return upsertRows('classroom_messages',rows.map(({raw,rawOriginal,id})=>({legacy_id:id,legacy_user_id:String(pick(rawOriginal,'userId','uid','firebaseUid')||'')||null,model_id:String(pick(rawOriginal,'modelId','profileId')||'')||null,direction:String(pick(rawOriginal,'direction')||'internal'),subject:pick(rawOriginal,'subject','title'),body:pick(rawOriginal,'body','message','content'),status:pick(rawOriginal,'status'),raw_data:raw,created_at:iso(pick(rawOriginal,'createdAt','date'))||new Date().toISOString()})));
    case 'juryMembers': return upsertRows('jury_members',rows.map(({raw,rawOriginal,id})=>({legacy_id:id,legacy_user_id:String(pick(rawOriginal,'userId','uid','firebaseUid')||'')||null,name:pick(rawOriginal,'name','displayName'),email:pick(rawOriginal,'email'),phone:pick(rawOriginal,'phone','telephone'),is_active:pick(rawOriginal,'isActive')!==false,permissions:pick(rawOriginal,'permissions')||{},raw_data:raw,created_at:iso(pick(rawOriginal,'createdAt'))||new Date().toISOString(),updated_at:iso(pick(rawOriginal,'updatedAt'))||new Date().toISOString()})));
    case 'registrationStaff': return upsertRows('registration_staff',rows.map(({raw,rawOriginal,id})=>({legacy_id:id,legacy_user_id:String(pick(rawOriginal,'userId','uid','firebaseUid')||'')||null,name:pick(rawOriginal,'name','displayName'),email:pick(rawOriginal,'email'),phone:pick(rawOriginal,'phone','telephone'),is_active:pick(rawOriginal,'isActive')!==false,permissions:pick(rawOriginal,'permissions')||{},raw_data:raw,created_at:iso(pick(rawOriginal,'createdAt'))||new Date().toISOString(),updated_at:iso(pick(rawOriginal,'updatedAt'))||new Date().toISOString()})));
    case 'users': case 'userProfiles': case 'authProfiles': return upsertRows('legacy_user_profiles',rows.map(({raw,rawOriginal,id})=>({legacy_uid:String(pick(rawOriginal,'uid','userId','id')||id),role:pick(rawOriginal,'role','appRole','app_role'),identifier:pick(rawOriginal,'identifier','username','matricule'),display_name:pick(rawOriginal,'name','displayName'),email:pick(rawOriginal,'email'),model_id:String(pick(rawOriginal,'modelId','profileId')||'')||null,is_active:pick(rawOriginal,'isActive')!==false && pick(rawOriginal,'status')!=='inactive',must_change_password:Boolean(pick(rawOriginal,'mustChangePassword','must_change_password')),permissions:pick(raw,'permissions')||{},metadata:raw,created_at:iso(pick(rawOriginal,'createdAt'))||new Date().toISOString(),updated_at:iso(pick(rawOriginal,'updatedAt'))||new Date().toISOString()})),'legacy_uid');
    case 'adminPermissions': {
      const entries = value && typeof value === 'object' && !Array.isArray(value) ? Object.entries(value) : [];
      return upsertRows('admin_permissions',entries.map(([permission_key,val])=>({permission_key,value:sanitize(val),updated_at:new Date().toISOString()})),'permission_key');
    }
    case 'forumThreads': return upsertRows('forum_threads',rows.map(({raw,rawOriginal,id})=>({legacy_id:id,legacy_author_id:String(pick(rawOriginal,'authorId','userId','uid')||'')||null,title:pick(rawOriginal,'title','subject')||'Discussion',body:pick(rawOriginal,'body','content','message'),status:String(pick(rawOriginal,'status')||'active'),raw_data:raw,created_at:iso(pick(rawOriginal,'createdAt','date'))||new Date().toISOString()})));
    case 'forumReplies': return upsertRows('forum_replies',rows.map(({raw,rawOriginal,id})=>({legacy_id:id,legacy_author_id:String(pick(rawOriginal,'authorId','userId','uid')||'')||null,legacy_thread_id:String(pick(rawOriginal,'threadId','topicId')||'')||null,body:pick(rawOriginal,'body','content','message'),raw_data:raw,created_at:iso(pick(rawOriginal,'createdAt','date'))||new Date().toISOString()})));
    case 'articleComments': return upsertRows('article_comments',rows.map(({raw,rawOriginal,id})=>({legacy_id:id,legacy_user_id:String(pick(rawOriginal,'userId','uid','authorId')||'')||null,legacy_post_id:String(pick(rawOriginal,'postId','articleId')||'')||null,author_name:pick(rawOriginal,'authorName','name'),body:pick(rawOriginal,'body','content','comment'),status:String(pick(rawOriginal,'status')||'published'),raw_data:raw,created_at:iso(pick(rawOriginal,'createdAt','date'))||new Date().toISOString()})));
    case 'classroomProgress': {
      const flat:any[]=[];
      if(value && typeof value==='object') for(const [uid,progress] of Object.entries(value as Record<string,unknown>)) {
        if(progress && typeof progress==='object') for(const [courseId,p] of Object.entries(progress as Record<string,unknown>)) flat.push({legacy_id:`${uid}:${courseId}`,legacy_user_id:uid,course_id:courseId,progress:sanitize(p),updated_at:new Date().toISOString()});
      }
      return upsertRows('course_progress',flat);
    }
    case 'courseData': {
      return upsertRows('courses',rows.map(({rawOriginal,id,index})=>({id:String(pick(rawOriginal,'id','slug')||id),title:pick(rawOriginal,'title','name')||`Formation ${index+1}`,description:pick(rawOriginal,'description'),content:sanitize(rawOriginal),is_active:pick(rawOriginal,'isActive')!==false,position:index,created_at:iso(pick(rawOriginal,'createdAt'))||new Date().toISOString(),updated_at:iso(pick(rawOriginal,'updatedAt'))||new Date().toISOString()})),'id');
    }
    default: return 0;
  }
}

export async function POST(){
  const profile=await getCurrentAppProfile();
  if(!profile || profile.role!=='admin') return NextResponse.json({error:'Accès administrateur requis.'},{status:403});
  if(!hasSupabasePrivilegedKey()) return NextResponse.json({error:'SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY doit être configurée côté serveur avant la migration privée.'},{status:503});

  const summary:Record<string,{archived:boolean;normalized:number;error?:string}>={};
  for(const key of KNOWN_COLLECTIONS){
    try{
      const value=await getCollection(key);
      await archiveCollection(key,value);
      const normalized=await normalizeCollection(key,value);
      summary[key]={archived:true,normalized};
    }catch(error:any){
      summary[key]={archived:false,normalized:0,error:String(error?.message||error)};
    }
  }
  const failed=Object.entries(summary).filter(([,x])=>x.error).map(([key,x])=>({key,error:x.error}));
  const totalNormalized=Object.values(summary).reduce((n,x)=>n+x.normalized,0);
  await privilegedSupabaseUpsert('migration_runs',{
    source:'firebase-rtdb',status:failed.length?'partial':'completed',completed_at:new Date().toISOString(),summary:{collections:Object.keys(summary).length,totalNormalized,failed}
  }).catch(()=>undefined);
  return NextResponse.json({success:failed.length===0,totalNormalized,failed,summary},{status:failed.length?207:200});
}
