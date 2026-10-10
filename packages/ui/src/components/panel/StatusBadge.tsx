import { cn } from '../../lib/utils'

export type StatusTone = 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'orange' | 'purple'

const toneClasses: Record<StatusTone, string> = {
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
  blue: 'bg-blue-100 text-blue-700',
  orange: 'bg-orange-100 text-orange-700',
  purple: 'bg-purple-100 text-purple-700',
}

export interface StatusBadgeProps {
  label: string
  tone?: StatusTone
  className?: string
}

/** Small pill used by the club and platform panels for statuses and roles. */
export function StatusBadge({ label, tone = 'gray', className }: StatusBadgeProps) {
  return (
    <span className={cn('inline-block text-xs px-2 py-1 rounded-full font-medium', toneClasses[tone], className)}>
      {label}
    </span>
  )
}
