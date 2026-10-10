import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { RefundPolicyValues } from '../../features/clubs/services/clubService'

/**
 * The club's refund policy in plain words, shown before paying (card #76). Renders nothing until
 * the policy is known. `hours_before_start = 0` means "until the start"; a late percentage of 0 or
 * 100 gets its own sentence.
 */
export function RefundPolicyNotice({ policy }: { policy: RefundPolicyValues | null }) {
  const { t } = useTranslation()
  if (!policy) return null

  const { hours_before_start: hours, late_refund_percent: percent } = policy
  const lines: string[] = []
  if (hours === 0) {
    lines.push(t('refundPolicy.fullUntilStart'))
  } else {
    lines.push(t('refundPolicy.fullBefore', { hours }))
    if (percent >= 100) lines.push(t('refundPolicy.lateFull'))
    else if (percent <= 0) lines.push(t('refundPolicy.lateNone'))
    else lines.push(t('refundPolicy.latePartial', { percent }))
  }
  lines.push(t('refundPolicy.afterStart'))

  return (
    <div role="note" className="flex items-start gap-2 bg-muted rounded-xl p-4 text-sm text-muted-foreground">
      <Info size={16} className="flex-shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-medium text-foreground">{t('refundPolicy.title')}</p>
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  )
}
