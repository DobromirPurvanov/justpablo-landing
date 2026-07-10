import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/**
 * Custom cursor (almero стил): червен диск, който следва мишката
 * и се разгъва с текст върху елементи с data-cursor атрибут.
 * Само desktop + точен pointer.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')

  useEffect(() => {
    const dot = dotRef.current
    if (!dot) return
    if (!window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches) return

    gsap.set(dot, { xPercent: -50, yPercent: -50, scale: 0 })
    const xTo = gsap.quickTo(dot, 'x', { duration: 0.35, ease: 'power3' })
    const yTo = gsap.quickTo(dot, 'y', { duration: 0.35, ease: 'power3' })

    const move = (e: MouseEvent) => { xTo(e.clientX); yTo(e.clientY) }
    const over = (e: MouseEvent) => {
      const target = (e.target as Element).closest?.('[data-cursor]')
      if (target) {
        setLabel(target.getAttribute('data-cursor') || '')
        gsap.to(dot, { scale: 1, duration: 0.35, ease: 'power3.out' })
      } else {
        gsap.to(dot, { scale: 0, duration: 0.3, ease: 'power3.out' })
      }
    }

    window.addEventListener('mousemove', move, { passive: true })
    document.addEventListener('mouseover', over)
    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
    }
  }, [])


  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="fixed top-0 left-0 z-[70] pointer-events-none hidden lg:flex items-center justify-center w-24 h-24 rounded-full bg-[#DC2626] shadow-xl shadow-[#DC2626]/30"
      style={{ transform: 'translate(-50%, -50%) scale(0)' }}
    >
      <span className="text-white text-[11px] font-medium tracking-wide text-center px-3 leading-tight">{label}</span>
    </div>
  )
}
