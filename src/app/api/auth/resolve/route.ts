import { NextResponse } from 'next/server';
import { firebaseDatabaseGet } from '@/lib/firebase-backend';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ADMIN_ALIASES = new Set(['admin','admin@perfectmodels.online','contact@perfectmodels.online','contact@perfectmodels.ga','perfectmodels.ga@gmail.com']);
const asArray = (v:any) => Array.isArray(v) ? v : v && typeof v === 'object' ? Object.values(v) : [];

async function resolve(identifier: string) {
  const candidate = identifier.trim().toLowerCase();
  if (!candidate) return NextResponse.json({ error: 'Identifiant requis.' }, { status: 400 });
  if (ADMIN_ALIASES.has(candidate)) return NextResponse.json({ email:'admin@perfectmodels.online', identifier:'admin', role:'admin', name:'Administration PMM' });

  try {
    const [models, users, profiles] = await Promise.all([
      firebaseDatabaseGet('models').catch(() => null),
      firebaseDatabaseGet('users').catch(() => null),
      firebaseDatabaseGet('userProfiles').catch(() => null),
    ]);
    const all = [...asArray(models), ...asArray(users), ...asArray(profiles)];
    const row = all.find((item:any) => {
      const values = [item?.identifier,item?.matricule,item?.email,item?.loginEmail,item?.login_email,item?.username,item?.name]
        .filter(Boolean).map((v:any)=>String(v).toLowerCase());
      return values.includes(candidate);
    });
    if (!row) return NextResponse.json({ error:'Identifiant introuvable ou compte inactif.' }, { status:404 });
    const email = String(row.email || row.loginEmail || row.login_email || (String(row.matricule || row.identifier || '').toLowerCase() + '@perfectmodels.online'));
    return NextResponse.json({ email, identifier:String(row.identifier || row.matricule || candidate), role:String(row.role || row.app_role || 'student'), name:String(row.name || row.displayName || candidate) }, { headers:{'Cache-Control':'no-store'} });
  } catch (error) {
    console.error('[auth/resolve] Firebase lookup failed', error);
    return NextResponse.json({ error:"Le service d'authentification est temporairement indisponible." }, { status:503 });
  }
}

export async function POST(request:Request){const body=await request.json().catch(()=>({}));return resolve(String(body.identifier||''));}
export async function GET(request:Request){return resolve(new URL(request.url).searchParams.get('identifier')||'');}
