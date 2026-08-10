/* ────────────────────────────────────────────────────────────
   Cloudflare Turnstile (invisible) — зарежда скрипта лениво и връща
   token при изпращане на формата. Бекендът го верифицира.

   Замести reCAPTCHA v3, защото:
   • няма плаваща значка и няма изискване за надпис във формата
     (invisible режимът иска само препратка в политиката за
     поверителност — тя е в src/legal/poveritelnost.tsx);
   • безплатен и без лимит, а домейнът вече минава през Cloudflare.

   Site key-ът е публичен — това е нормално, тайната е само secret key-ът
   на сървъра.
   ──────────────────────────────────────────────────────────── */

const SITE_KEY = '0x4AAAAAAECsYDTi8Gj3l1lQ'
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

type TurnstileOptions = {
  sitekey: string
  callback: (token: string) => void
  'error-callback': () => void
  'timeout-callback': () => void
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: TurnstileOptions) => string | undefined
      remove: (widgetId: string) => void
    }
  }
}

let loadPromise: Promise<void> | null = null

export function loadTurnstile(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile?.render) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = new Promise<void>((resolve, reject) => {
    /* При провал: маха се и скриптът, и кешираният promise — иначе едно
       временно недостъпно challenges.cloudflare.com (мрежов blip, блокер,
       изключен впоследствие) отравя ВСЕКИ следващ опит до пълен reload:
       loadTurnstile() би връщал завинаги същото rejected promise, а
       „вторият опит" при submit би бил фиктивен. */
    const fail = (script: HTMLScriptElement) => {
      script.remove()
      loadPromise = null
      reject(new Error('Turnstile failed to load'))
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => fail(existing))
      return
    }
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    s.dataset.turnstile = 'true'
    s.onload = () => resolve()
    s.onerror = () => fail(s)
    document.head.appendChild(s)
  })
  return loadPromise
}

/**
 * Връща еднократен token, или null ако Turnstile не е достъпна
 * (блокер, мрежа, изтекло време). Никога не хвърля — трекингът и
 * защитата не бива да чупят изпращането на формата.
 *
 * Token-ите са за еднократна употреба и изтичат, затова се вика при
 * всяко изпращане, а не веднъж при зареждане.
 */
export async function getTurnstileToken(): Promise<string | null> {
  try {
    await loadTurnstile()
    const turnstile = window.turnstile
    if (!turnstile?.render) return null

    // Invisible widget-ът пак иска контейнер, в който да се рендира.
    const host = document.createElement('div')
    host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'
    host.setAttribute('aria-hidden', 'true')
    document.body.appendChild(host)

    return await new Promise<string | null>((resolve) => {
      let settled = false

      const finish = (token: string | null) => {
        if (settled) return
        settled = true
        /* Cleanup-ът е отложен нарочно: callback-ът може да се задейства
           синхронно ВЪТРЕ в render(), тоест преди widgetId да е присвоен.
           setTimeout гарантира, че четенето му става чак след като
           render() е върнал — иначе remove() би получил undefined. */
        setTimeout(() => {
          if (widgetId) { try { turnstile.remove(widgetId) } catch { /* вече е махнат */ } }
          host.remove()
        }, 0)
        resolve(token)
      }

      const widgetId = turnstile.render(host, {
        sitekey: SITE_KEY,
        callback: (token) => finish(token),
        'error-callback': () => finish(null),
        'timeout-callback': () => finish(null),
      })

      if (widgetId === undefined) finish(null)
    })
  } catch {
    return null
  }
}
