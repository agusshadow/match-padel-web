import type { User } from '../api/auth.api'

// Matches the random fallback username handle_new_user() gives an account
// that reached public.users without one (e.g. a first-time Google sign-in):
// 'user_' + substr(id::text, 1, 8).
const RANDOM_FALLBACK_USERNAME = /^user_[0-9a-f]{8}$/

// True for an account that skipped the normal registration form — today,
// only a first-time Google OAuth sign-in — and still needs to pick a real
// username and fill in skill_level/preferred_hand before using the app.
export function isProfileIncomplete(user: User | null): boolean {
  if (!user) return false
  return user.skill_level == null || user.preferred_hand == null || RANDOM_FALLBACK_USERNAME.test(user.username)
}
