import { z } from 'zod'
import { ACHIEVEMENT_CONDITION_TYPES } from '@match-padel/types'
import { CODE_PATTERN, ICON_KEY_PATTERN, LIMITS } from '../constants'

export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

const int = (label: string, min: number, max: number) =>
  z
    .number({ invalid_type_error: `${label}: ingresá un número entero` })
    .int(`${label}: debe ser un entero`)
    .min(min, `${label}: mínimo ${min}`)
    .max(max, `${label}: máximo ${max.toLocaleString('es-AR')}`)

const text = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${label}: al menos ${min} caracteres`)
    .max(max, `${label}: máximo ${max} caracteres`)

export const codeField = z
  .string()
  .trim()
  .min(LIMITS.codeMin, `Código: al menos ${LIMITS.codeMin} caracteres`)
  .max(LIMITS.codeMax, `Código: máximo ${LIMITS.codeMax} caracteres`)
  .regex(CODE_PATTERN, 'Código: minúsculas, números y guion bajo (ej. first_match)')

const nameField = text('Nombre', LIMITS.nameMin, LIMITS.nameMax)
const descriptionField = text('Descripción', LIMITS.descriptionMin, LIMITS.descriptionMax)

const imageUrlField = z
  .string()
  .trim()
  .min(1, 'Imagen: requerida')
  .max(LIMITS.urlMax)
  .refine(isHttpsUrl, 'Imagen: debe ser una URL https')

const iconField = z
  .string()
  .trim()
  .min(1, 'Ícono: requerido')
  .max(LIMITS.urlMax)
  .refine(
    (v) => (ICON_KEY_PATTERN.test(v) && v.length <= LIMITS.iconKeyMax) || isHttpsUrl(v),
    'Ícono: una clave en minúsculas (ej. trophy) o una URL https',
  )

export const achievementSchema = z.object({
  code: codeField,
  name: nameField,
  description: descriptionField,
  icon: iconField,
  points: int('Puntos', 0, LIMITS.points),
  condition_type: z.enum(ACHIEVEMENT_CONDITION_TYPES),
  condition_count: int('Cantidad', 1, LIMITS.conditionCount),
})
export type AchievementFormValues = z.infer<typeof achievementSchema>

export const challengeSchema = z.object({
  code: codeField,
  name: nameField,
  description: descriptionField,
  cadence: z.enum(['daily', 'weekly', 'monthly', 'one_time']),
  action_type: z.enum(['play_matches', 'win_matches']),
  target_count: int('Meta', 1, LIMITS.targetCount),
  reward_xp: int('XP', 0, LIMITS.rewardXp),
  reward_currency: int('Monedas', 0, LIMITS.amount),
})
export type ChallengeFormValues = z.infer<typeof challengeSchema>

export const cosmeticSchema = z.object({
  code: codeField,
  name: nameField,
  description: descriptionField,
  type: z.enum(['palette_skin', 'avatar', 'emblem']),
  image_url: imageUrlField,
  price_currency: int('Precio', 0, LIMITS.amount),
})
export type CosmeticFormValues = z.infer<typeof cosmeticSchema>
