import { supabaseGetRoot, supabaseSetRoot } from './supabase-backend';
import { PUBLIC_COLLECTIONS, INTAKE_COLLECTIONS, STUDENT_PRIVATE_COLLECTIONS, MANAGER_COLLECTIONS, JURY_COLLECTIONS, REGISTRATION_COLLECTIONS } from './data-policy';

export interface CollectionRow { key:string; data:unknown; is_public:boolean; updated_at:string; }

export const KNOWN_COLLECTIONS = Array.from(new Set([
  ...PUBLIC_COLLECTIONS,
  ...INTAKE_COLLECTIONS,
  ...STUDENT_PRIVATE_COLLECTIONS,
  ...MANAGER_COLLECTIONS,
  ...JURY_COLLECTIONS,
  ...REGISTRATION_COLLECTIONS,
  'beautyContests','adminPermissions','classroomProgress','classroomRequests','classroomMessages','users','juryMembers','registrationStaff','userProfiles','authProfiles',
  'adminNotifications','adminProfile','applications','fashionDayReservations','heroSlides','missOneLight','pagesContent','mailingContacts'
]));

const SUPABASE_ROOTS = new Set([
  'adminNotifications','adminProfile','agencyAchievements','agencyInfo','agencyPartners','agencyServices','agencyTimeline','apiKeys','applications',
  'castingApplications','classroomProgress','contactInfo','faqData','fashionDayEvents','fashionDayReservations','heroSlides','juryMembers','mailingContacts',
  'missOneLight','modelDistinctions','models','navLinks','newsItems','pagesContent','registrationStaff','siteConfig','siteImages','socialLinks','testimonials','users'
]);

export async function getCollection(key:string){
  if(!SUPABASE_ROOTS.has(key)) return null;
  return supabaseGetRoot(key);
}

export async function getPublicCollection(key:string){
  if(!PUBLIC_COLLECTIONS.has(key)) throw new Error(`Collection publique non autorisée: ${key}`);
  if(!SUPABASE_ROOTS.has(key)) return null;
  return supabaseGetRoot(key);
}

export async function getCollections(keys:Iterable<string>=KNOWN_COLLECTIONS):Promise<CollectionRow[]>{
  const selected=Array.from(new Set(keys)).filter(key=>SUPABASE_ROOTS.has(key));
  const rows=await Promise.all(selected.map(async key=>{
    try{
      const data=await supabaseGetRoot(key);
      return {key,data,is_public:PUBLIC_COLLECTIONS.has(key),updated_at:new Date().toISOString()} as CollectionRow;
    }catch(error:any){
      if(error?.status===401||error?.status===403||error?.status===404)return null;
      throw error;
    }
  }));
  return rows.filter(Boolean) as CollectionRow[];
}

export async function setCollection(key:string,data:unknown){
  if(!SUPABASE_ROOTS.has(key)) throw new Error(`Collection non migrée vers Supabase: ${key}`);
  await supabaseSetRoot(key,data??null);
}

export function collectionToArray(value:unknown):any[]{if(Array.isArray(value))return value.filter(Boolean);if(value&&typeof value==='object')return Object.values(value as Record<string,unknown>).filter(Boolean);return[]}
const idx=(arr:any[],s:string)=>/^\d+$/.test(s)?Number(s):arr.findIndex((i)=>i&&String(i.id)===s);
export function getNestedValue(root:any,segs:string[]){let c=root;for(const s of segs){if(c==null)return null;if(Array.isArray(c)){const i=idx(c,s);if(i<0)return null;c=c[i]}else c=c[s]}return c??null}
export function setNestedValue(root:any,segs:string[],value:any):any{if(!segs.length)return value;const copy=Array.isArray(root)?[...root]:{...(root&&typeof root==='object'?root:{})};const[h,...t]=segs;if(Array.isArray(copy)){let i=idx(copy,h);if(i<0){copy.push({id:h});i=copy.length-1}copy[i]=t.length?setNestedValue(copy[i],t,value):value;return copy}copy[h]=t.length?setNestedValue(copy[h],t,value):value;return copy}
export function patchNestedValue(root:any,segs:string[],updates:Record<string,unknown>){const current=getNestedValue(root,segs);return setNestedValue(root,segs,{...(current&&typeof current==='object'?current:{}),...updates})}
export function deleteNestedValue(root:any,segs:string[]):any{if(!segs.length)return null;const copy=Array.isArray(root)?[...root]:{...(root&&typeof root==='object'?root:{})};const[h,...t]=segs;if(Array.isArray(copy)){const i=idx(copy,h);if(i<0)return copy;if(!t.length){copy.splice(i,1);return copy}copy[i]=deleteNestedValue(copy[i],t);return copy}if(!t.length)delete copy[h];else if(copy[h]!=null)copy[h]=deleteNestedValue(copy[h],t);return copy}
