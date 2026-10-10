import axios from 'axios'

interface ErrorBody {
  message?: string
  error?: string | { message?: string }
  details?: unknown
}

/**
 * Message to show for a failed request. The API answers `{ error, message }` from its error
 * handler; the envelope form `{ error: { message } }` is also accepted.
 */
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

/** Machine code of an API error (`{ error: CODE }`), e.g. `APPLICATION_INCOMPLETE`, `USERNAME_TAKEN`. */
export function getErrorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError<ErrorBody>(error)) return undefined
  const code = error.response?.data?.error
  return typeof code === 'string' ? code : undefined
}

/** `details` of an API error, untyped: callers narrow it for the codes they know. */
export function getErrorDetails(error: unknown): unknown {
  return axios.isAxiosError<ErrorBody>(error) ? error.response?.data?.details : undefined
}

/**
 * Individual problems of a 400 validation error: `details.errors` (strings, schedule and price rules)
 * or `details` as a list of `{ field, message }` (schema validation). Empty when there are none.
 */
export function getErrorProblems(error: unknown): string[] {
  const details = getErrorDetails(error)
  if (Array.isArray(details)) {
    return details.flatMap((d) => {
      if (typeof d === 'string') return [d]
      if (d && typeof d === 'object' && 'message' in d && typeof d.message === 'string') {
        const field = 'field' in d && typeof d.field === 'string' ? `${d.field}: ` : ''
        return [`${field}${d.message}`]
      }
      return []
    })
  }
  if (details && typeof details === 'object' && 'errors' in details && Array.isArray(details.errors)) {
    return details.errors.filter((e): e is string => typeof e === 'string')
  }
  return []
}
