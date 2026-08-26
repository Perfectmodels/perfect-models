import { NextResponse } from 'next/server';
import { supabaseConfigured, supabaseGetRoot } from '@/lib/supabase-backend';

export const dynamic='force-dynamic';
export async function GET(){
  if(!supabaseConfigured())return NextResponse.json({ok:false,configured:false,backend:'supabase',error:'Variables Supabase serveur manquantes.'},{status:503,headers:{'Cache-Control':'no-store'}});
  const started=Date.now();
  try{
    const siteConfig=await supabaseGetRoot('siteConfig');
    return NextResponse.json({ok:true,configured:true,backend:'supabase',databaseReachable:true,latencyMs:Date.now()-started,samplePresent:siteConfig!=null},{headers:{'Cache-Control':'no-store'}});
  }catch(error){return NextResponse.json({ok:false,configured:true,backend:'supabase',databaseReachable:false,latencyMs:Date.now()-started,error:error instanceof Error?error.message:'Supabase indisponible.'},{status:503,headers:{'Cache-Control':'no-store'}})}
}
