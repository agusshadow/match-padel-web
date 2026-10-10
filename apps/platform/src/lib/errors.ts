import axios from 'axios'

/**
 * The API answers `{ error: CODE, message, details? }` from its error handler. The envelope
 * form `{ success: false, error: { code, message, details? } }` is also accepted.
 */
interface ErrorBody {
  message?: string
  error?: string | { code?: string; message?: string; details?: unknown }
  details?: unknown
}

function bodyOf(error: unknown): ErrorBody | undefined {
  return axios.isAxiosError<ErrorBody>(error) ? error.response?.data : undefined
}

/** Message to show for a failed request. */
export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError<ErrorBody>(error)) {
    const body = error.response?.data
    const fromEnvelope = typeof body?.error === 'object' ? body.error?.message : undefined
    return body?.message ?? fromEnvelope ?? error.message ?? fallback
  }
  return error instanceof Error ? error.message : fallback
}

export function getErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}

/** Machine code of an API error (`{ error: CODE }` or `{ error: { code } }`), e.g. `CONFLICT`. */
export function getErrorCode(error: unknown): string | undefined {
  const code = bodyOf(error)?.error
  if (typeof code === 'string') return code
  return typeof code === 'object' ? code?.code : undefined
}

/** `details` of an API error, untyped: callers narrow it for the codes they know. */
export function getErrorDetails(error: unknown): unknown {
  const body = bodyOf(error)
  return body?.details ?? (typeof body?.error === 'object' ? body.error?.details : undefined)
}

/** The status changed while the user was reviewing (409), or the action no longer applies. */
export function isConflictError(error: unknown): boolean {
  return getErrorStatus(error) === 409
}

export const CONFLICT_MESSAGE =
  'El estado de la solicitud cambió mientras la revisabas (otra persona pudo haberla resuelto). Actualizamos los datos: revisá el estado actual antes de volver a intentar.'

/** Like `getErrorMessage`, with a clear text for the 409 of a status that changed meanwhile. */
export function getLifecycleErrorMessage(error: unknown): string {
  return isConflictError(error) ? CONFLICT_MESSAGE : getErrorMessage(error)
}
