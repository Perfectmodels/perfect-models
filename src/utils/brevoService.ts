// Compatibilité UI : aucun secret SMTP/Brevo ne doit exister dans le bundle navigateur.
// Les soumissions publiques déclenchent leurs emails dans /api/data côté serveur.
// Les outils administrateur utilisent /api/email, protégé par la session PMM.

const DAILY_LIMIT = 300;
const DAILY_STATE_KEY = 'pmm_email_daily_state';

type Recipient = { email: string; name?: string };
interface SendOptions {
  to: Recipient[];
  subject: string;
  htmlContent: string;
  replyTo?: Recipient;
}

interface DailyState { date: string; sent: number }
const today = () => new Date().toISOString().slice(0, 10);
const readState = (): DailyState => {
  if (typeof window === 'undefined') return { date: today(), sent: 0 };
  try {
    const parsed = JSON.parse(localStorage.getItem(DAILY_STATE_KEY) || '{}');
    if (parsed?.date === today()) return { date: today(), sent: Number(parsed.sent) || 0 };
  } catch {}
  return { date: today(), sent: 0 };
};
const writeState = (state: DailyState) => {
  if (typeof window !== 'undefined') localStorage.setItem(DAILY_STATE_KEY, JSON.stringify(state));
};

export const getBrevoDailyUsage = () => {
  const state = readState();
  return { used: state.sent, limit: DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - state.sent), resetDate: state.date };
};

export const buildEmailTemplate = (content: string, preheader = ''): string => `<!doctype html>
<html lang="fr"><body style="margin:0;background:#080808;font-family:Arial,Helvetica,sans-serif;color:#f5f0e8">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden">${preheader}</div>` : ''}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:36px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#0d0d0d;border:1px solid #292313;border-radius:16px;overflow:hidden">
<tr><td align="center" style="padding:30px;border-bottom:1px solid #292313"><img src="https://www.perfectmodels.online/logo.svg" width="62" alt="PMM"><div style="margin-top:14px;color:#c9a84c;font-size:11px;font-weight:800;letter-spacing:4px">PERFECT MODELS MANAGEMENT</div></td></tr>
<tr><td style="padding:36px">${content}</td></tr>
<tr><td align="center" style="padding:22px;border-top:1px solid #292313;color:#666;font-size:10px">Perfect Models Management · Libreville, Gabon<br><a href="https://www.perfectmodels.online" style="color:#c9a84c;text-decoration:none">www.perfectmodels.online</a></td></tr>
</table></td></tr></table></body></html>`;

async function postEmail(payload: Record<string, unknown>) {
  const response = await fetch('/api/email', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error || `Email impossible (${response.status}).`);
  return body;
}

export const sendEmail = async (opts: SendOptions): Promise<void> => {
  await postEmail({ type: 'raw', to: opts.to, subject: opts.subject, htmlContent: opts.htmlContent, replyTo: opts.replyTo });
};

export const sendCastingEmail = sendEmail;

async function sendTemplate(templateKey: string, to: Recipient[], variables: Record<string, unknown>, replyTo?: Recipient) {
  await postEmail({ type: 'template', templateKey, to, variables, replyTo });
}

// Ces emails sont envoyés automatiquement par le serveur après persistance de la soumission.
// Les fonctions restent exportées pour ne pas casser les anciennes pages pendant la transition.
const serverManaged = async () => undefined;
export const sendContactConfirmationToUser = serverManaged as (p: { name: string; email: string; subject: string }) => Promise<void>;
export const sendContactNotificationToAdmin = serverManaged as (p: { name: string; email: string; subject: string; message: string; notificationEmail: string }) => Promise<void>;
export const sendCastingConfirmationToUser = serverManaged as (p: { firstName: string; lastName: string; email: string; city: string }) => Promise<void>;
export const sendCastingNotificationToAdmin = serverManaged as (p: { firstName: string; lastName: string; email: string; phone: string; city: string; gender: string; height: string; experience: string; instagram?: string; notificationEmail: string }) => Promise<void>;
export const sendFashionDayConfirmationToUser = serverManaged as (p: { name: string; email: string; role: string }) => Promise<void>;
export const sendFashionDayNotificationToAdmin = serverManaged as (p: { name: string; email: string; phone: string; role: string; message: string; notificationEmail: string }) => Promise<void>;
export const sendBookingConfirmationToUser = serverManaged as (p: { clientName: string; clientEmail: string; requestedModels: string; startDate?: string; endDate?: string }) => Promise<void>;
export const sendBookingNotificationToAdmin = serverManaged as (p: { clientName: string; clientEmail: string; clientCompany?: string; requestedModels: string; startDate?: string; endDate?: string; message: string; notificationEmail: string }) => Promise<void>;

export const sendReplyToContact = (p: { toName: string; toEmail: string; originalSubject: string; replyBody: string; adminName?: string }) =>
  sendEmail({
    to: [{ email: p.toEmail, name: p.toName }],
    subject: `Re: ${p.originalSubject}`,
    htmlContent: buildEmailTemplate(`<p style="font-size:16px">Bonjour <strong style="color:#c9a84c">${p.toName}</strong>,</p><div style="white-space:pre-wrap;line-height:1.8;color:#ddd">${p.replyBody}</div><p style="margin-top:28px">Cordialement,<br><strong style="color:#c9a84c">${p.adminName || "L'équipe Perfect Models Management"}</strong></p>`),
  });

export const sendCastingAcceptedNotification = (p: { firstName: string; lastName: string; email: string; phone: string; city: string; height: string; instagram?: string }) =>
  sendTemplate('casting_application_approved', [{ email: p.email, name: `${p.firstName} ${p.lastName}` }], {
    name: `${p.firstName} ${p.lastName}`,
    first_name: p.firstName,
    city: p.city,
    height: p.height,
  });

export const sendCastingRejectedNotification = (p: { firstName: string; lastName: string; email: string; rejectionReasons: string }) =>
  sendTemplate('casting_application_rejected', [{ email: p.email, name: `${p.firstName} ${p.lastName}` }], {
    name: `${p.firstName} ${p.lastName}`,
    first_name: p.firstName,
    reason: p.rejectionReasons,
  });

export const sendCastingPresignedNotification = (p: { firstName: string; lastName: string; email: string }) =>
  sendEmail({
    to: [{ email: p.email, name: `${p.firstName} ${p.lastName}` }],
    subject: 'Votre candidature est en cours d’étude — Perfect Models Management',
    htmlContent: buildEmailTemplate(`<p>Bonjour <strong style="color:#c9a84c">${p.firstName}</strong>,</p><p style="line-height:1.8;color:#ddd">Votre dossier a été retenu pour une présélection approfondie. L’équipe PMM étudie actuellement votre profil et vous contactera pour la prochaine étape.</p>`),
  });

export const sendBulkEmail = async (p: {
  to: Recipient[];
  subject: string;
  bodyHtml: string;
  batchSize?: number;
  delayMs?: number;
  onProgress?: (sent: number, total: number) => void;
}): Promise<{ sent: number; skipped: number; limitReached: boolean; remainingToday: number }> => {
  const state = readState();
  const available = Math.max(0, DAILY_LIMIT - state.sent);
  const total = Math.min(p.to.length, available);
  const batchSize = Math.max(1, Math.min(p.batchSize || 25, 25));
  let sent = 0;
  for (let i = 0; i < total; i += batchSize) {
    const batch = p.to.slice(i, i + batchSize);
    await sendEmail({ to: batch, subject: p.subject, htmlContent: buildEmailTemplate(p.bodyHtml) });
    sent += batch.length;
    p.onProgress?.(sent, total);
    if (i + batchSize < total && (p.delayMs || 0) > 0) await new Promise((resolve) => setTimeout(resolve, p.delayMs));
  }
  const next = { date: state.date, sent: state.sent + sent };
  writeState(next);
  return { sent, skipped: p.to.length - sent, limitReached: p.to.length > sent, remainingToday: Math.max(0, DAILY_LIMIT - next.sent) };
};

export const buildNewsletterBody = (p: {
  headline: string;
  intro: string;
  sections: { title: string; text: string; imageUrl?: string; ctaLabel?: string; ctaUrl?: string }[];
}): string => `
<h1 style="color:#c9a84c;font-family:Georgia,serif;font-size:28px;margin:0 0 12px">${p.headline}</h1>
<p style="color:#ddd;line-height:1.8;margin:0 0 28px">${p.intro}</p>
${p.sections.map((section) => `
  ${section.imageUrl ? `<img src="${section.imageUrl}" alt="" style="width:100%;border-radius:8px;margin-bottom:16px">` : ''}
  <h2 style="color:#fff;font-family:Georgia,serif;font-size:20px">${section.title}</h2>
  <p style="color:#bbb;line-height:1.8">${section.text}</p>
  ${section.ctaLabel && section.ctaUrl ? `<p><a href="${section.ctaUrl}" style="display:inline-block;background:#c9a84c;color:#080808;text-decoration:none;font-weight:800;padding:11px 22px;border-radius:999px">${section.ctaLabel}</a></p>` : ''}
`).join('')}`;
