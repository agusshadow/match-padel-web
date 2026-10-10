export interface PersonName {
  first_name?: string | null
  last_name?: string | null
  username?: string | null
}

/** "First Last", falling back to the username (and then to `fallback`). */
export function personName(person: PersonName | null | undefined, fallback = 'Sin nombre'): string {
  if (!person) return fallback
  const full = [person.first_name, person.last_name].filter(Boolean).join(' ').trim()
  return full || person.username || fallback
}
