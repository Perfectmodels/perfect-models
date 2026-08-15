'use client';
import React,{createContext,useCallback,useContext,useEffect,useState}from'react';
import type{UserPermissions}from'../types';
export type UserRole='admin'|'student'|'jury'|'registration'|'jury-contest';
export interface AuthUser{uid:string;email:string|null;displayName:string|null;role:UserRole;userId:string;contestId?:string;permissions?:UserPermissions;mustChangePassword?:boolean;identifier?:string}
export interface ModelMigrationRequest{modelId:string;name:string;suggestedEmail:string}
export interface LoginResult{success:boolean;error?:string;migrationRequired?:boolean;migration?:ModelMigrationRequest}
interface AuthContextType{user:AuthUser|null;loading:boolean;login:(identifier:string,password:string)=>Promise<LoginResult>;logout:()=>Promise<void>;createUserWithRole:(email:string,password:string,role:UserRole,profileData:{id:string;name:string;[key:string]:any})=>Promise<{success:boolean;error?:string}>;migrateModelToAuth:(modelId:string,email:string,newPassword:string,legacyPassword?:string)=>Promise<{success:boolean;error?:string}>;resetPassword:(email:string)=>Promise<{success:boolean;error?:string}>;signInWithPhone:(phone:string,containerId?:string)=>Promise<{success:boolean;error?:string}>;confirmPhoneCode:(code:string)=>Promise<{success:boolean;error?:string}>}
const AuthContext=createContext<AuthContextType|null>(null);export const useAuth=()=>{const c=useContext(AuthContext);if(!c)throw new Error('useAuth must be used within AuthProvider');return c};
const emit=()=>{if(typeof window!=='undefined')window.dispatchEvent(new Event('pmm-auth-changed'))};
const ADMIN_ALIASES=new Set(['admin','contact@perfectmodels.online','contact@perfectmodels.ga','perfectmodels.ga@gmail.com']);
export const AuthProvider:React.FC<{children:React.ReactNode}>=({children})=>{
 const[user,setUser]=useState<AuthUser|null>(null);const[loading,setLoading]=useState(true);
 const refresh=useCallback(async()=>{try{const r=await fetch('/api/auth/profile',{credentials:'include',cache:'no-store'});if(!r.ok){setUser(null);return null}const j=await r.json().catch(()=>({}));const profile=j?.user as AuthUser|null;if(!profile){setUser(null);return null}setUser(profile);return profile}catch(error){console.error('[auth] Firebase profile refresh failed',error);setUser(null);return null}},[]);
 useEffect(()=>{refresh().finally(()=>setLoading(false))},[refresh]);
 const login=useCallback(async(identifier:string,password:string):Promise<LoginResult=>{
   try{let candidate=identifier.trim().toLowerCase();if(!candidate)return{success:false,error:'Identifiant requis.'};if(ADMIN_ALIASES.has(candidate))candidate='admin';
   const r=await fetch('/api/auth/resolve',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({identifier:candidate})});const resolved=await r.json().catch(()=>({}));if(!r.ok||!resolved?.email)return{success:false,error:resolved?.error||'Identifiant introuvable.'};
   const s=await fetch('/api/auth/sign-in/email',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:resolved.email,password})});const result=await s.json().catch(()=>({}));if(!s.ok)return{success:false,error:result?.message||result?.error?.message||result?.error||'Identifiant ou mot de passe incorrect.'};
   const appUser=await refresh();if(!appUser)return{success:false,error:'Compte authentifié mais profil PMM indisponible.'};emit();return{success:true};
   }catch(error:any){return{success:false,error:error?.message||'Erreur de connexion.'}}
 },[refresh]);
 const logout=useCallback(async()=>{try{await fetch('/api/auth/sign-out',{method:'POST',credentials:'include'})}finally{setUser(null);emit()}},[]);
 const createUserWithRole=useCallback(async(email:string,password:string,role:UserRole,profileData:{id:string;name:string;[key:string]:any})=>{try{const r=await fetch('/api/admin/users',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,role,profileData})});const j=await r.json().catch(()=>({}));if(!r.ok)return{success:false,error:j.error||'Création impossible.'};emit();return{success:true}}catch(error:any){return{success:false,error:error.message||'Création impossible.'}}},[]);
 const migrateModelToAuth=useCallback(async()=>({success:false,error:'Ce portail utilise désormais Firebase Authentication. Les comptes mannequins sont centralisés dans Firebase.'}),[]);
 const resetPassword=useCallback(async(email:string)=>{try{const r=await fetch('/api/auth/forget-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email.trim().toLowerCase(),redirectTo:`${window.location.origin}/login`})});if(!r.ok){const j=await r.json().catch(()=>({}));return{success:false,error:j?.message||j?.error?.message||j?.error||"Impossible d'envoyer le lien."}}return{success:true}}catch(error:any){return{success:false,error:error.message||"Impossible d'envoyer le lien."}}},[]);
 const signInWithPhone=useCallback(async()=>({success:false,error:'La connexion par téléphone est désactivée.'}),[]);const confirmPhoneCode=useCallback(async()=>({success:false,error:'La connexion par téléphone est désactivée.'}),[]);
 return <AuthContext.Provider value={{user,loading,login,logout,createUserWithRole,migrateModelToAuth,resetPassword,signInWithPhone,confirmPhoneCode}}>{children}</AuthContext.Provider>
};
