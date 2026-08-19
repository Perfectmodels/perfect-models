import { firebaseDatabaseGet } from '../firebase-backend';
import { auth } from './server';

export type AppRole = 'admin' | 'student' | 'jury' | 'registration' | 'jury-contest';
export interface AppSessionProfile { userId:string; email:string; name:string; identifier:string; role:AppRole; profileId:string; status:string; mustChangePassword:boolean; permissions:Record<string,boolean>; adminPermissions?:Record<string,boolean>; contestId?:string|null; }

const ADMIN_ALIASES = new Set(['admin','admin@perfectmodels.online','contact@perfectmodels.online','contact@perfectmodels.ga','perfectmodels.ga@gmail.com']);

function asArray(value:any): any[] {
  return Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [];
}

async function findProfile(user:any): Promise<AppSessionProfile | null> {
  const email = String(user?.email || '').toLowerCase();
  const name = String(user?.displayName || email.split('@')[0] || '');
  const uid = String(user?.localId || '');
  const identifier = email === 'admin@perfectmodels.online' ? 'admin' : email.split('@')[0];

  if (ADMIN_ALIASES.has(email) || email === 'admin@perfectmodels.online') {
    return { userId:uid,email,name: user?.displayName || 'Administration PMM',identifier:'admin',role:'admin',profileId:'admin',status:'active',mustChangePassword:false,permissions:{all:true,isAdmin:true},adminPermissions:undefined };
  }

  const candidateRoots = ['users','userProfiles','authProfiles','registrationStaff','juryMembers'];
  for (const root of candidateRoots) {
    const record = await firebaseDatabaseGet(`${root}/${uid}`).catch(() => null);
    if (record && typeof record === 'object') {
      const role = String(record.role || record.app_role || record.appRole || (root === 'juryMembers' ? 'jury' : root === 'registrationStaff' ? 'registration' : 'student')) as AppRole;
      // Lire les permissions admin si le rôle est admin (admin délégué)
      let adminPermissions: Record<string,boolean> | undefined;
      if (role === 'admin') {
        const ap = await firebaseDatabaseGet(`adminPermissions/${uid}`).catch(() => null);
        adminPermissions = (ap && typeof ap === 'object') ? ap : undefined;
      }
      return {
        userId:uid,
        email:String(record.email || email),
        name:String(record.name || record.displayName || name),
        identifier:String(record.identifier || record.matricule || identifier),
        role,
        profileId:String(record.profileId || record.modelId || record.id || uid),
        status:String(record.status || 'active'),
        mustChangePassword:Boolean(record.mustChangePassword || record.must_change_password),
        permissions:(record.permissions && typeof record.permissions === 'object') ? record.permissions : {},
        adminPermissions,
        contestId:record.contestId || null,
      };
    }
  }

  const models = asArray(await firebaseDatabaseGet('models').catch(() => null));
  const model = models.find((m:any) => String(m?.email || m?.loginEmail || m?.login_email || '').toLowerCase() === email || String(m?.identifier || m?.matricule || '').toLowerCase() === identifier);
  if (model) {
    return { userId:uid,email,name:String(model.name || name),identifier:String(model.matricule || model.identifier || identifier),role:'student',profileId:String(model.id || uid),status:'active',mustChangePassword:Boolean(model.mustChangePassword),permissions:{isActive:true},adminPermissions:undefined,contestId:model.contestId || null };
  }

  if (email.endsWith('@perfectmodels.online')) {
    return { userId:uid,email,name,identifier,role:'student',profileId:uid,status:'active',mustChangePassword:false,permissions:{isActive:true},adminPermissions:undefined };
  }
  return null;
}

export async function getCurrentAppProfile(): Promise<AppSessionProfile | null> {
  try {
    const { data } = await auth.getSession();
    return findProfile(data?.user);
  } catch { return null; }
}

export async function getFirebaseSessionUser() {
  const { data } = await auth.getSession();
  return data?.user || null;
}
