import type { Category, MovType } from '../types'

export const STORE_KEY = 'micontrolgastos_v1'
export const THEME_KEY = 'mcg_theme'
export const LAST_BACKUP_KEY = 'mcg_lastBackup'

export const SERIES = ['--s1', '--s2', '--s3', '--s4', '--s5', '--s6', '--s7', '--s8'] as const

export const DEFAULT_GROUPS = [
  'Necesidades Básicas',
  'Personal',
  'Suscripciones',
  'Ahorros',
  'Ingresos',
  'Otros',
]

export const DEFAULT_CATS: Category[] = [
  { name: 'Despensa', group: 'Necesidades Básicas' },
  { name: 'Renta', group: 'Necesidades Básicas' },
  { name: 'Transporte', group: 'Necesidades Básicas' },
  { name: 'Lavandería', group: 'Necesidades Básicas' },
  { name: 'Servicios', group: 'Necesidades Básicas' },
  { name: 'Celular', group: 'Personal' },
  { name: 'Recargas', group: 'Personal' },
  { name: 'Compras Personales', group: 'Personal' },
  { name: 'Salud', group: 'Personal' },
  { name: 'Spotify', group: 'Suscripciones' },
  { name: 'iCloud', group: 'Suscripciones' },
  { name: 'Claude', group: 'Suscripciones' },
  { name: 'Ahorro', group: 'Ahorros' },
  { name: 'Ahorro Personal', group: 'Ahorros' },
  { name: 'Sueldo', group: 'Ingresos' },
  { name: 'Ingreso Extra', group: 'Ingresos' },
]

export const ICONS: Record<string, string> = {
  Despensa: '🛒', Renta: '🏠', Transporte: '🚌', Lavandería: '🧺', Servicios: '💡',
  Celular: '📱', Recargas: '📶', 'Compras Personales': '🛍️', Salud: '🩺',
  Spotify: '🎧', iCloud: '☁️', Claude: '✨', Ahorro: '🐷', 'Ahorro Personal': '🏦',
  Sueldo: '💵', 'Ingreso Extra': '➕',
}

export const ACC_ICON: Record<string, string> = {
  efectivo: '💵', tarjeta: '💳', banco: '🏦', otros: '👛',
}

export const WEEKDAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

export function iconFor(cat: string, type: MovType): string {
  return ICONS[cat] || (type === 'in' ? '💰' : '💳')
}
