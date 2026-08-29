import { useMemo, type ReactNode } from 'react'

const F2 = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const F0 = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 0 })

/**
 * Cifra de dinero con jerarquía tipográfica fintech: el símbolo y los decimales
 * van subordinados (más tenues y pequeños) frente al entero. Tabular por defecto.
 * `decimals` muestra centavos atenuados (úsalo en el número principal).
 */
export default function Money({ value, decimals = false, className }: {
  value: number
  decimals?: boolean
  className?: string
}) {
  const nodes = useMemo<ReactNode[]>(() => {
    const parts = (decimals ? F2 : F0).formatToParts(value || 0)
    const out: ReactNode[] = []
    let frac = ''
    parts.forEach((p, i) => {
      if (p.type === 'currency') out.push(<span key={i} className="m-sym">{p.value}</span>)
      else if (p.type === 'decimal' || p.type === 'fraction') frac += p.value
      else out.push(<span key={i}>{p.value}</span>) // integer, group, minusSign, literal
    })
    if (frac) out.push(<span key="frac" className="m-frac">{frac}</span>)
    return out
  }, [value, decimals])

  return <span className={`money${className ? ' ' + className : ''}`}>{nodes}</span>
}
