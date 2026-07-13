/** Курс евро/лев — фиксиран 1 EUR = 1.95583 BGN */
const EUR_BGN_RATE = 1.95583

export function bgn(eur: number): string {
  const lev = Math.round(eur * EUR_BGN_RATE)
  return `≈ ${lev.toLocaleString('bg-BG')} лв.`
}
