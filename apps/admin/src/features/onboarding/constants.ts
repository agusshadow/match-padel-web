import type { ClubDocumentKind, CourtSurface, OnboardingStepKey, Weekday } from '@match-padel/types'

/** Wizard steps in order; `submit` is the final review, it has no server-side completeness. */
export type WizardStepKey = OnboardingStepKey | 'submit'

export const STEP_ORDER: WizardStepKey[] = ['club', 'location', 'contact', 'courts', 'schedule', 'documents', 'submit']

export const STEP_LABELS: Record<WizardStepKey, string> = {
  club: 'Datos del club',
  location: 'Ubicación',
  contact: 'Contacto',
  courts: 'Canchas',
  schedule: 'Horarios',
  documents: 'Documentación',
  submit: 'Revisar y enviar',
}

/** Field codes returned by `GET /onboarding` and `422 APPLICATION_INCOMPLETE`. */
const MISSING_LABELS: Record<string, string> = {
  name: 'Nombre del club',
  legal_name: 'Razón social',
  tax_id: 'CUIT / identificación fiscal',
  address: 'Dirección',
  city: 'Ciudad',
  coordinates: 'Latitud y longitud',
  phone: 'Teléfono',
  email: 'Email de contacto',
  active_court_with_price: 'Al menos una cancha activa con precio por hora',
  opening_hours: 'Horarios de apertura (al menos un día con un rango)',
  document: 'Al menos un documento',
}

/** `club.tax_id` and `tax_id` both resolve to the same label. */
export function missingLabel(code: string): string {
  const field = code.includes('.') ? code.slice(code.indexOf('.') + 1) : code
  return MISSING_LABELS[field] ?? field
}

/** Step a `<step>.<field>` code belongs to. */
export function missingStep(code: string): OnboardingStepKey | null {
  const step = code.split('.')[0] as OnboardingStepKey
  return STEP_ORDER.includes(step) ? step : null
}

export const SURFACE_LABELS: Record<CourtSurface, string> = {
  indoor: 'Interior',
  outdoor: 'Exterior',
  panoramic: 'Panorámica',
}

export const DOCUMENT_KIND_LABELS: Record<ClubDocumentKind, string> = {
  tax_id: 'Constancia de CUIT / AFIP',
  company_registration: 'Contrato social o inscripción',
  id_document: 'Documento del titular',
  other: 'Otro',
}

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
}

export const ACCEPTED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024

/** Statuses in which the API accepts edits to the club, courts and documents (409 otherwise). */
export const EDITABLE_STATUSES = ['draft', 'changes_requested', 'approved'] as const
