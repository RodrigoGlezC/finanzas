import { describe, it, expect } from 'vitest'
import { accBalance, goalSaved, budgetSummary } from './calc'
import { migrate } from './storage'
import type { Movement } from '../types'

const mv = (o: Partial<Movement>): Movement => ({
  id: Math.random().toString(36).slice(2), type: 'out', amount: 0, category: 'X',
  date: '2020-01-10', note: '', accountId: 'a1', _c: 0, ...o,
})

describe('accBalance', () => {
  it('suma apertura + ingresos - gastos de esa cuenta', () => {
    const st = migrate({
      accounts: [{ id: 'a1', name: 'Efectivo', type: 'efectivo', opening: 100 }],
      movements: [
        mv({ type: 'in', amount: 50, accountId: 'a1' }),
        mv({ type: 'out', amount: 20, accountId: 'a1' }),
        mv({ type: 'in', amount: 999, accountId: 'otra' }), // otra cuenta, no cuenta
      ],
    })
    expect(accBalance(st, 'a1')).toBe(130)
  })
})

describe('goalSaved', () => {
  it('es initial + gastos con goalId (fuente única de verdad)', () => {
    const goal = { id: 'g1', name: 'Fondo', target: 1000, initial: 100, color: '#000', _c: 0 }
    const st = migrate({
      goals: [goal],
      movements: [
        mv({ type: 'out', amount: 30, goalId: 'g1' }),
        mv({ type: 'out', amount: 20, goalId: 'g1' }),
        mv({ type: 'in', amount: 500, goalId: 'g1' }), // ingreso: se ignora
        mv({ type: 'out', amount: 77 }), // sin goalId: se ignora
      ],
    })
    expect(goalSaved(st, goal)).toBe(150)
  })
})

describe('budgetSummary', () => {
  it('calcula restante = límite - gastado del mes', () => {
    const anchor = new Date(2020, 0, 15) // enero 2020 (mes pasado, evita lógica de "hoy")
    const st = migrate({
      budgets: { Food: 100 },
      movements: [mv({ type: 'out', amount: 40, category: 'Food', date: '2020-01-10' })],
    })
    const s = budgetSummary(st, anchor)
    expect(s.hasBudgets).toBe(true)
    expect(s.limitTotal).toBe(100)
    expect(s.spentTotal).toBe(40)
    expect(s.remaining).toBe(60)
  })
})
