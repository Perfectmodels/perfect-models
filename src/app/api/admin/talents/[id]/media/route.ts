import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id:string }> };
const MAX_PORTFOLIO_IMAGES = 24;
const MAX_BATCH_SIZE = 8;

function text(value:unknown, max=1200) { return String(value ?? '').trim().slice(0,max); }
function objectValue(value:unknown) { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string,unknown> : {}; }
function directImgBB(value:unknown) {
  const candidate=text(value);
  if(!candidate) return '';
  try { const url=new URL(candidate); return url.protocol==='https:'&&url.hostname==='i.ibb.co'&&url.pathname.length>1?url.toString():''; }
  catch { return ''; }
}

async function authorize(context:Context) {
  const profile=await getCurrentAppProfile();
  if(!profile||!['admin','manager'].includes(profile.role)) return { error:NextResponse.json({error:'Accès administrateur requis.'},{status:401}) } as const;
  if(!hasAdminPermission(profile,'models')) return { error:NextResponse.json({error:'Permission Talents insuffisante.'},{status:403}) } as const;
  const {id}=await context.params;
  const supabase=createSupabaseAdminClient() as any;
  const {data:model,error}=await supabase.from('models').select('id,image_url,raw_data').eq('id',id).maybeSingle();
  if(error) return { error:NextResponse.json({error:'La fiche talent ne peut pas être vérifiée.'},{status:503}) } as const;
  if(!model?.id) return { error:NextResponse.json({error:'Talent introuvable.'},{status:404}) } as const;
  return { profile,model,supabase } as const;
}

export async function POST(request:Request, context:Context) {
  const access=await authorize(context); if('error' in access) return access.error;
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null;
  const requested=Array.isArray(body?.urls)?body.urls:[];
  const urls=[...new Set(requested.map(directImgBB).filter(Boolean))].slice(0,MAX_BATCH_SIZE);
  if(!urls.length) return NextResponse.json({error:'Ajoutez au moins une image ImgBB valide.'},{status:400});
  const {data:existing,count,error:readError}=await access.supabase.from('model_portfolio_images').select('id,url,position',{count:'exact'}).eq('model_id',access.model.id).order('position',{ascending:false});
  if(readError) return NextResponse.json({error:'Le portfolio ne peut pas être vérifié.'},{status:503});
  const existingUrls=new Set((existing||[]).map((row:any)=>String(row.url||'')));
  const available=Math.max(0,MAX_PORTFOLIO_IMAGES-Number(count||0));
  const additions=urls.filter((url)=>!existingUrls.has(url)).slice(0,available);
  if(!available) return NextResponse.json({error:`Le portfolio est limité à ${MAX_PORTFOLIO_IMAGES} photos.`},{status:409});
  if(!additions.length) return NextResponse.json({error:'Ces images figurent déjà dans le portfolio.'},{status:409});
  const highest=Array.isArray(existing)&&existing.length?Number(existing[0]?.position||0):-1;
  const rows=additions.map((url,index)=>({model_id:access.model.id,url,position:highest+index+1,caption:null}));
  const {data,error}=await access.supabase.from('model_portfolio_images').insert(rows).select('id,url,position,caption').order('position',{ascending:true});
  if(error) return NextResponse.json({error:error.code==='23505'?'Une image figure déjà dans ce portfolio.':'Les images n’ont pas pu être ajoutées.'},{status:400});
  return NextResponse.json({success:true,images:data||[]},{status:201});
}

export async function PATCH(request:Request, context:Context) {
  const access=await authorize(context); if('error' in access) return access.error;
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null;
  const action=text(body?.action,40);
  if(action==='composite') {
    const requested=text(body?.url);
    const url=requested?directImgBB(requested):'';
    if(requested&&!url) return NextResponse.json({error:'Le composite doit provenir du téléversement ImgBB PMM.'},{status:400});
    const raw=objectValue(access.model.raw_data);
    const now=new Date().toISOString();
    const rawData={...raw,compCardUrl:url||null,compCardIsPublic:Boolean(url&&body?.isPublic===true),compCardUpdatedAt:url?now:null,adminMediaUpdatedAt:now};
    const {data,error}=await access.supabase.from('models').update({raw_data:rawData,updated_at:now}).eq('id',access.model.id).select('id,raw_data').maybeSingle();
    if(error||!data) return NextResponse.json({error:'Le composite n’a pas pu être enregistré.'},{status:503});
    return NextResponse.json({success:true,composite:{url,isPublic:Boolean(url&&body?.isPublic===true)}});
  }
  const imageId=text(body?.imageId,100);
  if(!imageId) return NextResponse.json({error:'Image requise.'},{status:400});
  const {data:image}=await access.supabase.from('model_portfolio_images').select('id,url,model_id').eq('id',imageId).eq('model_id',access.model.id).maybeSingle();
  if(!image?.id) return NextResponse.json({error:'Image introuvable dans ce portfolio.'},{status:404});
  if(action==='cover') {
    const {error}=await access.supabase.from('models').update({image_url:image.url,updated_at:new Date().toISOString()}).eq('id',access.model.id);
    if(error) return NextResponse.json({error:'La photo principale n’a pas pu être mise à jour.'},{status:503});
    return NextResponse.json({success:true,imageUrl:image.url});
  }
  if(action==='caption') {
    const {data,error}=await access.supabase.from('model_portfolio_images').update({caption:text(body?.caption,300)||null}).eq('id',imageId).eq('model_id',access.model.id).select('id,url,position,caption').maybeSingle();
    if(error||!data) return NextResponse.json({error:'La légende n’a pas pu être enregistrée.'},{status:503});
    return NextResponse.json({success:true,image:data});
  }
  return NextResponse.json({error:'Action média inconnue.'},{status:400});
}

export async function DELETE(request:Request, context:Context) {
  const access=await authorize(context); if('error' in access) return access.error;
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null;
  const imageId=text(body?.imageId,100);
  if(!imageId) return NextResponse.json({error:'Image requise.'},{status:400});
  const {data:image}=await access.supabase.from('model_portfolio_images').select('id,url').eq('id',imageId).eq('model_id',access.model.id).maybeSingle();
  if(!image?.id) return NextResponse.json({error:'Image introuvable dans ce portfolio.'},{status:404});
  const {error}=await access.supabase.from('model_portfolio_images').delete().eq('id',imageId).eq('model_id',access.model.id);
  if(error) return NextResponse.json({error:'L’image n’a pas pu être retirée.'},{status:503});
  if(String(access.model.image_url||'')===String(image.url||'')) await access.supabase.from('models').update({image_url:null,updated_at:new Date().toISOString()}).eq('id',access.model.id);
  return NextResponse.json({success:true,clearedCover:String(access.model.image_url||'')===String(image.url||'')});
}
