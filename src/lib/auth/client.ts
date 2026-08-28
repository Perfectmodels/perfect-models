'use client';

export const authClient = {
  signIn: { email: async ({ email, password }: { email:string; password:string }) => {
    const r=await fetch('/api/auth/sign-in/email',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
    const data=await r.json().catch(()=>({}));
    return r.ok?{data}:{error:{message:data?.message||data?.error||'Connexion impossible'}};
  }},
  signUp: { email: async ({ email, password, name }: { email:string; password:string; name:string }) => {
    const r=await fetch('/api/auth/sign-up/email',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,name})});
    const data=await r.json().catch(()=>({}));
    return r.ok?{data}:{error:{message:data?.message||data?.error||'Création impossible'}};
  }},
  signOut: async()=>{await fetch('/api/auth/sign-out',{method:'POST',credentials:'include'});},
  changePassword: async ({ newPassword, currentPassword }: { newPassword:string; currentPassword?:string })=>{const r=await fetch('/api/auth/change-password',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({newPassword,currentPassword})});const data=await r.json().catch(()=>({}));return r.ok?{data}:{error:{message:data?.message||data?.error||'Modification impossible'}};},
};
