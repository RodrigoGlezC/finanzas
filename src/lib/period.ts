import type { PeriodMode } from '../types'
import { addDays, cap, daysInMonth, mondayOf, monthKey } from './format'

export interface Period {
  start: Date
  end: Date
  inRange: (dateStr: string) => boolean
  label: string
}

export function getPeriod(anchor: Date, mode: PeriodMode): Period {
  if (mode === 'week') {
    const s = mondayOf(anchor)
    const e = addDays(s, 6)
    return {
      start: s, end: e,
      inRange: (d) => {
        const x = new Date(d + 'T00:00:00')
        return x >= s && x <= e
      },
      label: s.getDate() + '–' + e.getDate() + ' ' + e.toLocaleDateString('es-MX', { month: 'short' }).replace('.', ''),
    }
  }
  const y = anchor.getFullYear(), m = anchor.getMonth()
  const s = new Date(y, m, 1), e = new Date(y, m, daysInMonth(y, m))
  const key = monthKey(anchor)
  return {
    start: s, end: e,
    inRange: (d) => d.slice(0, 7) === key,
    label: cap(anchor.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }).replace('.', ' ')),
  }
}
