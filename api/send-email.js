import { Resend } from 'resend'
import { buildInquiryEmail, buildClientConfirmation } from './email-template.js'

/* Адрес, на който клиентът може да отговори на потвърждението. Домейнът
   just-pablo.com няма MX записи, така че from-адресът НЕ приема поща —
   Reply-To трябва да сочи към реална кутия, иначе отговорите се губят. */
const DEFAULT_CLIENT_REPLY_TO = 'adsjustpablo@gmail.com'

const MAX_FIELD_LENGTH = 500
const MAX_LIST_ITEMS = 20

/* Best-effort rate limiting на ниво „топъл" инстанс. Serverless инстансите са
   много и се рециклират, така че това НЕ е желязна защита — но спира най-грубия
   flood от един IP. За твърда защита: Vercel KV / Upstash. */
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 5
const rateHits = new Map()

function clientIp(req) {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff) return xff.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

function isRateLimited(ip) {
  const now = Date.now()
  const recent = (rateHits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS)
  recent.push(now)
  rateHits.set(ip, recent)
  if (rateHits.size > 5000) rateHits.clear() // предпазен клапан срещу неограничен растеж
  return recent.length > RATE_MAX
}

function parseBody(req) {
  if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString())
  if (typeof req.body === 'string') return JSON.parse(req.body)
  return req.body || {}
}

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim())

/* Формата е публична — ограничаваме дължините, за да не се озове мегабайтов
   низ в имейла. Реже се тихо: не бива валидно запитване да пропадне заради
   твърде дълъг отговор. */
function clamp(value) {
  if (Array.isArray(value)) return value.slice(0, MAX_LIST_ITEMS).map(clamp)
  if (value == null) return value
  return String(value).trim().slice(0, MAX_FIELD_LENGTH)
}

function sanitizeBody(body) {
  const fields = ['brandType', 'brandName', 'focus', 'goals', 'period', 'needs', 'budget', 'name', 'email', 'phone', 'site', 'socials']
  const out = {}
  for (const key of fields) {
    if (body[key] !== undefined) out[key] = clamp(body[key])
  }
  return out
}

/* Google reCAPTCHA v3 — оценяваме, но НЕ блокираме. Целта е да не губим
   реални клиенти: винаги приемаме заявката, а само маркираме съмнителните
   (провалена проверка / нисък score) с бележка в имейла.
   Липсващ token (напр. блокер), липсващ secret или мрежов проблем НЕ се
   третират като спам — за да не наказваме легитимни хора. */
async function assessRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  const minScore = Number(process.env.RECAPTCHA_MIN_SCORE || '0.5')

  if (!secret || !token) return { suspicious: false, note: null }

  try {
    const params = new URLSearchParams({ secret, response: String(token) })
    const resp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
    const data = await resp.json()
    if (!data.success) {
      const codes = (data['error-codes'] || []).join(', ') || 'unknown'
      return { suspicious: true, note: `reCAPTCHA не премина (${codes})` }
    }
    if (typeof data.score === 'number' && data.score < minScore) {
      return { suspicious: true, note: `нисък reCAPTCHA score (${data.score})` }
    }
    return { suspicious: false, note: null, score: data.score }
  } catch (err) {
    console.error('reCAPTCHA verify error:', err)
    return { suspicious: false, note: null }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  if (isRateLimited(clientIp(req))) {
    return res.status(429).json({ success: false, error: 'Твърде много заявки. Опитайте отново след няколко минути.' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('Missing RESEND_API_KEY environment variable')
    return res.status(500).json({ success: false, error: 'Email service is not configured' })
  }

  try {
    const raw = parseBody(req)
    const body = sanitizeBody(raw)
    const { name, email } = body

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Име и имейл са задължителни.' })
    }
    if (!isEmail(email)) {
      return res.status(400).json({ success: false, error: 'Моля, въведете валиден имейл адрес.' })
    }

    // reCAPTCHA само маркира съмнителните — никога не блокира (за да не губим клиенти).
    const rc = await assessRecaptcha(raw.recaptchaToken)
    if (rc.suspicious) console.warn('reCAPTCHA маркира заявка като съмнителна:', rc.note)

    const teamEmail = buildInquiryEmail(body, { spamNote: rc.note })

    const recipients = [
      process.env.TO_EMAIL_PRIMARY,
      process.env.TO_EMAIL_SECONDARY,
    ].filter(Boolean)

    if (!recipients.length) {
      console.error('Missing TO_EMAIL_PRIMARY / TO_EMAIL_SECONDARY environment variables')
      return res.status(500).json({ success: false, error: 'Email service is not configured' })
    }

    const fromAddress = process.env.FROM_EMAIL || 'Just Pablo <zapitvane@just-pablo.com>'
    const resend = new Resend(apiKey)

    /* Едно писмо до всички получатели (не по едно на човек) — така екипът има
       общ thread и Reply-All стига до колегите, вместо да се дублират кутии. */
    try {
      const { error } = await resend.emails.send({
        from: fromAddress,
        to: recipients,
        subject: teamEmail.subject,
        html: teamEmail.html,
        text: teamEmail.text,
        // Полето на SDK-а е replyTo (camelCase); reply_to се игнорира тихо.
        replyTo: email,
      })
      if (error) throw new Error(error.message || 'Resend rejected the notification')
    } catch (err) {
      console.error('[send-email] известието към екипа се провали:', err)
      return res.status(500).json({ success: false, error: 'Email sending failed' })
    }

    /* Потвърждението към клиента е второстепенно: ако то се провали, запитването
       вече е стигнало до екипа и не бива да показваме грешка на клиента. */
    const clientReplyTo = process.env.CLIENT_REPLY_TO || DEFAULT_CLIENT_REPLY_TO
    try {
      const confirmation = buildClientConfirmation(body, { replyTo: clientReplyTo })
      const { error } = await resend.emails.send({
        from: fromAddress,
        to: email,
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
        replyTo: clientReplyTo,
      })
      if (error) throw new Error(error.message || 'Resend rejected the confirmation')
    } catch (err) {
      console.error('[send-email] потвърждението към клиента се провали:', err)
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    // Подробностите остават в лога — навън не изтичат вътрешни съобщения.
    console.error('[send-email] неочаквана грешка:', error)
    return res.status(500).json({ success: false, error: 'Неуспешно изпращане. Моля, опитайте отново.' })
  }
}
