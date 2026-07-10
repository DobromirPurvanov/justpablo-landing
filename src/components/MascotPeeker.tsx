import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface MascotPeekerProps {
  triggerId: string
  imageSrc: string
  side?: 'left' | 'right'
}

export default function MascotPeeker({ triggerId, imageSrc, side = 'right' }: MascotPeekerProps) {
  const mascotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mascotRef.current
    const targetTrigger = document.getElementById(triggerId)
    if (!el || !targetTrigger) return

    const ctx = gsap.context(() => {
      gsap.set(el, { xPercent: side === 'right' ? 110 : -110 })

      gsap.to(el, {
        xPercent: side === 'right' ? 15 : -15,
        duration: 0.6,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: targetTrigger,
          start: 'top 60%',
          end: 'bottom 20%',
          toggleActions: 'play reverse play reverse',
        }
      })
    })

    return () => ctx.revert()
  }, [triggerId, side])

  return (
    <div
      ref={mascotRef}
      className={`fixed bottom-[15%] z-50 w-32 lg:w-44 pointer-events-none ${
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
