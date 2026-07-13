import { useEffect, useState } from 'react'

/* ────────────────────────────────────────────────────────────
   Промо-ургентност:
   • брояч, който отброява до края на текущия месец;
   • „live viewers" индикатор — колко души разглеждат офертата сега
     (лек random-walk, за да изглежда живо).
   Само на клиента (new Date / Math.random), tabular-nums срещу „подскачане".
   ──────────────────────────────────────────────────────────── */

function msUntilEndOfMonth() {
  const now = new Date()
  // Начало на следващия месец = край на текущия (авто-ролва при нов месец)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0)
  return Math.max(0, end.getTime() - now.getTime())
}

function breakdown(ms: number) {
  const s = Math.floor(ms / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    mins: Math.floor((s % 3600) / 60),
    secs: s % 60,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

/* Брой „разглеждащи" в момента — тръгва произволно в диапазона и се
   разхожда с ±1 на неравни интервали, за да усеща като реален трафик. */
const V_MIN = 2
const V_MAX = 6
function initialViewers() {
  return V_MIN + Math.floor(Math.random() * (V_MAX - V_MIN + 1))
}

export default function PromoCountdown({ className = '' }: { className?: string }) {
  const [ms, setMs] = useState(msUntilEndOfMonth)
  const [viewers, setViewers] = useState(initialViewers)

  useEffect(() => {
    const id = window.setInterval(() => setMs(msUntilEndOfMonth()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    let timer: number
    const schedule = () => {
      // 7–19 сек между промените, за да не изглежда „часовниково"
      timer = window.setTimeout(() => {
        setViewers(prev => {
          const delta = Math.random() < 0.5 ? -1 : 1
          const next = prev + delta
          if (next < V_MIN) return V_MIN + 1
          if (next > V_MAX) return V_MAX - 1
          return next
        })
        schedule()
      }, 7000 + Math.random() * 12000)
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [])

  const t = breakdown(ms)
  const units = [
    { v: t.days, l: t.days === 1 ? 'ден' : 'дни' },
    { v: t.hours, l: 'часа' },
    { v: t.mins, l: 'мин' },
    { v: t.secs, l: 'сек' },
  ]

  return (
    <div className={`inline-flex flex-col gap-2.5 ${className}`}>
      <span className="inline-flex items-center gap-2 text-[11px] lg:text-xs uppercase tracking-[0.12em] font-semibold text-[#1A1A1A]/65">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Промоцията изтича до края на месеца
      </span>

      <div className="flex items-stretch gap-1.5" role="timer" aria-label="Оставащо време до края на промоцията">
        {units.map(u => (
          <div
            key={u.l}
            className="flex flex-col items-center justify-center bg-[#1A1A1A] text-white rounded-xl px-2.5 py-1.5 min-w-[48px] shadow-[0_6px_20px_rgba(0,0,0,0.10)]"
          >
            <span className="text-xl lg:text-2xl font-bold leading-none tabular-nums">{pad(u.v)}</span>
            <span className="text-[9px] uppercase tracking-[0.08em] text-white/60 mt-1">{u.l}</span>
          </div>
        ))}
      </div>

      {/* Live viewers — социално доказателство/ургентност */}
      <span className="inline-flex items-center gap-2 text-xs font-medium text-[#1A1A1A]/70" aria-live="polite">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#DC2626] opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#DC2626]" />
        </span>
        <span className="tabular-nums font-semibold text-[#1A1A1A]">{viewers}</span>&nbsp;души разглеждат тази оферта в момента
      </span>
    </div>
  )
}
