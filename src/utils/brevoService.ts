// Emails are sent directly via Brevo API (client-side, key via VITE_BREVO_API_KEY).

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY as string;
const SENDER = { name: 'Perfect Models Management', email: 'contact@perfectmodels.online' };
const CASTING_SENDER = { name: 'Casting PMM', email: 'casting@perfectmodels.online' };
const BREVO_DAILY_LIMIT = 300;
const BREVO_BATCH_SIZE = 25;
const BREVO_DELAY_MS = 2000;
const BREVO_DAILY_STATE_KEY = 'pmm_brevo_daily_state';

interface BrevoDailyState {
  date: string;
  sent: number;
}

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const readBrevoDailyState = (): BrevoDailyState => {
  if (typeof window === 'undefined') {
    return { date: getTodayKey(), sent: 0 };
  }

  try {
    const raw = window.localStorage.getItem(BREVO_DAILY_STATE_KEY);
    if (!raw) return { date: getTodayKey(), sent: 0 };

    const parsed = JSON.parse(raw) as Partial<BrevoDailyState>;
    const today = getTodayKey();
    if (parsed?.date === today) {
      return { date: today, sent: Number(parsed.sent) || 0 };
    }
  } catch {
    // ignore malformed storage and reset below
  }

  return { date: getTodayKey(), sent: 0 };
};

const writeBrevoDailyState = (state: BrevoDailyState) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BREVO_DAILY_STATE_KEY, JSON.stringify(state));
};

export const getBrevoDailyUsage = () => {
  const state = readBrevoDailyState();
  return {
    used: state.sent,
    limit: BREVO_DAILY_LIMIT,
    remaining: Math.max(0, BREVO_DAILY_LIMIT - state.sent),
    resetDate: state.date,
  };
};

// ─── Logo SVG inline (branding email) ────────────────────────────────────────
const LOGO_URL = 'https://perfectmodels.online/logo.svg';

// ─── Base template ────────────────────────────────────────────────────────────
export const buildEmailTemplate = (content: string, preheader = ''): string => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Perfect Models Management</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:Arial,Helvetica,sans-serif">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:#080808">${preheader}</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- HEADER -->
        <tr>
          <td style="background:#0a0a0a;border:1px solid #c9a84c22;border-bottom:none;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center">
            <img src="${LOGO_URL}" alt="PMM" width="64" height="64" style="border-radius:50%;border:1px solid #c9a84c33;padding:6px;background:#000"/>
            <div style="margin-top:12px">
              <span style="color:#c9a84c;font-size:11px;letter-spacing:6px;text-transform:uppercase;font-weight:900">Perfect Models Management</span>
            </div>
            <div style="width:40px;height:1px;background:#c9a84c;margin:12px auto 0"></div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#0a0a0a;border-left:1px solid #c9a84c22;border-right:1px solid #c9a84c22;padding:40px">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#050505;border:1px solid #c9a84c22;border-top:none;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center">
            <p style="margin:0 0 8px;color:#ffffff20;font-size:11px;letter-spacing:3px;text-transform:uppercase">Suivez-nous</p>
            <p style="margin:0 0 16px">
              <a href="https://facebook.com" style="color:#c9a84c;text-decoration:none;margin:0 8px;font-size:12px">Facebook</a>
              <span style="color:#ffffff20">·</span>
              <a href="https://instagram.com" style="color:#c9a84c;text-decoration:none;margin:0 8px;font-size:12px">Instagram</a>
              <span style="color:#ffffff20">·</span>
              <a href="https://youtube.com" style="color:#c9a84c;text-decoration:none;margin:0 8px;font-size:12px">YouTube</a>
            </p>
            <p style="margin:0;color:#ffffff20;font-size:10px">
              © ${new Date().getFullYear()} Perfect Models Management · Libreville, Gabon<br/>
              <a href="https://perfectmodels.online/" style="color:#c9a84c44;text-decoration:none">perfectmodels.online</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─── Core send ────────────────────────────────────────────────────────────────
interface SendOptions {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
  apiKey?: string; // kept for backward compat, ignored
}

export const sendEmail = async (opts: SendOptions): Promise<void> => {
  const apiKey = opts.apiKey || BREVO_API_KEY;
  if (!apiKey) throw new Error('VITE_BREVO_API_KEY non configurée.');

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: SENDER,
      to: opts.to,
      subject: opts.subject,
      htmlContent: opts.htmlContent,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Brevo error ${res.status}`);
  }
};

export const sendCastingEmail = async (opts: SendOptions): Promise<void> => {
  const apiKey = opts.apiKey || BREVO_API_KEY;
  if (!apiKey) throw new Error('VITE_BREVO_API_KEY non configurée.');

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: CASTING_SENDER,
      to: opts.to,
      subject: opts.subject,
      htmlContent: opts.htmlContent,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Brevo error ${res.status}`);
  }
};

// ─── Templates ────────────────────────────────────────────────────────────────

/** Confirmation de réception au visiteur */
export const sendContactConfirmationToUser = (p: {
  name: string; email: string; subject: string;
}) =>
  sendEmail({
    to: [{ email: p.email, name: p.name }],
    subject: 'Nous avons bien reçu votre message — Perfect Models Management',
    htmlContent: buildEmailTemplate(`
      <p style="color:#f5f0e8;font-size:16px;margin:0 0 16px">Bonjour <strong style="color:#c9a84c">${p.name}</strong>,</p>
      <p style="color:#f5f0e8cc;line-height:1.8;margin:0 0 24px">
        Nous avons bien reçu votre message concernant <em>"${p.subject}"</em>.<br/>
        Notre équipe vous répondra dans les plus brefs délais, généralement sous <strong>24 à 48 heures ouvrées</strong>.
      </p>
      <div style="background:#c9a84c0d;border:1px solid #c9a84c22;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px">En attendant</p>
        <p style="color:#f5f0e8aa;font-size:14px;margin:0 0 16px">Découvrez nos mannequins, services et actualités.</p>
        <a href="https://perfectmodels.online/" style="display:inline-block;background:#c9a84c;color:#080808;font-weight:900;font-size:12px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:12px 28px;border-radius:100px">Visiter le site</a>
      </div>
      <p style="color:#f5f0e8cc;line-height:1.7;margin:0">Cordialement,<br/><strong style="color:#c9a84c">L'équipe Perfect Models Management</strong></p>
    `, `Votre message a bien été reçu — nous vous répondons sous 48h`),
  });

/** Notification admin d'un nouveau message de contact */
export const sendContactNotificationToAdmin = (p: {
  name: string; email: string; subject: string; message: string; notificationEmail: string;
}) =>
  sendEmail({
    to: [{ email: p.notificationEmail, name: 'Équipe PMM' }],
    replyTo: { email: p.email, name: p.name },
    subject: `[Contact PMM] ${p.subject}`,
    htmlContent: buildEmailTemplate(`
      <div style="background:#c9a84c0d;border-left:3px solid #c9a84c;border-radius:4px;padding:16px 20px;margin-bottom:28px">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 4px">Nouveau message de contact</p>
        <p style="color:#f5f0e8;font-size:18px;font-weight:bold;margin:0">${p.subject}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px;width:100px">De</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.name}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Email</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d"><a href="mailto:${p.email}" style="color:#c9a84c">${p.email}</a></td></tr>
      </table>
      <p style="color:#f5f0e8aa;font-size:11px;text-transform:uppercase;letter-spacing:3px;margin:0 0 12px">Message</p>
      <div style="background:#ffffff06;border:1px solid #ffffff0d;border-radius:8px;padding:20px;color:#f5f0e8;line-height:1.8;white-space:pre-wrap">${p.message}</div>
      <p style="color:#ffffff30;font-size:11px;text-align:center;margin-top:24px">Répondez directement à cet email pour contacter ${p.name}</p>
    `, `Nouveau message de ${p.name}`),
  });

/** Réponse admin à un message de contact */
export const sendReplyToContact = (p: {
  toName: string; toEmail: string; originalSubject: string;
  replyBody: string; adminName?: string;
}) =>
  sendEmail({
    to: [{ email: p.toEmail, name: p.toName }],
    subject: `Re: ${p.originalSubject}`,
    htmlContent: buildEmailTemplate(`
      <p style="color:#f5f0e8;font-size:16px;margin:0 0 20px">Bonjour <strong style="color:#c9a84c">${p.toName}</strong>,</p>
      <div style="color:#f5f0e8cc;line-height:1.8;white-space:pre-wrap;margin-bottom:32px">${p.replyBody}</div>
      <p style="color:#f5f0e8cc;margin:0">Cordialement,<br/><strong style="color:#c9a84c">${p.adminName || "L'équipe Perfect Models Management"}</strong></p>
    `, p.replyBody.substring(0, 80)),
  });

/** Email générique / newsletter — envoi par lots pour éviter les blocages Brevo */
export const sendBulkEmail = async (p: {
  to: { email: string; name?: string }[];
  subject: string;
  bodyHtml: string;
  apiKey?: string;
  batchSize?: number;
  delayMs?: number;
  onProgress?: (sent: number, total: number) => void;
}): Promise<{ sent: number; skipped: number; limitReached: boolean; remainingToday: number }> => {
  const batchSize = Math.min(p.batchSize ?? BREVO_BATCH_SIZE, BREVO_BATCH_SIZE);
  const delayMs = p.delayMs ?? BREVO_DELAY_MS;
  const dailyState = readBrevoDailyState();
  const availableSlots = Math.max(0, BREVO_DAILY_LIMIT - dailyState.sent);
  const totalToSend = Math.min(p.to.length, availableSlots);

  if (totalToSend === 0) {
    return { sent: 0, skipped: p.to.length, limitReached: true, remainingToday: 0 };
  }

  let sent = 0;
  for (let i = 0; i < totalToSend; i += batchSize) {
    const batch = p.to.slice(i, i + batchSize);
    await sendEmail({
      to: batch,
      subject: p.subject,
      apiKey: p.apiKey,
      htmlContent: buildEmailTemplate(p.bodyHtml),
    });
    sent += batch.length;
    p.onProgress?.(sent, totalToSend);

    if (i + batchSize < totalToSend) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  const updatedState: BrevoDailyState = {
    date: dailyState.date,
    sent: dailyState.sent + sent,
  };
  writeBrevoDailyState(updatedState);

  return {
    sent,
    skipped: p.to.length - sent,
    limitReached: p.to.length > sent,
    remainingToday: Math.max(0, BREVO_DAILY_LIMIT - updatedState.sent),
  };
};

/** Template newsletter stylé */
export const buildNewsletterBody = (p: {
  headline: string;
  intro: string;
  sections: { title: string; text: string; imageUrl?: string; ctaLabel?: string; ctaUrl?: string }[];
}): string => `
  <h1 style="color:#c9a84c;font-family:Georgia,serif;font-size:28px;font-style:italic;margin:0 0 8px;line-height:1.2">${p.headline}</h1>
  <div style="width:40px;height:2px;background:#c9a84c;margin:0 0 24px"></div>
  <p style="color:#f5f0e8cc;line-height:1.8;margin:0 0 32px">${p.intro}</p>
  ${p.sections.map(s => `
    ${s.imageUrl ? `<img src="${s.imageUrl}" alt="${s.title}" style="width:100%;border-radius:8px;margin-bottom:20px;display:block"/>` : ''}
    <h2 style="color:#f5f0e8;font-family:Georgia,serif;font-size:20px;margin:0 0 12px">${s.title}</h2>
    <p style="color:#f5f0e8aa;line-height:1.8;margin:0 0 20px">${s.text}</p>
    ${s.ctaLabel && s.ctaUrl ? `
      <p style="margin:0 0 32px">
        <a href="${s.ctaUrl}" style="display:inline-block;background:#c9a84c;color:#080808;font-weight:900;font-size:11px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:12px 24px;border-radius:100px">${s.ctaLabel}</a>
      </p>` : '<div style="height:24px;border-bottom:1px solid #ffffff0d;margin-bottom:24px"></div>'}
  `).join('')}
`;

/** Confirmation de demande de vote Miss One Light */
export const sendVoteConfirmation = (p: {
  email: string;
  candidateName: string;
  votes: number;
  txRef: string;
}) =>
  sendEmail({
    to: [{ email: p.email }],
    subject: `Vote Miss One Light — Réf. ${p.txRef}`,
    htmlContent: buildEmailTemplate(`
      <h2 style="color:#c9a84c;font-family:Georgia,serif;font-size:24px;margin:0 0 16px">✅ Demande de vote reçue !</h2>
      <p style="color:#f5f0e8cc;line-height:1.8;margin:0 0 24px">
        Votre demande de vote pour <strong style="color:#c9a84c">${p.candidateName}</strong> a bien été enregistrée.
      </p>
      <div style="background:#c9a84c0d;border:1px solid #c9a84c22;border-radius:8px;padding:20px;margin-bottom:24px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px;width:120px">Candidate</td><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.candidateName}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Votes</td><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.votes}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Montant</td><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8;font-weight:bold">${p.votes * 100} FCFA</td></tr>
          <tr><td style="padding:8px 0;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Référence</td><td style="padding:8px 0;color:#f5f0e8;font-family:monospace">${p.txRef}</td></tr>
        </table>
      </div>
      <div style="background:#ffffff06;border:1px solid #ffffff0d;border-radius:8px;padding:20px;margin-bottom:24px">
        <p style="color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:3px;margin:0 0 12px">💳 Effectuez votre paiement</p>
        <p style="color:#f5f0e8;margin:0 0 8px">📞 Airtel Money : <strong>074799319</strong></p>
        <p style="color:#f5f0e8;margin:0 0 8px">📱 Moov Money : <strong>065 23 54 84</strong></p>
        <p style="color:#f5f0e8aa;font-size:13px;margin:0">Mentionnez la référence <strong style="color:#c9a84c">${p.txRef}</strong> lors du paiement.</p>
      </div>
      <p style="color:#f5f0e8aa;font-size:13px;line-height:1.7;margin:0">
        Après paiement, envoyez la confirmation sur WhatsApp au <strong>+241 74 79 93 19</strong>.<br/>
        L'admin validera vos votes sous 24h.
      </p>
    `, `Vote Miss One Light — ${p.votes} votes pour ${p.candidateName}`),
  });

export const sendVoteNotificationToAdmin = (p: {
  voterName: string; email: string; phone: string; candidateName: string; votes: number; txRef: string; notificationEmail: string;
}) =>
  sendEmail({
    to: [{ email: p.notificationEmail, name: 'Équipe PMM' }],
    replyTo: { email: p.email, name: p.voterName },
    subject: `[Miss One Light] Nouveau vote en attente - ${p.txRef}`,
    htmlContent: buildEmailTemplate(`
      <div style="background:#c9a84c0d;border-left:3px solid #c9a84c;border-radius:4px;padding:16px 20px;margin-bottom:28px">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 4px">Nouveau vote en attente de validation</p>
        <p style="color:#f5f0e8;font-size:18px;font-weight:bold;margin:0">${p.votes} votes pour ${p.candidateName}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px;width:140px">Votant</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.voterName}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Email</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d"><a href="mailto:${p.email}" style="color:#c9a84c">${p.email}</a></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Téléphone</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.phone}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Montant attendu</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8;font-weight:bold">${p.votes * 100} FCFA</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Référence</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8;font-family:monospace">${p.txRef}</td></tr>
      </table>
      <div style="text-align:center;margin-top:24px">
        <a href="https://perfectmodels.online//admin/miss-one-light" style="display:inline-block;background:#c9a84c;color:#080808;font-weight:900;font-size:11px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:12px 24px;border-radius:100px">Voir dans l'admin</a>
      </div>
    `, `Nouveau vote de ${p.votes} votes pour ${p.candidateName}`),
  });

/** Email envoyé au votant UNIQUEMENT après validation par l'admin */
export const sendVoteValidatedEmail = (p: {
  email: string;
  candidateName: string;
  votes: number;
  bonusVotes: number;
  totalVotes: number;
  txRef: string;
}) =>
  sendEmail({
    to: [{ email: p.email }],
    subject: `✅ Vos votes sont activés — Miss One Light`,
    htmlContent: buildEmailTemplate(`
      <h2 style="color:#009E60;font-family:Georgia,serif;font-size:24px;margin:0 0 16px">🎉 Vos votes sont activés !</h2>
      <p style="color:#f5f0e8cc;line-height:1.8;margin:0 0 24px">
        Votre paiement a été confirmé. Vos votes pour <strong style="color:#c9a84c">${p.candidateName}</strong> sont maintenant comptabilisés dans le classement en direct.
      </p>
      <div style="background:#009E600d;border:1px solid #009E6033;border-radius:8px;padding:20px;margin-bottom:24px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#009E60;font-size:11px;text-transform:uppercase;letter-spacing:2px;width:140px">Candidate</td><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.candidateName}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#009E60;font-size:11px;text-transform:uppercase;letter-spacing:2px">Votes achetés</td><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.votes}</td></tr>
          ${p.bonusVotes > 0 ? `<tr><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#009E60;font-size:11px;text-transform:uppercase;letter-spacing:2px">Bonus offerts</td><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#009E60;font-weight:bold">+${p.bonusVotes}</td></tr>` : ''}
          <tr><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#009E60;font-size:11px;text-transform:uppercase;letter-spacing:2px">Total crédités</td><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8;font-weight:bold;font-size:18px">${p.totalVotes}</td></tr>
          <tr><td style="padding:8px 0;color:#009E60;font-size:11px;text-transform:uppercase;letter-spacing:2px">Référence</td><td style="padding:8px 0;color:#f5f0e8;font-family:monospace">${p.txRef}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin-bottom:24px">
        <a href="https://perfectmodels.online//miss-one-light" style="display:inline-block;background:#009E60;color:#fff;font-weight:900;font-size:12px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:14px 32px;border-radius:100px">Voir le classement en direct</a>
      </div>
      <p style="color:#f5f0e8aa;font-size:13px;line-height:1.7;margin:0;text-align:center">
        Merci pour votre soutien à <strong style="color:#c9a84c">${p.candidateName}</strong> 🌟
      </p>
    `, `Vos ${p.totalVotes} votes pour ${p.candidateName} sont activés !`),
  });

// ─── Casting Application ──────────────────────────────────────────────────────

/** Confirmation au candidat après soumission du formulaire casting */
export const sendCastingConfirmationToUser = (p: {
  firstName: string; lastName: string; email: string; city: string;
}) =>
  sendCastingEmail({
    to: [{ email: p.email, name: `${p.firstName} ${p.lastName}` }],
    subject: 'Candidature reçue — Perfect Models Management',
    htmlContent: buildEmailTemplate(`
      <p style="color:#f5f0e8;font-size:16px;margin:0 0 16px">Bonjour <strong style="color:#c9a84c">${p.firstName}</strong>,</p>
      <p style="color:#f5f0e8cc;line-height:1.8;margin:0 0 24px">
        Nous avons bien reçu votre candidature au casting Perfect Models Management depuis <strong>${p.city}</strong>.<br/>
        Notre équipe de sélection examinera votre dossier et vous contactera sous <strong>48 à 72 heures ouvrées</strong>.
      </p>
      <div style="background:#c9a84c0d;border:1px solid #c9a84c22;border-radius:8px;padding:20px;margin-bottom:24px;text-align:center">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px">Prochaine étape</p>
        <p style="color:#f5f0e8aa;font-size:14px;margin:0 0 16px">Si votre profil est retenu, vous serez convoqué(e) pour un entretien en personne.</p>
        <a href="https://perfectmodels.online//casting" style="display:inline-block;background:#c9a84c;color:#080808;font-weight:900;font-size:12px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:12px 28px;border-radius:100px">Voir le casting</a>
      </div>
      <p style="color:#f5f0e8cc;line-height:1.7;margin:0">Cordialement,<br/><strong style="color:#c9a84c">L'équipe Perfect Models Management</strong></p>
    `, `Votre candidature casting a bien été reçue`),
  });

/** Notification admin d'une nouvelle candidature casting */
export const sendCastingNotificationToAdmin = (p: {
  firstName: string; lastName: string; email: string; phone: string;
  city: string; gender: string; height: string; experience: string;
  instagram?: string; notificationEmail: string;
}) =>
  sendCastingEmail({
    to: [{ email: p.notificationEmail, name: 'Équipe PMM' }],
    replyTo: { email: p.email, name: `${p.firstName} ${p.lastName}` },
    subject: `[Casting PMM] ${p.firstName} ${p.lastName} — ${p.city}`,
    htmlContent: buildEmailTemplate(`
      <div style="background:#c9a84c0d;border-left:3px solid #c9a84c;border-radius:4px;padding:16px 20px;margin-bottom:28px">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 4px">Nouvelle candidature casting</p>
        <p style="color:#f5f0e8;font-size:18px;font-weight:bold;margin:0">${p.firstName} ${p.lastName}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px;width:120px">Nom</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.firstName} ${p.lastName}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Email</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d"><a href="mailto:${p.email}" style="color:#c9a84c">${p.email}</a></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Téléphone</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.phone}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Ville</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.city}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Genre</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.gender}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Taille</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.height ? p.height + ' cm' : '—'}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Expérience</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.experience}</td></tr>
        ${p.instagram ? `<tr><td style="padding:10px 0;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Instagram</td><td style="padding:10px 0;color:#f5f0e8">${p.instagram}</td></tr>` : ''}
      </table>
      <div style="text-align:center">
        <a href="https://perfectmodels.online//admin/casting-applications" style="display:inline-block;background:#c9a84c;color:#080808;font-weight:900;font-size:11px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:12px 24px;border-radius:100px">Voir dans l'admin</a>
      </div>
    `, `Nouvelle candidature de ${p.firstName} ${p.lastName}`),
  });

// ─── Casting Status Notifications ─────────────────────────────────────────

/** Email au candidat quand le profil est ACCEPTÉ */
export const sendCastingAcceptedNotification = (p: {
  firstName: string; lastName: string; email: string; phone: string;
  city: string; height: string; instagram?: string;
}) =>
  sendCastingEmail({
    to: [{ email: p.email, name: `${p.firstName} ${p.lastName}` }],
    subject: '🎉 Félicitations — Votre profil a été retenu — Perfect Models Management',
    htmlContent: buildEmailTemplate(`
      <h2 style="color:#009E60;font-family:Georgia,serif;font-size:24px;margin:0 0 16px">🎉 Félicitations ${p.firstName} !</h2>
      <p style="color:#f5f0e8cc;line-height:1.8;margin:0 0 24px">
        Votre profil a été retenu pour le casting Perfect Models Management.<br/>
        Vous êtes officiellement invité(e) à rejoindre notre agence de mannequins.
      </p>
      <div style="background:#009E600d;border:1px solid #009E6033;border-radius:8px;padding:20px;margin-bottom:24px">
        <p style="color:#009E60;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 12px;font-weight:bold">Vos coordonnées</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#009E60;font-size:11px;width:100px">Téléphone</td><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.phone}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#009E60;font-size:11px">Ville</td><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.city}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#009E60;font-size:11px">Taille</td><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.height ? p.height + ' cm' : '—'}</td></tr>
          ${p.instagram ? `<tr><td style="padding:8px 0;color:#009E60;font-size:11px">Instagram</td><td style="padding:8px 0;color:#f5f0e8">${p.instagram}</td></tr>` : ''}
        </table>
      </div>
      <div style="background:#c9a84c0d;border:1px solid #c9a84c22;border-radius:8px;padding:20px;margin-bottom:24px">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 12px;font-weight:bold">Tableau de bord mannequins</p>
        <p style="color:#f5f0e8cc;margin:0 0 12px;line-height:1.7">
          Connectez-vous à votre espace personnel pour accéder aux missions, planning et documents.
        </p>
        <p style="color:#f5f0e8;margin:0 0 16px">
          <strong>Email :</strong> <span style="color:#c9a84c">${p.email}</span><br/>
          <strong>Mot de passe :</strong> À définir lors de votre première connexion
        </p>
        <a href="https://perfectmodels.online/model-login" style="display:inline-block;background:#c9a84c;color:#080808;font-weight:900;font-size:12px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:12px 28px;border-radius:100px">Accéder au tableau de bord</a>
      </div>
      <p style="color:#f5f0e8cc;line-height:1.7;margin:0">
        Contactez-nous au <strong style="color:#c9a84c">+241 74 79 93 19</strong> pour convenir de votre entretien d'intégration.
      </p>
    `, `Votre candidature a été retenue — bienvenue chez PMM`),
  });

/** Email au candidat quand le profil est NON RETENU */
export const sendCastingRejectedNotification = (p: {
  firstName: string; lastName: string; email: string; rejectionReasons: string;
}) =>
  sendCastingEmail({
    to: [{ email: p.email, name: `${p.firstName} ${p.lastName}` }],
    subject: 'Candidature casting - Perfect Models Management',
    htmlContent: buildEmailTemplate(`
      <div style="background:#ff47570d;border-left:3px solid #ff4757;border-radius:4px;padding:16px 20px;margin-bottom:28px">
        <p style="color:#ff4757;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 4px">Candidature analytique</p>
        <p style="color:#f5f0e8;font-size:18px;font-weight:bold;margin:0">Merci pour votre interet</p>
      </div>
      <p style="color:#f5f0e8cc;line-height:1.8;margin:0 0 24px">
        Bonjour <strong style="color:#c9a84c">${p.firstName}</strong>,<br/>
        Apres analyse attentive de votre candidature, nous ne pouvons malheureusement pas retenir votre profil a ce stade.
      </p>
      <div style="background:#ffffff06;border:1px solid #ffffff0d;border-radius:8px;padding:20px;color:#f5f0e8cc;line-height:1.8;margin-bottom:24px">
        <p style="color:#ff4757;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 12px;font-weight:bold">Raisons du non-retenu</p>
        <p style="margin:0">${p.rejectionReasons}</p>
      </div>
      <div style="background:#c9a84c0d;border:1px solid #c9a84c22;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px">Conseil</p>
        <p style="color:#f5f0e8aa;font-size:14px;margin:0 0 16px">Travaillez votre presence, votre silhouette et reessayez lors d'un futur casting.</p>
        <a href="https://perfectmodels.online/casting" style="display:inline-block;background:#c9a84c;color:#080808;font-weight:900;font-size:12px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:12px 28px;border-radius:100px">Voir les prochaines dates</a>
      </div>
      <p style="color:#f5f0e8aa;line-height:1.7;margin:0">
        Nous vous remercions pour votre confiance.<br/>
        <strong style="color:#c9a84c">L'equipe Perfect Models Management</strong>
      </p>
    `, 'Reponse a votre candidature casting'),
  });

/** Email au candidat quand le profil est PRESELECTIONNE */
export const sendCastingPresignedNotification = (p: {
  firstName: string; lastName: string; email: string;
}) => {
  const subjectText = '📋 Votre candidature est en cours d\'etude - Perfect Models Management';
  return sendCastingEmail({
    to: [{ email: p.email, name: `${p.firstName} ${p.lastName}` }],
    subject: subjectText,
    htmlContent: buildEmailTemplate(`
      <div style="background:#c9a84c0d;border-left:3px solid #c9a84c;border-radius:4px;padding:16px 20px;margin-bottom:28px">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 4px">Preselection</p>
        <p style="color:#f5f0e8;font-size:18px;font-weight:bold;margin:0">Candidature en cours d'analyse</p>
      </div>
      <p style="color:#f5f0e8cc;line-height:1.8;margin:0 0 24px">
        Bonjour <strong style="color:#c9a84c">${p.firstName}</strong>,<br/>
        Votre dossier a été retenu pour une préselection approfondie. Nous étudions actuellement votre profil.
      </p>
      <div style="background:#ffffff06;border:1px solid #ffffff0d;border-radius:8px;padding:20px;color:#f5f0e8cc;line-height:1.8;margin-bottom:24px">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 12px;font-weight:bold">Prochaine etape</p>
        <p style="margin:0">Si vous êtes retenu(e), vous recevrez une invitation pour un entretien et la création de votre profil mannequin.</p>
      </div>
      <p style="color:#f5f0e8aa;line-height:1.7;margin:0">
        Nous vous tiendrons informé(e) sous 48h.<br/>
        <strong style="color:#c9a84c">L'equipe Perfect Models Management</strong>
      </p>
    `, 'Candidature en cours d\'etude'),
  });
};

// ─── Fashion Day Application ──────────────────────────────────────────────────

/** Confirmation au candidat après soumission candidature Fashion Day */
export const sendFashionDayConfirmationToUser = (p: {
  name: string; email: string; role: string;
}) =>
  sendEmail({
    to: [{ email: p.email, name: p.name }],
    subject: 'Candidature Perfect Fashion Day reçue — PMM',
    htmlContent: buildEmailTemplate(`
      <p style="color:#f5f0e8;font-size:16px;margin:0 0 16px">Bonjour <strong style="color:#c9a84c">${p.name}</strong>,</p>
      <p style="color:#f5f0e8cc;line-height:1.8;margin:0 0 24px">
        Votre candidature en tant que <strong style="color:#c9a84c">${p.role}</strong> pour le <strong>Perfect Fashion Day</strong> a bien été reçue.<br/>
        Notre équipe organisatrice vous recontactera prochainement pour la suite du processus.
      </p>
      <div style="background:#c9a84c0d;border:1px solid #c9a84c22;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px">Perfect Fashion Day</p>
        <p style="color:#f5f0e8aa;font-size:14px;margin:0 0 16px">Restez connecté(e) pour les prochaines annonces de l'événement.</p>
        <a href="https://perfectmodels.online//fashion-day" style="display:inline-block;background:#c9a84c;color:#080808;font-weight:900;font-size:12px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:12px 28px;border-radius:100px">En savoir plus</a>
      </div>
      <p style="color:#f5f0e8cc;line-height:1.7;margin:0">Cordialement,<br/><strong style="color:#c9a84c">L'équipe Perfect Models Management</strong></p>
    `, `Votre candidature Perfect Fashion Day a bien été reçue`),
  });

/** Notification admin d'une nouvelle candidature Fashion Day */
export const sendFashionDayNotificationToAdmin = (p: {
  name: string; email: string; phone: string; role: string; message: string; notificationEmail: string;
}) =>
  sendEmail({
    to: [{ email: p.notificationEmail, name: 'Équipe PMM' }],
    replyTo: { email: p.email, name: p.name },
    subject: `[Fashion Day] ${p.name} — ${p.role}`,
    htmlContent: buildEmailTemplate(`
      <div style="background:#c9a84c0d;border-left:3px solid #c9a84c;border-radius:4px;padding:16px 20px;margin-bottom:28px">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 4px">Nouvelle candidature Perfect Fashion Day</p>
        <p style="color:#f5f0e8;font-size:18px;font-weight:bold;margin:0">${p.name} — ${p.role}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px;width:120px">Nom</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.name}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Email</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d"><a href="mailto:${p.email}" style="color:#c9a84c">${p.email}</a></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Téléphone</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.phone}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Rôle</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.role}</td></tr>
      </table>
      <p style="color:#f5f0e8aa;font-size:11px;text-transform:uppercase;letter-spacing:3px;margin:0 0 12px">Message</p>
      <div style="background:#ffffff06;border:1px solid #ffffff0d;border-radius:8px;padding:20px;color:#f5f0e8;line-height:1.8;white-space:pre-wrap">${p.message}</div>
      <div style="text-align:center;margin-top:24px">
        <a href="https://perfectmodels.online//admin/fashion-day-applications" style="display:inline-block;background:#c9a84c;color:#080808;font-weight:900;font-size:11px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:12px 24px;border-radius:100px">Voir dans l'admin</a>
      </div>
    `, `Nouvelle candidature Fashion Day de ${p.name}`),
  });

// ─── Booking Request ──────────────────────────────────────────────────────────

/** Confirmation au client après soumission d'une demande de booking */
export const sendBookingConfirmationToUser = (p: {
  clientName: string; clientEmail: string; requestedModels: string;
  startDate?: string; endDate?: string;
}) =>
  sendEmail({
    to: [{ email: p.clientEmail, name: p.clientName }],
    subject: 'Demande de booking reçue — Perfect Models Management',
    htmlContent: buildEmailTemplate(`
      <p style="color:#f5f0e8;font-size:16px;margin:0 0 16px">Bonjour <strong style="color:#c9a84c">${p.clientName}</strong>,</p>
      <p style="color:#f5f0e8cc;line-height:1.8;margin:0 0 24px">
        Nous avons bien reçu votre demande de booking. Notre équipe commerciale vous contactera sous <strong>24 à 48 heures ouvrées</strong> pour discuter des détails et établir un devis.
      </p>
      <div style="background:#c9a84c0d;border:1px solid #c9a84c22;border-radius:8px;padding:20px;margin-bottom:24px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px;width:140px">Mannequin(s)</td><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.requestedModels}</td></tr>
          ${p.startDate ? `<tr><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Date début</td><td style="padding:8px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.startDate}</td></tr>` : ''}
          ${p.endDate ? `<tr><td style="padding:8px 0;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Date fin</td><td style="padding:8px 0;color:#f5f0e8">${p.endDate}</td></tr>` : ''}
        </table>
      </div>
      <p style="color:#f5f0e8cc;line-height:1.7;margin:0">Cordialement,<br/><strong style="color:#c9a84c">L'équipe Perfect Models Management</strong></p>
    `, `Votre demande de booking a bien été reçue`),
  });

/** Notification admin d'une nouvelle demande de booking */
export const sendBookingNotificationToAdmin = (p: {
  clientName: string; clientEmail: string; clientCompany?: string;
  requestedModels: string; startDate?: string; endDate?: string;
  message: string; notificationEmail: string;
}) =>
  sendEmail({
    to: [{ email: p.notificationEmail, name: 'Équipe PMM' }],
    replyTo: { email: p.clientEmail, name: p.clientName },
    subject: `[Booking PMM] ${p.clientName} — ${p.requestedModels}`,
    htmlContent: buildEmailTemplate(`
      <div style="background:#c9a84c0d;border-left:3px solid #c9a84c;border-radius:4px;padding:16px 20px;margin-bottom:28px">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 4px">Nouvelle demande de booking</p>
        <p style="color:#f5f0e8;font-size:18px;font-weight:bold;margin:0">${p.clientName}${p.clientCompany ? ` — ${p.clientCompany}` : ''}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px;width:140px">Client</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.clientName}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Email</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d"><a href="mailto:${p.clientEmail}" style="color:#c9a84c">${p.clientEmail}</a></td></tr>
        ${p.clientCompany ? `<tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Société</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.clientCompany}</td></tr>` : ''}
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Mannequin(s)</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.requestedModels}</td></tr>
        ${p.startDate ? `<tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Date début</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.startDate}</td></tr>` : ''}
        ${p.endDate ? `<tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Date fin</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.endDate}</td></tr>` : ''}
      </table>
      <p style="color:#f5f0e8aa;font-size:11px;text-transform:uppercase;letter-spacing:3px;margin:0 0 12px">Message</p>
      <div style="background:#ffffff06;border:1px solid #ffffff0d;border-radius:8px;padding:20px;color:#f5f0e8;line-height:1.8;white-space:pre-wrap">${p.message}</div>
      <div style="text-align:center;margin-top:24px">
        <a href="https://perfectmodels.online//admin/bookings" style="display:inline-block;background:#c9a84c;color:#080808;font-weight:900;font-size:11px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:12px 24px;border-radius:100px">Voir dans l'admin</a>
      </div>
    `, `Nouvelle demande de booking de ${p.clientName}`),
  });

// ─── Registration Casting ──────────────────────────────────────────────────────────

export const sendRegistrationCastingConfirmationToUser = (p: {
  firstName: string; lastName: string; email: string;
}) =>
  sendEmail({
    to: [{ email: p.email, name: `${p.firstName} ${p.lastName}` }],
    subject: 'Confirmation de votre enregistrement au casting — Perfect Models Management',
    htmlContent: buildEmailTemplate(`
      <p style="color:#f5f0e8;font-size:16px;margin:0 0 16px">Bonjour <strong style="color:#c9a84c">${p.firstName}</strong>,</p>
      <p style="color:#f5f0e8cc;line-height:1.8;margin:0 0 24px">
        Nous avons bien enregistré votre candidature sur place. Notre équipe étudiera votre profil avec attention et vous recontactera si vous êtes retenu(e) pour la prochaine étape du processus.
      </p>
      <div style="background:#c9a84c0d;border:1px solid #c9a84c22;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 8px">Casting Perfect Models</p>
        <p style="color:#f5f0e8aa;font-size:14px;margin:0 0 16px">Merci de l'intérêt que vous portez à notre agence.</p>
        <a href="https://perfectmodels.online/" style="display:inline-block;background:#c9a84c;color:#080808;font-weight:900;font-size:12px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:12px 28px;border-radius:100px">Découvrir l'agence</a>
      </div>
      <p style="color:#f5f0e8cc;line-height:1.7;margin:0">Cordialement,<br/><strong style="color:#c9a84c">L'équipe Perfect Models Management</strong></p>
    `, `Votre enregistrement au casting a bien été effectué`),
  });

export const sendRegistrationCastingNotificationToAdmin = (p: {
  firstName: string; lastName: string; email: string; phone: string; gender: string; notificationEmail: string;
}) =>
  sendEmail({
    to: [{ email: p.notificationEmail, name: 'Équipe PMM' }],
    replyTo: { email: p.email, name: `${p.firstName} ${p.lastName}` },
    subject: `[Casting Sur Place] ${p.firstName} ${p.lastName}`,
    htmlContent: buildEmailTemplate(`
      <div style="background:#c9a84c0d;border-left:3px solid #c9a84c;border-radius:4px;padding:16px 20px;margin-bottom:28px">
        <p style="color:#c9a84c;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 4px">Nouvel enregistrement casting (sur place)</p>
        <p style="color:#f5f0e8;font-size:18px;font-weight:bold;margin:0">${p.firstName} ${p.lastName}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px;width:120px">Nom</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.firstName} ${p.lastName}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Email</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d"><a href="mailto:${p.email}" style="color:#c9a84c">${p.email}</a></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Téléphone</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.phone}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#c9a84c;font-size:11px;text-transform:uppercase;letter-spacing:2px">Genre</td><td style="padding:10px 0;border-bottom:1px solid #ffffff0d;color:#f5f0e8">${p.gender}</td></tr>
      </table>
      <div style="text-align:center;margin-top:24px">
        <a href="https://perfectmodels.online//admin/casting-applications" style="display:inline-block;background:#c9a84c;color:#080808;font-weight:900;font-size:11px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:12px 24px;border-radius:100px">Voir dans l'admin</a>
      </div>
    `, `Nouvel enregistrement casting de ${p.firstName} ${p.lastName}`),
  });
