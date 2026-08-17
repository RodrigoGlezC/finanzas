import { cssVar, money } from '../lib/format'
import type { MonthPoint } from '../lib/calc'

export default function TrendChart({ series }: { series: MonthPoint[] }) {
  const max = Math.max(1, ...series.map((x) => Math.max(x.in, x.out)))
  const W = 340, H = 150, pad = 24
  const bw = (W - pad * 2) / series.length
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {series.map((x, i) => {
        const cx = pad + bw * i + bw / 2
        const ih = (x.in / max) * (H - 40)
        const oh = (x.out / max) * (H - 40)
        const w = Math.min(13, bw / 3)
        return (
          <g key={i}>
            <rect x={cx - w - 2} y={H - 20 - ih} width={w} height={Math.max(0, ih)} rx={3} fill={cssVar('--s1')}>
              <title>{x.label}: ingresos {money(x.in)}</title>
            </rect>
            <rect x={cx + 2} y={H - 20 - oh} width={w} height={Math.max(0, oh)} rx={3} fill={cssVar('--s2')}>
              <title>{x.label}: gastos {money(x.out)}</title>
            </rect>
            <text x={cx} y={H - 6} textAnchor="middle" fontSize="10" fill={cssVar('--label-2')}>{x.label}</text>
          </g>
        )
      })}
    </svg>
  )
}
