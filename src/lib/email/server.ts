import 'server-only';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/database.types';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const EMAIL_CONCURRENCY = 5;
const MAX_RECIPIENTS = 25;
const MAX_ATTEMPTS = 20;
const QUEUED_RETRY_DELAY_MS = 10 * 60 * 1000;

export type EmailRecipient = { email: string; name?: string };

export type TransactionalEmailInput = {
  templateKey: string;
  to: EmailRecipient[];
  variables?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  replyTo?: EmailRecipient;
  idempotencyKey?: string;
};

export type RawBrevoEmailInput = {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  replyTo?: EmailRecipient;
};

type DeliveryLog = {
  id: string;
  status: string;
  attempt_count: number;
  last_attempt_at: string;
  provider_message_id?: string | null;
};

type DeliveryResult = {
  email: string;
  ok: boolean;
  duplicate?: boolean;
  status?: string;
  messageId?: string | null;
  error?: string;
};

function normalizeEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function cleanText(value: unknown, max = 500) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] || character,
  );
}

function renderHtml(source: string, variables: Record<string, unknown>) {
  return source.replace(
    /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g,
    (_match, key) => escapeHtml(variables[key] ?? ''),
  );
}

function renderText(source: string, variables: Record<string, unknown>, max = 240) {
  return cleanText(source.replace(
    /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g,
    (_match, key) => cleanText(variables[key] ?? '', 500),
  ), max);
}

function emailFrame(content: string, preheader = '') {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Perfect Models Management</title>
  </head>
  <body style="margin:0;background:#fbf7f1;font-family:Arial,Helvetica,sans-serif;color:#342a25">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>` : ''}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fbf7f1;padding:28px 12px">
      <tr><td align="center">
        <table role="presentation" width="620" cellspacing="0" cellpadding="0" style="width:100%;max-width:620px;background:#ffffff;border:1px solid #eadccf;border-radius:18px;overflow:hidden">
          <tr>
            <td style="padding:30px 34px;border-bottom:1px solid #f0e4d9;background:#fffaf5">
              <table role="presentation" width="100%"><tr>
                <td style="color:#c8784d;font-family:Georgia,serif;font-size:29px;letter-spacing:-1px">PMM</td>
                <td align="right" style="color:#8c7669;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase">Libreville · Gabon</td>
              </tr></table>
            </td>
          </tr>
          <tr><td style="padding:42px 34px;font-size:15px;line-height:1.8;color:#4a3c34">${content}</td></tr>
          <tr>
            <td style="padding:24px 34px;border-top:1px solid #f0e4d9;color:#8c7669;font-size:11px;line-height:1.7;background:#fffaf5">
              Perfect Models Management<br>
              <a href="https://www.perfectmodels.online" style="color:#c8784d;text-decoration:none">perfectmodels.online</a>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function asJson(value: Record<string, unknown>): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function brevoConfig() {
  const apiKey = process.env.BREVO_API_KEY || '';
  const senderEmail = normalizeEmail(process.env.EMAIL_FROM || process.env.DEFAULT_FROM_EMAIL)
    || 'contact@perfectmodels.online';
  if (!apiKey) {
    throw Object.assign(new Error('BREVO_API_KEY non configurée sur Vercel.'), { status: 503 });
  }
  return { apiKey, senderEmail };
}

export async function sendRawBrevoEmail(input: RawBrevoEmailInput) {
  const { apiKey, senderEmail } = brevoConfig();
  const recipients = input.to
    .slice(0, MAX_RECIPIENTS)
    .map((recipient) => ({
      email: normalizeEmail(recipient.email),
      name: cleanText(recipient.name, 120) || undefined,
    }))
    .filter((recipient) => recipient.email);

  if (!recipients.length) throw Object.assign(new Error('Aucun destinataire email valide.'), { status: 400 });

  const replyToEmail = normalizeEmail(input.replyTo?.email);
  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { name: 'Perfect Models Management', email: senderEmail },
      to: recipients,
      subject: cleanText(input.subject, 180) || 'Perfect Models Management',
      htmlContent: input.htmlContent,
      ...(replyToEmail ? {
        replyTo: { email: replyToEmail, name: cleanText(input.replyTo?.name, 120) || undefined },
      } : {}),
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });

  const payload = await response.json().catch(() => ({})) as { messageId?: string; message?: string };
  if (!response.ok) {
    throw Object.assign(
      new Error(cleanText(payload.message || `Brevo error ${response.status}`, 500)),
      { status: response.status },
    );
  }
  return { messageId: cleanText(payload.messageId, 240) || null };
}

async function reserveDelivery(input: {
  templateKey: string;
  email: string;
  name?: string;
  subject: string;
  metadata: Record<string, unknown>;
  idempotencyKey: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const queuedAt = new Date().toISOString();
  const { data: inserted, error: insertError } = await supabase
    .from('email_delivery_log')
    .insert({
      template_key: input.templateKey,
      recipient_email: input.email,
      recipient_name: input.name || null,
      subject: input.subject,
      provider: 'brevo',
      status: 'queued',
      metadata: asJson(input.metadata),
      idempotency_key: input.idempotencyKey,
      last_attempt_at: queuedAt,
    })
    .select('id,status,attempt_count,last_attempt_at')
    .single();

  if (!insertError && inserted) return { log: inserted as DeliveryLog, duplicate: false };
  if (!input.idempotencyKey || insertError?.code !== '23505') {
    throw new Error(cleanText(insertError?.message || 'Journal de livraison indisponible.', 500));
  }

  const { data: existing, error: existingError } = await supabase
    .from('email_delivery_log')
    .select('id,status,attempt_count,last_attempt_at,provider_message_id')
    .eq('idempotency_key', input.idempotencyKey)
    .maybeSingle();
  if (existingError || !existing) {
    throw new Error(cleanText(existingError?.message || 'Journal de livraison indisponible.', 500));
  }

  const isStale = Date.now() - new Date(existing.last_attempt_at).getTime() > QUEUED_RETRY_DELAY_MS;
  const canRetry = existing.attempt_count < MAX_ATTEMPTS
    && (existing.status === 'failed' || (existing.status === 'queued' && isStale));

  if (!canRetry) return { log: existing as DeliveryLog, duplicate: true };

  const { data: retry, error: retryError } = await supabase
    .from('email_delivery_log')
    .update({
      status: 'queued',
      error_message: null,
      attempt_count: existing.attempt_count + 1,
      last_attempt_at: queuedAt,
    })
    .eq('id', existing.id)
    .eq('last_attempt_at', existing.last_attempt_at)
    .select('id,status,attempt_count,last_attempt_at,provider_message_id')
    .maybeSingle();
  if (retryError) throw new Error(cleanText(retryError.message, 500));
  return retry
    ? { log: retry as DeliveryLog, duplicate: false }
    : { log: existing as DeliveryLog, duplicate: true };
}

async function deliverRecipient(input: {
  templateKey: string;
  recipient: EmailRecipient;
  subject: string;
  htmlContent: string;
  metadata: Record<string, unknown>;
  idempotencyKey: string | null;
  replyTo?: EmailRecipient;
}): Promise<DeliveryResult> {
  const email = normalizeEmail(input.recipient.email);
  const name = cleanText(input.recipient.name, 120) || undefined;
  if (!email) return { email: String(input.recipient.email || ''), ok: false, error: 'Adresse email invalide.' };

  try {
    const reservation = await reserveDelivery({
      templateKey: input.templateKey,
      email,
      name,
      subject: input.subject,
      metadata: input.metadata,
      idempotencyKey: input.idempotencyKey,
    });

    if (reservation.duplicate) {
      return {
        email,
        ok: reservation.log.status === 'sent',
        duplicate: true,
        status: reservation.log.status,
        messageId: reservation.log.provider_message_id || null,
      };
    }

    try {
      const sent = await sendRawBrevoEmail({
        to: [{ email, name }],
        subject: input.subject,
        htmlContent: input.htmlContent,
        replyTo: input.replyTo,
      });
      const sentAt = new Date().toISOString();
      const { error: updateError } = await createSupabaseAdminClient()
        .from('email_delivery_log')
        .update({ status: 'sent', provider_message_id: sent.messageId, sent_at: sentAt, error_message: null })
        .eq('id', reservation.log.id);
      if (updateError) console.error('[email] livraison envoyée mais journal non mis à jour', updateError.message);
      return { email, ok: true, status: 'sent', messageId: sent.messageId };
    } catch (error) {
      const message = cleanText(error instanceof Error ? error.message : error, 1000);
      await createSupabaseAdminClient()
        .from('email_delivery_log')
        .update({ status: 'failed', error_message: message })
        .eq('id', reservation.log.id);
      return { email, ok: false, status: 'failed', error: message };
    }
  } catch (error) {
    return { email, ok: false, error: cleanText(error instanceof Error ? error.message : error, 1000) };
  }
}

export async function sendTransactionalTemplate(input: TransactionalEmailInput) {
  brevoConfig();
  const templateKey = cleanText(input.templateKey, 120);
  if (!templateKey) throw Object.assign(new Error('Template email invalide.'), { status: 400 });

  const recipients = input.to
    .slice(0, MAX_RECIPIENTS)
    .map((recipient) => ({
      email: normalizeEmail(recipient.email),
      name: cleanText(recipient.name, 120) || undefined,
    }))
    .filter((recipient) => recipient.email);
  if (!recipients.length) throw Object.assign(new Error('Aucun destinataire email valide.'), { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('template_key,subject,preheader,html_content,is_active')
    .eq('template_key', templateKey)
    .eq('is_active', true)
    .maybeSingle();
  if (templateError || !template) {
    throw Object.assign(new Error('Template email indisponible.'), { status: 404 });
  }

  const variables = input.variables && typeof input.variables === 'object' ? input.variables : {};
  const metadata = input.metadata && typeof input.metadata === 'object' ? input.metadata : {};
  const eventId = metadata.application_id || metadata.message_id || metadata.booking_id || metadata.event_id;
  const eventSource = cleanText(metadata.source, 80);
  const idempotencyBase = cleanText(
    input.idempotencyKey || (eventId && eventSource ? `${eventSource}:${String(eventId)}` : ''),
    240,
  );
  const replyToEmail = normalizeEmail(input.replyTo?.email);
  const replyTo = replyToEmail
    ? { email: replyToEmail, name: cleanText(input.replyTo?.name, 120) || undefined }
    : undefined;

  const results: DeliveryResult[] = [];
  for (let index = 0; index < recipients.length; index += EMAIL_CONCURRENCY) {
    const batch = recipients.slice(index, index + EMAIL_CONCURRENCY);
    const deliveredBatch = await Promise.all(batch.map(async (recipient) => {
      const renderedVariables = {
        ...variables,
        email: recipient.email,
        name: variables.name ?? recipient.name ?? '',
      };
      return deliverRecipient({
        templateKey,
        recipient,
        subject: renderText(template.subject, renderedVariables),
        htmlContent: emailFrame(
          renderHtml(template.html_content, renderedVariables),
          renderText(template.preheader || '', renderedVariables),
        ),
        metadata,
        idempotencyKey: idempotencyBase ? await digest(`${idempotencyBase}:${templateKey}:${recipient.email}`) : null,
        replyTo,
      });
    }));
    results.push(...deliveredBatch);
  }

  const delivered = results.filter((result) => result.ok).length;
  const response = { ok: delivered > 0, delivered, attempted: results.length, results };
  if (!delivered) {
    const firstError = results.find((result) => result.error)?.error || 'Envoi transactionnel impossible.';
    throw Object.assign(new Error(firstError), { status: 502, details: response });
  }
  return response;
}

function adminEmailFor(kind: 'casting' | 'contact' | 'booking') {
  if (kind === 'casting') return normalizeEmail(process.env.CASTING_NOTIFICATION_EMAIL) || 'casting@perfectmodels.online';
  if (kind === 'booking') return normalizeEmail(process.env.BOOKING_NOTIFICATION_EMAIL) || 'contact@perfectmodels.online';
  return normalizeEmail(process.env.CONTACT_NOTIFICATION_EMAIL) || 'contact@perfectmodels.online';
}

export async function notifyIntakeSubmission(collection: string, item: Record<string, unknown>, id: string) {
  const tasks: Promise<unknown>[] = [];

  if (collection === 'castingApplications') {
    const name = `${cleanText(item.firstName, 80)} ${cleanText(item.lastName, 80)}`.trim();
    const email = normalizeEmail(item.email);
    if (email) {
      tasks.push(sendTransactionalTemplate({
        templateKey: 'casting_application_received',
        to: [{ email, name }],
        variables: { name: name || 'candidat', reference: id },
        metadata: { source: 'casting_form', application_id: id },
      }));
    }
    tasks.push(sendTransactionalTemplate({
      templateKey: 'admin_new_casting',
      to: [{ email: adminEmailFor('casting'), name: 'Équipe Casting PMM' }],
      variables: { name: name || 'Candidat', email: email || cleanText(item.email, 160) },
      metadata: { source: 'casting_form', application_id: id },
      replyTo: email ? { email, name } : undefined,
    }));
  }

  if (collection === 'contactMessages') {
    const name = cleanText(item.name, 120);
    const email = normalizeEmail(item.email);
    const subject = cleanText(item.subject, 180);
    const message = cleanText(item.message, 4000);
    if (email) {
      tasks.push(sendTransactionalTemplate({
        templateKey: 'contact_received',
        to: [{ email, name }],
        variables: { name: name || 'Bonjour', subject: subject || 'votre demande' },
        metadata: { source: 'contact_form', message_id: id },
      }));
    }
    tasks.push(sendTransactionalTemplate({
      templateKey: 'admin_new_contact',
      to: [{ email: adminEmailFor('contact'), name: 'Perfect Models Management' }],
      variables: { name: name || 'Visiteur', email: email || cleanText(item.email, 160), subject, message },
      metadata: { source: 'contact_form', message_id: id },
      replyTo: email ? { email, name } : undefined,
    }));
  }

  if (collection === 'bookingRequests') {
    const name = cleanText(item.clientName, 120);
    const email = normalizeEmail(item.clientEmail);
    if (email) {
      tasks.push(sendTransactionalTemplate({
        templateKey: 'booking_received',
        to: [{ email, name }],
        variables: {
          name: name || 'Bonjour',
          requested_models: cleanText(item.requestedModels, 500),
          start_date: cleanText(item.startDate, 40),
          end_date: cleanText(item.endDate, 40),
        },
        metadata: { source: 'booking_form', booking_id: id },
      }));
    }
  }

  if (!tasks.length) return [];
  return Promise.allSettled(tasks);
}
