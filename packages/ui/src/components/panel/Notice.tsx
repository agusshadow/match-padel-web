import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface NoticeProps {
  tone?: 'error' | 'info' | 'warning' | 'success'
  children: ReactNode
  className?: string
}

/** Inline banner for errors and short informative messages. */
export function Notice({ tone = 'error', children, className }: NoticeProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'border text-sm rounded-lg px-4 py-3',
        tone === 'error' && 'bg-red-50 border-red-200 text-red-700',
        tone === 'info' && 'bg-blue-50 border-blue-200 text-blue-700',
        tone === 'warning' && 'bg-yellow-50 border-yellow-200 text-yellow-800',
        tone === 'success' && 'bg-green-50 border-green-200 text-green-700',
        className,
      )}
    >
      {children}
    </div>
  )
}
