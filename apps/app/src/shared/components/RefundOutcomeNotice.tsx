import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { PlayerRefundResult } from '../../../../../packages/types/src/api'

const money = (value: number) => `$${value.toLocaleString('es-AR')}`

/**
 * What the club's policy returned after a cancellation (card #76): all, part, none, or pending
 * (owed, but the club could not pay it yet). Renders nothing when nothing was paid (`refund` null).
 */
export function RefundOutcomeNotice({ refund }: { refund: PlayerRefundResult | null | undefined }) {
  const { t } = useTranslation()
  if (!refund) return null

  let text: string
  if (refund.refund_pending || refund.status === 'pending') {
    text =
      refund.amount_refunded > 0
        ? t('refundOutcome.pendingPartial', {
            amount: money(refund.amount_refunded),
            pending: money(refund.amount_pending),
          })
        : t('refundOutcome.pending', { amount: money(refund.amount_pending) })
  } else if (refund.status === 'refunded') {
    text = t('refundOutcome.refunded', { amount: money(refund.amount_refunded) })
  } else if (refund.status === 'partial') {
    text = t('refundOutcome.partial', {
      amount: money(refund.amount_refunded),
      percent: refund.percent,
      paid: money(refund.amount_paid),
    })
  } else {
    text = refund.reason === 'after_start' ? t('refundOutcome.noneAfterStart') : t('refundOutcome.noneLate')
  }

  return (
    <div role="status" className="flex items-start gap-2 bg-muted rounded-xl p-3 text-sm text-foreground">
      <Info size={16} className="flex-shrink-0 mt-0.5 text-primary" />
      <span>{text}</span>
    </div>
  )
}
