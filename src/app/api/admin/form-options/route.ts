import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type Option = { label: string; value: string };

const SUPPORTED_FIELDS = new Set([
  'model_id', 'model_ids', 'user_id', 'auth_user_id', 'recipient_user_id', 'jury_user_id',
  'author_user_id', 'casting_application_id', 'post_id', 'thread_id', 'course_id',
]);

function unique(options: Option[]) {
  const seen = new Set<string>();
  return options.filter((option) => {
    if (!option.value || seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
}

export async function GET(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const requested = new URL(request.url).searchParams.get('fields')?.split(',').map((field) => field.trim()).filter((field) => SUPPORTED_FIELDS.has(field)) || [];
  if (!requested.length) return NextResponse.json({ options: {} });

  const supabase = createSupabaseAdminClient() as any;
  const options: Record<string, Option[]> = {};

  const needsModels = requested.some((field) => field === 'model_id' || field === 'model_ids');
  const needsProfiles = requested.some((field) => ['user_id', 'auth_user_id', 'recipient_user_id', 'jury_user_id', 'author_user_id'].includes(field));
  const needsCasting = requested.includes('casting_application_id');
  const needsPosts = requested.includes('post_id');
  const needsThreads = requested.includes('thread_id');
  const needsCourses = requested.includes('course_id');

  const [models, profiles, casting, posts, threads, courses] = await Promise.all([
    needsModels ? supabase.from('models').select('id,name,email').eq('is_active', true).order('name').limit(300) : Promise.resolve({ data: [] }),
    needsProfiles ? supabase.from('profiles').select('user_id,display_name,email,role').eq('is_active', true).order('display_name').limit(300) : Promise.resolve({ data: [] }),
    needsCasting ? supabase.from('casting_applications').select('id,full_name,first_name,last_name,email').order('created_at', { ascending: false }).limit(300) : Promise.resolve({ data: [] }),
    needsPosts ? supabase.from('blog_posts').select('id,title').order('created_at', { ascending: false }).limit(300) : Promise.resolve({ data: [] }),
    needsThreads ? supabase.from('forum_threads').select('id,title').order('created_at', { ascending: false }).limit(300) : Promise.resolve({ data: [] }),
    needsCourses ? supabase.from('courses').select('id,title').eq('is_active', true).order('position').limit(300) : Promise.resolve({ data: [] }),
  ]);

  const modelOptions = unique((models.data || []).map((row: any) => ({ value: String(row.id), label: `${row.name || row.id}${row.email ? ` · ${row.email}` : ''}` })));
  for (const field of ['model_id', 'model_ids']) if (requested.includes(field)) options[field] = modelOptions;

  const profileOptions = unique((profiles.data || []).map((row: any) => ({ value: String(row.user_id), label: `${row.display_name || row.email || row.user_id}${row.role ? ` · ${row.role}` : ''}` })));
  for (const field of ['user_id', 'auth_user_id', 'recipient_user_id', 'jury_user_id', 'author_user_id']) if (requested.includes(field)) options[field] = profileOptions;

  if (requested.includes('casting_application_id')) options.casting_application_id = unique((casting.data || []).map((row: any) => ({ value: String(row.id), label: row.full_name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.email || String(row.id) })));
  if (requested.includes('post_id')) options.post_id = unique((posts.data || []).map((row: any) => ({ value: String(row.id), label: row.title || String(row.id) })));
  if (requested.includes('thread_id')) options.thread_id = unique((threads.data || []).map((row: any) => ({ value: String(row.id), label: row.title || String(row.id) })));
  if (requested.includes('course_id')) options.course_id = unique((courses.data || []).map((row: any) => ({ value: String(row.id), label: row.title || String(row.id) })));

  return NextResponse.json({ options }, { headers: { 'Cache-Control': 'private, max-age=30' } });
}
