import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { supabaseAdminCreateUser } from '@/lib/supabase-backend';
import { collectionToArray, getCollection, setCollection } from '@/lib/app-data';
import type { AppRole } from '@/lib/auth/profile';

const allowed = new Set<AppRole>(['manager','student','jury','registration','jury-contest']);
const MANAGER_DEFAULT_PERMISSIONS = {
  dashboard:false,models:true,absences:true,agency:false,artisticDirection:true,beautyContests:false,bookings:true,castingApplications:false,
  castingResults:false,classroom:true,classroomProgress:true,comments:false,fashionDayApplications:false,fashionDayEvents:false,gallery:false,
  imageAnalysis:false,imageGeneration:false,liveChat:false,magazine:false,mailing:false,mediaLibrary:false,messages:true,modelAccess:false,news:false,
  payments:true,recovery:false,settings:false,userPermissions:false,
};

export async function POST(request:Request){
  const admin=await getCurrentAppProfile();
  if(!admin||admin.role!=='admin')return NextResponse.json({error:'Accès administrateur requis.'},{status:403});
  const b=await request.json().catch(()=>({}));
  const email=String(b.email||'').trim().toLowerCase(),password=String(b.password||''),role=String(b.role||'') as AppRole,pd=b.profileData||{},name=String(pd.name||email),profileId=String(pd.id||'');
  const identifier=String(pd.username||pd.matricule||profileId||email).trim();
  if(!email||password.length<8||!profileId||!allowed.has(role))return NextResponse.json({error:'Données invalides.'},{status:400});
  try{
    const permissions=role==='manager'?{...(pd.permissions||{}),isManager:true}:{...(pd.permissions||{})};
    const created:any=await supabaseAdminCreateUser({
      email,password,email_confirm:true,
      user_metadata:{name},
      app_metadata:{role,profile_id:profileId,identifier,must_change_password:false},
    });
    const user=created?.user||created;
    const userId=String(user?.id||'');
    if(!userId)return NextResponse.json({error:'Identifiant Supabase absent.'},{status:502});

    const users=((await getCollection('users').catch(()=>null))||{}) as Record<string,any>;
    users[userId]={id:userId,uid:userId,supabaseUserId:userId,email,name,identifier,matricule:pd.matricule||identifier,role,app_role:role,profileId,status:'active',mustChangePassword:false,permissions,createdAt:new Date().toISOString()};
    await setCollection('users',users);

    if(role==='manager'){
      const adminPermissions=((await getCollection('adminPermissions').catch(()=>null))||{}) as Record<string,any>;
      adminPermissions[userId]={...MANAGER_DEFAULT_PERMISSIONS,...(pd.adminPermissions||{})};
      await setCollection('adminPermissions',adminPermissions);
    }
    const key=role==='student'?'models':role==='jury'?'juryMembers':role==='registration'?'registrationStaff':null;
    if(key){
      const arr=collectionToArray(await getCollection(key));
      const item={...pd,id:profileId,name,username:identifier,email,authUserId:userId,supabaseUserId:userId};
      const i=arr.findIndex(x=>String(x?.id)===profileId);
      if(i>=0)arr[i]={...arr[i],...item};else arr.push(item);
      await setCollection(key,arr);
    }
    return NextResponse.json({success:true,userId});
  }catch(error:any){
    const message=String(error?.message||'Création Supabase impossible.');
    const status=/already|exists|registered/i.test(message)?409:Number(error?.status||400);
    return NextResponse.json({error:message},{status});
  }
}
