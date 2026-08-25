import { firebaseDatabaseGet } from './firebase-backend';
import { firebaseAdminDatabaseGet, firebaseAdminDatabasePut, firebaseAdminConfigured } from './firebase-admin-backend';
import { firestoreGetCollection, firestoreSetCollection } from './firestore-backend';
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
  'adminNotifications','adminProfile','applications','fashionDayReservations','heroSlides','missOneLight','pagesContent'
]));

export class DataBackendUnavailableError extends Error {
  status = 503;
  constructor(message = 'Backend Firestore privé non configuré côté serveur.') {
    super(message);
    this.name = 'DataBackendUnavailableError';
  }
}

async function legacyRead(key:string){
  if(PUBLIC_COLLECTIONS.has(key) && !firebaseAdminConfigured()) return firebaseDatabaseGet(key,null);
  if(!firebaseAdminConfigured()) throw new DataBackendUnavailableError();
  return firebaseAdminDatabaseGet(key);
}

export async function getCollection(key:string){
  if(firebaseAdminConfigured()){
    const firestoreValue=await firestoreGetCollection(key);
    if(firestoreValue!==null)return firestoreValue;
  }
  return legacyRead(key);
}

export async function getPublicCollection(key:string){
  if(!PUBLIC_COLLECTIONS.has(key)) throw new Error(`Collection publique non autorisée: ${key}`);
  if(firebaseAdminConfigured()){
    const firestoreValue=await firestoreGetCollection(key);
    if(firestoreValue!==null)return firestoreValue;
  }
  return firebaseDatabaseGet(key,null);
}

export async function getCollections(keys:Iterable<string>=KNOWN_COLLECTIONS):Promise<CollectionRow[]>{
  const selected=Array.from(new Set(keys));
  const adminReady=firebaseAdminConfigured();
  const rows=await Promise.all(selected.map(async key=>{
    // En local ou sur un environnement sans secret Admin, on continue de servir
    // toutes les données publiques RTDB au lieu de faire échouer /api/data.
    if(!adminReady && !PUBLIC_COLLECTIONS.has(key)) return null;
    try{
      const data=await getCollection(key);
      return {key,data,is_public:PUBLIC_COLLECTIONS.has(key),updated_at:new Date().toISOString()} as CollectionRow;
    }catch(error:any){
      if(error?.status===401||error?.status===403||error?.status===404||error?.status===503)return null;
      throw error;
    }
  }));
  return rows.filter(Boolean) as CollectionRow[];
}

export async function setCollection(key:string,data:unknown){
  if(!firebaseAdminConfigured()) throw new DataBackendUnavailableError('Firebase Admin est requis pour écrire dans Firestore.');
  await firestoreSetCollection(key,data??null);
  // Transition courte : une panne RTDB ne doit jamais faire échouer une écriture Firestore.
  if(process.env.DUAL_WRITE_RTDB==='true'){
    await firebaseAdminDatabasePut(key,data??null).catch(()=>undefined);
  }
}

export function collectionToArray(value:unknown):any[]{if(Array.isArray(value))return value.filter(Boolean);if(value&&typeof value==='object')return Object.values(value as Record<string,unknown>).filter(Boolean);return[]}
const idx=(arr:any[],s:string)=>/^\d+$/.test(s)?Number(s):arr.findIndex((i)=>i&&String(i.id)===s);
export function getNestedValue(root:any,segs:string[]){let c=root;for(const s of segs){if(c==null)return null;if(Array.isArray(c)){const i=idx(c,s);if(i<0)return null;c=c[i]}else c=c[s]}return c??null}
export function setNestedValue(root:any,segs:string[],value:any):any{if(!segs.length)return value;const copy=Array.isArray(root)?[...root]:{...(root&&typeof root==='object'?root:{})};const[h,...t]=segs;if(Array.isArray(copy)){let i=idx(copy,h);if(i<0){copy.push({id:h});i=copy.length-1}copy[i]=t.length?setNestedValue(copy[i],t,value):value;return copy}copy[h]=t.length?setNestedValue(copy[h],t,value):value;return copy}
export function patchNestedValue(root:any,segs:string[],updates:Record<string,unknown>){const current=getNestedValue(root,segs);return setNestedValue(root,segs,{...(current&&typeof current==='object'?current:{}),...updates})}
export function deleteNestedValue(root:any,segs:string[]):any{if(!segs.length)return null;const copy=Array.isArray(root)?[...root]:{...(root&&typeof root==='object'?root:{})};const[h,...t]=segs;if(Array.isArray(copy)){const i=idx(copy,h);if(i<0)return copy;if(!t.length){copy.splice(i,1);return copy}copy[i]=deleteNestedValue(copy[i],t);return copy}if(!t.length)delete copy[h];else if(copy[h]!=null)copy[h]=deleteNestedValue(copy[h],t);return copy}
