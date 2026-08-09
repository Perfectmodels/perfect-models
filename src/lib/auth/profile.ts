import { auth } from './server';
import { sqlQuery } from '../neon';

export type AppRole = 'admin' | 'student' | 'jury' | 'registration' | 'jury-contest';
export interface AppSessionProfile {
  userId: string; email: string; name: string; identifier: string; role: AppRole;
  profileId: string; status: string; mustChangePassword: boolean;
  permissions: Record<string, boolean>; contestId?: string | null;
}
interface ProfileRow { user_id:string; identifier:string; app_role:AppRole; login_email:string; profile_id:string|null; status:string; must_change_password:boolean; permissions:Record<string,boolean>|null; contest_id:string|null; name:string; }

export async function getCurrentAppProfile(): Promise<AppSessionProfile | null> {
  try {
    const { data: session } = await auth.getSession();
    const sessionUser = session?.user;
    if (!sessionUser?.id) return null;
    const rows = await sqlQuery<ProfileRow>(`SELECT ap.user_id::text,ap.identifier,ap.app_role,ap.login_email,ap.profile_id,ap.status,ap.must_change_password,ap.permissions,ap.contest_id,u.name FROM public.auth_profiles ap JOIN neon_auth."user" u ON u.id=ap.user_id WHERE ap.user_id::text=$1 LIMIT 1`, [sessionUser.id]);
    const row = rows[0];
    if (!row || row.status !== 'active') return null;
    return { userId:row.user_id,email:row.login_email,name:row.name,identifier:row.identifier,role:row.app_role,profileId:row.profile_id||row.identifier,status:row.status,mustChangePassword:Boolean(row.must_change_password),permissions:row.permissions||{},contestId:row.contest_id };
  } catch { return null; }
}
