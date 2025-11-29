export function formatCurrency(amount: number): string {
  return `${amount} DA`
}

export function formatNumber(num: number): string {
  return num.toString()
}

export function toArabicNumber(num: number | string): string {
  return String(num)
}
