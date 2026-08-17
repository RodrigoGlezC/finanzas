import type { AppState, Recurring } from '../types'
import { addDays, daysInMonth, monthKey, mondayOf, parseD, startOfToday, ymd } from './format'
import { uid } from './storage'

/** Genera los movimientos vencidos de cada recurrente (idempotente). Muta y devuelve cuántos agregó. */
export function materializeRecurring(state: AppState): number {
  const today = startOfToday()
  let added = 0
  state.recurring.filter((r) => r.active !== false).forEach((r) => {
    const since = parseD(r.since)
    if (r.freq === 'mensual') {
      let d = new Date(since.getFullYear(), since.getMonth(), 1)
      while (d <= today) {
        const y = d.getFullYear(), m = d.getMonth(), key = monthKey(d)
        const day = Math.min(r.day || 1, daysInMonth(y, m))
        const date = new Date(y, m, day)
        if (
          date >= since && date <= today &&
          !(r.skip && r.skip.includes(key)) &&
          !state.movements.some((x) => x.recurringId === r.id && x.period === key)
        ) {
          state.movements.push({
            id: uid('m_'), type: r.type, amount: r.amount, category: r.category,
            date: ymd(date), note: r.note || '', accountId: r.accountId,
            recurringId: r.id, period: key, _c: Date.now() + added,
          })
          added++
        }
        d = new Date(y, m + 1, 1)
      }
    } else {
      let d = mondayOf(since)
      while (d <= today) {
        const off = (r.day || 1) - 1
        const date = addDays(d, off)
        const key = 'W' + ymd(mondayOf(date))
        if (
          date >= since && date <= today &&
          !(r.skip && r.skip.includes(key)) &&
          !state.movements.some((x) => x.recurringId === r.id && x.period === key)
        ) {
          state.movements.push({
            id: uid('m_'), type: r.type, amount: r.amount, category: r.category,
            date: ymd(date), note: r.note || '', accountId: r.accountId,
            recurringId: r.id, period: key, _c: Date.now() + added,
          })
          added++
        }
        d = addDays(d, 7)
      }
    }
  })
  return added
}

export interface Upcoming { r: Recurring; date: Date }

export function upcomingList(state: AppState, days = 31): Upcoming[] {
  const today = startOfToday()
  const limit = addDays(today, days)
  const out: Upcoming[] = []
  state.recurring.filter((r) => r.active !== false).forEach((r) => {
    if (r.freq === 'mensual') {
      for (let k = 0; k < 2; k++) {
        const base = new Date(today.getFullYear(), today.getMonth() + k, 1)
        const day = Math.min(r.day || 1, daysInMonth(base.getFullYear(), base.getMonth()))
        const date = new Date(base.getFullYear(), base.getMonth(), day)
        if (date > today && date <= limit) out.push({ r, date })
      }
    } else {
      let d = mondayOf(today)
      for (let k = 0; k < 6; k++) {
        const date = addDays(d, (r.day || 1) - 1)
        if (date > today && date <= limit) out.push({ r, date })
        d = addDays(d, 7)
      }
    }
  })
  return out.sort((a, b) => a.date.getTime() - b.date.getTime())
}
