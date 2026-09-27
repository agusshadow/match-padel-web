import { api } from '../../../lib/axios'
import type { ApiResponse } from '../../../../../packages/types/src/api'
import type { User } from '../../auth/api/auth.api'

export const onboardingApi = {
  complete: () =>
    api
      .put<ApiResponse<User>>('/users/me', { onboarding_completed_at: new Date().toISOString() })
      .then((r) => r.data.data),
}
