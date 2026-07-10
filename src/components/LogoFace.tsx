import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// Измерено от реалното лого (дялове от размера на лицето)
const EYES = [
  { name: 'left', rest: [0.3161, 0.3845] as const, w: 0.1854, img: './images/pupil-left.png' },
  { name: 'right', rest: [0.6733, 0.3845] as const, w: 0.1824, img: './images/pupil-right.png' },
]
const TRAVEL_X = 0.0365 // максимално отклонение на зеницата (дял от ширината)
const TRAVEL_Y = 0.0213

/**
 * Интерактивното лого: очите следват мишката.
 * На touch устройства се оглежда само̀, мига на случайни интервали.
 */
export default function LogoFace({ className = '' }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const pupils = Array.from(root.querySelectorAll<HTMLElement>('.lf-pupil'))
    if (pupils.length !== 2) return

    const setters = pupils.map(el => ({
      x: gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' }),
      y: gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' }),
    }))

    const fine = window.matchMedia('(pointer: fine)').matches
    let idle: gsap.core.Timeline | undefined

    const move = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect()
      const maxX = rect.width * TRAVEL_X
      const maxY = rect.width * TRAVEL_Y
      pupils.forEach((_, i) => {
        const ex = rect.left + rect.width * EYES[i].rest[0]
        const ey = rect.top + rect.height * EYES[i].rest[1]
        const dx = e.clientX - ex
        const dy = e.clientY - ey
        const dist = Math.hypot(dx, dy) || 1
        const f = Math.tanh(dist / 240) // близо следи точно, далеч се насища
        setters[i].x((dx / dist) * maxX * f)
        setters[i].y((dy / dist) * maxY * f)
      })
    }
    const recenter = () => setters.forEach(s => { s.x(0); s.y(0) })

    if (fine) {
      window.addEventListener('mousemove', move, { passive: true })
      document.documentElement.addEventListener('mouseleave', recenter)
    } else {
      // Touch: автономно оглеждане
      const w = root.getBoundingClientRect().width || 300
      const mx = w * TRAVEL_X
      const my = w * TRAVEL_Y
      idle = gsap.timeline({ repeat: -1, repeatDelay: 1.4 })
      idle.to(pupils, { x: mx, y: 0, duration: 0.6, ease: 'power2.inOut' })
        .to(pupils, { x: -mx, y: my * 0.6, duration: 0.7, ease: 'power2.inOut' }, '+=0.9')
        .to(pupils, { x: mx * 0.4, y: -my, duration: 0.5, ease: 'power2.inOut' }, '+=0.8')
        .to(pupils, { x: 0, y: 0, duration: 0.6, ease: 'power2.inOut' }, '+=1.1')
    }

    // Мигане на случайни интервали
    let blinkTimer = 0
    const blink = () => {
      gsap.to(pupils, { scaleY: 0.15, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.inOut', transformOrigin: '50% 50%' })
      blinkTimer = window.setTimeout(blink, 2600 + Math.random() * 3400)
    }
    blinkTimer = window.setTimeout(blink, 2200)

    return () => {
      window.clearTimeout(blinkTimer)
      idle?.kill()
      window.removeEventListener('mousemove', move)
      document.documentElement.removeEventListener('mouseleave', recenter)
    }
  }, [])

  return (
    <div ref={rootRef} className={`relative select-none pointer-events-none ${className}`} aria-hidden="true">
      <img src="./images/face-base.png" alt="" className="w-full h-auto" draggable={false} />
      {EYES.map(eye => (
        <div
          key={eye.name}
          className="absolute"
          style={{
            left: `${eye.rest[0] * 100}%`,
            top: `${eye.rest[1] * 100}%`,
            width: `${eye.w * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img src={eye.img} alt="" className="lf-pupil block w-full h-auto" draggable={false} />
        </div>
      ))}
    </div>
  )
}
