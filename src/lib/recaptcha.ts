/* ────────────────────────────────────────────────────────────
   Google reCAPTCHA v3 (невидима) — зарежда скрипта лениво и връща
   token при изпращане на формата. Бекендът верифицира token-а.
   Site key-ът е публичен (стои в клиента) — това е нормално за v3.
   ──────────────────────────────────────────────────────────── */

const SITE_KEY = '6LcbF1ItAAAAAP_882GeOnO5aTq3DrTtyIA2WzQb'

type Grecaptcha = {
  ready: (cb: () => void) => void
  execute: (siteKey: string, opts: { action: string }) => Promise<string>
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha
  }
}

let loadPromise: Promise<void> | null = null

export function loadRecaptcha(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.grecaptcha?.execute) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = new Promise<void>((resolve, reject) => {
    const ready = () => {
      if (window.grecaptcha) window.grecaptcha.ready(() => resolve())
      else reject(new Error('grecaptcha unavailable'))
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-recaptcha]')
    if (existing) {
      existing.addEventListener('load', ready)
      existing.addEventListener('error', () => reject(new Error('reCAPTCHA failed to load')))
      return
    }
    const s = document.createElement('script')
    s.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    s.async = true
    s.defer = true
    s.dataset.recaptcha = 'true'
    s.onload = ready
    s.onerror = () => reject(new Error('reCAPTCHA failed to load'))
    document.head.appendChild(s)
  })
  return loadPromise
}

/** Връща token за подадения action, или null ако reCAPTCHA не е достъпна. */
export async function getRecaptchaToken(action = 'submit'): Promise<string | null> {
  try {
    await loadRecaptcha()
    if (!window.grecaptcha?.execute) return null
    return await window.grecaptcha.execute(SITE_KEY, { action })
  } catch {
    return null
  }
}
