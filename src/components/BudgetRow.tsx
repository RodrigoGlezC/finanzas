import { cssVar, money, tint } from '../lib/format'
import { iconFor } from '../lib/constants'
import { Icon } from '../lib/icons'
import type { Category } from '../types'

export default function BudgetRow({ cat, limit, spent, onClick, cats }: {
  cat: string; limit: number; spent: number; onClick?: () => void; cats?: Category[]
}) {
  const pct = limit > 0 ? (spent / limit) * 100 : 0
  const st = pct > 100 ? 'over' : pct >= 80 ? 'warn' : 'ok'
  const col = st === 'over' ? cssVar('--red') : st === 'warn' ? cssVar('--orange') : cssVar('--green')
  return (
    <div className="catrow" style={{ cursor: onClick ? 'pointer' : undefined }} onClick={onClick}>
      <span className="ic" style={{ background: tint(cssVar('--tint'), 15), color: 'var(--tint)' }}><Icon name={iconFor(cat, 'out', cats)} /></span>
      <div className="cbody">
        <div className="cline">
          <span className="cname">{cat}</span>
          {st === 'over'
            ? <span className="badge over">+{money(spent - limit)}</span>
            : <span className={`badge ${st}`}>{Math.round(pct)}%</span>}
        </div>
        <div className="track big"><span style={{ width: Math.min(100, pct) + '%', background: col }} /></div>
        <div className="r-sub" style={{ marginTop: 5 }}>{money(spent)} de {money(limit)}</div>
      </div>
    </div>
  )
}
