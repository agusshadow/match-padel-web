import type { ClubDocumentKind, CourtSurface, Weekday } from '@match-padel/types'

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
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
