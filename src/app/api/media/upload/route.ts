import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
export const runtime='nodejs';
const TYPES=new Set(['image/jpeg','image/png','image/webp','image/gif','image/avif']);
export async function POST(request:Request){const p=await getCurrentAppProfile();const form=await request.formData();const file=form.get('file');const scope=String(form.get('scope')||'media');if(!(file instanceof File))return NextResponse.json({error:'Fichier requis.'},{status:400});if(!TYPES.has(file.type))return NextResponse.json({error:'Format image non accepté.'},{status:415});if(file.size>4.5*1024*1024)return NextResponse.json({error:'Image trop lourde (4,5 Mo maximum).'}, {status:413});if(!p&&scope!=='casting')return NextResponse.json({error:'Connexion requise.'},{status:401});const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-');const blob=await put(`pmm/${scope}/${Date.now()}-${safe}`,file,{access:'public',addRandomSuffix:true});return NextResponse.json({url:blob.url,pathname:blob.pathname});}
