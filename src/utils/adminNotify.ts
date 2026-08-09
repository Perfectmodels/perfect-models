export type NotifType='visit'|'casting'|'contact'|'booking'|'fashionday'|'migration';
export async function notifyAdmin(type:NotifType,body:string,url='/admin'){try{await fetch('/api/data/adminNotifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,body,url,createdAt:new Date().toISOString(),read:false})})}catch{}}
export const saveAdminFcmToken=async()=>{};export const removeAdminFcmToken=async()=>{};
