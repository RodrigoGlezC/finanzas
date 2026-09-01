import type { ReactNode } from 'react'

/**
 * Set de íconos monocromo estilo "SF Symbols": trazo (`currentColor`), sin relleno,
 * viewBox 24 y grosor uniforme. Reemplaza a los emoji en toda la app.
 * El color lo hereda del contenedor (currentColor) y el tamaño del font-size (1em).
 */

// Contenido interno de cada ícono (paths/shapes). El <svg> envolvente pone stroke/caps.
const P: Record<string, ReactNode> = {
  // — Dinero / cuentas —
  coins: <><ellipse cx="12" cy="6.5" rx="7" ry="3" /><path d="M5 6.5v5c0 1.66 3.13 3 7 3s7-1.34 7-3v-5" /><path d="M5 11.5v5c0 1.66 3.13 3 7 3s7-1.34 7-3v-5" /></>,
  cash: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M5.5 9v6M18.5 9v6" /></>,
  card: <><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19" /><path d="M6 15h4" /></>,
  bank: <><path d="M3 10 12 4l9 6" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" /><path d="M3.5 21h17" /></>,
  wallet: <><rect x="3" y="5.5" width="18" height="14" rx="2.5" /><path d="M15 11.5h6v4h-6a2 2 0 0 1 0-4z" /><path d="M15.8 13.5h.01" /></>,
  piggy: <><path d="M4 12.5A6 5.5 0 0 1 10 7h3.5a6 5.5 0 0 1 6 5.5 6 5.5 0 0 1-2 4.1V20h-3v-2h-2v2H7v-2.4a6 5.5 0 0 1-3-5.1z" /><path d="M2.6 11.5h1.6" /><circle cx="16.5" cy="11.5" r=".7" /><path d="M9 7l1-2" /></>,
  transfer: <><path d="M4 8.5h13l-3-3" /><path d="M20 15.5H7l3 3" /></>,
  // — Necesidades / hogar —
  cart: <><circle cx="9" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /><path d="M2 3h2.2l2.3 12.1a1.6 1.6 0 0 0 1.6 1.3h8.9a1.6 1.6 0 0 0 1.6-1.3L21 7H5" /></>,
  home: <><path d="M3 11 12 4l9 7" /><path d="M5.5 10v10h13V10" /><path d="M10 20v-6h4v6" /></>,
  bus: <><rect x="4" y="4" width="16" height="13" rx="2.2" /><path d="M4 11.5h16" /><circle cx="8" cy="20" r="1.2" /><circle cx="16" cy="20" r="1.2" /><path d="M7 8h.01M17 8h.01" /></>,
  car: <><path d="M5 11l1.7-4.4A2 2 0 0 1 8.6 5.4h6.8a2 2 0 0 1 1.9 1.2L19 11" /><rect x="3" y="11" width="18" height="6" rx="2" /><circle cx="7.5" cy="17.5" r="1.3" /><circle cx="16.5" cy="17.5" r="1.3" /></>,
  fuel: <><path d="M5 20V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" /><path d="M3.5 20.5h11" /><path d="M6.5 9.5h5" /><path d="M13 8l3 2.4V16a1.7 1.7 0 0 0 3.4 0V9.5l-2-2.2" /></>,
  laundry: <><rect x="4.5" y="3" width="15" height="18" rx="2.2" /><circle cx="12" cy="13" r="4.2" /><path d="M7.5 6h.01M10.5 6h.01" /></>,
  bulb: <><path d="M9.5 18.5h5M10.5 21h3" /><path d="M12 3a6 6 0 0 0-3.8 10.6c.6.6.9 1.1.9 2.4h5.8c0-1.3.3-1.8.9-2.4A6 6 0 0 0 12 3z" /></>,
  droplet: <><path d="M12 3.5s6 6.3 6 10.3a6 6 0 0 1-12 0C6 9.8 12 3.5 12 3.5z" /></>,
  flame: <><path d="M12 21a5.5 5.5 0 0 0 5.5-5.5c0-3.8-3.5-5.5-3.5-8.5 0 0-1.7 1-1.7 3.5 0 1.3-.9 1.8-.9 1.8s-.8-.5-.8-1.8C10.6 8 8.8 9 8.8 11.5c-1 1-2.3 2.2-2.3 4A5.5 5.5 0 0 0 12 21z" /></>,
  // — Personal / salud —
  phone: <><rect x="6.5" y="2" width="11" height="20" rx="2.5" /><path d="M10.5 18.5h3" /></>,
  wifi: <><path d="M4.5 12.2a11 11 0 0 1 15 0" /><path d="M7.5 15.4a6.5 6.5 0 0 1 9 0" /><circle cx="12" cy="18.6" r="1" /></>,
  bag: <><path d="M6 8h12l-1 12.2a1 1 0 0 1-1 .8H8a1 1 0 0 1-1-.8L6 8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>,
  shirt: <><path d="M8.5 4 5 6 2.6 9.2l2.6 2.1L7 9.6V20h10V9.6l1.8 1.7 2.6-2.1L19 6l-3.5-2a3.5 3.5 0 0 1-7 0z" /></>,
  shoe: <><path d="M3 16.5v-4.2l4-2 2 2 4-1 8.5 3.9v2.3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M7 10.3l1.2 2M11 11.3l1.1 1.6" /></>,
  pill: <><rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)" /><path d="M8.5 8.5l7 7" /></>,
  stethoscope: <><path d="M6 3v5a4 4 0 0 0 8 0V3" /><path d="M6 3H4.4M14 3h1.6" /><path d="M10 12.5V15a4.2 4.2 0 0 0 8.4 0v-1.3" /><circle cx="18.4" cy="11.5" r="2" /></>,
  hospital: <><rect x="4" y="4" width="16" height="16" rx="2.2" /><path d="M12 8.5v7M8.5 12h7" /></>,
  heart: <><path d="M12 20.5C5.5 15.7 3 12 3 8.7A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 9 2.5c0 3.3-2.5 7-9 11.8z" /></>,
  dumbbell: <><path d="M6.5 6v12M4 8v8M17.5 6v12M20 8v8M6.5 12h11" /></>,
  scissors: <><circle cx="6.5" cy="7" r="2.5" /><circle cx="6.5" cy="17" r="2.5" /><path d="M8.7 8.4 20 16.5M8.7 15.6 20 7.5" /></>,
  ball: <><circle cx="12" cy="12" r="8.5" /><path d="M12 6.5l3.4 2.4-1.3 4.1h-4.2L8.6 8.9z" /><path d="M12 6.5V4M15.4 8.9l2.1-1M14.1 13l1.4 1.9M9.9 13l-1.4 1.9M8.6 8.9l-2.1-1" /></>,
  // — Suscripciones / ocio —
  headphones: <><path d="M4 13.5v-1.5a8 8 0 0 1 16 0v1.5" /><rect x="3" y="13" width="4" height="6.5" rx="1.6" /><rect x="17" y="13" width="4" height="6.5" rx="1.6" /></>,
  cloud: <><path d="M7.2 18.5a4.2 4.2 0 0 1 .2-8.4 5.2 5.2 0 0 1 9.9-1A3.7 3.7 0 0 1 17 18.5H7.2z" /></>,
  sparkle: <><path d="M12 3l1.9 5.4L19 10l-5.1 1.6L12 17l-1.9-5.4L5 10l5.1-1.6L12 3z" /><path d="M18.5 3.5l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6z" /></>,
  film: <><rect x="3" y="4" width="18" height="16" rx="2.2" /><path d="M8 4v16M16 4v16M3 9.3h5M3 14.7h5M16 9.3h5M16 14.7h5" /></>,
  gamepad: <><rect x="2" y="7.5" width="20" height="9" rx="4.5" /><path d="M7 10.5v3M5.5 12h3" /><circle cx="15.8" cy="11.3" r=".9" /><circle cx="18.2" cy="13.5" r=".9" /></>,
  book: <><path d="M4 5a2 2 0 0 1 2-2h6v17H6a2 2 0 0 0-2 2V5z" /><path d="M20 5a2 2 0 0 0-2-2h-6v17h6a2 2 0 0 1 2 2V5z" /></>,
  music: <><circle cx="6.5" cy="18" r="2.5" /><circle cx="17" cy="16" r="2.5" /><path d="M9 18V6l10-2v12" /><path d="M9 9l10-2" /></>,
  // — Vida / otros —
  plane: <><path d="M10.2 3.6a1.6 1.6 0 0 1 3.2 0V9l7.6 4.6v2.1L13.4 13v4.7l2.2 1.6v1.7L12 20l-3.6.9V19l2.2-1.6V13L3 15.7v-2.1L10.2 9V3.6z" /></>,
  beach: <><path d="M12 3.5a9 9 0 0 1 9 8.5H3a9 9 0 0 1 9-8.5z" /><path d="M12 3.5V21" /><path d="M12 21h3.5" /></>,
  gift: <><rect x="3.5" y="8" width="17" height="4" rx="1" /><path d="M5 12v8h14v-8" /><path d="M12 8v12" /><path d="M12 8C11 6 9.5 5 8.2 5.6 7 6.2 7.4 8 9 8zM12 8c1-2 2.5-3 3.8-2.4C17 6.2 16.6 8 15 8z" /></>,
  dog: <><path d="M4.5 5.5 8 8v4a4 4 0 0 0 8 0V8l3.5-2.5V13a7.5 7.5 0 0 1-15 0V5.5z" /><circle cx="10" cy="12" r=".7" /><circle cx="14" cy="12" r=".7" /><path d="M11 15h2" /></>,
  cat: <><path d="M5 4.5 7.6 8.5h8.8L19 4.5V13a7 7 0 0 1-14 0V4.5z" /><circle cx="10" cy="12" r=".7" /><circle cx="14" cy="12" r=".7" /><path d="M11 15l1 1 1-1" /></>,
  plant: <><path d="M12 21v-8.5" /><path d="M12 13c0-3.2 2.2-5.2 5.2-5.2 0 3.2-2.2 5.2-5.2 5.2z" /><path d="M12 15.5c0-3.2-2.2-6-5.2-6 0 3.2 2.2 6 5.2 6z" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2.2" /><path d="M8.5 7V5.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V7" /><path d="M3 12.5h18" /></>,
  wrench: <><path d="M15.5 3a5 5 0 0 0-4.6 6.9L4 16.8 7.2 20l6.9-6.9A5 5 0 0 0 21 8.5l-2.8 2.8-2.5-2.5L18.5 6A5 5 0 0 0 15.5 3z" /></>,
  coffee: <><path d="M4 8h13v5.5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z" /><path d="M17 9.5h2.3a2.3 2.3 0 0 1 0 4.6H17" /><path d="M8 3.5v2M12 3.5v2" /></>,
  burger: <><path d="M4 9.5a8 4.2 0 0 1 16 0z" /><path d="M4 13h16" /><path d="M5 16h14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" /></>,
  pizza: <><path d="M12 3.2 3 20.2l9-2 9 2L12 3.2z" /><circle cx="10" cy="12" r=".8" /><circle cx="13.2" cy="15" r=".8" /></>,
  beer: <><path d="M6 8h9v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8z" /><path d="M15 10.5h2.4a2.3 2.3 0 0 1 0 4.6H15" /><path d="M6 8V6.2a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2V8" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><path d="M9 8h6M9 12h6" /></>,
  star: <><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.9 6.7 19.7l1.1-6L3.4 9.5l6-.8L12 3.2z" /></>,
  // — UI / editoriales —
  plus: <><path d="M12 5v14M5 12h14" /></>,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r=".9" /></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4z" /><path d="M8 5.2H5v1.8a3 3 0 0 0 3 3M16 5.2h3v1.8a3 3 0 0 1-3 3" /><path d="M12 13v3.5M9 20h6M10 20v-3.2h4V20" /></>,
  chart: <><path d="M5 21V11M12 21V4M19 21v-6" /><path d="M3 21h18" /></>,
  'trending-up': <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  'trending-down': <><path d="M3 7l6 6 4-4 8 8" /><path d="M15 17h6v-6" /></>,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2.2" /><path d="M4 9.5h16M8.5 3v4M15.5 3v4" /></>,
  shield: <><path d="M12 3l7 3v5.2c0 4.6-3 7.6-7 9-4-1.4-7-4.4-7-9V6l7-3z" /></>,
  logout: <><path d="M9 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" /><path d="M13 8l4 4-4 4" /><path d="M17 12H8.5" /></>,
  trash: <><path d="M4 7h16M9.5 7V5.2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7M6 7l1 12.1a2 2 0 0 0 2 1.9h6a2 2 0 0 0 2-1.9L18 7" /><path d="M10 11v6M14 11v6" /></>,
  tag: <><path d="M4 12.5V5.5a1.5 1.5 0 0 1 1.5-1.5h7L20.5 12 13 19.5 4 12.5z" /><circle cx="8.5" cy="8.5" r="1.3" /></>,
  download: <><path d="M12 4v11" /><path d="M8 11l4 4 4-4" /><path d="M5 19h14" /></>,
  upload: <><path d="M12 20V9" /><path d="M8 13l4-4 4 4" /><path d="M5 5h14" /></>,
  file: <><path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v4h4" /><path d="M8.5 13h7M8.5 16.5h7" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2.6M12 19.4V22M2 12h2.6M19.4 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" /></>,
  moon: <><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7.2 7.2 0 1 0 20 14.5z" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" /></>,
  alert: <><path d="M12 3.5 21.5 20H2.5L12 3.5z" /><path d="M12 10v4.4" /><path d="M12 17.6h.01" /></>,
  backspace: <><path d="M8 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8L2 12 8 5z" /><path d="M16 9.5l-5 5M11 9.5l5 5" /></>,
  close: <><path d="M6 6l12 12M18 6 6 18" /></>,
  chevron: <><path d="M9.5 5l7 7-7 7" /></>,
}

export type IconName = keyof typeof P
export const ICON_KEYS = new Set(Object.keys(P))

export function Icon({ name, className, size }: { name?: string; className?: string; size?: number | string }) {
  const inner = (name && P[name]) || P.tag
  const s = size ?? '1em'
  return (
    <svg
      className={className}
      width={s} height={s}
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false"
      style={{ display: 'block', flex: '0 0 auto' }}
    >
      {inner}
    </svg>
  )
}

/** Íconos ofrecidos en el selector de categorías (orden curado). */
export const PICKER_ICONS: string[] = [
  'cart', 'home', 'bus', 'car', 'fuel', 'laundry', 'bulb', 'droplet', 'flame',
  'phone', 'wifi', 'bag', 'shirt', 'shoe', 'pill', 'stethoscope', 'hospital', 'heart',
  'dumbbell', 'scissors', 'ball', 'headphones', 'cloud', 'sparkle', 'film', 'gamepad',
  'music', 'book', 'plane', 'beach', 'gift', 'dog', 'cat', 'plant', 'coffee', 'burger',
  'pizza', 'beer', 'briefcase', 'wrench', 'receipt', 'star',
  'coins', 'cash', 'card', 'bank', 'wallet', 'piggy', 'transfer', 'target', 'shield',
]

/** Migración: emoji histórico → clave de ícono. Cubre todo CATEGORY_ICONS + extras. */
export const EMOJI_TO_KEY: Record<string, string> = {
  '🛒': 'cart', '🏠': 'home', '🚌': 'bus', '🚗': 'car', '⛽': 'fuel', '🧺': 'laundry',
  '💡': 'bulb', '💧': 'droplet', '🔥': 'flame', '📱': 'phone', '📶': 'wifi', '🛍️': 'bag',
  '👕': 'shirt', '👟': 'shoe', '💊': 'pill', '🩺': 'stethoscope', '🏥': 'hospital',
  '🎧': 'headphones', '☁️': 'cloud', '✨': 'sparkle', '🐷': 'piggy', '🏦': 'bank',
  '💵': 'cash', '💳': 'card', '➕': 'plus', '🍔': 'burger', '🍕': 'pizza', '☕': 'coffee',
  '🍺': 'beer', '🎬': 'film', '🎮': 'gamepad', '📚': 'book', '✈️': 'plane', '🏖️': 'beach',
  '🎁': 'gift', '🐶': 'dog', '🐱': 'cat', '💇': 'scissors', '🏋️': 'dumbbell', '⚽': 'ball',
  '🎵': 'music', '🧾': 'receipt', '💼': 'briefcase', '🔧': 'wrench', '🌱': 'plant',
  '❤️': 'heart', '⭐': 'star', '💰': 'coins', '👛': 'wallet', '🎯': 'target', '📊': 'chart',
  '📈': 'trending-up', '🏆': 'trophy', '💸': 'wallet', '🛡️': 'shield',
  '⬇️': 'download', '⬆️': 'upload', '📄': 'file', '🔍': 'search', '🔄': 'transfer',
  '👤': 'user', '☀️': 'sun', '🌙': 'moon', '🔴': 'alert', '🟠': 'alert',
}

/** Normaliza cualquier valor de ícono guardado a una clave válida (idempotente). */
export function normalizeIconKey(v: string): string {
  if (ICON_KEYS.has(v)) return v
  return EMOJI_TO_KEY[v] || 'tag'
}
