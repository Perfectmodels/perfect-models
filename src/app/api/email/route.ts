import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { sendRawBrevoEmail, sendTransactionalTemplate } from '@/lib/email/server';

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

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
    }

    const profile = await getCurrentAppProfile();
    if (!profile || !['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Authentification administrateur requise.' }, { status: 403 });
    }
    if (!hasAdminPermission(profile, 'mailing')) {
      return NextResponse.json({ error: 'Permission mailing insuffisante.' }, { status: 403 });
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

    const result = await sendRawBrevoEmail({
      to: recipients,
      subject: String(subject || 'Perfect Models Management').trim().slice(0, 180),
      htmlContent,
      replyTo: replyTo && validEmail(replyTo.email)
        ? { email: validEmail(replyTo.email), name: String(replyTo.name || '').slice(0, 120) || undefined }
        : undefined,
    });
    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (error: any) {
    console.error('[email]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur email' },
      { status: Number(error?.status || 500) },
    );
  }
}
