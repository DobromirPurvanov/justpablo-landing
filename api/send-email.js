import { Resend } from 'resend'
import { buildInquiryEmail, buildClientConfirmation } from './email-template.js'
import { hasDb } from './_lib/db.js'
import { insertLead } from './_lib/leads.js'

/* Запитванията се пишат и в CRM базата (таблица leads). Best-effort:
   грешка в базата НИКОГА не бива да чупи формата — само се логва. */
async function saveLead(body, meta) {
  if (!hasDb()) return
  try {
    await insertLead(body, meta)
  } catch (err) {
    console.error('[send-email] записът в CRM се провали:', err)
  }
}

/* Адрес, на който клиентът може да отговори на потвърждението. Домейнът
   just-pablo.com няма MX записи, така че from-адресът НЕ приема поща —
   Reply-To трябва да сочи към реална кутия, иначе отговорите се губят. */
const DEFAULT_CLIENT_REPLY_TO = 'adsjustpablo@gmail.com'

const MAX_FIELD_LENGTH = 500
const MAX_LIST_ITEMS = 20

/* ── Блокирани податели ──────────────────────────────────────
   Адреси и домейни, които са пращали само боклук през формата.
   Пази се в кода, за да има история кой кога е бил блокиран.
   За спешно добавяне без коммит: env BLOCKED_EMAILS / BLOCKED_DOMAINS
   (списъци, разделени със запетая).

   Блокираното запитване получава 200 „успех", но НЕ се изпраща нищо —
   нито до екипа, нито потвърждение. Ако върнем грешка, ботът разбира,
   че е хванат, и опитва пак с друг адрес.
   ──────────────────────────────────────────────────────────── */
const BLOCKED_EMAILS = ['rudo@ruko.ru', 'asdasdasds@kuku.gs']
const BLOCKED_DOMAINS = []

function splitEnvList(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

const blockedEmails = new Set([
  ...BLOCKED_EMAILS.map((e) => e.toLowerCase()),
  ...splitEnvList(process.env.BLOCKED_EMAILS),
])
const blockedDomains = new Set([
  ...BLOCKED_DOMAINS.map((d) => d.toLowerCase()),
  ...splitEnvList(process.env.BLOCKED_DOMAINS).map((d) => d.replace(/^@/, '')),
])

/* „ivan+cokolado@gmail.com" и „ivan@gmail.com" стигат до една кутия —
   без това сваляне на суфикса блокирането се заобикаля с един знак. */
function normalizeEmail(value) {
  const email = String(value || '').trim().toLowerCase()
  const at = email.lastIndexOf('@')
  if (at < 1) return email
  const local = email.slice(0, at).split('+')[0]
  return `${local}@${email.slice(at + 1)}`
}

function isBlocked(email) {
  const normalized = normalizeEmail(email)
  if (blockedEmails.has(normalized)) return true
  const domain = normalized.slice(normalized.lastIndexOf('@') + 1)
  return Boolean(domain) && blockedDomains.has(domain)
}

/* Best-effort rate limiting на ниво „топъл" инстанс. Serverless инстансите са
   много и се рециклират, така че това НЕ е желязна защита.

   Истинската защита от flood вече е на edge-а — Cloudflare rate limiting
   правило спира над 5 заявки за 10 секунди от IP, преди изобщо да стигнат
   дотук. Затова този брояч е нарочно хлабав: ролята му е само предпазен
   клапан, ако някой заобиколи edge-а.

   Лимитът брои и неуспешните опити (сгрешен имейл, липсващо име), а зад
   един офисен или мобилен NAT адрес стоят много хора. Твърде стегната
   стойност тук отказва реални клиенти — точно това, което формата не бива
   да прави. */
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 15
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

/* ── Cloudflare Turnstile ────────────────────────────────────
   Замести reCAPTCHA v3. Turnstile е pass/fail — няма score, което
   маха цялата настройка на прагове: или токенът е валиден, или не е.

   Три изхода, защото „бот" и „човек с блокер" не са едно и също:

     block — токен, който Cloudflare отхвърля (подправен, изтекъл,
             вече използван) или дошъл от чужд домейн.
     flag  — липсващ токен. Причината може да е блокер у реален
             клиент, затова минава с бележка. С TURNSTILE_REQUIRE_TOKEN=true
             става блок.
     allow — чист токен, или наша конфигурационна грешка / паднал
             Cloudflare — никога не наказваме клиента за това.

   Блокираните получават ЯСНА грешка, не тихо „успех": формата показва
   резервния канал, така че сгрешено блокиран човек има как да се свърже.
   ──────────────────────────────────────────────────────────── */
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const TURNSTILE_ALLOWED_HOSTS = ['just-pablo.com', 'www.just-pablo.com']

async function assessCaptcha(token, remoteip) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  const requireToken = process.env.TURNSTILE_REQUIRE_TOKEN === 'true'

  if (!secret) {
    // Шумно, защото отвън е неразличимо от работеща защита.
    console.error('[send-email] TURNSTILE_SECRET_KEY липсва — формата е БЕЗ защита от ботове.')
    return { verdict: 'allow', note: null }
  }

  if (!token) {
    return requireToken
      ? { verdict: 'block', note: 'липсващ Turnstile токен' }
      : { verdict: 'flag', note: 'без Turnstile токен (блокер или бот)' }
  }

  let data
  try {
    const body = new URLSearchParams({ secret, response: String(token) })
    if (remoteip && remoteip !== 'unknown') body.set('remoteip', remoteip)
    const resp = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    data = await resp.json()
  } catch (err) {
    console.error('[send-email] Turnstile verify недостъпна:', err)
    return { verdict: 'allow', note: 'Turnstile не можа да бъде проверена' }
  }

  if (!data?.success) {
    const codes = (data?.['error-codes'] || []).join(', ') || 'unknown'
    return { verdict: 'block', note: `Turnstile не премина (${codes})` }
  }

  /* Токен, минтван на друг домейн = преизползван от чужд сайт. */
  if (data.hostname && !TURNSTILE_ALLOWED_HOSTS.includes(data.hostname)) {
    return { verdict: 'block', note: `Turnstile hostname не съвпада (${data.hostname})` }
  }

  return { verdict: 'allow', note: null }
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

    /* Тихо отбиване: отвън изглежда като успешно изпращане, но нищо не тръгва.
       Логва се, за да се вижда обемът във Vercel логовете.

       `delivered: false` е за нас, не за подателя: без него клиентът вижда
       success и праща generate_lead в GA4, тоест блокираният спам щеше да
       се брои като конверсия. Ботът няма причина да гледа това поле — за
       него отговорът си остава „успех". */
    if (isBlocked(email)) {
      console.warn('[send-email] блокиран подател, запитването е отхвърлено:', normalizeEmail(email))
      // Спамът също се пази — с отделен статус, за да се вижда обемът.
      await saveLead(body, { status: 'spam', ip: clientIp(req) })
      return res.status(200).json({ success: true, delivered: false })
    }

    const rc = await assessCaptcha(raw.captchaToken, clientIp(req))
    if (rc.verdict === 'block') {
      console.warn('[send-email] Turnstile отхвърли заявка:', rc.note, '|', normalizeEmail(email))
      return res.status(403).json({
        success: false,
        error: 'Проверката за сигурност не премина. Моля, опитайте отново или ни пишете директно на adsjustpablo@gmail.com.',
      })
    }
    if (rc.verdict === 'flag') console.warn('[send-email] съмнителна заявка:', rc.note)

    // В базата — преди изпращането, за да не зависи от успеха на Resend.
    await saveLead(body, { status: 'new', spamNote: rc.note, ip: clientIp(req) })

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
