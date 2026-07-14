/* ────────────────────────────────────────────────────────────
   Имейл темплейт за известие при ново запитване (към екипа).
   Table-based + inline стилове за максимална съвместимост
   (Gmail, Apple Mail, Outlook). Без външни ресурси.
   ──────────────────────────────────────────────────────────── */

export function escapeHtml(text) {
  if (text == null) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function formatList(value) {
  if (Array.isArray(value)) return value.map(String).join(', ') || '—'
  return value ? String(value) : '—'
}

function sentAtLabel() {
  try {
    return new Date().toLocaleString('bg-BG', {
      timeZone: 'Europe/Sofia',
      dateStyle: 'long',
      timeStyle: 'short',
    })
  } catch {
    return new Date().toISOString()
  }
}

/**
 * Изгражда съдържанието на имейла от данните на формата.
 * @param {object} data - данните от формата
 * @param {object} [opts] - { spamNote?: string } — предупреждение, ако reCAPTCHA е съмнителна
 * @returns {{ html: string, text: string, subject: string }}
 */
export function buildInquiryEmail(data = {}, opts = {}) {
  const { brandType, brandName, focus, goals, period, needs, budget, name, email, phone, site } = data
  const spamNote = opts.spamNote ? String(opts.spamNote) : ''

  const displayName = String(name || '').trim() || 'Клиент'
  const sentAt = sentAtLabel()

  // Предупредителна лента (само ако reCAPTCHA е маркирала заявката като съмнителна)
  const spamWarningHtml = spamNote
    ? `
          <tr>
            <td style="padding:12px 20px;background-color:#FFF4E5;border-bottom:1px solid #FCE2BD;">
              <span style="font-size:13px;color:#B45309;font-weight:600;">&#9888;&nbsp; Възможен спам: ${escapeHtml(spamNote)}. Прегледайте внимателно.</span>
            </td>
          </tr>`
    : ''

  // Сурови стойности (за текстовата версия) + подредба на редовете
  const rawDetails = [
    ['Дейност', brandName ? String(brandName) : '—'],
    ['Тип бранд', brandType ? String(brandType) : '—'],
    ['Фокус', formatList(focus)],
    ['Цели', formatList(goals)],
    ['Период', period ? String(period) : '—'],
    ['Услуги', formatList(needs)],
    ['Бюджет', budget ? String(budget) : '—'],
  ]

  const detailRows = rawDetails
    .map(([label, value], i) => {
      const border = i < rawDetails.length - 1 ? 'border-bottom:1px solid #eef0f2;' : ''
      return `
              <tr>
                <td style="padding:12px 16px;${border}font-size:13px;color:#6b7280;font-weight:500;vertical-align:top;width:36%;">${escapeHtml(label)}</td>
                <td style="padding:12px 16px;${border}font-size:14px;color:#111827;font-weight:600;vertical-align:top;">${escapeHtml(value)}</td>
              </tr>`
    })
    .join('')

  const safeName = escapeHtml(displayName)
  const safeEmail = escapeHtml(email)
  const safePhone = escapeHtml(phone)
  const safeSite = escapeHtml(site)

  const preheader = escapeHtml(`Ново запитване от ${displayName} · ${formatList(needs)} · ${budget || ''}`)

  const html = `<!DOCTYPE html>
<html lang="bg" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Ново запитване</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background-color:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e9eaec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a1a;padding:26px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">
                    Just Pablo <span style="color:#DC2626;">&bull;</span>
                    <span style="font-size:11px;font-weight:600;letter-spacing:0.18em;color:#9ca3af;">DIGITAL</span>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background-color:#DC2626;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.08em;padding:6px 13px;border-radius:999px;">НОВО ЗАПИТВАНЕ</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
${spamWarningHtml}
          <!-- Contact hero -->
          <tr>
            <td style="padding:30px 32px 4px;">
              <div style="font-size:13px;color:#6b7280;font-weight:500;margin-bottom:6px;">Ново запитване от</div>
              <div style="font-size:26px;font-weight:800;color:#111827;letter-spacing:-0.02em;line-height:1.2;">${safeName}</div>
            </td>
          </tr>

          <!-- Contact chips -->
          <tr>
            <td style="padding:18px 32px 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 0 12px;">
                    <div style="font-size:12px;color:#9ca3af;margin-bottom:2px;">Имейл</div>
                    ${email ? `<a href="mailto:${safeEmail}" style="font-size:15px;color:#DC2626;font-weight:600;text-decoration:none;">${safeEmail}</a>` : `<span style="font-size:15px;color:#9ca3af;">Не е посочен</span>`}
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 12px;">
                    <div style="font-size:12px;color:#9ca3af;margin-bottom:2px;">Телефон</div>
                    ${phone ? `<a href="tel:${safePhone}" style="font-size:15px;color:#111827;font-weight:600;text-decoration:none;">${safePhone}</a>` : `<span style="font-size:15px;color:#9ca3af;">Не е посочен</span>`}
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 4px;">
                    <div style="font-size:12px;color:#9ca3af;margin-bottom:2px;">Сайт / бизнес</div>
                    <span style="font-size:15px;color:#111827;font-weight:600;">${safeSite || 'Не е посочен'}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reply button -->
          <tr>
            <td style="padding:20px 32px 26px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="#DC2626" style="border-radius:10px;">
                    <a href="mailto:${safeEmail}" style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">&#9993;&nbsp;&nbsp;Отговори на клиента</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 32px;"><div style="height:1px;line-height:1px;font-size:0;background-color:#eef0f2;">&nbsp;</div></td></tr>

          <!-- Details -->
          <tr>
            <td style="padding:26px 32px 10px;">
              <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;color:#9ca3af;text-transform:uppercase;margin-bottom:14px;">Детайли за проекта</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fafafa;border:1px solid #eef0f2;border-radius:12px;">
                ${detailRows}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:22px 32px 30px;">
              <div style="font-size:12px;color:#9ca3af;line-height:1.6;">
                Изпратено автоматично от контактната форма на <span style="color:#6b7280;font-weight:700;">Just&nbsp;Pablo</span><br>
                ${escapeHtml(sentAt)}
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const textContent = [
    'НОВО ЗАПИТВАНЕ ОТ JUST PABLO',
    ...(spamNote ? [`⚠ ВЪЗМОЖЕН СПАМ: ${spamNote}. Прегледайте внимателно.`] : []),
    '',
    `Име: ${displayName}`,
    `Имейл: ${email || 'Не е посочен'}`,
    `Телефон: ${phone || 'Не е посочен'}`,
    `Сайт/бизнес: ${site || 'Не е посочен'}`,
    '',
    '— Детайли за проекта —',
    ...rawDetails.map(([label, value]) => `${label}: ${value}`),
    '',
    `Изпратено: ${sentAt}`,
  ].join('\n')

  return {
    html,
    text: textContent,
    subject: `Ново запитване от ${displayName}`,
  }
}
