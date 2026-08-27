import { NextResponse } from 'next/server';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.perfectmodels.online';
const DEFAULT_FROM_EMAIL = process.env.DEFAULT_FROM_EMAIL || 'contact@perfectmodels.online';
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qzkodgqxrcxsnfwpmwfb.supabase.co').replace(/\/$/, '');
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const escapeHtml = (value: unknown) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#039;');

const sendRaw = async (payload: Record<string, unknown>) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY is not configured');
  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || `Brevo error ${response.status}`);
  }
  return response.json();
};

const sendTemplate = async (payload: Record<string, unknown>) => {
  if (!SUPABASE_SECRET_KEY) throw new Error('SUPABASE_SECRET_KEY is not configured');
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-transactional-email`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: SUPABASE_SECRET_KEY,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error || `Supabase email function error ${response.status}`);
  return body;
};

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (origin && origin !== SITE_URL && origin !== SITE_URL.replace('www.', '')) {
      return NextResponse.json({ error: 'Origin not allowed.' }, { status: 403 });
    }

    const body = await request.json();
    const { type, to, subject, htmlContent, replyTo, templateKey, variables, metadata } = body || {};

    if (type === 'template') {
      if (typeof templateKey !== 'string' || !templateKey || !Array.isArray(to) || to.length === 0 || to.length > 25) {
        return NextResponse.json({ error: 'Payload template invalide.' }, { status: 400 });
      }
      const recipients = to
        .filter((r: any) => r && typeof r.email === 'string' && r.email.includes('@'))
        .map((r: any) => ({ email: r.email, ...(r.name ? { name: r.name } : {}) }));
      if (!recipients.length) return NextResponse.json({ error: 'Destinataire invalide.' }, { status: 400 });

      const result = await sendTemplate({
        templateKey,
        to: recipients,
        variables: variables && typeof variables === 'object' ? variables : {},
        metadata: metadata && typeof metadata === 'object' ? metadata : {},
        ...(replyTo ? { replyTo } : {}),
      });
      return NextResponse.json(result);
    }

    if (type !== 'raw') return NextResponse.json({ error: 'Type d’email non autorisé.' }, { status: 400 });
    if (!Array.isArray(to) || to.length === 0 || to.length > 25 || typeof htmlContent !== 'string' || htmlContent.length > 200000) {
      return NextResponse.json({ error: 'Payload email invalide.' }, { status: 400 });
    }
    const recipients = to
      .filter((r: any) => r && typeof r.email === 'string' && r.email.includes('@'))
      .map((r: any) => ({ email: r.email, ...(r.name ? { name: r.name } : {}) }));
    if (!recipients.length) return NextResponse.json({ error: 'Destinataire invalide.' }, { status: 400 });

    const result = await sendRaw({
      sender: { name: 'Perfect Models Management', email: DEFAULT_FROM_EMAIL },
      to: recipients,
      subject: String(subject || 'Perfect Models Management'),
      htmlContent: `<html><body style=\"font-family:Arial;line-height:1.7;color:#222\">${escapeHtml(htmlContent).replace(/\n/g, '<br>')}</body></html>`,
      ...(replyTo ? { replyTo } : {}),
    });
    return NextResponse.json({ ok: true, messageId: result?.messageId });
  } catch (error) {
    console.error('[email]', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur email' }, { status: 500 });
  }
}
