import { tint } from '../lib/format'

export function IconSquare({ emoji, color, small }: { emoji: string; color: string; small?: boolean }) {
  return (
    <span className={small ? 'ic sm' : 'ic'} style={{ background: tint(color, 15) }}>{emoji}</span>
  )
}

export function MiniEmpty({ text, icon }: { text: string; icon?: string }) {
  return (
    <div className="mini-empty">
      {icon && <span className="me-ic" aria-hidden="true">{icon}</span>}
      <span>{text}</span>
    </div>
  )
}
