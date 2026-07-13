import { Resend } from 'resend'
import { buildInquiryEmail } from './email-template.js'

function parseBody(req) {
  if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString())
  if (typeof req.body === 'string') return JSON.parse(req.body)
  return req.body || {}
}

/* Google reCAPTCHA v3 проверка. Ако RECAPTCHA_SECRET_KEY не е зададен,
   пропускаме (формата продължава да работи), но логваме предупреждение. */
async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  const minScore = Number(process.env.RECAPTCHA_MIN_SCORE || '0.5')

  if (!secret) {
    console.warn('RECAPTCHA_SECRET_KEY не е зададен — пропускам reCAPTCHA проверката')
    return { ok: true, skipped: true }
  }
  if (!token) return { ok: false, reason: 'missing-token' }

  try {
    const params = new URLSearchParams({ secret, response: String(token) })
    const resp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
    const data = await resp.json()
    if (!data.success) return { ok: false, reason: 'verify-failed', errors: data['error-codes'] }
    if (typeof data.score === 'number' && data.score < minScore) {
      return { ok: false, reason: 'low-score', score: data.score }
    }
    return { ok: true, score: data.score }
  } catch (err) {
    // Мрежов проблем към Google — не блокираме легитимен потребител.
    console.error('reCAPTCHA verify error:', err)
    return { ok: true, error: true }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('Missing RESEND_API_KEY environment variable')
    return res.status(500).json({ success: false, error: 'Email service is not configured' })
  }

  try {
    const body = parseBody(req)
    const { name, email } = body

    if (!name || !String(name).trim() || !email || !String(email).trim()) {
      return res.status(400).json({ success: false, error: 'Име и имейл са задължителни.' })
    }

    const gate = await verifyRecaptcha(body.recaptchaToken)
    if (!gate.ok) {
      console.warn('reCAPTCHA отхвърли заявка:', gate)
      return res.status(400).json({ success: false, error: 'Проверката за сигурност не бе успешна. Моля, опитайте отново.' })
    }

    const { html: htmlContent, text: textContent, subject } = buildInquiryEmail(body)

    const recipients = [
      process.env.TO_EMAIL_PRIMARY,
      process.env.TO_EMAIL_SECONDARY,
    ].filter(Boolean)

    if (!recipients.length) {
      return res.status(500).json({ success: false, error: 'No recipients configured' })
    }

    const fromAddress = process.env.FROM_EMAIL || 'Just Pablo <zapitvane@just-pablo.com>'
    console.log('[send-email] from:', fromAddress, '| to:', recipients, '| FROM_EMAIL set:', Boolean(process.env.FROM_EMAIL))
    const resend = new Resend(apiKey)

    const results = await Promise.allSettled(
      recipients.map((to) =>
        resend.emails.send({
          from: fromAddress,
          to,
          subject,
          html: htmlContent,
          text: textContent,
          reply_to: email || undefined,
        })
      )
    )

    const failures = results.filter((r) => r.status === 'rejected')
    if (failures.length === results.length) {
      const messages = failures.map((f) => (f.reason instanceof Error ? f.reason.message : String(f.reason)))
      console.error('Resend send failed:', messages)
      return res.status(500).json({ success: false, error: messages[0] || 'Email sending failed' })
    }

    return res.status(200).json({ success: true, data: results })
  } catch (error) {
    console.error('Resend error:', error)
    return res.status(500).json({ success: false, error: error.message || 'Unexpected error' })
  }
}
