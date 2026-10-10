import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { StatusTone } from './StatusBadge'

const toneClasses: Record<StatusTone, string> = {
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
  blue: 'bg-blue-100 text-blue-700',
  orange: 'bg-orange-100 text-orange-700',
  purple: 'bg-purple-100 text-purple-700',
}

export interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  tone?: StatusTone
}

/** Dashboard counter tile. */
export function StatCard({ label, value, icon: Icon, tone = 'gray' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-6 h-6" />
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', toneClasses[tone])}>{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString('es-AR')}</p>
    </div>
  )
}
