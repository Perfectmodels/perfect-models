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

function appMeta(user:any){ return user?.app_metadata && typeof user.app_metadata==='object' ? user.app_metadata : {}; }
function userMeta(user:any){ return user?.user_metadata && typeof user.user_metadata==='object' ? user.user_metadata : {}; }

export async function findProfile(user: unknown): Promise<AppSessionProfile | null> {
  const u = user as Record<string, any> | null;
  const uid = String(u?.id || '');
  const email = String(u?.email || '').trim().toLowerCase();
  if (!uid) return null;
  const app = appMeta(u);
  const meta = userMeta(u);
  const defaultName = String(meta.name || meta.display_name || email.split('@')[0] || '');
  const defaultRole = normalizeAppRole(app.role, ADMIN_ALIASES.has(email) ? 'admin' : 'student');
  const defaultProfileId = String(app.profile_id || uid);
  const defaultIdentifier = String(app.identifier || (ADMIN_ALIASES.has(email) ? 'admin' : email.split('@')[0]));

  const usersRoot = await getCollection('users').catch(() => null) as Record<string, any> | null;
  const userRows = usersRoot && typeof usersRoot === 'object' && !Array.isArray(usersRoot) ? Object.values(usersRoot) : collectionToArray(usersRoot);
  const central:any = userRows.find((row:any) => row && (
    String(row.supabaseUserId || row.authUserId || '') === uid ||
    String(row.email || '').trim().toLowerCase() === email ||
    String(row.profileId || '') === defaultProfileId
  ));

  const roleFromRow = central ? normalizeAppRole(central.role || central.app_role || central.appRole, defaultRole) : defaultRole;
  const permissions = central?.permissions && typeof central.permissions === 'object'
    ? central.permissions
    : (roleFromRow === 'admin' ? { all:true, isAdmin:true } : { isActive:true });
  const role:AppRole = permissions.isAdmin === true ? 'admin' : roleFromRow;

  let delegated:Record<string,boolean>|undefined;
  if(role==='admin' || role==='manager') {
    const root = await getCollection('adminPermissions').catch(()=>null) as Record<string,any>|null;
    const candidate = root && typeof root==='object' ? (root[uid] || root[central?.uid] || root[central?.id]) : null;
    if(candidate && typeof candidate==='object') delegated=candidate;
  }

  const models = collectionToArray(await getCollection('models').catch(()=>null));
  const model:any = models.find((m:any)=>
    String(m?.authUserId||'')===uid || String(m?.email||'').trim().toLowerCase()===email || String(m?.id||'')===String(central?.profileId||defaultProfileId)
  );

  return {
    userId: uid,
    email: String(central?.email || model?.email || email),
    name: String(central?.name || central?.displayName || model?.name || defaultName),
    identifier: String(central?.identifier || central?.matricule || model?.matricule || model?.identifier || defaultIdentifier),
    role,
    profileId: String(central?.profileId || model?.id || defaultProfileId),
    status: String(central?.status || model?.status || 'active'),
    mustChangePassword: Boolean(central?.mustChangePassword || central?.must_change_password || app.must_change_password),
    permissions,
    adminPermissions: delegated,
    contestId: central?.contestId ? String(central.contestId) : (model?.contestId ? String(model.contestId) : null),
  };
}

export async function getCurrentAppProfile(): Promise<AppSessionProfile | null> {
  try { const { data } = await auth.getSession(); return data?.user ? findProfile(data.user) : null; } catch { return null; }
}

export async function ensureUserProfile(user: { id?: string; email?: string | null; user_metadata?: Record<string,any> }): Promise<AppSessionProfile | null> {
  const uid = String(user?.id || ''); if (!uid) return null;
  const existing = await findProfile(user); if (existing) return existing;
  const email = String(user?.email || '').toLowerCase();
  const name = String(user?.user_metadata?.name || email.split('@')[0] || '');
  const identifier = ADMIN_ALIASES.has(email) ? 'admin' : email.split('@')[0];
  const role:AppRole = ADMIN_ALIASES.has(email) ? 'admin' : 'student';
  const root = (await getCollection('users').catch(()=>null) || {}) as Record<string,any>;
  root[uid] = { id:uid, supabaseUserId:uid, email, name, identifier, role, profileId:uid, status:'active', mustChangePassword:false, permissions:role==='admin'?{all:true,isAdmin:true}:{isActive:true}, createdAt:new Date().toISOString() };
  await setCollection('users',root);
  return findProfile(user);
}
