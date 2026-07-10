type LenisLike = { scrollTo: (target: number | HTMLElement, opts?: { offset?: number }) => void }

/** Плавен скрол до секция — през Lenis, ако е активен */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis
  if (lenis) lenis.scrollTo(el, { offset: -4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

/** Плавен скрол до върха — през Lenis, ако е активен */
export function scrollToTop() {
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis
  if (lenis) lenis.scrollTo(0)
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}
