import type { AppState, Goal } from '../types'
import { monthKey, startOfToday } from './format'

export function catGroup(state: AppState, name: string): string {
  const c = state.cats.find((c) => c.name === name)
  return c ? c.group : 'Otros'
}

export function accName(state: AppState, id: string): string {
  const a = state.accounts.find((a) => a.id === id)
  return a ? a.name : '—'
}

export function accBalance(state: AppState, id: string): number {
  const a = state.accounts.find((a) => a.id === id)
  if (!a) return 0
  return a.opening + state.movements
    .filter((m) => m.accountId === id)
    .reduce((s, m) => s + (m.type === 'in' ? m.amount : -m.amount), 0)
}

export function spentByCatMonth(state: AppState, anchor: Date): Record<string, number> {
  const key = monthKey(anchor)
  const o: Record<string, number> = {}
  state.movements
    .filter((m) => m.type === 'out' && m.date.slice(0, 7) === key)
    .forEach((m) => { o[m.category] = (o[m.category] || 0) + m.amount })
  return o
}

export function goalSaved(state: AppState, g: Goal): number {
  return (g.initial || 0) + state.movements
    .filter((m) => m.goalId === g.id && m.type === 'out')
    .reduce((s, m) => s + m.amount, 0)
}

export function avgMonthlySavings(state: AppState): number {
  const now = startOfToday()
  const keys: string[] = []
  for (let i = 0; i < 3; i++) {
    keys.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)))
  }
  const tot = state.movements
    .filter((m) => m.type === 'out' && catGroup(state, m.category) === 'Ahorros' && keys.includes(m.date.slice(0, 7)))
    .reduce((s, m) => s + m.amount, 0)
  return tot / 3
}

export interface MonthPoint { key: string; label: string; in: number; out: number }

export function monthlySeries(state: AppState, n: number): MonthPoint[] {
  const arr: MonthPoint[] = []
  const now = startOfToday()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = monthKey(d)
    const ms = state.movements.filter((m) => m.date.slice(0, 7) === key)
    arr.push({
      key,
      label: d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', ''),
      in: ms.filter((m) => m.type === 'in').reduce((a, b) => a + b.amount, 0),
      out: ms.filter((m) => m.type === 'out').reduce((a, b) => a + b.amount, 0),
    })
  }
  return arr
}
