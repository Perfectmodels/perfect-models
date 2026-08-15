import { NextRequest,NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { firebaseDatabaseGet, firebaseDatabasePut, firebaseLookup, getValidFirebaseIdToken } from '@/lib/firebase-backend';
import { getCollection,setCollection } from '@/lib/app-data';

async function account(path:string){
  const[,id]=path.split('/');
  const token=await getValidFirebaseIdToken();
  const [authUser,profile]=await Promise.all([firebaseLookup(id).catch(()=>null),firebaseDatabaseGet(`users/${id}`,token).catch(()=>null)]);
  if(!authUser&&!profile)return null;
  return {uid:id,email:profile?.email||authUser?.email||null,role:profile?.role||profile?.app_role||'student',profileId:profile?.profileId||profile?.modelId||id,username:profile?.identifier||profile?.matricule||String(authUser?.email||'').split('@')[0],permissions:profile?.permissions||{},status:profile?.status||'active',displayName:profile?.name||authUser?.displayName||null};
}

export async function GET(r:NextRequest){const p=await getCurrentAppProfile();if(!p)return NextResponse.json({error:'Non autorisé.'},{status:401});const path=r.nextUrl.searchParams.get('path')||'';if(path.startsWith('accounts/'))return NextResponse.json({data:await account(path)});const docs=(await getCollection('legacyDocuments')) as Record<string,unknown>|null;return NextResponse.json({data:docs?.[path]??null})}
export async function PUT(r:NextRequest){const p=await getCurrentAppProfile();if(!p)return NextResponse.json({error:'Non autorisé.'},{status:401});const b=await r.json().catch(()=>({}));const path=String(b.path||'');const data=b.data&&typeof b.data==='object'?b.data:{};if(path.startsWith('accounts/')){if(p.role!=='admin')return NextResponse.json({error:'Admin requis.'},{status:403});const[,id]=path.split('/');const token=await getValidFirebaseIdToken();const current=await firebaseDatabaseGet(`users/${id}`,token).catch(()=>({}));await firebaseDatabasePut(`users/${id}`,{...current,permissions:data.permissions||current?.permissions||{}},token);return NextResponse.json({success:true})}const docs=((await getCollection('legacyDocuments'))||{}) as Record<string,unknown>;docs[path]=b.merge&&docs[path]&&typeof docs[path]==='object'?{...(docs[path] as object),...data}:data;await setCollection('legacyDocuments',docs);return NextResponse.json({success:true})}
export async function DELETE(r:NextRequest){const p=await getCurrentAppProfile();if(!p||p.role!=='admin')return NextResponse.json({error:'Admin requis.'},{status:403});const path=r.nextUrl.searchParams.get('path')||'';const docs=((await getCollection('legacyDocuments'))||{}) as Record<string,unknown>;delete docs[path];await setCollection('legacyDocuments',docs);return NextResponse.json({success:true})}
