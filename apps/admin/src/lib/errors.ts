import axios from 'axios'

interface ErrorBody {
  message?: string
  error?: string | { message?: string }
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
