import { notFound, redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ moduleSlug: string }> };

function renderContent(content: unknown) {
  if (!content || typeof content !== 'object') return null;
  if (Array.isArray(content)) return <div className="space-y-5">{content.map((item,index)=><div key={index} className="border border-white/10 p-5"><pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-white/55">{typeof item==='string'?item:JSON.stringify(item,null,2)}</pre></div>)}</div>;
  return <pre className="whitespace-pre-wrap border border-white/10 bg-black/20 p-6 font-sans text-sm leading-7 text-white/55">{JSON.stringify(content,null,2)}</pre>;
}

export default async function Page({ params }: Props) {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/formations');
  if (!['student','admin','manager'].includes(profile.role)) redirect('/profil');
  const { moduleSlug } = await params;
  const supabase = createSupabaseAdminClient() as any;
  const { data: course } = await supabase.from('courses').select('*').eq('id', moduleSlug).eq('is_active', true).maybeSingle();
  if (!course) notFound();
  const { data: progress } = await supabase.from('course_progress').select('*').eq('user_id',profile.userId).eq('course_id',moduleSlug).maybeSingle();
  return <main className="min-h-screen bg-pm-dark px-5 py-12 text-pm-off-white sm:px-8 lg:px-10"><article className="mx-auto max-w-5xl"><p className="text-[9px] font-black uppercase tracking-[.35em] text-pm-gold">Classroom · {progress?.completed_at?'Terminé':'Formation'}</p><h1 className="mt-4 font-playfair text-5xl font-bold">{course.title}</h1>{course.description&&<p className="mt-5 text-base leading-8 text-white/45">{course.description}</p>}<div className="mt-10">{renderContent(course.content)}</div></article></main>;
}
