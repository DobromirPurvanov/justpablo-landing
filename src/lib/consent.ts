/* ────────────────────────────────────────────────────────────
   Съгласие за бисквитки + гейтване на трекерите (GDPR/ePrivacy).

   GA4 и Meta Pixel НЕ се зареждат в index.html/HTML шаблоните. Вместо това
   се инжектират оттук ЕДВА след като потребителят е избрал „Приемам"
   (localStorage jp_cookie_consent.v === 'all'). Така преди съгласие не се
   пращат бисквитки/IP към Google/Meta. При избор „Само необходимите" —
   нищо не се зарежда.
   ──────────────────────────────────────────────────────────── */

const KEY = 'jp_cookie_consent'
const GA_ID = 'G-JTNZ4WYG32'
const PIXEL_ID = '1834416007939090'

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

/** Трекери се пускат само в реалната продукция — не на Vercel preview/localhost,
    за да не замърсяват данните с трафик от разработка. */
function isProduction() {
  const host = location.hostname
  return host === 'just-pablo.com' || host === 'www.just-pablo.com'
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

function loadGA() {
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  const gtag: GtagFn = (...args) => { window.dataLayer!.push(args) }
  window.gtag = gtag
  gtag('js', new Date())
  gtag('config', GA_ID)
}

function loadMetaPixel() {
  if (window.fbq) return
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

let loaded = false

/** Инжектира GA4 + Meta Pixel. Идемпотентно. Вика се само при съгласие. */
export function loadTrackers() {
  if (loaded || typeof window === 'undefined' || !isProduction()) return
  loaded = true
  loadGA()
  loadMetaPixel()
}

/** Вика се при зареждане на всяка страница: пуска трекерите само ако вече
    има запазено съгласие „all". Без съгласие — нищо. */
export function initConsent() {
  if (consentValue() === 'all') loadTrackers()
}
