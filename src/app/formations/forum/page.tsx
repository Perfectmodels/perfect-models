import Link from 'next/link';
import { redirect } from 'next/navigation';
import { NewThreadForm } from '@/components/classroom/ForumComposer';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic='force-dynamic';
export default async function Page(){
  const profile=await getCurrentAppProfile();if(!profile)redirect('/login?next=/formations/forum');if(!['student','admin','manager'].includes(profile.role))redirect('/profil');
  const supabase=createSupabaseAdminClient() as any;const{data:threads}=await supabase.from('forum_threads').select('*').eq('status','active').order('created_at',{ascending:false});
  return <main className="min-h-screen bg-pm-dark px-5 py-12 text-pm-off-white sm:px-8 lg:px-10"><div className="mx-auto max-w-5xl"><div className="border-b border-white/10 pb-8"><p className="text-[9px] font-black uppercase tracking-[.35em] text-pm-gold">Classroom · Forum Supabase</p><h1 className="mt-3 font-playfair text-5xl font-bold">Discussions</h1></div><div className="mt-8"><NewThreadForm /></div><div className="mt-8 space-y-3">{threads?.length?threads.map((thread:any)=><Link key={thread.id} href={`/formations/forum/${thread.id}`} className="block border border-white/10 bg-black/20 p-5 hover:border-pm-gold/40"><p className="text-[8px] uppercase tracking-wider text-white/30">{new Date(thread.created_at).toLocaleDateString('fr-FR')}</p><h2 className="mt-2 font-playfair text-2xl font-bold">{thread.title||'Discussion'}</h2><p className="mt-2 line-clamp-2 text-sm leading-7 text-white/40">{thread.body}</p></Link>):<div className="border border-white/10 p-10 text-center text-sm text-white/35">Aucune discussion pour le moment.</div>}</div></div></main>;
}
