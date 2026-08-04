/* Запис на запитвания от публичната форма в таблицата leads.
   Извиква се best-effort от send-email.js — грешките се хващат там. */
import { sql } from './db.js'

/* body е вече санитизираният обект от send-email.js (camelCase ключове).
   JSON полетата (focus/goals/needs) пристигат като масиви. */
export async function insertLead(body, { ip = null, spamNote = null, status = 'new', source = 'form' } = {}) {
  await sql`
    INSERT INTO leads (
      name, email, phone, site, socials,
      brand_type, brand_name, focus, goals, needs, period, budget,
      status, source, ip, spam_note
    ) VALUES (
      ${String(body.name || '')}, ${String(body.email || '')},
      ${body.phone || null}, ${body.site || null}, ${body.socials || null},
      ${body.brandType || null}, ${body.brandName || null},
      ${JSON.stringify(body.focus || [])}, ${JSON.stringify(body.goals || [])}, ${JSON.stringify(body.needs || [])},
      ${body.period || null}, ${body.budget || null},
      ${status}, ${source}, ${ip}, ${spamNote}
    )
  `
}
