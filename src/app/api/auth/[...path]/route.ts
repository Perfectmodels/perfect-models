import { NextResponse } from 'next/server';
import { ensureUserProfile } from '@/lib/auth/profile';
import { firebaseSignIn } from '@/lib/firebase-backend';
import {
  clearSupabaseSession,
  getAuthMigrationByEmail,
  getSupabaseAccessToken,
  markAuthMigration,
  setSupabaseSession,
  supabaseAdminUpdateUser,
  supabaseChangePassword,
  supabaseResetPassword,
  supabaseSignIn,
  supabaseSignUp,
} from '@/lib/supabase-backend';

export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ path: string[] }> };

async function signInWithMigrationBridge(email:string,password:string){
  try{return await supabaseSignIn(email,password)}catch(primary:any){
    const migration=await getAuthMigrationByEmail(email).catch(()=>null);
    if(!migration?.supabase_user_id)throw primary;
    const firebase=await firebaseSignIn(email,password).catch(()=>null);
    if(!firebase?.localId)throw primary;
    await supabaseAdminUpdateUser(String(migration.supabase_user_id),{password,app_metadata:{firebase_uid:firebase.localId,role:migration.role||'student',profile_id:migration.profile_id||null,migration_pending_password:false}});
    await markAuthMigration(String(migration.firebase_uid),{migrated_at:new Date().toISOString(),must_change_password:false,data:{...(migration.data||{}),passwordBridgePending:false,passwordMigratedAt:new Date().toISOString()}}).catch(()=>undefined);
    return supabaseSignIn(email,password);
  }
}

export async function POST(request: Request, context: Ctx) {
  const { path = [] } = await context.params;
  const action = path.join('/');
  const body = await request.json().catch(() => ({}));
  try {
    if (action === 'sign-in/email') {
      const email=String(body.email||'').trim().toLowerCase();const password=String(body.password||'');
      const session = await signInWithMigrationBridge(email,password);
      await setSupabaseSession(session);
      return NextResponse.json({ user: { id: session.user.id, email: session.user.email || null, name: session.user.user_metadata?.name || null } });
    }
    if (action === 'sign-up/email') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const name = String(body.name || email.split('@')[0] || '');
      const session = await supabaseSignUp(email, password, name);
      if (session.access_token && session.refresh_token) await setSupabaseSession(session);
      await ensureUserProfile({ id: session.user.id, email, user_metadata: { name } });
      return NextResponse.json({ user: { id: session.user.id, email: session.user.email || email, name } }, { status: 201 });
    }
    if (action === 'sign-out') { await clearSupabaseSession(); return NextResponse.json({ success: true }); }
    if (action === 'forget-password') { await supabaseResetPassword(String(body.email || '').trim().toLowerCase()); return NextResponse.json({ success: true }); }
    if (action === 'change-password') {
      const token = await getSupabaseAccessToken();
      if (!token) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });
      await supabaseChangePassword(token, String(body.newPassword || ''));
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Route d’authentification inconnue.' }, { status: 404 });
  } catch (error:any) {
    const message = String(error?.message || 'Erreur Supabase Authentication');
    const status = Number(error?.status || 400);
    return NextResponse.json({ error: message, message }, { status });
  }
}

export async function GET(_request: Request, context: Ctx) {
  const { path = [] } = await context.params;
  return NextResponse.json({ service: 'supabase-auth', route: path.join('/') });
}
