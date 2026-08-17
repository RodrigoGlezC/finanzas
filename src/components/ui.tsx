import { tint } from '../lib/format'

export function IconSquare({ emoji, color, small }: { emoji: string; color: string; small?: boolean }) {
  return (
    <span className={small ? 'ic sm' : 'ic'} style={{ background: tint(color, 15) }}>{emoji}</span>
  )
}

export function MiniEmpty({ text }: { text: string }) {
  return <div style={{ color: 'var(--label-2)', fontSize: 14, padding: '26px 16px', textAlign: 'center' }}>{text}</div>
}
