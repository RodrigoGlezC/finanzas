import { useStore } from '../store'
import MovementSheet from '../sheets/MovementSheet'
import AccountSheet from '../sheets/AccountSheet'
import BudgetSheet from '../sheets/BudgetSheet'
import GoalSheet from '../sheets/GoalSheet'
import AporteSheet from '../sheets/AporteSheet'
import RecurringSheet from '../sheets/RecurringSheet'
import CategorySheet from '../sheets/CategorySheet'
import ReassignSheet from '../sheets/ReassignSheet'
import TransferSheet from '../sheets/TransferSheet'

export default function Sheets() {
  const sheet = useStore((s) => s.sheet)
  if (!sheet) return null
  switch (sheet.kind) {
    case 'movement': return <MovementSheet id={sheet.id} />
    case 'account': return <AccountSheet id={sheet.id} />
    case 'budget': return <BudgetSheet cat={sheet.cat} />
    case 'goal': return <GoalSheet id={sheet.id} />
    case 'aporte': return <AporteSheet goalId={sheet.goalId} />
    case 'recurring': return <RecurringSheet id={sheet.id} />
    case 'transfer': return <TransferSheet />
    case 'category': return <CategorySheet name={sheet.name} />
    case 'reassignAccount': return <ReassignSheet target={sheet} />
    case 'reassignCategory': return <ReassignSheet target={sheet} />
    default: return null
  }
}
