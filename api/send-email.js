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
const BLOCKED_EMAILS = [
  'rudo@ruko.ru',
  'asdasdasds@kuku.gs',
  // Вълната от 10.08.2026 (виждат се в Resend: bounce-нали потвърждения):
  'vaq@gmail.com',
  'mini@mail.ru',
  'face@mail.ru',
]
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

/* ── Структурна проверка ─────────────────────────────────────
   Реалната форма е wizard с фиксирани опции: brandType, period и budget
   са задължителни стъпки и стойностите им идват само от бутоните в
   ScrollWizard.tsx. Генеричният форм-спам (name/email/message) няма как
   да ги уцели. Несъответствието е БЕЛЕЖКА към екипа, не блок: списъците
   тук са копие на клиентските и при разминаване след редизайн (напр.
   стар запазен прогрес с етикети отпреди смяна на цените) реален клиент
   не бива да пострада. Ботовете без токен така или иначе спират по-рано.

   При промяна на опциите в ScrollWizard.tsx — обнови и тук. Дрейфът е
   безопасен (само шум в бележките), затова не е изнесено в общ модул. */
const FORM_OPTIONS = {
  brandType: ['Съществуващ бранд', 'Стартиращ бранд', 'Личен проект / Инфлуенсър'],
  period: ['3 месеца', '6 месеца', '1 година', '2+ години'],
  budget: ['До 500 €', '500 – 1500 €', '1500 – 2500 €', '2500 – 5000 €', 'Над 5000 €'],
  focus: ['Услуга/и', 'Продукт/и собствено производство', 'Търговия или дистрибуция', 'Друго'],
  goals: ['Разпознаваемост', 'Продажби', 'Абонаменти', 'Подготовка за експанзия', 'Друго'],
  needs: ['Нов уебсайт', 'SEO и GEO (видимост в AI)', 'Онлайн реклама', 'Брандинг и дизайн', 'Социални мрежи и видео'],
}

function structureNote(body) {
  const issues = []
  for (const key of ['brandType', 'period', 'budget']) {
    if (!body[key]) issues.push(`липсва ${key}`)
    else if (!FORM_OPTIONS[key].includes(body[key])) issues.push(`${key} извън опциите`)
  }
  for (const key of ['focus', 'goals', 'needs']) {
    const list = body[key]
    if (Array.isArray(list) && list.some((v) => !FORM_OPTIONS[key].includes(v))) {
      issues.push(`${key} извън опциите`)
    }
  }
  // Линк в името е класика при спам; полето site легитимно съдържа URL.
  if (/https?:\/\//i.test(String(body.name || ''))) issues.push('URL в името')
  return issues.length ? `подозрителна структура: ${issues.join(', ')}` : null
}

/* Под колко милисекунди попълване е физически неправдоподобно за човек.
   Стойността идва от клиента и е фалшифицируема — затова е бележка. */
const MIN_FILL_MS = 5000

function fillTimeNote(raw) {
  const ms = Number(raw.formElapsedMs)
  if (!Number.isFinite(ms) || ms < 0) return null
  return ms < MIN_FILL_MS ? `формата е попълнена за ${(ms / 1000).toFixed(1)}s` : null
}

/* Honeypot: скрито поле „fax" в контактната стъпка, което човек не вижда.
   Стойност в него = автопопълване — но НЕ само от ботове: LastPass/RoboForm
   профилите и Safari Contact AutoFill имат поле Fax и могат да го попълнят
   на РЕАЛЕН клиент (прегледът от 10.08.2026 го потвърди). Затова honeypot-ът
   е БЕЛЕЖКА, не тихо изхвърляне: запитване на човек с password manager не
   бива да изчезва зад екран „Благодарим!". Ботът с валиден токен + honeypot
   пристига видимо маркиран, човекът преценява.
   != null + String(): typeof-проверка се заобикаля с fax: 123 / ["x"]. */
function honeypotNote(raw) {
  return raw.fax != null && String(raw.fax).trim() ? 'honeypot (fax) попълнен' : null
}

/* ── Cloudflare Turnstile ────────────────────────────────────
   Замести reCAPTCHA v3. Turnstile е pass/fail — няма score, което
   маха цялата настройка на прагове: или токенът е валиден, или не е.

   Три изхода, защото „бот" и „човек с блокер" не са едно и също:

     block — липсващ токен, или токен, който Cloudflare отхвърля
             (подправен, изтекъл, вече използван), или дошъл от чужд домейн.
     flag  — липсващ токен при TURNSTILE_REQUIRE_TOKEN=false — минава
             с бележка. Това беше подразбирането до 10.08.2026, когато
             целият спам се оказа точно тук: ботове, POST-ващи директно
             към API-то без изобщо да зареждат Turnstile. Затова сега
             липсващият токен по подразбиране е block, а env-ът е
             аварийният изход, ако защитата почне да реже реални клиенти.
     allow — чист токен, или наша конфигурационна грешка / паднал
             Cloudflare — никога не наказваме клиента за това.

   Блокираните получават ЯСНА грешка, не тихо „успех": формата показва
   резервния канал, така че сгрешено блокиран човек има как да се свърже.
   Пазят се и в CRM базата (статус „спам"), за да се вижда колко и кого
   режем — единственият начин да се хване прекалено строга защита.
   ──────────────────────────────────────────────────────────── */
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const TURNSTILE_ALLOWED_HOSTS = ['just-pablo.com', 'www.just-pablo.com']

async function assessCaptcha(token, remoteip) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  // Строг режим по подразбиране; TURNSTILE_REQUIRE_TOKEN=false го отпуска.
  const requireToken = process.env.TURNSTILE_REQUIRE_TOKEN !== 'false'

  if (!secret) {
    /* Fail-open, но ВИДИМ: без secret не наказваме клиента (формата работи),
       ала всяко писмо пристига с крещяща бележка и без потвърждение към
       подателя — иначе изгубеният env връща тихо целия спам канал. */
    console.error('[send-email] TURNSTILE_SECRET_KEY липсва — формата е БЕЗ защита от ботове.')
    return { verdict: 'flag', note: 'TURNSTILE_SECRET_KEY липсва — captcha-та НЕ е проверена' }
  }

  if (!token) {
    return requireToken
      ? { verdict: 'block', note: 'липсващ Turnstile токен' }
      : { verdict: 'flag', note: 'без Turnstile токен (блокер или бот)' }
  }

  let data
  try {
    // Clamp: Turnstile токените са до ~2 KB; мегабайтов „токен" не бива да
    // пътува до Cloudflare на всяка заявка.
    const body = new URLSearchParams({ secret, response: String(token).slice(0, 2048) })
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

  /* siteverify връща action-а, зададен при render (src/lib/turnstile.ts).
     Токен с ДРУГ action е минтван за друг контекст → block. Празен action
     се допуска: стар кеширан бъндъл отпреди добавянето му минтва без action,
     а edge кешът е доказано сервирал HTML с часове (виж infra бележката). */
  if (data.action && data.action !== 'submit_inquiry') {
    return { verdict: 'block', note: `Turnstile action не съвпада (${data.action})` }
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
      // В базата със статус „спам" — за видимост дали не режем реални хора.
      await saveLead(body, { status: 'spam', spamNote: rc.note, ip: clientIp(req) })
      return res.status(403).json({
        success: false,
        error: 'Проверката за сигурност не премина. Ако ползвате блокер на реклами, изключете го и опитайте отново — или ни пишете директно на adsjustpablo@gmail.com.',
      })
    }
    if (rc.verdict === 'flag') console.warn('[send-email] съмнителна заявка:', rc.note)

    /* Меките сигнали не блокират поотделно — събират се в обща бележка,
       която отива в имейла и в CRM записа, за преглед от човек. */
    const spamNote = [rc.note, honeypotNote(raw), structureNote(body), fillTimeNote(raw)].filter(Boolean).join('; ') || null
    if (spamNote) console.warn('[send-email] бележки по заявката:', spamNote, '|', normalizeEmail(email))

    // В базата — преди изпращането, за да не зависи от успеха на Resend.
    await saveLead(body, { status: 'new', spamNote, ip: clientIp(req) })

    const teamEmail = buildInquiryEmail(body, { spamNote })

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
       вече е стигнало до екипа и не бива да показваме грешка на клиента.

       При КАКВАТО И ДА Е бележка (без токен в отпуснат режим, счупена
       структура, светкавично попълване) потвърждение НЕ се праща: ботовете
       пишат фалшиви адреси, тези писма bounce-ват и потъват репутацията на
       домейна (към 10.08.2026 — 31% bounce в Resend, изтровен от точно това).
       Реалният клиент при съмнение просто не получава потвърждение —
       запитването му при всички случаи е у екипа. */
    const clientReplyTo = process.env.CLIENT_REPLY_TO || DEFAULT_CLIENT_REPLY_TO
    if (spamNote) {
      console.warn('[send-email] потвърждението е пропуснато заради бележки:', normalizeEmail(email))
      return res.status(200).json({ success: true })
    }
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
