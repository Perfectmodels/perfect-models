import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseSecretKey } from '@/lib/supabase/config';
import { SURVEY_QUESTIONS, isInternalRespondent } from '@/lib/agency-survey';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const COOKIE = 'pmm_survey_v1';
const MIN_PUBLIC_SAMPLE = 5;
const signature = () => createHmac('sha256', getSupabaseSecretKey()).update('pmm-survey-submitted:v1').digest('hex');

function hasSubmitted(value: string | undefined) {
  if (!value || !/^[0-9a-f]{64}$/.test(value)) return false;
  return timingSafeEqual(Buffer.from(value, 'hex'), Buffer.from(signature(), 'hex'));
}

function noStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient() as any;
    const counts: Record<string, Record<string, number>> = {};
    const answered: Record<string, number> = {};
    const published: Array<{ id: string; comments: Array<{ question: number; text: string }> }> = [];
    let total = 0;
    for (let from = 0; from < 20000; from += 500) {
      const { data, error } = await supabase.from('agency_survey_responses')
        .select('id,answers,public_comments,moderation_status')
        .order('created_at', { ascending: false }).range(from, from + 499);
      if (error) throw error;
      const rows: Array<{id:string;answers:Record<string,unknown>;public_comments:Record<string,string>;moderation_status:string}> = data || [];
      total += rows.length;
      for (const row of rows) {
        const answers = row.answers || {};
        for (const question of SURVEY_QUESTIONS) {
          if (question.type === 'text') continue;
          const value = answers[String(question.id)];
          const values = Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
          if (!values.length) continue;
          answered[question.id] = (answered[question.id] || 0) + 1;
          const bucket = counts[question.id] ||= {};
          for (const option of values) {
            const key = String(option);
            bucket[key] = (bucket[key] || 0) + 1;
          }
        }
        if (row.moderation_status === 'approved' && published.length < 500) {
          const comments = Object.entries(row.public_comments || {})
            .filter(([id, value]) => SURVEY_QUESTIONS.some(q => q.id === Number(id) && q.type === 'text') && typeof value === 'string' && value.trim())
            .map(([id, value]) => ({ question: Number(id), text: value }));
          if (comments.length) published.push({ id: row.id, comments });
        }
      }
      if (rows.length < 500) break;
    }
    // Until at least five respondents, do not show answer distributions or testimonials.
    const released = total >= MIN_PUBLIC_SAMPLE;
    const result = {
      total, minPublicSample: MIN_PUBLIC_SAMPLE, released,
      answered: released ? answered : {}, counts: released ? counts : {},
      average: released && answered['33']
        ? Math.round((Object.entries(counts['33'] || {}).reduce((sum, [score, count]) => sum + Number(score) * count, 0) / answered['33']) * 10) / 10
        : null,
      testimonials: released ? published : [],
      alreadySubmitted: hasSubmitted(request.cookies.get(COOKIE)?.value),
    };
    return noStore(NextResponse.json(result));
  } catch {
    return noStore(NextResponse.json({ error: 'Les résultats sont temporairement indisponibles.' }, { status: 503 }));
  }
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    if (!origin || new URL(origin).host !== request.nextUrl.host) {
      return noStore(NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 }));
    }
    if (hasSubmitted(request.cookies.get(COOKIE)?.value)) {
      return noStore(NextResponse.json({ error: 'Vous avez déjà participé depuis ce navigateur.' }, { status: 409 }));
    }
    if (Number(request.headers.get('content-length') || 0) > 25000) {
      return noStore(NextResponse.json({ error: 'Réponse trop longue.' }, { status: 413 }));
    }
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body) || body.website || body.consent !== true ||
        typeof body.answers !== 'object' || Array.isArray(body.answers) || body.answers === null) {
      return noStore(NextResponse.json({ error: 'Réponses ou consentement invalides.' }, { status: 400 }));
    }
    const submitted = body.answers as Record<string, unknown>;
    if (Object.keys(submitted).length > 40) {
      return noStore(NextResponse.json({ error: 'Nombre de questions invalide.' }, { status: 400 }));
    }
    const role = submitted['1'];
    if (typeof role !== 'string' || !SURVEY_QUESTIONS[0].options?.includes(role)) {
      return noStore(NextResponse.json({ error: 'Veuillez sélectionner votre profil.' }, { status: 400 }));
    }
    const answers: Record<string, string | string[] | number> = {};
    const privateComments: Record<string, string> = {};
    for (const question of SURVEY_QUESTIONS) {
      const raw = submitted[String(question.id)];
      if (raw === undefined || raw === null || raw === '') continue;
      if (question.internal && !isInternalRespondent(role)) continue;
      if (question.type === 'text') {
        if (typeof raw !== 'string' || raw.length > 1600) {
          return noStore(NextResponse.json({ error: 'Le texte est trop long.' }, { status: 400 }));
        }
        const comment = raw.trim();
        if (comment) privateComments[question.id] = comment;
      } else if (question.type === 'scale') {
        if (!Number.isInteger(raw) || (raw as number) < 0 || (raw as number) > 10) {
          return noStore(NextResponse.json({ error: 'La note est invalide.' }, { status: 400 }));
        }
        answers[question.id] = raw as number;
      } else if (question.type === 'multiple') {
        if (!Array.isArray(raw) || raw.length > (question.maxSelections || question.options?.length || 0) ||
            new Set(raw).size !== raw.length || !raw.every(v => typeof v === 'string' && question.options?.includes(v))) {
          return noStore(NextResponse.json({ error: 'Une sélection multiple est invalide.' }, { status: 400 }));
        }
        if (raw.length) answers[question.id] = raw;
      } else if (typeof raw === 'string' && question.options?.includes(raw)) {
        answers[question.id] = raw;
      } else {
        return noStore(NextResponse.json({ error: 'Une réponse est invalide.' }, { status: 400 }));
      }
    }
    if (Object.keys(answers).length < 3) {
      return noStore(NextResponse.json({ error: 'Répondez à au moins trois questions à choix.' }, { status: 400 }));
    }
    const db = createSupabaseAdminClient() as any;
    const { error } = await db.from('agency_survey_responses').insert({
      answers, private_comments: privateComments, public_comments: {},
      moderation_status: Object.keys(privateComments).length ? 'pending' : 'none',
    });
    if (error) throw error;
    const response = noStore(NextResponse.json({ success: true }, { status: 201 }));
    response.cookies.set(COOKIE, signature(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 180 });
    return response;
  } catch {
    return noStore(NextResponse.json({ error: 'Envoi impossible pour le moment.' }, { status: 503 }));
  }
}
