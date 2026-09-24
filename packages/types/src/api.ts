export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Array<{ field: string; message: string }>
  }
}
