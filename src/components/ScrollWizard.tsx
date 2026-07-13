import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { maskReveal } from '../lib/motion'
import LogoFace from './LogoFace'

/* ────────────────────────────────────────────────────────────
   Кръгла контактна форма (progressive disclosure)
   Кръгът е запазен като запазена марка; вътре: зони, ring
   progress с точки, хоризонтални pill бутони, валидация,
   auto-save в localStorage, стъпков индикатор на мобилно.
   ──────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'justpablo_form_progress'

type QType = 'text' | 'checkbox' | 'radio' | 'contact' | 'review'
type Question = {
  id: string
  short: string
  title: string
  subtitle?: string
  type: QType
  options?: string[]
  placeholder?: string
  skippable?: boolean
}

const questions: Question[] = [
  { id: 'brandName', short: 'Дейност', title: 'Каква е дейността на вашата марка?', subtitle: 'Нека се запознаем. Попълването на всички стъпки отнема само минута.', type: 'text', placeholder: 'предмет на дейност' },
  { id: 'focus', short: 'Фокус', title: 'Какъв е фокусът на вашия бизнес?', subtitle: 'Натиснете върху опция, за да я изберете — можете да маркирате повече от една.', type: 'checkbox', options: ['Услуга/и', 'Продукт/и собствено производство', 'Търговия или дистрибуция', 'Друго'], skippable: true },
  { id: 'goals', short: 'Цели', title: 'Какви са вашите цели за онлайн развитие?', subtitle: 'Натиснете върху опция, за да я изберете — можете да маркирате повече от една.', type: 'checkbox', options: ['Разпознаваемост', 'Продажби', 'Абонаменти', 'Подготовка за експанзия', 'Друго'], skippable: true },
  { id: 'period', short: 'Период', title: 'За какъв период очаквате резултати?', subtitle: 'Натиснете върху един отговор, за да продължите.', type: 'radio', options: ['3 месеца', '6 месеца', '1 година', '2+ години'] },
  { id: 'needs', short: 'Услуги', title: 'От какви услуги имате нужда?', subtitle: 'Натиснете върху опция, за да я изберете — можете да маркирате повече от една.', type: 'checkbox', options: ['Нов уебсайт', 'SEO и GEO (видимост в AI)', 'Онлайн реклама', 'Брандинг и дизайн', 'Социални мрежи и видео'], skippable: true },
  { id: 'budget', short: 'Бюджет', title: 'Какъв е предвиденият бюджет?', subtitle: 'Натиснете върху един отговор, за да продължите.', type: 'radio', options: ['До 500 €', '500 – 1500 €', '1500 – 2500 €', '2500 – 5000 €', 'Над 5000 €'] },
  { id: 'contact', short: 'Контакт', title: 'Информация за контакт', subtitle: 'Ще се свържем с вас в рамките на 24 часа.', type: 'contact' },
  { id: 'review', short: 'Преглед', title: 'Прегледайте и изпратете', subtitle: 'Проверете отговорите си — всяка стъпка може да се редактира.', type: 'review' },
]

const contactFields = [
  { id: 'name', type: 'text', label: 'име и фамилия *', auto: 'name', hint: 'next' as const, required: true },
  { id: 'email', type: 'email', label: 'e-mail адрес *', auto: 'email', hint: 'next' as const, required: true },
  { id: 'phone', type: 'tel', label: 'телефон (по избор)', auto: 'tel', hint: 'next' as const, required: false },
  { id: 'site', type: 'text', label: 'име на бизнес / сайт (по избор)', auto: 'organization', hint: 'done' as const, required: false },
]

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Малки иконки по стъпка (зона А) — червени, 48px */
function StepGlyph({ step }: { step: number }) {
  const c = { fill: 'none', stroke: '#DC2626', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true">
      {step === 0 && (<g {...c}><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19l-4 1z" /><path d="M14 6l3 3" /></g>)}
      {step === 1 && (<g {...c}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.8" fill="#DC2626" /></g>)}
      {step === 2 && (<g {...c}><path d="M4 17l5-5 3.5 3.5L20 8" /><path d="M15 8h5v5" /></g>)}
      {step === 3 && (<g {...c}><rect x="4" y="5.5" width="16" height="15" rx="2.5" /><path d="M4 10h16M8.5 3.5v3.5M15.5 3.5v3.5" /></g>)}
      {step === 4 && (<g {...c}><path d="M12 3.5l8.5 4.5L12 12.5 3.5 8 12 3.5z" /><path d="M3.5 12.5L12 17l8.5-4.5" /><path d="M3.5 16.5L12 21l8.5-4.5" /></g>)}
      {step === 5 && (<g {...c}><rect x="3.5" y="6.5" width="17" height="12.5" rx="2.5" /><path d="M3.5 10.5h17" /><path d="M7 15.5h4" /></g>)}
      {step === 6 && (<g {...c}><circle cx="12" cy="8.2" r="3.8" /><path d="M5 20c1.2-3.6 3.9-5.3 7-5.3s5.8 1.7 7 5.3" /></g>)}
      {step === 7 && (<g {...c}><circle cx="12" cy="12" r="8.5" /><path d="M8.3 12.3l2.5 2.5 5-5.3" /></g>)}
    </svg>
  )
}

/* Ring progress: плавно запълващ се обръч според текущата стъпка */
function ProgressRing({ current, total }: { current: number; total: number }) {
  const pct = total > 1 ? (current / (total - 1)) * 100 : 0
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 108 108" aria-hidden="true">
      {/* фонов track */}
      <circle cx="54" cy="54" r="48" fill="none" stroke="#F0F0F0" strokeWidth="2.2" />
      {/* червен прогрес, който се запълва отгоре по часовниковата стрелка */}
      <g transform="rotate(-90 54 54)">
        <circle
          cx="54" cy="54" r="48"
          fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round"
          pathLength="100" strokeDasharray="100"
          className="wz-ring-progress"
          style={{ strokeDashoffset: 100 - pct }}
        />
      </g>
    </svg>
  )
}

/* Конфети от центъра на успеха — без зависимости, ~1.5s */
function ConfettiBurst() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (prefersReduced()) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const colors = ['#DC2626', '#1A1A1A', '#E5E5E5', '#B91C1C']
    const cx = canvas.width / 2
    const cy = Math.min(canvas.height * 0.42, 420)
    const parts = Array.from({ length: 110 }, () => ({
      x: cx, y: cy,
      vx: (Math.random() - 0.5) * 13,
      vy: -Math.random() * 11 - 3,
      s: Math.random() * 6 + 3,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * colors.length)],
    }))
    const t0 = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const el = t - t0
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.32; p.r += p.vr
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r)
        ctx.globalAlpha = Math.max(0, 1 - el / 1500)
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.62)
        ctx.restore()
      })
      if (el < 1500) raf = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} className="fixed inset-0 z-[60] pointer-events-none" aria-hidden="true" />
}

const isAnswered = (data: Record<string, unknown>, id: string) => {
  const v = data[id]
  return Array.isArray(v) ? v.length > 0 : Boolean(v && String(v).trim())
}
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

export default function ScrollWizard() {
  const [phase, setPhase] = useState<'intro' | 'wizard'>('intro')
  const [current, setCurrent] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stepError, setStepError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [resume, setResume] = useState<{ formData: Record<string, any>; current: number; phase: 'intro' | 'wizard' } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  // На touch устройства не отваряме клавиатурата насила при смяна на стъпка
  const finePointer = useRef(typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches)

  /* ─── Auto-save: запис при всяка промяна, предложение за продължаване при връщане ─── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw)
      if (saved && saved.formData && Object.keys(saved.formData).length > 0) setResume(saved)
    } catch { /* private mode и т.н. — тихо */ }
  }, [])

  useEffect(() => {
    if (isSuccess) return
    try {
      if (Object.keys(formData).length > 0 || phase === 'wizard') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, formData, current, phase }))
      }
    } catch { /* няма localStorage — формата работи и без него */ }
  }, [formData, current, phase, isSuccess])

  const clearSaved = () => { try { localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ } }

  useEffect(() => {
    const el = rootRef.current
    if (el && phase === 'intro' && !isSuccess) maskReveal(el.querySelector('.wz-h1'), null, { delay: 0.1 })
  }, [phase, isSuccess])

  const setValue = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }))
    setStepError('')
    setFieldErrors(prev => { const n = { ...prev }; delete n[id]; return n })
  }
  const toggleCheckbox = (id: string, option: string) => {
    const arr = (formData[id] as string[]) || []
    setValue(id, arr.includes(option) ? arr.filter(o => o !== option) : [...arr, option])
  }

  const shake = () => {
    if (prefersReduced()) return
    const targets = gsap.utils.toArray<HTMLElement>('.wz-shake', rootRef.current)
    if (targets.length) gsap.fromTo(targets, { x: 0 }, { keyframes: [{ x: -5 }, { x: 5 }, { x: -4 }, { x: 0 }], duration: 0.3, ease: 'power1.inOut' })
    // Първата опция пулсира — „ето тук се натиска"
    const firsts = rootRef.current?.querySelectorAll('[role="radiogroup"] > .wz-opt:first-of-type, [role="group"] > .wz-opt:first-of-type')
    if (firsts?.length) gsap.fromTo(firsts, { scale: 1 }, { keyframes: [{ scale: 1.02 }, { scale: 1 }], duration: 0.3, repeat: 2, ease: 'power1.inOut' })
  }

  /* Мек пулс на първата опция при зареждане на неотговорена изборна стъпка */
  useEffect(() => {
    if (phase !== 'wizard' || isSuccess || prefersReduced()) return
    const qq = questions[current]
    if ((qq.type !== 'radio' && qq.type !== 'checkbox') || isAnswered(formData, qq.id)) return
    const firsts = rootRef.current?.querySelectorAll('[role="radiogroup"] > .wz-opt:first-of-type, [role="group"] > .wz-opt:first-of-type')
    if (!firsts?.length) return
    const tween = gsap.fromTo(firsts,
      { boxShadow: '0 0 0 0 rgba(220,38,38,0.35)' },
      { boxShadow: '0 0 0 9px rgba(220,38,38,0)', duration: 1, repeat: 1, delay: 0.55, ease: 'power2.out', clearProps: 'boxShadow' }
    )
    return () => { tween.kill() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, phase, isSuccess])

  const startWizard = (brandType: string) => {
    setValue('brandType', brandType)
    const el = rootRef.current
    if (!el || prefersReduced()) { setPhase('wizard'); return }
    gsap.to(el, { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in', onComplete: () => {
      setPhase('wizard')
      gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', clearProps: 'transform' })
    }})
  }

  /* Смяна на стъпка: моментална, за да не забива съдържанието при анимации */
  const go = (target: number) => {
    if (target < 0 || target > questions.length - 1 || target === current) return
    setStepError('')
    setCurrent(target)
  }

  const q = questions[current]
  const isReview = q.type === 'review'

  /* ─── Валидация: „Напред" винаги е активен; грешката се показва, кръгът трепва ─── */
  const validateContactField = (id: string, value: unknown) => {
    let err = ''
    if (id === 'name' && (!value || !String(value).trim())) err = 'Моля, въведете име и фамилия.'
    if (id === 'email') {
      if (!value || !String(value).trim()) err = 'Моля, въведете e-mail адрес.'
      else if (!emailOk(String(value))) err = 'E-mail адресът не изглежда валиден.'
    }
    setFieldErrors(prev => {
      const next = { ...prev }
      if (err) next[id] = err
      else delete next[id]
      return next
    })
  }

  const validateStep = (i: number): boolean => {
    const qq = questions[i]
    if (qq.type === 'checkbox' || qq.type === 'radio') {
      if (!isAnswered(formData, qq.id)) {
        setStepError('Моля, изберете поне един отговор, за да продължите.')
        shake()
        return false
      }
    }
    if (qq.type === 'text' && !qq.skippable && !isAnswered(formData, qq.id)) {
      setStepError('Моля, попълнете полето, за да продължите.')
      shake()
      return false
    }
    if (qq.type === 'contact') {
      const errs: Record<string, string> = {}
      if (!formData.name || !String(formData.name).trim()) errs.name = 'Моля, въведете име и фамилия.'
      if (!formData.email || !String(formData.email).trim()) errs.email = 'Моля, въведете e-mail адрес.'
      else if (!emailOk(String(formData.email))) errs.email = 'E-mail адресът не изглежда валиден.'
      if (Object.keys(errs).length) {
        setFieldErrors(errs)
        shake()
        const first = contactFields.find(f => errs[f.id])
        if (first) (rootRef.current?.querySelector(`[data-field="${first.id}"]`) as HTMLInputElement | null)?.focus()
        return false
      }
    }
    return true
  }

  const next = () => { if (validateStep(current)) go(current + 1) }
  const prev = () => go(current - 1)
  const skip = () => { setStepError(''); go(current + 1) }

  const submit = async () => {
    if (!formData.privacy) {
      setStepError('Моля, потвърдете, че сте съгласни с политиката за поверителност.')
      shake()
      return
    }
    setIsSubmitting(true)
    setStepError('')
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Грешка при изпращане на запитването.')
      }
      clearSaved()
      setIsSuccess(true)
    } catch (err: any) {
      setStepError(err.message || 'Неуспешно изпращане. Моля, опитайте отново.')
      shake()
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!isSuccess || prefersReduced()) return
    const el = rootRef.current?.querySelector('.wz-success-face')
    if (el) gsap.fromTo(el, { scale: 1 }, { keyframes: [{ scale: 1.05 }, { scale: 1 }], duration: 0.5, delay: 0.15, ease: 'power1.inOut' })
  }, [isSuccess])

  /* Автоматичен фокус и ресет на скрола вътре в кръга при смяна на стъпка */
  useEffect(() => {
    if (phase !== 'wizard' || isSuccess) return
    const container = contentRef.current
    if (container) container.scrollTop = 0
    const timer = window.setTimeout(() => {
      const focusable = rootRef.current?.querySelector<HTMLElement>('.wz-opt, input[data-field], input[type="text"], [role="checkbox"]')
      if (focusable) {
        focusable.focus()
        focusable.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
      }
    }, 420)
    return () => window.clearTimeout(timer)
  }, [current, phase, isSuccess])

  const resetAll = () => {
    clearSaved()
    setFormData({}); setFieldErrors({}); setStepError('')
    setCurrent(0); setIsSuccess(false); setPhase('intro')
  }

  /* ─── Опция (radio/checkbox) — кутийка по спека, 48px touch target ─── */
  const OptionButton = ({ opt, selected, onClick, role }: { opt: string; selected: boolean; onClick: () => void; role: 'radio' | 'checkbox' }) => (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={`wz-opt w-full min-h-[48px] lg:min-h-[44px] px-5 lg:px-6 py-3 rounded-full border-2 flex items-center gap-3 text-sm lg:text-base font-semibold leading-snug text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626] ${
        selected
          ? 'bg-[#DC2626] border-[#DC2626] text-white shadow-[0_4px_14px_rgba(220,38,38,0.25)]'
          : 'border-[#E5E5E5] bg-white text-[#1A1A1A]/85 hover:border-[#DC2626] hover:bg-[#FFF5F5] hover:translate-x-1 hover:shadow-[0_2px_10px_rgba(220,38,38,0.08)]'
      }`}
    >
      <span className={`shrink-0 flex items-center justify-center transition-colors duration-200 ${role === 'checkbox' ? 'w-5 h-5 rounded-md border-2' : 'w-5 h-5 rounded-full border-2'} ${selected ? 'border-white bg-white' : 'border-[#D1D1D1] bg-white'}`}>
        {selected && (role === 'checkbox'
          ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
          : <span className="w-2 h-2 rounded-full bg-[#DC2626]" />)}
      </span>
      <span className="flex-1">{opt}</span>
    </button>
  )

  /* ─── Зона Б: съдържанието на активната стъпка ─── */
  const answerArea = (
    <div className="w-full">
      {/* Грешка на стъпката — над опциите, aria-live за скрийнрийдъри */}
      <div aria-live="polite" className={stepError ? 'mb-3' : ''}>
        {stepError && <p className="text-sm font-semibold text-[#EF4444] text-center">{stepError}</p>}
      </div>

      {q.type === 'radio' && q.options && (
        <div role="radiogroup" aria-label={q.title} className="flex flex-col gap-2.5 w-full">
          {q.options.map(opt => (
            <OptionButton key={opt} opt={opt} role="radio" selected={formData[q.id] === opt}
              onClick={() => { setValue(q.id, opt); window.setTimeout(() => go(current + 1), 280) }} />
          ))}
        </div>
      )}

      {q.type === 'checkbox' && q.options && (
        <div className="w-full">
          <div role="group" aria-label={q.title} className="flex flex-col gap-2.5 w-full">
            {q.options.map(opt => (
              <OptionButton key={opt} opt={opt} role="checkbox" selected={((formData[q.id] as string[]) || []).includes(opt)}
                onClick={() => toggleCheckbox(q.id, opt)} />
            ))}
          </div>
          {((formData[q.id] as string[]) || []).length > 0 && (
            <div className="text-xs lg:text-sm font-semibold text-[#DC2626] text-center mt-2.5" aria-live="polite">
              Избрани: {((formData[q.id] as string[]) || []).length} от {q.options.length}
            </div>
          )}
        </div>
      )}

      {q.type === 'text' && (
        <div className="w-full">
          <input
            type="text"
            value={formData[q.id] || ''}
            onChange={e => setValue(q.id, e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') next() }}
            onFocus={e => { e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' }) }}
            autoFocus={finePointer.current}
            enterKeyHint="next"
            aria-label={q.placeholder}
            className="w-full bg-transparent border-b-2 border-[#1A1A1A]/25 focus:border-[#DC2626] px-0 py-3 text-base lg:text-lg font-light text-[#1A1A1A] text-center outline-none transition-colors duration-200"
          />
          <div className="text-xs lg:text-sm font-light text-[#1A1A1A]/70 mt-2 text-center">{q.placeholder}</div>
        </div>
      )}

      {q.type === 'contact' && (
        <div className="flex flex-col gap-2 lg:gap-3 w-full">
          {contactFields.map((f, i) => (
            <div key={f.id} className="text-left">
              <label className="block text-[10px] lg:text-[11px] font-medium text-[#1A1A1A]/70 mb-0.5 uppercase tracking-wide">
                {f.label}
              </label>
              <input
                type={f.type}
                data-field={f.id}
                value={formData[f.id] || ''}
                onChange={e => setValue(f.id, e.target.value)}
                onBlur={() => validateContactField(f.id, formData[f.id])}
                onFocus={e => { e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' }) }}
                autoFocus={i === 0 && finePointer.current}
                autoComplete={f.auto}
                enterKeyHint={f.hint}
                aria-label={f.label}
                aria-invalid={Boolean(fieldErrors[f.id])}
                className={`w-full bg-white border-2 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-sm lg:text-base font-light text-[#1A1A1A] outline-none transition-all duration-200 ${fieldErrors[f.id] ? 'border-[#EF4444] bg-[#FFF5F5]' : 'border-[#E5E5E5] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'}`}
              />
              {fieldErrors[f.id] && (
                <p className="text-[11px] font-medium text-[#EF4444] mt-0.5">{fieldErrors[f.id]}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {q.type === 'review' && (
        <div className="w-full text-left">
          <ul className="flex flex-col gap-2">
            {[{ short: 'Тип бранд', val: formData.brandType, edit: () => setPhase('intro') },
              ...questions.slice(0, 7).map((rq, i) => ({
                short: rq.short,
                val: rq.type === 'contact'
                  ? [formData.name, formData.email, formData.phone, formData.site].filter(Boolean).join(' · ')
                  : Array.isArray(formData[rq.id]) ? (formData[rq.id] as string[]).join(', ') : formData[rq.id],
                edit: () => go(i),
              }))].map(row => (
              <li key={row.short} className="flex items-baseline justify-between gap-3 text-xs lg:text-sm border-b border-[#E5E5E5] pb-1.5">
                <span className="shrink-0 font-medium text-[#1A1A1A]/60">{row.short}</span>
                <span className="text-right text-[#1A1A1A] font-light truncate">{row.val || '—'}</span>
                <button type="button" onClick={row.edit} className="shrink-0 text-[11px] text-[#DC2626] underline underline-offset-2 hover:no-underline py-1">Редактирай</button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            role="checkbox"
            aria-checked={Boolean(formData.privacy)}
            onClick={() => setValue('privacy', !formData.privacy)}
            className="mt-4 flex items-start gap-3 text-left w-full py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626]"
          >
            <span className={`mt-0.5 w-5 h-5 rounded-[5px] border-2 flex items-center justify-center shrink-0 transition-colors duration-200 ${formData.privacy ? 'bg-[#DC2626] border-[#DC2626]' : 'border-[#1A1A1A]/30 bg-white'}`}>
              {formData.privacy && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
            </span>
            <span className="text-xs font-light text-[#1A1A1A]/70 leading-relaxed">
              Съгласен съм личните ми данни да бъдат обработени според <a href="./poveritelnost.html" target="_blank" rel="noopener" className="text-[#DC2626] underline underline-offset-2" onClick={e => e.stopPropagation()}>политиката за поверителност</a>.
            </span>
          </button>
        </div>
      )}

    </div>
  )

  /* ─── Зона В: навигационни pill бутони — хоризонтални, вътре в кръга/картата ─── */
  const navButtons = (variant: 'desktop' | 'mobile') => (
    <div className={variant === 'desktop' ? 'flex items-center justify-center gap-4' : 'flex flex-col gap-3 w-full'}>
      {variant === 'mobile' && (
        <button
          type="button"
          onClick={isReview ? submit : next}
          disabled={isSubmitting}
          className="w-full h-14 rounded-xl bg-[#DC2626] text-white text-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#B91C1C] active:scale-[0.98] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? (<><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Изпраща се...</>)
            : isReview ? 'Изпрати запитване' : 'Напред'}
          {!isSubmitting && (isReview
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" /></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
        </button>
      )}
      <button
        type="button"
        onClick={prev}
        disabled={current === 0}
        aria-label="Предишна стъпка"
        className={`${variant === 'desktop' ? 'w-[120px] h-12' : 'w-full h-12 rounded-xl'} ${variant === 'desktop' ? 'rounded-full' : ''} border-2 border-[#E5E5E5] bg-white text-sm font-medium text-[#1A1A1A]/60 flex items-center justify-center gap-2 transition-all duration-200 ${current === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:border-[#1A1A1A]/30 hover:text-[#1A1A1A] hover:bg-[#F5F5F5] hover:-translate-y-px active:translate-y-0 active:scale-[0.98]'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626]`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Назад
      </button>
      {variant === 'desktop' && (
        <button
          type="button"
          onClick={isReview ? submit : next}
          disabled={isSubmitting}
          className={`${isReview ? 'min-w-[200px] h-[52px] text-lg font-bold px-6' : 'w-[160px] h-12 text-base font-semibold'} rounded-full bg-[#DC2626] text-white flex items-center justify-center gap-2 hover:bg-[#B91C1C] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(220,38,38,0.3)] active:translate-y-0 active:shadow-none transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
        >
          {isSubmitting
            ? (<><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Изпраща се...</>)
            : isReview ? 'Изпрати запитване' : 'Напред'}
          {!isSubmitting && (isReview
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" /></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
        </button>
      )}
    </div>
  )

  const skipLink = q.skippable && (
    <button type="button" onClick={skip} className="mt-3 text-sm font-light text-[#1A1A1A]/50 underline underline-offset-2 hover:text-[#DC2626] transition-colors py-2 mx-auto block">
      Пропусни този въпрос
    </button>
  )

  /* ─── Зона А: иконка + стъпка ─── */
  const zoneA = (
    <div className="flex flex-col items-center gap-2">
      <StepGlyph step={current} />
      <div className="inline-flex items-center bg-[#F5F5F5] text-[#1A1A1A]/60 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.05em]">
        Стъпка {current + 1} от {questions.length}
      </div>
    </div>
  )

  const zoneTitle = (
    <div className="text-center px-2">
      <h2 className="text-lg lg:text-[clamp(18px,1.6vw,24px)] font-bold text-[#1A1A1A] leading-tight max-w-[95%] mx-auto">{q.title}</h2>
      {q.subtitle && <p className="text-xs lg:text-sm font-light text-[#1A1A1A]/60 mt-1.5 lg:mt-2 leading-relaxed max-w-sm mx-auto">{q.subtitle}</p>}
    </div>
  )

  /* ─── Успех ─── */
  if (isSuccess) {
    return (
      <div ref={rootRef} className="min-h-[80vh] supports-[height:100svh]:min-h-[80svh] flex flex-col items-center justify-center text-center bg-white section-padding py-16">
        <ConfettiBurst />
        <div className="wz-success-face w-32 lg:w-40 mb-10" aria-hidden="true">
          <LogoFace />
        </div>
        <h1 className="wz-h1 font-thin-display text-[clamp(40px,7vw,84px)] text-[#1A1A1A] leading-none mb-6">Благодарим!</h1>
        <p className="text-base font-light text-[#1A1A1A]/60 max-w-md mb-10">
          Запитването е изпратено. Ще се запознаем с детайлите и ще се свържем с вас в рамките на 24 часа.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center justify-center gap-2 px-7 h-12 rounded-full border-2 border-[#E5E5E5] text-sm font-medium text-[#1A1A1A]/70 hover:border-[#DC2626] hover:text-[#DC2626] active:scale-[0.98] transition-all duration-200"
          >
            Изпрати ново запитване
          </button>
          <button
            type="button"
            onClick={() => { const l = (window as unknown as { __lenis?: { scrollTo: (t: number) => void } }).__lenis; if (l) l.scrollTo(0); else window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.14em] font-medium text-[#DC2626] hover:gap-3 transition-all duration-300 py-2"
          >
            Обратно нагоре
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    )
  }

  /* ─── Интро: Какъв е вашият бизнес? ─── */
  if (phase === 'intro') {
    return (
      <div ref={rootRef} className="bg-white min-h-[85vh] supports-[height:100svh]:min-h-[85svh] flex items-center py-14 relative">
        {resume && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[80] bg-[#1A1A1A] text-white pl-5 pr-3 py-3 rounded-lg shadow-xl flex items-center gap-4 text-sm max-w-[calc(100vw-32px)]" role="status">
            <span className="font-light">Имате запазен прогрес — стъпка {Math.min((resume.current ?? 0) + 1, questions.length)}.</span>
            <button type="button" onClick={() => { setFormData(resume.formData || {}); setCurrent(Math.min(resume.current ?? 0, questions.length - 1)); setPhase(resume.phase === 'wizard' ? 'wizard' : 'intro'); setResume(null) }} className="shrink-0 bg-[#DC2626] hover:bg-[#B91C1C] px-3.5 py-1.5 rounded-md font-medium transition-colors">Продължи</button>
            <button type="button" onClick={() => { clearSaved(); setResume(null) }} className="shrink-0 text-white/60 hover:text-white px-1 py-1.5 transition-colors">Отначало</button>
          </div>
        )}
        <div className="section-padding w-full">
          <div className="container-max">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5">
                <h1 className="wz-h1 text-[clamp(32px,4.5vw,56px)] font-bold text-[#1A1A1A] leading-tight mb-8">
                  Какъв е вашият бизнес?
                </h1>
                <div className="flex flex-col gap-5 text-base lg:text-lg font-light italic text-[#1A1A1A]/70 leading-relaxed max-w-md">
                  <p>Изпращането на запитване не ви ангажира с нас, но ви гарантира, че ще се запознаем в детайли с вашия бизнес.</p>
                  <p>Така, когато ви се обадим за среща, ще влезем на нея подготвени и още от първия разговор ще ви бъдем полезни — с конкретни предложения, параметри и анализи.</p>
                </div>
              </div>
              <div className="lg:col-span-7 flex justify-center">
                <div className="relative w-[min(340px,88vw)] md:w-[460px] lg:w-[560px] aspect-square rounded-full border border-[#1A1A1A]/10 flex flex-col items-center justify-center gap-3 px-[11%]">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" aria-hidden="true">
                    <g transform="rotate(25 50 50)">
                      <circle cx="50" cy="50" r="49.5" fill="none" stroke="#E5E5E5" strokeWidth="0.7" strokeLinecap="round" strokeDasharray="4 7" />
                    </g>
                  </svg>
                  <div className="text-xs font-medium text-[#1A1A1A]/50 mb-2">Натиснете, за да започнете</div>
                  {['Съществуващ бранд', 'Стартиращ бранд', 'Личен проект / Инфлуенсър'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => startWizard(opt)}
                      className="group w-full max-w-[340px] min-h-[50px] lg:min-h-[48px] px-6 py-3 rounded-full border-2 border-[#E5E5E5] bg-white flex items-center gap-3 text-base font-semibold text-[#1A1A1A] leading-snug text-left transition-all duration-200 hover:border-[#DC2626] hover:bg-[#FFF5F5] hover:translate-x-1 hover:shadow-[0_2px_10px_rgba(220,38,38,0.08)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626]"
                    >
                      <span className="shrink-0 w-5 h-5 rounded-full border-2 border-[#D1D1D1] bg-white flex items-center justify-center transition-colors duration-200 group-hover:border-[#DC2626]">
                        <span className="w-2 h-2 rounded-full bg-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </span>
                      <span className="flex-1">{opt}</span>
                      <span className="shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5">
                          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ─── Wizard: лява колона с ясни състояния + кръг с ring progress ─── */
  return (
    <div ref={rootRef} className="bg-white min-h-[92vh] supports-[height:100svh]:min-h-[92svh] py-8 lg:py-12 overflow-x-clip">
      <div className="section-padding">
        <div className="container-max">
          {/* Мобилен stepper: номерирани кръгчета, свързани с линия */}
          <div className="lg:hidden mb-6" role="list" aria-label="Стъпки на запитването">
            <div className="flex items-center">
              {questions.map((sq, i) => (
                <div key={sq.id} role="listitem" aria-current={i === current ? 'step' : undefined} className={`flex items-center ${i < questions.length - 1 ? 'flex-1' : ''}`}>
                  <button
                    type="button"
                    onClick={() => { if (i < current) go(i) }}
                    aria-label={`Стъпка ${i + 1}: ${sq.short}`}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-semibold shrink-0 transition-colors duration-300 ${
                      i < current ? 'bg-[#DC2626] border-[#DC2626] text-white'
                      : i === current ? 'bg-[#DC2626] border-[#DC2626] text-white shadow-[0_0_0_3px_rgba(220,38,38,0.15)]'
                      : 'bg-white border-[#E5E5E5] text-[#1A1A1A]/45'
                    }`}
                  >
                    {i < current
                      ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
                      : i + 1}
                  </button>
                  {i < questions.length - 1 && <span className={`h-0.5 flex-1 mx-1 transition-colors duration-300 ${i < current ? 'bg-[#DC2626]' : 'bg-[#E5E5E5]'}`} />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Лява колона: всички стъпки с ясни състояния (desktop) */}
            <aside className="hidden lg:block lg:col-span-4">
              <ol className="flex flex-col gap-5">
                {questions.map((sq, i) => {
                  const done = i < current
                  const active = i === current
                  return (
                    <li key={sq.id}>
                      <button
                        type="button"
                        onClick={() => { if (done) go(i) }}
                        disabled={!done && !active}
                        aria-current={active ? 'step' : undefined}
                        className={`group flex items-baseline gap-2.5 text-left transition-colors duration-200 py-0.5 ${done ? 'cursor-pointer' : active ? 'cursor-default' : 'cursor-default'}`}
                      >
                        <span className={`text-xs font-mono font-bold w-7 shrink-0 ${active ? 'text-[#DC2626]' : 'text-[#1A1A1A]/50'}`}>{String(i + 1).padStart(2, '0')}</span>
                        <span className={`leading-snug transition-colors duration-200 ${
                          active ? 'text-[#DC2626] text-lg font-bold'
                          : done ? 'text-[#1A1A1A]/70 text-base font-medium group-hover:text-[#DC2626] group-hover:underline underline-offset-4'
                          : 'text-[#1A1A1A]/50 text-base font-normal'
                        }`}>
                          {active && <span className="inline-block w-2 h-2 rounded-full bg-[#DC2626] mr-2 align-middle" aria-hidden="true" />}
                          {sq.title}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
              <div className="mt-10 text-xs font-light text-[#1A1A1A]/65">
                Предпочитате директно? <a href="mailto:adsjustpablo@gmail.com" className="text-[#DC2626] hover:underline py-1">adsjustpablo@gmail.com</a>
              </div>
            </aside>

            {/* Кръгът: ring progress с точки отвън, зони А/Б/В вътре (desktop) */}
            <div className="hidden lg:flex lg:col-span-8 justify-center xl:justify-end">
              <div className="wz-shake relative w-[min(48vw,680px)] aspect-square shrink-0">
                <ProgressRing current={current} total={questions.length} />
                <div className="absolute inset-[4.5%] rounded-full bg-white border border-[#E5E5E5] shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
                  <div className="wz-anim absolute inset-0 flex flex-col items-center justify-between pt-[7%] pb-[6%] px-[10%]">
                    {zoneA}
                    <div ref={contentRef} className="w-full max-w-[480px] flex-1 min-h-0 flex flex-col items-center gap-4 lg:gap-5 my-2 lg:my-3 overflow-y-auto scroll-smooth overscroll-contain [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                      {zoneTitle}
                      {answerArea}
                      {skipLink}
                    </div>
                    {navButtons('desktop')}
                  </div>
                </div>
              </div>
            </div>

            {/* Мобилно: заоблена карта вместо кръг — духът на дизайна, повече място */}
            <div className="lg:hidden">
              <div className="wz-shake rounded-[24px] border border-[#E5E5E5] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-6 min-h-[450px] max-h-[calc(100svh-180px)] flex flex-col">
                <div ref={contentRef} className="wz-anim flex flex-col items-center gap-5 flex-1 overflow-y-auto scroll-smooth overscroll-contain [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                  {zoneA}
                  {zoneTitle}
                  {answerArea}
                  {skipLink}
                  <div className="mt-auto w-full pt-4">
                    {navButtons('mobile')}
                  </div>
                </div>
              </div>
              <div className="mt-6 text-xs font-light text-[#1A1A1A]/65 text-center">
                Предпочитате директно? <a href="mailto:adsjustpablo@gmail.com" className="text-[#DC2626] hover:underline py-1">adsjustpablo@gmail.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
