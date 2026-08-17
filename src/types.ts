export type MovType = 'in' | 'out'
export type AccountType = 'efectivo' | 'tarjeta' | 'banco' | 'otros'
export type Freq = 'mensual' | 'semanal'

export interface Movement {
  id: string
  type: MovType
  amount: number
  category: string
  date: string // YYYY-MM-DD
  note: string
  accountId: string
  recurringId?: string
  period?: string
  goalId?: string
  transfer?: boolean
  transferId?: string
  _c: number
}

export interface Category {
  name: string
  group: string
}

export interface Account {
  id: string
  name: string
  type: AccountType
  opening: number
}

export interface Goal {
  id: string
  name: string
  target: number
  initial: number
  color: string
  _c: number
  saved?: number // legacy, ya no se usa como fuente de verdad
}

export interface Recurring {
  id: string
  type: MovType
  amount: number
  category: string
  accountId: string
  freq: Freq
  day: number
  note: string
  since: string
  active: boolean
  skip: string[]
}

export interface AppState {
  movements: Movement[]
  cats: Category[]
  groups: string[]
  accounts: Account[]
  budgets: Record<string, number>
  goals: Goal[]
  recurring: Recurring[]
  version: number
  updatedAt: number
}

export type ViewName = 'inicio' | 'movimientos' | 'presupuestos' | 'reportes' | 'ajustes'
export type Theme = 'light' | 'dark'
export type PeriodMode = 'month' | 'week'
