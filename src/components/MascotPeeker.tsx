import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface MascotPeekerProps {
  triggerId: string
  imageSrc: string
  side?: 'left' | 'right'
  bottomClassName?: string
}

/**
 * Гъвкав компонент за маскоти, които надничат от краищата на екрана.
 * Напълно интегриран с Lenis SmoothScroll и GSAP ScrollTrigger за перфектен флуиден пърформанс.
 */
export default function MascotPeeker({ triggerId, imageSrc, side = 'right', bottomClassName = 'bottom-[15%]' }: MascotPeekerProps) {
  const mascotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mascotRef.current
    const targetTrigger = document.getElementById(triggerId)
    if (!el || !targetTrigger) return

    const ctx = gsap.context(() => {
      // Изначално скриваме маскота извън пределите на екрана
      gsap.set(el, { xPercent: side === 'right' ? 120 : -120 })

      gsap.to(el, {
        xPercent: side === 'right' ? 15 : -15,
        duration: 0.7,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: targetTrigger,
          start: 'top 70%',
          end: 'bottom 20%',
          toggleActions: 'play reverse play reverse',
        }
      })
    }, el)

    return () => ctx.revert()
  }, [triggerId, side])

  return (
    <div
      ref={mascotRef}
      className={`fixed ${bottomClassName} z-40 w-28 md:w-36 lg:w-44 pointer-events-none ${
        side === 'right' ? 'right-0' : 'left-0'
      }`}
    >
      <img 
        src={imageSrc} 
        alt="Just Pablo Mascot Peeker" 
        className="w-full h-auto object-contain"
        draggable={false}
      />
    </div>
  )
}
