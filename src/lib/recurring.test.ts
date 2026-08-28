import { describe, it, expect } from 'vitest'
import { materializeRecurring } from './recurring'
import { migrate } from './storage'
import type { Recurring } from '../types'

const rec = (o: Partial<Recurring>): Recurring => ({
  id: 'r1', type: 'out', amount: 100, category: 'Renta', accountId: 'a1',
  freq: 'mensual', day: 1, note: '', since: '2020-01-01', active: true, skip: [], ...o,
})

describe('materializeRecurring', () => {
  it('genera los vencidos y es idempotente (no duplica)', () => {
    const st = migrate({ recurring: [rec({})] })
    const first = materializeRecurring(st)
    expect(first).toBeGreaterThan(0)
    // todos quedan enlazados por recurringId + period
    expect(st.movements.every((m) => m.recurringId === 'r1' && m.period)).toBe(true)
    // segunda pasada: nada nuevo
    const second = materializeRecurring(st)
    expect(second).toBe(0)
  })

  it('no genera periodos en skip', () => {
    const st = migrate({ recurring: [rec({})] })
    materializeRecurring(st)
    const periods = st.movements.map((m) => m.period!)
    const skipTarget = periods[1] // salta un periodo concreto
    // reinicia y materializa con ese periodo en skip
    const st2 = migrate({ recurring: [rec({ skip: [skipTarget] })] })
    materializeRecurring(st2)
    expect(st2.movements.some((m) => m.period === skipTarget)).toBe(false)
  })

  it('ignora recurrentes inactivos', () => {
    const st = migrate({ recurring: [rec({ active: false })] })
    expect(materializeRecurring(st)).toBe(0)
    expect(st.movements.length).toBe(0)
  })
})
