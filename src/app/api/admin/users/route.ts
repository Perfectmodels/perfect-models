import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { firebaseDatabasePut, firebaseSignUp } from '@/lib/firebase-backend';
import { collectionToArray, getCollection, setCollection } from '@/lib/app-data';
import type { AppRole } from '@/lib/auth/profile';

const allowed = new Set<AppRole>(['student','jury','registration','jury-contest']);

export async function POST(request:Request){
  const admin=await getCurrentAppProfile();
  if(!admin||admin.role!=='admin')return NextResponse.json({error:'Accès administrateur requis.'},{status:403});
  const b=await request.json().catch(()=>({}));
  const email=String(b.email||'').trim().toLowerCase(),password=String(b.password||''),role=String(b.role||'') as AppRole,pd=b.profileData||{},name=String(pd.name||email),profileId=String(pd.id||'');
  const identifier=String(pd.username||pd.matricule||profileId||email).trim();
  if(!email||password.length<8||!profileId||!allowed.has(role))return NextResponse.json({error:'Données invalides.'},{status:400});
  try{
    const result=await firebaseSignUp(email,password,name);
    const userId=String(result.localId||'');
    if(!userId)return NextResponse.json({error:'Identifiant Firebase absent.'},{status:502});
    await firebaseDatabasePut(`users/${userId}`,{id:userId,email,name,identifier,matricule:pd.matricule||identifier,role,app_role:role,profileId,status:'active',mustChangePassword:false,permissions:pd.permissions||{},createdAt:new Date().toISOString()});
    const key=role==='student'?'models':role==='jury'?'juryMembers':role==='registration'?'registrationStaff':null;
    if(key){const arr=collectionToArray(await getCollection(key));const item={...pd,id:profileId,name,username:identifier,email,authUserId:userId,firebaseUid:userId};const i=arr.findIndex(x=>String(x?.id)===profileId);if(i>=0)arr[i]={...arr[i],...item};else arr.push(item);await setCollection(key,arr);}
    return NextResponse.json({success:true,userId});
  }catch(error:any){return NextResponse.json({error:String(error?.message||'Création Firebase impossible.')},{status:Number(error?.status||400)})}
}
