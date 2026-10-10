import type { InputHTMLAttributes, ReactNode } from 'react'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'

export const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  id: string
  label: string
  registration: UseFormRegisterReturn
  error?: FieldError
  hint?: ReactNode
}

export function TextField({ id, label, registration, error, hint, ...input }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input id={id} className={inputClass} {...registration} {...input} />
      {hint && !error && <p className="text-gray-400 text-xs mt-1">{hint}</p>}
      {error && <p className="text-red-600 text-xs mt-1">{error.message}</p>}
    </div>
  )
}

export function SaveBar({
  editable,
  saving,
  saved,
  label = 'Guardar y continuar',
}: {
  editable: boolean
  saving: boolean
  saved: boolean
  label?: string
}) {
  if (!editable) return null
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {saving ? 'Guardando...' : label}
      </button>
      {saved && !saving && <span className="text-xs text-green-700">Borrador guardado</span>}
    </div>
  )
}

/** Empty string -> null, the way the API clears an optional field. */
export const orNull = (value: string): string | null => (value.trim() === '' ? null : value.trim())

/** Optional number input that arrives as a string. */
export const optionalNumberText = (min: number, max: number) => (v: string) =>
  v.trim() === '' || (!Number.isNaN(Number(v)) && Number(v) >= min && Number(v) <= max)
