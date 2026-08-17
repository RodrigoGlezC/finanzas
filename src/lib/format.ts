import { SERIES } from './constants'

const MXN = new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 0,
})
const MXN2 = new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2,
})

export function money(n: number, dec = false): string {
  return (dec ? MXN2 : MXN).format(n || 0)
}

export function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

/* ---------- fechas ---------- */
export function startOfToday(): Date {
  const t = new Date()
  return new Date(t.getFullYear(), t.getMonth(), t.getDate())
}
export function ymd(d: Date): string {
  return (
    d.getFullYear() +
    '-' + String(d.getMonth() + 1).padStart(2, '0') +
    '-' + String(d.getDate()).padStart(2, '0')
  )
}
export function parseD(s: string): Date {
  return new Date(s + 'T00:00:00')
}
export function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate()
}
export function mondayOf(d: Date): Date {
  const x = new Date(d)
  const w = (x.getDay() + 6) % 7
  x.setDate(x.getDate() - w)
  return x
}
export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
export function monthKey(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}

/* ---------- colores ---------- */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
export function colorForName(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return cssVar(SERIES[h % SERIES.length])
}
export function seriesColor(i: number): string {
  return cssVar(SERIES[i % SERIES.length])
}
export function tint(hex: string, a: number): string {
  return `color-mix(in srgb, ${hex} ${a}%, transparent)`
}
