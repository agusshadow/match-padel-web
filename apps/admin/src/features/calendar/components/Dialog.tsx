import { useEffect } from 'react'

/** Centered modal used by the calendar's block and cancel flows (Escape and the close button dismiss it). */
export function Dialog({
  title,
  onClose,
  busy = false,
  wide = false,
  children,
}: {
  title: string
  onClose: () => void
  /** While a request is in flight the dialog cannot be dismissed. */
  busy?: boolean
  wide?: boolean
  children: React.ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-white rounded-xl w-full ${wide ? 'max-w-xl' : 'max-w-md'} shadow-xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-600 text-xl leading-none disabled:opacity-40"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  )
}
