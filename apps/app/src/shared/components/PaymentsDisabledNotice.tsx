import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/** Non-blocking notice shown when the club cannot take online payments yet (`meta.payments_enabled = false`). */
export function PaymentsDisabledNotice() {
  const { t } = useTranslation()
  return (
    <div
      role="status"
      className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 text-foreground text-sm rounded-lg px-3 py-2.5"
    >
      <Info size={16} className="flex-shrink-0 mt-0.5 text-yellow-600" />
      <span>{t('reservations.paymentsDisabledNotice')}</span>
    </div>
  )
}
