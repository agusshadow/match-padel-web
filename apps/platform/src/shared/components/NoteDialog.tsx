import { useEffect, useId, useState } from 'react'
import { Notice } from '@match-padel/ui'

export const NOTE_MIN = 5
export const NOTE_MAX = 2000

export interface NoteDialogProps {
  title: string
  description?: string
  fieldLabel: string
  required: boolean
  confirmLabel: string
  tone?: 'primary' | 'danger'
  isPending: boolean
  /** Error of the last attempt, already formatted for the user. */
  error?: string | null
  /** Called with the trimmed note, or `undefined` when it is optional and was left empty. */
  onConfirm: (note: string | undefined) => void
  onClose: () => void
}

/** Validation of the API's note rule (`trim`, 5..2000 chars). Returns the error text or `null`. */
export function validateNote(value: string, required: boolean): string | null {
  const note = value.trim()
  if (note.length === 0) return required ? 'Este campo es obligatorio.' : null
  if (note.length < NOTE_MIN) return `Escribí al menos ${NOTE_MIN} caracteres.`
  if (note.length > NOTE_MAX) return `Máximo ${NOTE_MAX} caracteres.`
  return null
}

/** Confirmation dialog with a note field, used by every review and lifecycle action. */
export function NoteDialog({
  title,
  description,
  fieldLabel,
  required,
  confirmLabel,
  tone = 'primary',
  isPending,
  error,
  onConfirm,
  onClose,
}: NoteDialogProps) {
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  const fieldId = useId()
  const validation = validateNote(value, required)
  const length = value.trim().length

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPending, onClose])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (validation) return
    onConfirm(length > 0 ? value.trim() : undefined)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-600 text-xl leading-none disabled:opacity-40"
          >
            ×
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4" noValidate>
          {description && <p className="text-sm text-gray-600">{description}</p>}
          {error && <Notice>{error}</Notice>}
          <div>
            <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
              {fieldLabel}
            </label>
            <textarea
              id={fieldId}
              autoFocus
              rows={5}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={touched && !!validation}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-red-600">{touched && validation ? validation : ''}</p>
              <p className="text-xs text-gray-400">
                {length}/{NOTE_MAX}
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`flex-1 py-2.5 text-white text-sm font-semibold rounded-lg disabled:opacity-50 ${
                tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isPending ? 'Enviando...' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
