import { api } from '../../../lib/axios'

// Card #62: matches the shape of GET /challenges and GET /challenges/me.
export type ChallengeCadence = 'daily' | 'weekly' | 'monthly' | 'one_time'
export type ChallengeAction = 'play_matches' | 'win_matches'
export type UserChallengeStatus = 'active' | 'completed' | 'expired'

export interface Challenge {
  id: string
  code: string
  name: string
  description: string
  cadence: ChallengeCadence
  action_type: ChallengeAction
  target_count: number
  reward_xp: number
  reward_currency: number
}

export interface UserChallenge {
  id: string
  progress: number
  status: UserChallengeStatus
  period_start: string
  period_end: string
  completed_at: string | null
  challenge: Challenge
}

export const challengesService = {
  getCatalog: () =>
    api
      .get<{ success: boolean; data: Challenge[] }>('/challenges')
      .then((r) => r.data.data),

  getMine: () =>
    api
      .get<{ success: boolean; data: UserChallenge[] }>('/challenges/me')
      .then((r) => r.data.data),
}
