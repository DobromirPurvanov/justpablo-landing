// Официален фиксиран курс за превалутиране EUR -> BGN
export const EUR_BGN_RATE = 1.95583

const bgnFormatter = new Intl.NumberFormat('bg-BG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** 485 -> "948,58 лв." */
export const bgn = (eur: number) => `${bgnFormatter.format(eur * EUR_BGN_RATE)} лв.`

/** 205, 255 -> "400,95 – 498,74 лв." */
export const bgnRange = (eurFrom: number, eurTo: number) =>
  `${bgnFormatter.format(eurFrom * EUR_BGN_RATE)} – ${bgnFormatter.format(eurTo * EUR_BGN_RATE)} лв.`
