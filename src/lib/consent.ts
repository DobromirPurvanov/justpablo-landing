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

let loaded = false

/** Инжектира GA4 + Meta Pixel. Идемпотентно. Вика се само при съгласие. */
export function loadTrackers() {
  if (loaded || typeof window === 'undefined' || !isProduction()) return
  loaded = true

  // Google Analytics 4
  const w = window as unknown as { dataLayer: unknown[]; gtag: (...args: unknown[]) => void; fbq?: (...args: unknown[]) => void }
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
  w.dataLayer = w.dataLayer || []
  w.gtag = function gtag() { w.dataLayer.push(arguments) }
  w.gtag('js', new Date())
  w.gtag('config', GA_ID)

  // Meta Pixel
  ;(function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return
    const n: any = (f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) })
    if (!f._fbq) f._fbq = n
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = []
    const t = b.createElement(e) as HTMLScriptElement; t.async = true; t.src = v
    const g = b.getElementsByTagName(e)[0]
    g.parentNode!.insertBefore(t, g)
  })(w, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  w.fbq!('init', PIXEL_ID)
  w.fbq!('track', 'PageView')
}

/** Вика се при зареждане на всяка страница: пуска трекерите само ако вече
    има запазено съгласие „all". Без съгласие — нищо. */
export function initConsent() {
  if (consentValue() === 'all') loadTrackers()
}
