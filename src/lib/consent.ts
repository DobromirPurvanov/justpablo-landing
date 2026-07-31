/* ────────────────────────────────────────────────────────────
   Съгласие за бисквитки + Google Consent Mode v2 (GDPR/ePrivacy).

   Как работи:
   • GA4 се зарежда веднага, но с consent default = denied. В това
     състояние gtag НЕ пише бисквитки и НЕ праща идентификатори —
     изпраща само анонимни („cookieless") пингове, от които Google
     моделира трафика. Това е официално поддържаният от Google
     GDPR режим и позволява да мерим и хората, които не са
     натиснали „Приемам".
   • При „Приемам" пращаме consent update = granted и чак тогава
     тръгват бисквитките и Meta Pixel.
   • При „Само необходимите" оставаме на denied — Pixel не се зарежда.

   Важно: consent default трябва да е в dataLayer ПРЕДИ gtag.js да се
   изпълни, иначе първият hit тръгва с бисквитки. Затова редът в
   loadGA() не бива да се разбърква.
   ──────────────────────────────────────────────────────────── */

const KEY = 'jp_cookie_consent'
const GA_ID = 'G-JTNZ4WYG32'
const PIXEL_ID = '1834416007939090'

/** Име на прозоречното събитие, с което футърът отваря банера пак. */
export const OPEN_CONSENT_EVENT = 'jp:open-consent'

type GtagFn = (...args: unknown[]) => void
type FbqFn = {
  (...args: unknown[]): void
  callMethod?: (...args: unknown[]) => void
  queue: unknown[]
  loaded?: boolean
  version?: string
  push?: unknown
}

// Забележка: `gtag` е деклариран в src/lib/analytics.ts — не го предеклараираме
// тук, за да няма конфликт на типове (GtagFn е присвоим на неговия тип).
declare global {
  interface Window {
    dataLayer?: unknown[]
    fbq?: FbqFn
    _fbq?: FbqFn
  }
}

/** Диагностичен режим: `?ga_debug=1` пуска GA4 DebugView и разрешава
    трекинга извън продукцията (localhost, Vercel preview). Пази се за
    сесията, за да преживее вътрешната навигация. */
function debugMode() {
  try {
    if (new URLSearchParams(location.search).get('ga_debug') === '1') {
      sessionStorage.setItem('jp_ga_debug', '1')
    }
    return sessionStorage.getItem('jp_ga_debug') === '1'
  } catch {
    return false
  }
}

/** Трекери се пускат само в реалната продукция — не на Vercel preview/localhost,
    за да не замърсяват данните с трафик от разработка. `?ga_debug=1` вдига
    ограничението, когато трябва да се тества нарочно. */
function isProduction() {
  const host = location.hostname
  return host === 'just-pablo.com' || host === 'www.just-pablo.com' || debugMode()
}

export function consentValue(): 'all' | 'necessary' | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.v === 'all' || parsed?.v === 'necessary' ? parsed.v : null
  } catch {
    return null
  }
}

export function saveConsent(value: 'all' | 'necessary') {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: value, at: new Date().toISOString() }))
  } catch {
    /* private mode — просто не пазим */
  }
}

/**
 * Коя локална страница е заредена: `sofia` | `varna` | `plovdiv` | `burgas`
 * за /sofia и т.н., `general` за началната и правните страници.
 *
 * Нарочно НЕ се казва `city` — GA4 вече има вградено измерение „Град" за
 * географското местоположение на посетителя. Двете отговарят на различни
 * въпроса: „откъде гледа" срещу „коя страница гледа". Човек от Пловдив
 * може да е попаднал на /sofia — точно тази разлика ни интересува.
 *
 * Стойността идва от <html data-city="…">, който gen-city-pages.mjs
 * поставя. Четем DOM-а, а не cities.ts, за да няма нужда consent.ts да
 * знае за градовете и да се зарежда преди React.
 */
function pageCity() {
  const slug = document.documentElement.dataset.city
  return slug && /^[a-z-]{2,20}$/.test(slug) ? slug : 'general'
}

// gtag.js обработва само `arguments` обекти в dataLayer — обикновени масиви
// се игнорират тихо. Затова нарочно е `function`, а не стрелкова функция.
const gtag: GtagFn = function gtag() {
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer!.push(arguments)
}

/** Зарежда GA4 с denied по подразбиране. Идемпотентно през `gaLoaded`. */
let gaLoaded = false
function loadGA() {
  if (gaLoaded) return
  gaLoaded = true

  window.dataLayer = window.dataLayer || []
  window.gtag = gtag

  // 1) Consent default — ЗАДЪЛЖИТЕЛНО преди gtag.js.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    // Изчакваме до 500 ms евентуален update, преди да тръгне първият hit —
    // иначе при вече дадено съгласие page_view заминава като анонимен.
    wait_for_update: 500,
  })
  // Без бисквитки идентификацията минава през URL параметри — Google маха
  // рекламните данни и запазва връзката между страниците.
  gtag('set', 'ads_data_redaction', true)
  gtag('set', 'url_passthrough', true)

  // 2) Ако вече има запазено „Приемам", вдигаме съгласието веднага —
  //    пак в рамките на wait_for_update, така че първият hit е пълноценен.
  if (consentValue() === 'all') grantGA()

  // 3) И чак сега самият скрипт.
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)

  gtag('js', new Date())
  // Параметрите на `config` се закачат за ВСЯКО събитие на този measurement
  // ID — page_view и всичко от analytics.ts. Затова page_city е тук, а не в
  // отделните извиквания: няма как да се забрави при добавяне на ново събитие.
  //
  // Внимание: `gtag('set', {page_city})` НЕ работи за целта — проверено е, че
  // произволни custom параметри през `set` не стигат до заявката (в hit-а
  // липсва `ep.page_city`). Само `config` ги пренася.
  gtag('config', GA_ID, {
    page_city: pageCity(),
    ...(debugMode() ? { debug_mode: true } : {}),
  })
}

function updateGAConsent(state: 'granted' | 'denied') {
  gtag('consent', 'update', {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  })
}

const grantGA = () => updateGAConsent('granted')

let pixelLoaded = false
function loadMetaPixel() {
  if (pixelLoaded || window.fbq) return
  pixelLoaded = true
  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args)
    else fbq.queue.push(args)
  }) as FbqFn
  fbq.queue = []
  fbq.loaded = true
  fbq.version = '2.0'
  window.fbq = fbq
  window._fbq = window._fbq || fbq
  const t = document.createElement('script')
  t.async = true
  t.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(t)
  fbq('init', PIXEL_ID)
  fbq('track', 'PageView')
}

/**
 * Вика се при зареждане на всяка страница. GA4 тръгва винаги (в denied
 * режим), Meta Pixel — само при изрично „Приемам", защото няма
 * cookieless еквивалент.
 */
export function initConsent() {
  if (typeof window === 'undefined' || !isProduction()) return
  loadGA()
  if (consentValue() === 'all') loadMetaPixel()
}

/**
 * Вика се при избор в банера. Работи и когато посетителят се върне през
 * футъра и промени решението си — затова „necessary" изрично връща
 * съгласието на denied, вместо да разчита на default.
 */
export function applyConsent(value: 'all' | 'necessary') {
  if (typeof window === 'undefined' || !isProduction()) return
  loadGA() // ако банерът е показан преди initConsent да е минал
  if (value === 'all') {
    grantGA()
    loadMetaPixel()
  } else {
    updateGAConsent('denied')
    // Pixel не може да се разкачи, но спира да праща и трие бисквитките си.
    window.fbq?.('consent', 'revoke')
  }
}
