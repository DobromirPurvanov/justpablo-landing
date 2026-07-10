import { useEffect, useId, useRef } from 'react'
import gsap from 'gsap'
import { scrollToId } from '../lib/scroll'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Almero стил CTA: плътен червен кръг с текст по вътрешния ръб.
 * Магнитен — при hover дискът се навежда към мишката,
 * а стрелката се движи още по-силно след нея.
 */
export default function MagneticCta({
  targetId = 'zapitvane',
  label = 'направи запитване',
  ringText = 'Дигитална трансформация на вашия бизнес',
  className = '',
}: {
  targetId?: string
  label?: string
  ringText?: string
  className?: string
}) {
  const rootRef = useRef<HTMLAnchorElement>(null)
  const discRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)
  const ringRef = useRef<SVGSVGElement>(null)
  const pathId = useId().replace(/:/g, '')

  useEffect(() => {
    const root = rootRef.current
    const disc = discRef.current
    const arrow = arrowRef.current
    if (!root || !disc || !arrow) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Текстът по ръба се върти от скрола (almero)
    const ctx = gsap.context(() => {
      if (ringRef.current) {
        gsap.to(ringRef.current, {
          rotation: 200, ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 1 },
        })
      }
    }, root)

    if (!window.matchMedia('(pointer: fine)').matches) return () => ctx.revert()

    const dx = gsap.quickTo(disc, 'x', { duration: 0.4, ease: 'power3' })
    const dy = gsap.quickTo(disc, 'y', { duration: 0.4, ease: 'power3' })
    const ax = gsap.quickTo(arrow, 'x', { duration: 0.3, ease: 'power3' })
    const ay = gsap.quickTo(arrow, 'y', { duration: 0.3, ease: 'power3' })

    const move = (e: MouseEvent) => {
      const r = root.getBoundingClientRect()
      const relX = e.clientX - (r.left + r.width / 2)
      const relY = e.clientY - (r.top + r.height / 2)
      dx(relX * 0.22)
      dy(relY * 0.22)
      ax(relX * 0.32)
      ay(relY * 0.32)
    }
    const leave = () => {
      gsap.to(disc, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' })
      gsap.to(arrow, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' })
    }
    root.addEventListener('mousemove', move)
    root.addEventListener('mouseleave', leave)
    return () => {
      ctx.revert()
      root.removeEventListener('mousemove', move)
      root.removeEventListener('mouseleave', leave)
    }
  }, [])

  return (
    <a
      ref={rootRef}
      href={`#${targetId}`}
      onClick={e => { e.preventDefault(); scrollToId(targetId) }}
      className={`group relative block ${className}`}
      aria-label={label}
    >
      <div ref={discRef} className="absolute inset-0 rounded-full bg-[#DC2626] shadow-xl shadow-[#DC2626]/25 flex items-center justify-center will-change-transform group-hover:shadow-[#DC2626]/40 transition-shadow duration-300">
        {/* Текст по вътрешния ръб — бавно се върти */}
        <svg ref={ringRef} viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none will-change-transform">
          <defs>
            <path id={pathId} d="M 100,100 m -74,0 a 74,74 0 1,1 148,0 a 74,74 0 1,1 -148,0" fill="none" />
          </defs>
          <text fill="white" opacity="0.92" fontSize="14.5" fontFamily="Montserrat, sans-serif" fontWeight="500" letterSpacing="2.5">
            <textPath href={`#${pathId}`}>{ringText}</textPath>
          </text>
        </svg>

        {/* Център: магнитна стрелка + етикет */}
        <div className="relative z-10 flex items-center gap-2 text-white px-6">
          <span ref={arrowRef} className="inline-flex shrink-0 will-change-transform">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-[11px] leading-[1.25] font-medium max-w-[84px]">{label}</span>
        </div>
      </div>
    </a>
  )
}
