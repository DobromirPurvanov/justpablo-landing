import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const EASE = 'power3.out'

/** Уважава системното предпочитание за намалено движение. */
const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

type RevealOpts = {
  y?: number
  scale?: number
  stagger?: number
  delay?: number
  duration?: number
  start?: string
}

/**
 * Единна entrance анимация за целия сайт: леко повдигане + fade,
 * изпълнява се веднъж при влизане във viewport-а.
 * clearProps маха inline transform-а след края, за да не пречи на hover ефектите.
 */
export function reveal(targets: gsap.TweenTarget, trigger: Element | null, opts: RevealOpts = {}) {
  if (prefersReduced()) { gsap.set(targets, { opacity: 1, clearProps: 'transform' }); return }
  return gsap.from(targets, {
    y: opts.y ?? 28,
    scale: opts.scale ?? 1,
    opacity: 0,
    duration: opts.duration ?? 0.8,
    delay: opts.delay ?? 0,
    stagger: opts.stagger ?? 0,
    ease: EASE,
    clearProps: 'transform',
    scrollTrigger: trigger ? { trigger, start: opts.start ?? 'top 85%', once: true } : undefined,
  })
}

/* ─────────── Word-by-word reveal (almero стил четене) ─────────── */

/** Разбива текста на думи в span-ове, запазвайки вложените em/strong.
    Идемпотентно — при повторно извикване връща съществуващите. */
function splitWords(root: Element): HTMLElement[] {
  const existing = root.querySelectorAll<HTMLElement>('.w-split')
  if (existing.length) return Array.from(existing)
  const words: HTMLElement[] = []
  const process = (node: Node) => {
    Array.from(node.childNodes).forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent ?? ''
        if (!text.trim()) return
        const frag = document.createDocumentFragment()
        let prevSpan: HTMLElement | null = null
        text.split(/(\s+)/).forEach(part => {
          if (!part) return
          if (/^\s+$/.test(part)) {
            // Интервалът остава в span-а на предната дума — защита срещу
            // екстрактори, които изпускат whitespace-only text nodes (SEO, a11y)
            if (prevSpan) prevSpan.textContent += part
            else frag.appendChild(document.createTextNode(part))
            return
          }
          const span = document.createElement('span')
          span.className = 'w-split'
          span.textContent = part
          frag.appendChild(span)
          words.push(span)
          prevSpan = span
        })
        node.replaceChild(frag, child)
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        process(child)
      }
    })
  }
  process(root)
  return words
}

/** Думите "просветват" една по една, докато параграфът минава през екрана.
    Извиква се само при включени анимации — иначе текстът си е нормален. */
export function wordsReveal(paragraph: Element) {
  if (prefersReduced()) return
  const words = splitWords(paragraph)
  if (!words.length) return
  gsap.fromTo(words,
    { opacity: 0.25 },
    {
      opacity: 1,
      stagger: 0.015,
      ease: 'none',
      scrollTrigger: { trigger: paragraph, start: 'top 82%', end: 'top 40%', scrub: 0.5 },
    }
  )
}

/** Число, което брои от 0 до целта при влизане в екрана (almero counter).
    Работи с "+420%", "28%", "-15%" — префиксът и суфиксът се запазват.
    Стойности без водеща цифра (напр. "x3") остават статични. */
export function countUp(el: Element, opts: { delay?: number; duration?: number; trigger?: Element | null } = {}) {
  // Пазим оригиналната стойност веднъж — иначе при повторен mount
  // (React StrictMode / HMR) четем вече занулен текст и целта става 0.
  const raw = (el as HTMLElement).dataset.countup ?? el.textContent ?? ''
  if (!(el as HTMLElement).dataset.countup) (el as HTMLElement).dataset.countup = raw
  const m = raw.match(/^([+-]?)(\d+)([\s\S]*)$/)
  if (!m) return
  const [, prefix, numStr, suffix] = m
  const target = parseInt(numStr, 10)
  if (prefersReduced()) { el.textContent = `${prefix}${target}${suffix}`; return }
  const state = { v: 0 }
  el.textContent = `${prefix}0${suffix}`
  gsap.to(state, {
    v: target,
    duration: opts.duration ?? 1.3,
    delay: opts.delay ?? 0,
    ease: 'power2.out',
    scrollTrigger: opts.trigger ? { trigger: opts.trigger, start: 'top 82%', once: true } : undefined,
    onUpdate: () => { el.textContent = `${prefix}${Math.round(state.v)}${suffix}` },
  })
}

/** Заглавие изпод маска (almero scroll-trigger/title-content):
    съдържанието се плъзга нагоре иззад невидим ръб. Идемпотентно. */
export function maskReveal(target: Element | null, trigger: Element | null, opts: { delay?: number; duration?: number; start?: string } = {}) {
  if (!target) return
  if (prefersReduced()) return
  let inner = target.querySelector(':scope > .mask-inner') as HTMLElement | null
  if (!inner) {
    inner = document.createElement('div')
    inner.className = 'mask-inner'
    while (target.firstChild) inner.appendChild(target.firstChild)
    target.appendChild(inner)
    // Клипваме descender-ите (overflow hidden + padding), но компенсацията
    // отива на inner-а, а НЕ на marginBottom на самото заглавие — иначе
    // inline стилът презаписваше utility класа (mb-6) и изяждаше отстъпа
    // до следващия елемент.
    ;(target as HTMLElement).style.overflow = 'hidden'
    ;(target as HTMLElement).style.paddingBottom = '0.14em'
    inner.style.marginBottom = '-0.14em'
  }
  gsap.fromTo(inner,
    { yPercent: 115 },
    {
      yPercent: 0,
      duration: opts.duration ?? 0.95,
      delay: opts.delay ?? 0,
      ease: 'power3.out',
      scrollTrigger: trigger ? { trigger, start: opts.start ?? 'top 85%', once: true } : undefined,
    }
  )
}
