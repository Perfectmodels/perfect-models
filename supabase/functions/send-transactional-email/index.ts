import { createClient } from '@supabase/supabase-js'

type JsonRecord = Record<string, unknown>

const responseHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: responseHeaders })

const escapeHtml = (value: unknown) => String(value ?? '').replace(
  /[&<>"']/g,
  (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character] || character),
)

const cleanText = (value: unknown, max = 500) =>
  String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max)

const validEmail = (value: unknown) => {
  const email = cleanText(value, 254).toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ''
}

const renderHtml = (source: string, variables: JsonRecord) => source.replace(
  /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g,
  (_match, key) => escapeHtml(variables[key] ?? ''),
)

const renderText = (source: string, variables: JsonRecord) => cleanText(source.replace(
  /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g,
  (_match, key) => cleanText(variables[key] ?? '', 500),
), 240)

const emailFrame = (content: string, preheader = '') => `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="dark">
    <title>Perfect Models Management</title>
  </head>
  <body style="margin:0;background:#09090b;font-family:Arial,Helvetica,sans-serif;color:#f4efe6">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>` : ''}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#09090b;padding:28px 12px">
      <tr><td align="center">
        <table role="presentation" width="620" cellspacing="0" cellpadding="0" style="width:100%;max-width:620px;background:#111114;border:1px solid #363027">
          <tr>
            <td style="padding:30px 34px;border-bottom:1px solid #363027">
              <table role="presentation" width="100%"><tr>
                <td style="color:#d2ad65;font-family:Georgia,serif;font-size:29px;letter-spacing:-1px">PMM</td>
                <td align="right" style="color:#bdb5a8;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase">Libreville · Gabon</td>
              </tr></table>
            </td>
          </tr>
          <tr><td style="padding:42px 34px;font-size:15px;line-height:1.8;color:#e9e2d8">${content}</td></tr>
          <tr>
            <td style="padding:24px 34px;border-top:1px solid #363027;color:#898177;font-size:11px;line-height:1.7">
              Perfect Models Management<br>
              <a href="https://www.perfectmodels.online" style="color:#d2ad65;text-decoration:none">perfectmodels.online</a>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`

function configuredSecretKeys() {
  const values: string[] = []
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (legacy) values.push(legacy)
  try {
    const parsed = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}')
    values.push(...Object.values(parsed).filter((value): value is string => typeof value === 'string'))
  } catch {
    // A malformed optional key map must not disable the legacy service key.
  }
  return [...new Set(values)]
}

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 65_536) return json({ error: 'Payload too large' }, 413)

  const secretKeys = configuredSecretKeys()
  const suppliedKey = request.headers.get('apikey') || ''
  if (!suppliedKey || !secretKeys.includes(suppliedKey)) return json({ error: 'Unauthorized' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || secretKeys[0] || ''
  const brevoKey = Deno.env.get('BREVO_API_KEY') || ''
  if (!supabaseUrl || !serviceKey || !brevoKey) return json({ error: 'Email service unavailable' }, 503)

  const body = await request.json().catch(() => null) as JsonRecord | null
  const templateKey = cleanText(body?.templateKey, 120)
  const recipients = Array.isArray(body?.to) ? body.to.slice(0, 25) : []
  const variables = body?.variables && typeof body.variables === 'object' && !Array.isArray(body.variables)
    ? body.variables as JsonRecord
    : {}
  const metadata = body?.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
    ? body.metadata as JsonRecord
    : {}
  const idempotencyBase = cleanText(body?.idempotencyKey, 240)
  if (!templateKey || !recipients.length) return json({ error: 'Template and recipients are required' }, 400)

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('template_key,subject,preheader,html_content,is_active')
    .eq('template_key', templateKey)
    .eq('is_active', true)
    .maybeSingle()
  if (templateError || !template) return json({ error: 'Template unavailable' }, 404)

  const replyToEmail = validEmail((body?.replyTo as JsonRecord | undefined)?.email)
  const replyToName = cleanText((body?.replyTo as JsonRecord | undefined)?.name, 120)
  const results: JsonRecord[] = []

  for (const recipient of recipients) {
    const entry = recipient && typeof recipient === 'object' ? recipient as JsonRecord : {}
    const email = validEmail(entry.email)
    const name = cleanText(entry.name, 120)
    if (!email) continue

    const renderedVariables = { ...variables, email, name: variables.name ?? name }
    const subject = renderText(String(template.subject || ''), renderedVariables)
    const htmlContent = emailFrame(
      renderHtml(String(template.html_content || ''), renderedVariables),
      renderText(String(template.preheader || ''), renderedVariables),
    )
    const idempotencyKey = idempotencyBase
      ? await digest(`${idempotencyBase}:${templateKey}:${email}`)
      : null

    let log: { id: string; status: string; attempt_count: number; last_attempt_at: string } | null = null
    const queuedAt = new Date().toISOString()
    const { data: inserted, error: insertError } = await supabase
      .from('email_delivery_log')
      .insert({
        template_key: templateKey,
        recipient_email: email,
        recipient_name: name || null,
        subject,
        provider: 'brevo',
        status: 'queued',
        metadata,
        idempotency_key: idempotencyKey,
        last_attempt_at: queuedAt,
      })
      .select('id,status,attempt_count,last_attempt_at')
      .single()

    if (!insertError) {
      log = inserted
    } else if (idempotencyKey && insertError.code === '23505') {
      const { data: existing } = await supabase
        .from('email_delivery_log')
        .select('id,status,attempt_count,last_attempt_at,provider_message_id')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle()
      const isStale = existing?.last_attempt_at
        ? Date.now() - new Date(existing.last_attempt_at).getTime() > 10 * 60 * 1000
        : true
      if (existing && (existing.status === 'failed' || (existing.status === 'queued' && isStale)) && existing.attempt_count < 20) {
        const { data: retry } = await supabase
          .from('email_delivery_log')
          .update({
            status: 'queued',
            error_message: null,
            attempt_count: existing.attempt_count + 1,
            last_attempt_at: queuedAt,
          })
          .eq('id', existing.id)
          .eq('last_attempt_at', existing.last_attempt_at)
          .select('id,status,attempt_count,last_attempt_at')
          .maybeSingle()
        log = retry
      } else if (existing) {
        results.push({ email, ok: existing.status === 'sent', duplicate: true, status: existing.status })
        continue
      }
    }

    if (!log) {
      results.push({ email, ok: false, error: 'Delivery log unavailable' })
      continue
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json', 'api-key': brevoKey },
        body: JSON.stringify({
          sender: {
            name: 'Perfect Models Management',
            email: validEmail(Deno.env.get('EMAIL_FROM') || Deno.env.get('DEFAULT_FROM_EMAIL')) || 'contact@perfectmodels.online',
          },
          to: [{ email, ...(name ? { name } : {}) }],
          subject,
          htmlContent,
          ...(replyToEmail ? { replyTo: { email: replyToEmail, ...(replyToName ? { name: replyToName } : {}) } } : {}),
        }),
        signal: AbortSignal.timeout(15_000),
      })
      const providerResult = await response.json().catch(() => ({})) as JsonRecord
      if (!response.ok) throw new Error(cleanText(providerResult.message || `Brevo ${response.status}`, 500))

      const messageId = cleanText(providerResult.messageId, 240) || null
      await supabase.from('email_delivery_log').update({
        status: 'sent',
        provider_message_id: messageId,
        sent_at: new Date().toISOString(),
      }).eq('id', log.id)
      results.push({ email, ok: true, messageId })
    } catch (error) {
      const message = cleanText(error instanceof Error ? error.message : error, 1000)
      await supabase.from('email_delivery_log').update({
        status: 'failed',
        error_message: message,
      }).eq('id', log.id)
      results.push({ email, ok: false, error: message })
    }
  }

  const delivered = results.filter((result) => result.ok === true).length
  return json(
    { ok: delivered > 0, delivered, attempted: results.length, results },
    delivered > 0 ? 200 : 502,
  )
})
