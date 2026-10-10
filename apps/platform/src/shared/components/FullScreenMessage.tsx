import type { ReactNode } from 'react'

export function FullScreenMessage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-sm text-center text-sm text-gray-600 space-y-4">{children}</div>
    </div>
  )
}
