/* ────────────────────────────────────────────────────────────
   Google Analytics 4 — тънка обвивка около gtag.
   Скриптът се зарежда в index.html; тук само изпращаме събития.
   Ако gtag липсва (блокер, още незареден скрипт), извикванията
   мълчат — трекингът никога не бива да чупи формата.
   ──────────────────────────────────────────────────────────── */

type GtagParams = Record<string, string | number | boolean>

declare global {
  interface Window {
    gtag?: (command: 'event', name: string, params?: GtagParams) => void
  }
}

function track(name: string, params?: GtagParams) {
  try {
    window.gtag?.('event', name, params)
  } catch {
    /* трекингът е второстепенен — не пипаме потока на потребителя */
  }
}

/** Клиентът е избрал тип бранд и е влязъл в стъпките. */
export function trackFormStart() {
  track('form_start')
}

/**
 * Завършена стъпка — дава фунията и показва къде отпадат хората.
 * Съдържа само номер и вътрешно име на стъпката, никакви отговори.
 */
export function trackFormStep(step: number, name: string) {
  track('form_step', { step_number: step + 1, step_name: name })
}

/**
 * Успешно изпратено запитване. `generate_lead` е препоръчаното от GA4
 * име — маркирано е като ключово събитие в профила.
 * Нарочно без параметри: бюджетът и услугите не влизат в GA.
 */
export function trackLead() {
  track('generate_lead')
}

/** Изпращането се провали — за да се вижда разликата от „никой не е пробвал". */
export function trackFormError() {
  track('form_error')
}
