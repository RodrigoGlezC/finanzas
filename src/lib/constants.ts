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

// Íconos por defecto por nombre de categoría (claves del set SVG en lib/icons).
export const ICONS: Record<string, string> = {
  Despensa: 'cart', Renta: 'home', Transporte: 'bus', Lavandería: 'laundry', Servicios: 'bulb',
  Celular: 'phone', Recargas: 'wifi', 'Compras Personales': 'bag', Salud: 'stethoscope',
  Spotify: 'headphones', iCloud: 'cloud', Claude: 'sparkle', Ahorro: 'piggy', 'Ahorro Personal': 'bank',
  Sueldo: 'cash', 'Ingreso Extra': 'plus',
}

export const ACC_ICON: Record<string, string> = {
  efectivo: 'cash', tarjeta: 'card', banco: 'bank', otros: 'wallet',
}

export const WEEKDAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

/** Devuelve la CLAVE de ícono (no un emoji) para una categoría. Ver lib/icons. */
export function iconFor(cat: string, type: MovType, cats?: Category[]): string {
  const custom = cats?.find((c) => c.name === cat)?.icon
  return custom || ICONS[cat] || (type === 'in' ? 'coins' : 'tag')
}
