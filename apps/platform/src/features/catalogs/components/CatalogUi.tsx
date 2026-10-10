import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Notice, StatusBadge } from '@match-padel/ui'
import { ASSET_MAX_BYTES, ASSET_MIME_TYPES, KEEP_COPY } from '../constants'
import { useUploadCatalogAsset } from '../hooks/useCatalogs'
import { catalogErrorMessage } from '../lib/errors'
import { isHttpsUrl } from '../lib/schemas'

export const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500'

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return <StatusBadge label={isActive ? 'Activo' : 'Inactivo'} tone={isActive ? 'green' : 'gray'} />
}

export function DialogShell({
  title,
  onClose,
  busy = false,
  children,
}: {
  title: string
  onClose: () => void
  busy?: boolean
  children: ReactNode
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
        className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
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
        {children}
      </div>
    </div>
  )
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

export function FormActions({
  onClose,
  isPending,
  submitLabel,
  pendingLabel,
}: {
  onClose: () => void
  isPending: boolean
  submitLabel: string
  pendingLabel: string
}) {
  return (
    <div className="flex gap-3 pt-2">
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
        className="flex-1 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {isPending ? pendingLabel : submitLabel}
      </button>
    </div>
  )
}

/** Usage counters of an item, read from its detail response. */
export function UsageSummary({
  isLoading,
  lines,
  locked,
}: {
  isLoading: boolean
  lines: Array<{ label: string; value: number }>
  /** Human names of the fields that are locked because of that usage. */
  locked: string[]
}) {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-600 space-y-1">
      {isLoading ? (
        <p className="text-gray-400">Cargando uso...</p>
      ) : (
        lines.map((l) => (
          <p key={l.label}>
            {l.label}: <span className="font-semibold text-gray-900">{l.value}</span>
          </p>
        ))
      )}
      {locked.length > 0 && (
        <p className="text-xs text-yellow-800">
          Bloqueado mientras haya jugadores con este ítem: {locked.join(', ')}.
        </p>
      )}
    </div>
  )
}

export function CatalogToolbar({
  search,
  onSearch,
  active,
  onActive,
  placeholder,
  children,
}: {
  search: string
  onSearch: (value: string) => void
  active: '' | 'true' | 'false'
  onActive: (value: '' | 'true' | 'false') => void
  placeholder: string
  children?: ReactNode
}) {
  const selectClass =
    'px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500'
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      {children}
      <select
        value={active}
        onChange={(e) => onActive(e.target.value as '' | 'true' | 'false')}
        aria-label="Filtrar por estado"
        className={selectClass}
      >
        <option value="">Activos e inactivos</option>
        <option value="true">Solo activos</option>
        <option value="false">Solo inactivos</option>
      </select>
    </div>
  )
}

export const selectClass =
  'px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500'

/** Confirmation before taking an item out of circulation; fetches nothing, the caller passes the counters. */
export function DeactivateDialog({
  name,
  entityLabel,
  consequence,
  usageLines,
  isPending,
  error,
  onConfirm,
  onClose,
}: {
  name: string
  entityLabel: string
  consequence: string
  usageLines: string[]
  isPending: boolean
  error: string | null
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <DialogShell title={`Desactivar ${entityLabel}`} onClose={onClose} busy={isPending}>
      <div className="p-5 space-y-4">
        {error && <Notice>{error}</Notice>}
        <p className="text-sm text-gray-700">
          Vas a desactivar <span className="font-semibold">{name}</span>. {consequence}{' '}
          <span className="font-medium">{KEEP_COPY}</span>
        </p>
        {usageLines.length > 0 && (
          <ul className="text-sm text-gray-600 list-disc pl-5">
            {usageLines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        )}
        <p className="text-xs text-gray-400">Podés volver a activarlo cuando quieras.</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? 'Desactivando...' : 'Desactivar'}
          </button>
        </div>
      </div>
    </DialogShell>
  )
}

/** Client-side check mirroring the API: png/jpg/webp up to 2 MB. Returns the error text or `null`. */
export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!(ASSET_MIME_TYPES as readonly string[]).includes(file.type)) return 'La imagen debe ser PNG, JPG o WebP.'
  if (file.size > ASSET_MAX_BYTES) return 'La imagen pesa más de 2 MB.'
  return null
}

/** URL text field + upload button (`POST /platform/catalogs/assets`) + preview. */
export function ImageUploadField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
}: {
  id: string
  label: string
  value: string
  onChange: (url: string) => void
  error?: string
  hint?: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const upload = useUploadCatalogAsset()
  const [fileError, setFileError] = useState<string | null>(null)
  const [previewFailed, setPreviewFailed] = useState(false)
  const helpId = useId()

  useEffect(() => setPreviewFailed(false), [value])

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const problem = validateImageFile(file)
    setFileError(problem)
    if (problem) return
    upload.mutate(file, { onSuccess: (asset) => onChange(asset.url) })
  }

  const showPreview = isHttpsUrl(value.trim()) && !previewFailed
  const message = fileError ?? (upload.error ? catalogErrorMessage(upload.error) : null)

  return (
    <FormField label={label} htmlFor={id} error={error} hint={hint}>
      <div className="flex gap-3 items-start">
        <div className="w-16 h-16 shrink-0 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
          {showPreview ? (
            <img src={value.trim()} alt="Vista previa" className="w-full h-full object-contain" onError={() => setPreviewFailed(true)} />
          ) : (
            <span className="text-[10px] text-gray-400 text-center px-1">Sin imagen</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            aria-describedby={helpId}
            className={inputClass}
          />
          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept={ASSET_MIME_TYPES.join(',')}
              onChange={onFile}
              className="hidden"
              aria-label="Elegir imagen"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={upload.isPending}
              className="text-xs font-medium px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {upload.isPending ? 'Subiendo...' : 'Subir imagen'}
            </button>
            <span id={helpId} className="text-xs text-gray-400">
              PNG, JPG o WebP, hasta 2 MB
            </span>
          </div>
          {message && <p className="text-xs text-red-600">{message}</p>}
          {previewFailed && <p className="text-xs text-yellow-700">No se pudo cargar la imagen de esa URL.</p>}
        </div>
      </div>
    </FormField>
  )
}
