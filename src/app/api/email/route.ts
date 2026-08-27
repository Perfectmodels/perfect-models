import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { sendTransactionalTemplate } from '@/lib/email/server';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const DEFAULT_FROM_EMAIL = process.env.DEFAULT_FROM_EMAIL || 'contact@perfectmodels.online';

function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

function validEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

async function sendRaw(payload: Record<string, unknown>) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw Object.assign(new Error('BREVO_API_KEY non configurée.'), { status: 503 });
  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body?.message || `Brevo error ${response.status}`), { status: response.status });
  return body;
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
    }

    const profile = await getCurrentAppProfile();
    if (!profile || !['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Authentification administrateur requise.' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { type, to, subject, htmlContent, replyTo, templateKey, variables, metadata } = body || {};

    if (!Array.isArray(to) || to.length === 0 || to.length > 25) {
      return NextResponse.json({ error: 'Destinataires invalides.' }, { status: 400 });
    }
    const recipients = to
      .map((recipient: any) => ({
        email: validEmail(recipient?.email),
        name: String(recipient?.name || '').trim().slice(0, 120) || undefined,
      }))
      .filter((recipient: any) => recipient.email);
    if (!recipients.length) return NextResponse.json({ error: 'Destinataire invalide.' }, { status: 400 });

    if (type === 'template') {
      if (typeof templateKey !== 'string' || !templateKey || templateKey.length > 120) {
        return NextResponse.json({ error: 'Template invalide.' }, { status: 400 });
      }
      const result = await sendTransactionalTemplate({
        templateKey,
        to: recipients,
        variables: variables && typeof variables === 'object' ? variables : {},
        metadata: {
          ...(metadata && typeof metadata === 'object' ? metadata : {}),
          requested_by_user_id: profile.userId,
          requested_by_role: profile.role,
        },
        replyTo: replyTo && validEmail(replyTo.email)
          ? { email: validEmail(replyTo.email), name: String(replyTo.name || '').slice(0, 120) || undefined }
          : undefined,
      });
      return NextResponse.json(result);
    }

    if (type !== 'raw') return NextResponse.json({ error: 'Type d’email non autorisé.' }, { status: 400 });
    if (typeof htmlContent !== 'string' || !htmlContent.trim() || htmlContent.length > 200_000) {
      return NextResponse.json({ error: 'Contenu email invalide.' }, { status: 400 });
    }

    const result = await sendRaw({
      sender: { name: 'Perfect Models Management', email: DEFAULT_FROM_EMAIL },
      to: recipients,
      subject: String(subject || 'Perfect Models Management').trim().slice(0, 180),
      htmlContent,
      ...(replyTo && validEmail(replyTo.email)
        ? { replyTo: { email: validEmail(replyTo.email), name: String(replyTo.name || '').slice(0, 120) || undefined } }
        : {}),
    });
    return NextResponse.json({ ok: true, messageId: result?.messageId });
  } catch (error: any) {
    console.error('[email]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur email' },
      { status: Number(error?.status || 500) },
    );
  }
}