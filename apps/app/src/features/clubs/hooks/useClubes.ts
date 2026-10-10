import { useQuery } from '@tanstack/react-query'
import { clubService } from '../services/clubService'
import type { ClubAvailabilitySlot, RefundPolicyValues, WithPaymentsMeta } from '../services/clubService'
import type { GetClubsParams } from '../services/clubService'

export const CLUBS_KEY = 'clubs'

export function useClubes(params?: GetClubsParams) {
  return useQuery({
    queryKey: [CLUBS_KEY, params],
    queryFn: () => clubService.getClubes(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useClubById(id: string | null) {
  return useQuery({
    queryKey: [CLUBS_KEY, 'detail', id],
    queryFn: () => clubService.getClubById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useClubCourts(clubId: string | null) {
  return useQuery({
    queryKey: [CLUBS_KEY, 'courts', clubId],
    queryFn: () => clubService.getClubCourts(clubId!),
    enabled: !!clubId,
    staleTime: 1000 * 60 * 5,
  })
}

const availabilityKey = (clubId: string | null, date: string | null) =>
  [CLUBS_KEY, 'availability', clubId, date] as const

const selectSlots = (data: WithPaymentsMeta<ClubAvailabilitySlot[]>) => data.items
const selectPaymentsEnabled = (data: WithPaymentsMeta<ClubAvailabilitySlot[]>) => data.payments_enabled
const selectRefundPolicy = (data: WithPaymentsMeta<ClubAvailabilitySlot[]>) => data.refund_policy

/** Slots of the club for a day. Shares its request (and cache) with `useClubPaymentsEnabled`. */
export function useClubAvailability(clubId: string | null, date: string | null) {
  return useQuery({
    queryKey: availabilityKey(clubId, date),
    queryFn: () => clubService.getClubAvailability(clubId!, date!),
    enabled: !!clubId && !!date,
    staleTime: 1000 * 30, // 30 seconds — availability changes often
    select: selectSlots,
  })
}

/**
 * `meta.payments_enabled` of the club's availability: `false` when the club collects on its own
 * Mercado Pago account and has no usable link, so paid reservations and matches are refused (409
 * `CLUB_PAYMENTS_NOT_ENABLED`). `true` until the response arrives, so nothing flashes as blocked.
 */
export function useClubPaymentsEnabled(clubId: string | null, date: string | null): boolean {
  const { data } = useQuery({
    queryKey: availabilityKey(clubId, date),
    queryFn: () => clubService.getClubAvailability(clubId!, date!),
    enabled: !!clubId && !!date,
    staleTime: 1000 * 30,
    select: selectPaymentsEnabled,
  })
  return data ?? true
}

/**
 * The club's effective refund policy from `meta.refund_policy` of its availability (card #76), shown
 * before paying. `null` while loading or when the API did not send it. Shares the availability cache.
 */
export function useClubRefundPolicy(clubId: string | null, date: string | null): RefundPolicyValues | null {
  const { data } = useQuery({
    queryKey: availabilityKey(clubId, date),
    queryFn: () => clubService.getClubAvailability(clubId!, date!),
    enabled: !!clubId && !!date,
    staleTime: 1000 * 30,
    select: selectRefundPolicy,
  })
  return data ?? null
}
