import { Resend } from 'resend'
import { buildInquiryEmail } from './email-template.js'

function parseBody(req) {
  if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString())
  if (typeof req.body === 'string') return JSON.parse(req.body)
  return req.body || {}
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

    const { html: htmlContent, text: textContent, subject } = buildInquiryEmail(body)

    const recipients = [
      process.env.TO_EMAIL_PRIMARY,
      process.env.TO_EMAIL_SECONDARY,
    ].filter(Boolean)

    if (!recipients.length) {
      return res.status(500).json({ success: false, error: 'No recipients configured' })
    }

    const fromAddress = process.env.FROM_EMAIL || 'JustPablo <onboarding@resend.dev>'
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
