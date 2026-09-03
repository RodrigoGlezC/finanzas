import { useEffect, useRef, useState } from 'react'

/**
 * Interpola un número hacia `target` cuando cambia (easeOutCubic, ~0.42s), estilo
 * "los números cuentan" de Apple (Wallet/Salud). Arranca sin animar (el primer valor
 * aparece fijo) y solo tween en cambios posteriores. Respeta `prefers-reduced-motion`
 * y `enabled=false` → devuelve el valor tal cual sin programar rAF.
 */
export function useCountUp(target: number, enabled = true, duration = 420): number {
  const [val, setVal] = useState(target)
  const valRef = useRef(target)
  const rafRef = useRef(0)

  useEffect(() => {
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!enabled || reduce) {
      valRef.current = target
      setVal(target)
      return
    }
    const from = valRef.current
    if (from === target) return
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const e = 1 - Math.pow(1 - t, 3) // easeOutCubic
      const v = from + (target - from) * e
      valRef.current = v
      setVal(v)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else { valRef.current = target; setVal(target) }
    }
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, enabled, duration])

  return enabled ? val : target
}
