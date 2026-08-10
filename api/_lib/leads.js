/* Запис на запитвания от публичната форма в таблицата leads.
   Извиква се best-effort от send-email.js — грешките се хващат там. */
import { sql } from './db.js'

/* Има ли вече запитване от този имейл в последните N часа (какъвто и да е
   статус — спамър с изхвърлени опити не заслужава нови писма). Сравнява се
   и суровият, и нормализираният адрес (без +суфикс). */
export async function recentLeadExists(rawEmail, normalizedEmail, hours = 24) {
  const { rows } = await sql`
    SELECT 1 FROM leads
    WHERE lower(email) IN (${rawEmail.toLowerCase()}, ${normalizedEmail})
      AND created_at > now() - make_interval(hours => ${hours})
    LIMIT 1
  `
  return rows.length > 0
}

/* Колко запитвания със статус new са записани днес (UTC ден — Resend нулира
   квотата в полунощ UTC). Броят се new, защото само те пращат писма. */
export async function newLeadsToday() {
  const { rows } = await sql`
    SELECT count(*)::int AS n FROM leads
    WHERE status = 'new'
      AND created_at >= date_trunc('day', now() AT TIME ZONE 'utc')
  `
  return rows[0]?.n ?? 0
}

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
