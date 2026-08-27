import { firebaseDatabaseGet, firebaseDatabasePut, getValidFirebaseIdToken } from './firebase-backend';
import { PUBLIC_COLLECTIONS, INTAKE_COLLECTIONS, STUDENT_PRIVATE_COLLECTIONS, MANAGER_COLLECTIONS, JURY_COLLECTIONS, REGISTRATION_COLLECTIONS } from './data-policy';
import { getSupabaseLegacyCollection, getSupabasePublicModels, setSupabaseLegacyCollection } from './supabase-backend';

export interface CollectionRow { key:string; data:unknown; is_public:boolean; updated_at:string; }

export const KNOWN_COLLECTIONS = Array.from(new Set([
  ...PUBLIC_COLLECTIONS,
  ...INTAKE_COLLECTIONS,
  ...STUDENT_PRIVATE_COLLECTIONS,
  ...MANAGER_COLLECTIONS,
  ...JURY_COLLECTIONS,
  ...REGISTRATION_COLLECTIONS,
  'beautyContests','adminPermissions','classroomProgress','classroomRequests','classroomMessages','users','juryMembers','registrationStaff','userProfiles','authProfiles'
]));

async function readPublicCollection(key:string){
  try {
    if (key === 'models') return await getSupabasePublicModels();
    const value = await getSupabaseLegacyCollection(key);
    if (value !== null && typeof value !== 'undefined') return value;
  } catch (error) {
    console.warn(`[data] Supabase read fallback for ${key}`, error);
  }
  return firebaseDatabaseGet(key,null);
}

export async function getCollection(key:string){
  if(PUBLIC_COLLECTIONS.has(key)) return readPublicCollection(key);
  const token=await getValidFirebaseIdToken();
  return firebaseDatabaseGet(key,token);
}

export async function getPublicCollection(key:string){
  if(!PUBLIC_COLLECTIONS.has(key)) throw new Error(`Collection publique non autorisée: ${key}`);
  return readPublicCollection(key);
}

export async function getCollections(keys:Iterable<string>=KNOWN_COLLECTIONS):Promise<CollectionRow[]>{
  const token=await getValidFirebaseIdToken();
  const selected=Array.from(new Set(keys));
  const rows=await Promise.all(selected.map(async key=>{
    try{
      const isPublic=PUBLIC_COLLECTIONS.has(key);
      const data=isPublic?await readPublicCollection(key):await firebaseDatabaseGet(key,token);
      return {key,data,is_public:isPublic,updated_at:new Date().toISOString()} as CollectionRow;
    }catch(error:any){
      if(error?.status===401||error?.status===403)return null;
      throw error;
    }
  }));
  return rows.filter(Boolean) as CollectionRow[];
}

export async function setCollection(key:string,data:unknown){
  const token=await getValidFirebaseIdToken();
  await firebaseDatabasePut(key,data??null,token);
  if(PUBLIC_COLLECTIONS.has(key)) {
    try {
      await setSupabaseLegacyCollection(key,data??null);
    } catch (error) {
      console.error(`[data] Supabase dual-write failed for ${key}`, error);
    }
  }
}

export function collectionToArray(value:unknown):any[]{if(Array.isArray(value))return value.filter(Boolean);if(value&&typeof value==='object')return Object.values(value as Record<string,unknown>).filter(Boolean);return[]}
const idx=(arr:any[],s:string)=>/^\d+$/.test(s)?Number(s):arr.findIndex((i)=>i&&String(i.id)===s);
export function getNestedValue(root:any,segs:string[]){let c=root;for(const s of segs){if(c==null)return null;if(Array.isArray(c)){const i=idx(c,s);if(i<0)return null;c=c[i]}else c=c[s]}return c??null}
export function setNestedValue(root:any,segs:string[],value:any):any{if(!segs.length)return value;const copy=Array.isArray(root)?[...root]:{...(root&&typeof root==='object'?root:{})};const[h,...t]=segs;if(Array.isArray(copy)){let i=idx(copy,h);if(i<0){copy.push({id:h});i=copy.length-1}copy[i]=t.length?setNestedValue(copy[i],t,value):value;return copy}copy[h]=t.length?setNestedValue(copy[h],t,value):value;return copy}
export function patchNestedValue(root:any,segs:string[],updates:Record<string,unknown>){const current=getNestedValue(root,segs);return setNestedValue(root,segs,{...(current&&typeof current==='object'?current:{}),...updates})}
export function deleteNestedValue(root:any,segs:string[]):any{if(!segs.length)return null;const copy=Array.isArray(root)?[...root]:{...(root&&typeof root==='object'?root:{})};const[h,...t]=segs;if(Array.isArray(copy)){const i=idx(copy,h);if(i<0)return copy;if(!t.length){copy.splice(i,1);return copy}copy[i]=deleteNestedValue(copy[i],t);return copy}if(!t.length)delete copy[h];else if(copy[h]!=null)copy[h]=deleteNestedValue(copy[h],t);return copy}
