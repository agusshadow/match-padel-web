import axios from 'axios'
import type { ApiError } from '@match-padel/types'

/** Message to show for a failed request: the API's `error.message` when present. */
export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.error?.message ?? error.message ?? fallback
  }
  return error instanceof Error ? error.message : fallback
}

export function getErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}
