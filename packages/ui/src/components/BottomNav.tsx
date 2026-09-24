import * as React from 'react'
import { cn } from '../lib/utils'

export interface BottomNavItem {
  key: string
  label: string
  icon: React.ReactNode
  activeIcon?: React.ReactNode
}

export interface BottomNavProps {
  items: BottomNavItem[]
  activeKey: string
  onSelect: (key: string) => void
  className?: string
}

export function BottomNav({ items, activeKey, onSelect, className }: BottomNavProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'flex items-stretch bg-background border-t border-border',
        'pb-safe', // respects iOS safe area if configured in Tailwind
        className
      )}
      role="navigation"
      aria-label="Navegación principal"
    >
      {items.map((item) => {
        const isActive = item.key === activeKey
        return (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2 px-1',
              'text-xs font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className={cn('h-6 w-6', isActive && 'scale-110 transition-transform')}>
              {isActive && item.activeIcon ? item.activeIcon : item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
