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

/**
 * Formatea el string crudo del keypad de monto (p. ej. "12500", "12500.", "12500.5")
 * agrupando miles en la parte entera, sin tocar el valor interno usado por parseFloat.
 * Conserva el punto decimal final y los decimales tal cual se están tecleando.
 */
export function fmtAmountInput(s: string): string {
  if (!s) return ''
  const dot = s.indexOf('.')
  const intPart = dot === -1 ? s : s.slice(0, dot)
  const grouped = intPart ? Number(intPart).toLocaleString('es-MX') : '0'
  return dot === -1 ? grouped : grouped + '.' + s.slice(dot + 1)
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
// Cache de variables CSS por tema: getComputedStyle es una lectura de estilo forzada,
// y cssVar/colorForName se llaman por fila en listas. Se invalida al cambiar data-theme.
let _varCache: Record<string, string> = {}
let _varCacheTheme: string | null = null
export function cssVar(name: string): string {
  const theme = document.documentElement.getAttribute('data-theme') || ''
  if (theme !== _varCacheTheme) { _varCache = {}; _varCacheTheme = theme }
  let v = _varCache[name]
  if (v === undefined) {
    v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    _varCache[name] = v
  }
  return v
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
