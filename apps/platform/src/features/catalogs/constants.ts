import type { AchievementConditionType, ChallengeAction, ChallengeCadence, CosmeticType } from '@match-padel/types'

export const PAGE_SIZE = 20

/** Same limits as the API validator (`catalogs.validator.ts`). */
export const LIMITS = {
  codeMin: 2,
  codeMax: 60,
  nameMin: 2,
  nameMax: 80,
  descriptionMin: 2,
  descriptionMax: 300,
  urlMax: 1000,
  iconKeyMax: 40,
  points: 100_000,
  conditionCount: 100_000,
  targetCount: 10_000,
  rewardXp: 100_000,
  amount: 1_000_000,
} as const

export const CODE_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/
export const ICON_KEY_PATTERN = /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/

/** Icon keys the player app knows; others fall back to a generic icon. */
export const KNOWN_ICON_KEYS = ['trophy', 'medal', 'flame'] as const

export const ASSET_MAX_BYTES = 2 * 1024 * 1024
export const ASSET_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const

export const CONDITION_LABELS: Record<AchievementConditionType, string> = {
  matches_played: 'Partidos jugados',
  wins: 'Partidos ganados',
}

export const CADENCE_LABELS: Record<ChallengeCadence, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  one_time: 'Única vez',
}
export const CADENCES: ChallengeCadence[] = ['daily', 'weekly', 'monthly', 'one_time']

export const ACTION_LABELS: Record<ChallengeAction, string> = {
  play_matches: 'Jugar partidos',
  win_matches: 'Ganar partidos',
}
export const ACTIONS: ChallengeAction[] = ['play_matches', 'win_matches']

export const COSMETIC_TYPE_LABELS: Record<CosmeticType, string> = {
  palette_skin: 'Paleta de colores',
  avatar: 'Avatar',
  emblem: 'Emblema',
}
export const COSMETIC_TYPES: CosmeticType[] = ['palette_skin', 'avatar', 'emblem']

export const FIELD_LABELS: Record<string, string> = {
  cadence: 'Frecuencia',
  action_type: 'Acción',
  type: 'Tipo',
}

export const KEEP_COPY = 'Los jugadores que ya lo tienen lo conservan.'
