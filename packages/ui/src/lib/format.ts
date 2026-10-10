const LOCALE = 'es-AR'

/** `10 oct` style date. */
export function formatDate(value: string | Date, withYear = false): string {
  return new Date(value).toLocaleDateString(LOCALE, {
    day: '2-digit',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  })
}

/** `14:30` */
export function formatTime(value: string | Date): string {
  return new Date(value).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })
}

/** `10 oct, 14:30` */
export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString(LOCALE, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** `$12.500` */
export function formatMoney(value: number | string): string {
  return `$${Number(value).toLocaleString(LOCALE)}`
}
