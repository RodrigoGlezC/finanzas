/**
 * Signature element del login ("Libro mayor"): una línea de balance que asciende
 * sobre una base de retícula contable y remata en un punto. Se dibuja sola al cargar
 * (respeta prefers-reduced-motion vía la clase .auth-draw en el CSS). Decorativa.
 */
export default function BalanceSpark() {
  return (
    <svg className="auth-spark" viewBox="0 0 320 40" role="presentation" aria-hidden="true">
      <line className="grid" x1="0" y1="38.5" x2="320" y2="38.5" />
      <path className="line auth-draw" d="M2 33 L44 30 L86 31 L128 23 L170 25 L212 16 L254 18 L296 7 L315 5" />
      <circle className="dot" cx="315" cy="5" r="3.5" />
    </svg>
  )
}
