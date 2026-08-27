import 'server-only';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qzkodgqxrcxsnfwpmwfb.supabase.co').replace(/\/$/, '');
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export type EmailRecipient = { email: string; name?: string };

export type TransactionalEmailInput = {
  templateKey: string;
  to: EmailRecipient[];
  variables?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  replyTo?: EmailRecipient;
};

function normalizeEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function cleanText(value: unknown, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

export async function sendTransactionalTemplate(input: TransactionalEmailInput) {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw Object.assign(new Error('Service email transactionnel non configuré.'), { status: 503 });
  }

  const recipients = input.to
    .map((recipient) => ({
      email: normalizeEmail(recipient.email),
      name: cleanText(recipient.name, 120) || undefined,
    }))
    .filter((recipient) => recipient.email);

  if (!recipients.length) throw new Error('Aucun destinataire email valide.');

  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-transactional-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
    },
    body: JSON.stringify({
      templateKey: cleanText(input.templateKey, 120),
      to: recipients,
      variables: input.variables || {},
      metadata: input.metadata || {},
      replyTo: input.replyTo && normalizeEmail(input.replyTo.email)
        ? { email: normalizeEmail(input.replyTo.email), name: cleanText(input.replyTo.name, 120) || undefined }
        : undefined,
    }),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(String(payload?.error || payload?.message || 'Envoi transactionnel impossible.')), {
      status: response.status,
    });
  }
  return payload;
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
