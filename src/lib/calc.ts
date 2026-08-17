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
    .filter((m) => m.type === 'out' && !m.transfer && m.date.slice(0, 7) === key)
    .forEach((m) => { o[m.category] = (o[m.category] || 0) + m.amount })
  return o
}

/** Movimientos reales (excluye transferencias entre cuentas). */
export function isReal(m: { transfer?: boolean }): boolean {
  return !m.transfer
}

/** Presupuesto restante del mes + gasto diario recomendado para lo que queda. */
export function budgetSummary(state: AppState, anchor: Date) {
  const spent = spentByCatMonth(state, anchor)
  const cats = Object.keys(state.budgets).filter((c) => state.budgets[c] > 0)
  const limitTotal = cats.reduce((s, c) => s + state.budgets[c], 0)
  const spentTotal = cats.reduce((s, c) => s + (spent[c] || 0), 0)
  const remaining = limitTotal - spentTotal
  const y = anchor.getFullYear(), m = anchor.getMonth()
  const totalDays = new Date(y, m + 1, 0).getDate()
  const today = startOfToday()
  const isCurrentMonth = today.getFullYear() === y && today.getMonth() === m
  const daysLeft = isCurrentMonth ? Math.max(1, totalDays - today.getDate() + 1) : totalDays
  return { hasBudgets: cats.length > 0, limitTotal, spentTotal, remaining, daysLeft, perDay: remaining > 0 ? remaining / daysLeft : 0 }
}

export interface Alert { level: 'warn' | 'over' | 'info'; text: string }

/** Alertas proactivas basadas en el ritmo de gasto del mes. */
export function budgetAlerts(state: AppState, anchor: Date): Alert[] {
  const out: Alert[] = []
  const y = anchor.getFullYear(), m = anchor.getMonth()
  const today = startOfToday()
  const isCurrent = today.getFullYear() === y && today.getMonth() === m
  const totalDays = new Date(y, m + 1, 0).getDate()
  const dayOfMonth = isCurrent ? today.getDate() : totalDays
  const spent = spentByCatMonth(state, anchor)
  Object.keys(state.budgets).filter((c) => state.budgets[c] > 0).forEach((c) => {
    const limit = state.budgets[c]
    const s = spent[c] || 0
    if (s > limit) { out.push({ level: 'over', text: `Te pasaste del presupuesto de ${c} (${Math.round((s / limit) * 100)}%).` }); return }
    const pace = (s / dayOfMonth) * totalDays
    if (isCurrent && pace > limit * 1.05 && s > 0) {
      out.push({ level: 'warn', text: `A este ritmo te pasarás de ${c} este mes.` })
    }
  })
  return out.slice(0, 3)
}

/** Categoría más usada por tipo (para defaults rápidos). */
export function lastCategoryFor(state: AppState, type: 'in' | 'out'): string {
  const m = state.movements
    .filter((x) => x.type === type && !x.transfer)
    .sort((a, b) => b.date.localeCompare(a.date) || b._c - a._c)[0]
  return m?.category || ''
}

export function lastAccountId(state: AppState): string {
  const m = state.movements.slice().sort((a, b) => b._c - a._c)[0]
  return m?.accountId || state.accounts[0]?.id || ''
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
    .filter((m) => m.type === 'out' && !m.transfer && catGroup(state, m.category) === 'Ahorros' && keys.includes(m.date.slice(0, 7)))
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
    const ms = state.movements.filter((m) => m.date.slice(0, 7) === key && !m.transfer)
    arr.push({
      key,
      label: d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', ''),
      in: ms.filter((m) => m.type === 'in').reduce((a, b) => a + b.amount, 0),
      out: ms.filter((m) => m.type === 'out').reduce((a, b) => a + b.amount, 0),
    })
  }
  return arr
}
