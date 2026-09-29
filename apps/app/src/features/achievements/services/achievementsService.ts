import { api } from '../../../lib/axios'

// Card #54: matches the shape of GET /achievements and GET /achievements/me.
// `icon` is a lucide-react icon name in kebab/snake case (e.g. "trophy"),
// mapped to a component in AchievementsPage — kept as a plain string here so
// this service has no UI dependency.
export interface Achievement {
  id: string
  code: string
  name: string
  description: string
  icon: string
  points: number
}

export interface EarnedAchievement {
  earned_at: string
  achievement: Achievement
}

export const achievementsService = {
  getCatalog: () =>
    api
      .get<{ success: boolean; data: Achievement[] }>('/achievements')
      .then((r) => r.data.data),

  getMine: () =>
    api
      .get<{ success: boolean; data: EarnedAchievement[] }>('/achievements/me')
      .then((r) => r.data.data),
}
