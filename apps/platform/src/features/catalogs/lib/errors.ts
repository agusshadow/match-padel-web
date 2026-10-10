import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { CatalogFieldLockedDetails, ValidationErrorDetail } from '@match-padel/types'
import { getErrorCode, getErrorDetails, getErrorMessage, getErrorStatus } from '@/lib/errors'
import { FIELD_LABELS } from '../constants'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function lockedDetails(error: unknown): CatalogFieldLockedDetails | null {
  if (getErrorCode(error) !== 'CATALOG_FIELD_LOCKED') return null
  const details = getErrorDetails(error)
  if (!isRecord(details) || !Array.isArray(details.fields)) return null
  return {
    fields: details.fields.filter((f): f is string => typeof f === 'string'),
    usage: isRecord(details.usage) ? (details.usage as Record<string, number>) : {},
  }
}

export function validationDetails(error: unknown): ValidationErrorDetail[] {
  if (getErrorCode(error) !== 'VALIDATION_ERROR') return []
  const details = getErrorDetails(error)
  if (!Array.isArray(details)) return []
  return details.flatMap((d) =>
    isRecord(d) && typeof d.message === 'string'
      ? [{ field: typeof d.field === 'string' ? d.field : '', message: d.message }]
      : [],
  )
}

/** Text for a failed catalog request, by API code. */
export function catalogErrorMessage(error: unknown): string {
  const status = getErrorStatus(error)
  const code = getErrorCode(error)
  if (code === 'CODE_ALREADY_EXISTS') return 'Ya existe un ítem con ese código. Elegí otro.'
  const locked = lockedDetails(error)
  if (locked) {
    const names = locked.fields.map((f) => FIELD_LABELS[f] ?? f).join(', ')
    return `No se puede cambiar ${names}: hay jugadores que ya tienen progreso o lo poseen. Podés crear un ítem nuevo con otro código.`
  }
  if (code === 'VALIDATION_ERROR') {
    const details = validationDetails(error)
    if (details.length > 0) return details.map((d) => (d.field ? `${d.field}: ${d.message}` : d.message)).join(' · ')
  }
  if (code === 'NOT_FOUND' || status === 404) return 'El ítem ya no existe. Actualizá la lista.'
  if (code === 'FORBIDDEN' || status === 403) return 'No tenés permisos para editar los catálogos (solo superadmin).'
  return getErrorMessage(error)
}

/**
 * Puts API field errors (`CODE_ALREADY_EXISTS`, `VALIDATION_ERROR.details`) on the form fields they
 * name. Returns the messages that could not be matched, for a general notice.
 */
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
  aliases: Record<string, Path<T>> = {},
): string[] {
  const unmatched: string[] = []
  if (getErrorCode(error) === 'CODE_ALREADY_EXISTS' && (fields as readonly string[]).includes('code')) {
    setError('code' as Path<T>, { type: 'server', message: 'Ya existe un ítem con ese código.' })
    return unmatched
  }
  for (const d of validationDetails(error)) {
    const target = aliases[d.field] ?? (fields as readonly string[]).find((f) => f === d.field)
    if (target) setError(target as Path<T>, { type: 'server', message: d.message })
    else unmatched.push(d.field ? `${d.field}: ${d.message}` : d.message)
  }
  return unmatched
}
