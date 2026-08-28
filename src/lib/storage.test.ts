import { describe, it, expect } from 'vitest'
import { migrate, addTombstones, removeTombstones, emptyState } from './storage'
import type { AppState } from '../types'

describe('migrate', () => {
  it('inicializa los campos que faltan sin perder datos', () => {
    const d = migrate({ movements: [] })
    expect(d.accounts.length).toBeGreaterThan(0) // crea "Efectivo"
    expect(d.budgets).toEqual({})
    expect(d.recurring).toEqual([])
    expect(d.goals).toEqual([])
    expect(d.deleted).toEqual({})
    expect(d.version).toBe(2)
  })

  it('respeta un array de categorías vacío (usuario nuevo, totalmente personalizable)', () => {
    const d = migrate({ movements: [], cats: [] })
    expect(d.cats).toEqual([])
  })

  it('siembra categorías por defecto solo si el campo no existe (datos legacy)', () => {
    const d = migrate({ movements: [] })
    expect(d.cats.length).toBeGreaterThan(0)
  })

  it('es idempotente', () => {
    const once = migrate({ movements: [{ id: 'm1', type: 'out', amount: 10, category: 'X', date: '2026-01-01', note: '', accountId: 'acc_efvo', _c: 1 }] })
    const twice = migrate(structuredClone(once))
    expect(twice).toEqual(once)
  })

  it('asigna accountId a movimientos que no lo tengan', () => {
    const d = migrate({ movements: [{ id: 'm1', type: 'out', amount: 5, category: 'X', date: '2026-01-01', note: '', _c: 1 }] })
    expect(d.movements[0].accountId).toBe(d.accounts[0].id)
  })

  it('emptyState arranca sin categorías', () => {
    expect(emptyState().cats).toEqual([])
  })
})

describe('tombstones', () => {
  const base = (): AppState => migrate({ movements: [] })

  it('addTombstones marca ids con timestamp', () => {
    const st = base()
    addTombstones(st, ['a', 'b'])
    expect(Object.keys(st.deleted!).sort()).toEqual(['a', 'b'])
    expect(typeof st.deleted!.a).toBe('number')
  })

  it('removeTombstones quita ids (p. ej. al deshacer)', () => {
    const st = base()
    addTombstones(st, ['a', 'b'])
    removeTombstones(st, ['a'])
    expect(Object.keys(st.deleted!)).toEqual(['b'])
  })
})
