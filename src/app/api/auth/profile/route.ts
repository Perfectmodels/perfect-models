import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
export const dynamic='force-dynamic';
export async function GET(){const p=await getCurrentAppProfile();if(!p)return NextResponse.json({user:null},{status:401});return NextResponse.json({user:{uid:p.userId,email:p.email,displayName:p.name,role:p.role,userId:p.profileId,contestId:p.contestId||undefined,permissions:p.permissions,mustChangePassword:p.mustChangePassword,identifier:p.identifier}});}
