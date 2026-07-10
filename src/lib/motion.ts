import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const EASE = 'power3.out'

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

/* ─────────── Паралакс хелпъри (almero стил) ───────────
   Работят само на desktop и при изключен prefers-reduced-motion.
   Прилагат се върху обвивки/декорация — никога върху елемент,
   който вече има entrance анимация на същото свойство. */

const PARALLAX_MEDIA = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'

/** Вертикален дрифт при скрол (фонови текстове, колони, декорация) */
export function drift(target: gsap.TweenTarget, trigger: Element, opts: { from?: number; to?: number; scrub?: number } = {}) {
  const mm = gsap.matchMedia()
  mm.add(PARALLAX_MEDIA, () => {
    gsap.fromTo(target,
      { y: opts.from ?? 40 },
      {
        y: opts.to ?? -40,
        ease: 'none',
        scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: opts.scrub ?? 1 },
      }
    )
  })
  return mm
}

/** Хоризонтален дрифт (голямото "digital") */
export function driftX(target: gsap.TweenTarget, trigger: Element, opts: { from?: number; to?: number; scrub?: number } = {}) {
  const mm = gsap.matchMedia()
  mm.add(PARALLAX_MEDIA, () => {
    gsap.fromTo(target,
      { x: opts.from ?? -40 },
      {
        x: opts.to ?? 40,
        ease: 'none',
        scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: opts.scrub ?? 1 },
      }
    )
  })
  return mm
}

/** Вътрешен паралакс на изображение в карта — подписът на almero.
    Изображението е в scale-[1.15] обвивка и се движи вертикално,
    докато рамката минава през viewport-а. */
export function imageParallax(imgWrap: gsap.TweenTarget, frame: Element, opts: { amount?: number; scrub?: number } = {}) {
  const a = opts.amount ?? 6.5
  const mm = gsap.matchMedia()
  mm.add(PARALLAX_MEDIA, () => {
    gsap.fromTo(imgWrap,
      { yPercent: -a },
      {
        yPercent: a,
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: opts.scrub ?? 0.8 },
      }
    )
  })
  return mm
}

/* ─────────── Word-by-word reveal (almero стил четене) ─────────── */

/** Разбива текста на думи в span-ове, запазвайки вложените em/strong.
    Идемпотентно — при повторно извикване връща съществуващите. */
export function splitWords(root: Element): HTMLElement[] {
  const existing = root.querySelectorAll<HTMLElement>('.w-split')
  if (existing.length) return Array.from(existing)
  const words: HTMLElement[] = []
  const process = (node: Node) => {
    Array.from(node.childNodes).forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent ?? ''
        if (!text.trim()) return
        const frag = document.createDocumentFragment()
        text.split(/(\s+)/).forEach(part => {
          if (!part) return
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return }
          const span = document.createElement('span')
          span.className = 'w-split'
          span.textContent = part
          frag.appendChild(span)
          words.push(span)
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
  const words = splitWords(paragraph)
  if (!words.length) return
  gsap.fromTo(words,
    { opacity: 0.14 },
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
  const raw = el.textContent ?? ''
  const m = raw.match(/^([+\-]?)(\d+)([\s\S]*)$/)
  if (!m) return
  const [, prefix, numStr, suffix] = m
  const target = parseInt(numStr, 10)
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
  let inner = target.querySelector(':scope > .mask-inner') as HTMLElement | null
  if (!inner) {
    inner = document.createElement('div')
    inner.className = 'mask-inner'
    while (target.firstChild) inner.appendChild(target.firstChild)
    target.appendChild(inner)
    ;(target as HTMLElement).style.overflow = 'hidden'
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

/** Медия, която се разкрива с clip отдолу нагоре + вътрешно отдалечаване (almero) */
export function clipReveal(frame: Element | null, inner: Element | null, trigger: Element | null) {
  if (!frame) return
  const mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo(frame,
      { clipPath: 'inset(0% 0% 100% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: trigger ? { trigger, start: 'top 82%', once: true } : undefined,
      }
    )
    if (inner) {
      gsap.fromTo(inner,
        { scale: 1.35 },
        {
          scale: 1.15,
          duration: 1.3,
          ease: 'power3.out',
          scrollTrigger: trigger ? { trigger, start: 'top 82%', once: true } : undefined,
        }
      )
    }
  })
  return mm
}
