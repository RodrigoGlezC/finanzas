import { tint } from '../lib/format'
import { Icon } from '../lib/icons'

export function IconSquare({ name, color, small }: { name: string; color: string; small?: boolean }) {
  return (
    <span className={small ? 'ic sm' : 'ic'} style={{ background: tint(color, 15), color }}>
      <Icon name={name} />
    </span>
  )
}

export function MiniEmpty({ text, icon }: { text: string; icon?: string }) {
  return (
    <div className="mini-empty">
      {icon && <span className="me-ic"><Icon name={icon} /></span>}
      <span>{text}</span>
    </div>
  )
}
