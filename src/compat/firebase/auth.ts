import { authClient } from '@/lib/auth/client';
export interface User{uid:string;email:string|null;displayName?:string|null}export interface ConfirmationResult{verificationId?:string;confirm:(code:string)=>Promise<any>}
export const auth:{currentUser:User|null}={currentUser:null};export const getAuth=()=>auth;export const inMemoryPersistence={};export const browserLocalPersistence={};export const setPersistence=async()=>{};
async function profile(){const r=await fetch('/api/auth/profile',{credentials:'include',cache:'no-store'});if(!r.ok){auth.currentUser=null;return null}const j=await r.json();const u=j.user?{uid:j.user.uid,email:j.user.email,displayName:j.user.displayName}:null;auth.currentUser=u;return u}
export function onAuthStateChanged(_a:any,cb:(u:User|null)=>void){let active=true;profile().then(u=>active&&cb(u));const id=typeof window!=='undefined'?window.setInterval(()=>profile().then(u=>active&&cb(u)),30000):0;return()=>{active=false;if(id)clearInterval(id)}}
export async function signInWithEmailAndPassword(_a:any,email:string,password:string){const r=await (authClient as any).signIn.email({email,password});if(r?.error)throw Object.assign(new Error(r.error.message||'Connexion impossible'),{code:'auth/invalid-credential'});const u=await profile();return{user:u}}
export async function signOut(){await (authClient as any).signOut();auth.currentUser=null}
export async function createUserWithEmailAndPassword(_a:any,email:string,password:string){
  // Le flux Casting historique appelait Firebase Auth directement depuis le navigateur.
  // Sur la page Casting, la création réelle est désormais effectuée côté serveur après
  // validation de la candidature. On retourne uniquement un utilisateur transitoire afin
  // que l'ancien formulaire termine sa sauvegarde sans exposer/gérer le mot de passe.
  if(typeof window!=='undefined'&&window.location.pathname.startsWith('/admin/casting-applications')){
    return{user:{uid:'server-pending',email,displayName:email.split('@')[0]}};
  }
  const r=await (authClient as any).signUp.email({email,password,name:email.split('@')[0]});if(r?.error)throw new Error(r.error.message||'Création impossible');const u=await profile();return{user:u}}
export const deleteUser=async()=>{};export async function sendPasswordResetEmail(_a:any,email:string){const r=await fetch('/api/auth/forget-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,redirectTo:`${location.origin}/login`})});if(!r.ok)throw new Error('Réinitialisation impossible')}
export const EmailAuthProvider={credential:(email:string,password:string)=>({email,password})};export const reauthenticateWithCredential=async()=>({});export async function updatePassword(_u:any,newPassword:string){const r=await (authClient as any).changePassword({newPassword});if(r?.error)throw new Error(r.error.message||'Modification impossible')}
export class RecaptchaVerifier{constructor(..._args:any[]){}clear(){}}export async function signInWithPhoneNumber():Promise<ConfirmationResult>{throw new Error('Connexion par téléphone désactivée.')}
