import { auth } from './server';
import { collectionToArray, getCollection, setCollection } from '../app-data';

export type AppRole = 'admin' | 'manager' | 'student' | 'jury' | 'registration' | 'jury-contest';
export interface AppSessionProfile {
  userId: string; email: string; name: string; identifier: string; role: AppRole; profileId: string; status: string;
  mustChangePassword: boolean; permissions: Record<string, boolean>; adminPermissions?: Record<string, boolean>; contestId?: string | null;
}

export const ADMIN_ALIASES = new Set(['admin','admin@perfectmodels.online','contact@perfectmodels.online','contact@perfectmodels.ga','perfectmodels.ga@gmail.com']);

function normalizeAppRole(value: unknown, fallback: AppRole = 'student'): AppRole {
  const map: Record<string, AppRole> = { admin:'admin', manager:'manager', gestionnaire:'manager', student:'student', mannequin:'student', modele:'student', jury:'jury', registration:'registration', 'jury-contest':'jury-contest', accueil:'registration', staff:'registration' };
  return map[String(value || '').trim().toLowerCase()] || fallback;
}

function metadata(user: any) { return { ...(user?.user_metadata || {}), ...(user?.app_metadata || {}) }; }

export async function findProfile(user: unknown): Promise<AppSessionProfile | null> {
  const u = user as Record<string, any> | null;
  const uid = String(u?.id || u?.localId || u?.uid || '');
  const email = String(u?.email || '').toLowerCase();
  if (!uid) return null;
  const meta = metadata(u);
  const name = String(meta.name || meta.display_name || email.split('@')[0] || '');
  const firebaseUid = String(meta.firebase_uid || '');
  const identifierFallback = email === 'admin@perfectmodels.online' ? 'admin' : email.split('@')[0];

  if (ADMIN_ALIASES.has(email) || meta.role === 'admin') {
    return { userId: uid, email, name: name || 'Administration PMM', identifier:'admin', role:'admin', profileId:'admin', status:'active', mustChangePassword:false, permissions:{all:true,isAdmin:true}, adminPermissions:undefined, contestId:null };
  }

  const usersRoot = await getCollection('users').catch(() => null) as Record<string, any> | null;
  const users = usersRoot && typeof usersRoot === 'object' ? usersRoot : {};
  const central = (firebaseUid && users[firebaseUid]) || Object.values(users).find((row:any) => row && (String(row.supabaseUserId || '') === uid || String(row.email || '').toLowerCase() === email));
  if (central && typeof central === 'object') {
    const c:any = central;
    const baseRole = normalizeAppRole(c.role || c.app_role || c.appRole || meta.role);
    const permissions = c.permissions && typeof c.permissions === 'object' ? c.permissions : {};
    const role:AppRole = permissions.isAdmin === true ? 'admin' : baseRole;
    return { userId:uid, email:String(c.email || email), name:String(c.name || c.displayName || name), identifier:String(c.identifier || c.matricule || meta.identifier || identifierFallback), role, profileId:String(c.profileId || meta.profile_id || c.id || firebaseUid || uid), status:String(c.status || 'active'), mustChangePassword:Boolean(c.mustChangePassword || c.must_change_password || meta.must_change_password), permissions, adminPermissions:c.adminPermissions && typeof c.adminPermissions === 'object' ? c.adminPermissions : undefined, contestId:c.contestId ? String(c.contestId) : null };
  }

  const model = collectionToArray(await getCollection('models').catch(() => null)).find((m:any) => [m?.email,m?.loginEmail,m?.login_email].filter(Boolean).map((v:any)=>String(v).toLowerCase()).includes(email) || String(m?.authUserId || '')===uid || (firebaseUid && String(m?.firebaseUid || '')===firebaseUid));
  if (model) {
    const permissions = model.permissions && typeof model.permissions === 'object' ? model.permissions : {isActive:true};
    const role = permissions.isAdmin === true ? 'admin' : normalizeAppRole(model.role || meta.role,'student');
    return { userId:uid, email:String(model.email || email), name:String(model.name || name), identifier:String(model.matricule || model.identifier || meta.identifier || identifierFallback), role, profileId:String(model.id || meta.profile_id || uid), status:String(model.status || 'active'), mustChangePassword:Boolean(model.mustChangePassword || meta.must_change_password), permissions, adminPermissions:model.adminPermissions, contestId:model.contestId ? String(model.contestId) : null };
  }

  return { userId:uid, email, name, identifier:String(meta.identifier || identifierFallback), role:normalizeAppRole(meta.role,'student'), profileId:String(meta.profile_id || uid), status:'active', mustChangePassword:Boolean(meta.must_change_password), permissions:{isActive:true}, adminPermissions:undefined, contestId:null };
}

export async function getCurrentAppProfile(): Promise<AppSessionProfile | null> {
  try { const { data } = await auth.getSession(); return data?.user ? findProfile(data.user) : null; } catch { return null; }
}

export async function getFirebaseSessionUser() { const { data } = await auth.getSession(); return data?.user || null; }

export async function ensureUserProfile(user: { id?: string; localId?: string; email?: string | null; user_metadata?: Record<string,any>; displayName?: string | null }): Promise<AppSessionProfile | null> {
  const uid = String(user?.id || user?.localId || '');
  if (!uid) return null;
  const existing = await findProfile(user);
  if (existing) return existing;
  const email = String(user?.email || '').toLowerCase();
  const name = String(user?.user_metadata?.name || user?.displayName || email.split('@')[0] || '');
  const identifier = email === 'admin@perfectmodels.online' ? 'admin' : email.split('@')[0];
  const role:AppRole = ADMIN_ALIASES.has(email) ? 'admin' : 'student';
  const root = (await getCollection('users').catch(()=>null) || {}) as Record<string,any>;
  root[uid] = { id:uid, uid, supabaseUserId:uid, email, name, identifier, role, profileId:uid, status:'active', mustChangePassword:false, permissions:role==='admin'?{all:true,isAdmin:true}:{isActive:true}, createdAt:new Date().toISOString() };
  await setCollection('users',root);
  return findProfile(user);
}
