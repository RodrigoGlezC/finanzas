export default function Keypad({ onKey }: { onKey: (k: string) => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫']
  return (
    <div className="keypad">
      {keys.map((k) => (
        <button key={k} className="key" type="button" onClick={() => onKey(k)}>{k}</button>
      ))}
    </div>
  )
}

/** Aplica una tecla a un string de monto (dígitos, punto decimal, borrar). */
export function applyKey(amount: string, k: string): string {
  if (k === '⌫') return amount.slice(0, -1)
  if (k === '.') {
    if (amount.includes('.')) return amount
    return (amount === '' ? '0' : amount) + '.'
  }
  // limita a 2 decimales
  if (amount.includes('.') && amount.split('.')[1].length >= 2) return amount
  if (amount === '0') return k // reemplaza el cero inicial
  return amount + k
}
