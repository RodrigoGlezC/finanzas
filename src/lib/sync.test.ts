import { describe, it, expect } from 'vitest'
import { mergeStates, nextClock } from './sync'
import type { AppState, Movement } from '../types'

function state(over: Partial<AppState>): AppState {
  return {
    movements: [], cats: [], groups: [], accounts: [], budgets: {},
    goals: [], recurring: [], version: 2, updatedAt: 0, deleted: {},
    ...over,
  }
}
const mv = (id: string): Movement => ({
  id, type: 'out', amount: 1, category: 'X', date: '2026-01-01', note: '', accountId: 'a', _c: 0,
})
const ids = (s: AppState) => s.movements.map((m) => m.id).sort()

describe('mergeStates', () => {
  it('une adiciones en paralelo sin perder nada (el caso que antes perdía datos)', () => {
    const r = mergeStates(
      state({ movements: [mv('A'), mv('B')], updatedAt: 1 }),
      state({ movements: [mv('A'), mv('C')], updatedAt: 2 }),
    )
    expect(ids(r)).toEqual(['A', 'B', 'C'])
  })

  it('un borrado autoritativo gana y no resucita, pero conserva lo demás', () => {
    const r = mergeStates(
      state({ movements: [mv('A')], deleted: { B: Date.now() }, updatedAt: 3 }),
      state({ movements: [mv('A'), mv('B'), mv('C')], updatedAt: 2 }),
    )
    expect(ids(r)).toEqual(['A', 'C'])
  })

  it('deshacer un borrado ya sincronizado vuelve a traer el movimiento', () => {
    const r = mergeStates(
      state({ movements: [mv('A')], deleted: { B: Date.now() }, updatedAt: 3 }),
      state({ movements: [mv('A'), mv('B')], deleted: {}, updatedAt: 4 }),
    )
    expect(ids(r)).toEqual(['A', 'B'])
    expect(r.deleted?.B).toBeUndefined() // el tombstone de un movimiento vivo se limpia
  })

  it('poda tombstones más viejos que el TTL', () => {
    const ancient = Date.now() - 1000 * 60 * 60 * 24 * 200 // 200 días
    const r = mergeStates(
      state({ movements: [mv('A'), mv('B')], deleted: { B: ancient }, updatedAt: 3 }),
      state({ movements: [mv('A')], updatedAt: 1 }),
    )
    expect(ids(r)).toEqual(['A', 'B']) // B no se excluye porque el tombstone caducó
    expect(r.deleted?.B).toBeUndefined()
  })

  it('el updatedAt resultante es el máximo de ambos', () => {
    const r = mergeStates(state({ updatedAt: 5 }), state({ updatedAt: 9 }))
    expect(r.updatedAt).toBe(9)
  })
})

describe('nextClock', () => {
  it('con reloj normal usa la hora actual (nunca antes de "ahora")', () => {
    const before = Date.now()
    const r = nextClock(0)
    expect(r).toBeGreaterThanOrEqual(before)
  })

  it('si el prev viene del futuro (reloj del otro PC adelantado), lo supera en +1', () => {
    const future = Date.now() + 1_000_000
    expect(nextClock(future)).toBe(future + 1)
  })

  it('es estrictamente monótono en commits dentro del mismo milisegundo', () => {
    const t = nextClock(0)
    expect(nextClock(t)).toBeGreaterThan(t)
  })
})
