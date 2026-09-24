// AUTO-GENERADO — no editar manualmente
// Se genera desde el OpenAPI spec del backend

// Envelope de respuesta del API
export interface ApiResponse<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

// Las interfaces de entidades se agregan aquí al generar desde el spec
// Por ahora: placeholder
export type {} // evita error de módulo vacío
