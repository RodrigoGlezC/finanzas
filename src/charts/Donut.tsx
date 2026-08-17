import type { ReactElement } from 'react'
import { cssVar, money, seriesColor } from '../lib/format'
import { MiniEmpty } from '../components/ui'

export default function Donut({ entries }: { entries: [string, number][] }) {
  if (!entries.length) return <MiniEmpty text="Sin datos" />
  const total = entries.reduce((a, b) => a + b[1], 0)
  const R = 52, r = 33, C = 60, size = 120
  let acc = 0
  const paths: ReactElement[] = []
  entries.forEach(([g, v], i) => {
    const col = seriesColor(i)
    const frac = v / total
    const a0 = (acc / total) * 2 * Math.PI - Math.PI / 2
    const a1 = ((acc + v) / total) * 2 * Math.PI - Math.PI / 2
    acc += v
    if (frac >= 0.9999) {
      paths.push(<circle key={i} cx={C} cy={C} r={(R + r) / 2} fill="none" stroke={col} strokeWidth={R - r} />)
      return
    }
    const large = a1 - a0 > Math.PI ? 1 : 0
    const p = (an: number, rd: number): [number, number] => [C + rd * Math.cos(an), C + rd * Math.sin(an)]
    const [x0, y0] = p(a0, R), [x1, y1] = p(a1, R), [x2, y2] = p(a1, r), [x3, y3] = p(a0, r)
    paths.push(
      <path key={i} fill={col}
        d={`M${x0} ${y0} A${R} ${R} 0 ${large} 1 ${x1} ${y1} L${x2} ${y2} A${r} ${r} 0 ${large} 0 ${x3} ${y3} Z`}>
        <title>{g}: {money(v)}</title>
      </path>,
    )
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths}
      <text x={C} y={C - 3} textAnchor="middle" fontSize="10" fill={cssVar('--label-2')}>Total</text>
      <text x={C} y={C + 13} textAnchor="middle" fontSize="15" fontWeight="700" fill={cssVar('--label')}>{money(total)}</text>
    </svg>
  )
}
