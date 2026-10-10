import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  ClubAdminCourtCreate,
  ClubAdminCourtUpdate,
  CourtPriceRulesReplace,
  CourtScheduleReplace,
  ScheduleExceptionCreate,
} from '@match-padel/types'
import { courtsApi } from '../api/courts.api'

const key = (clubId: string, ...parts: Array<string | undefined>) => ['club-admin', clubId, ...parts] as const

export function useClubCourts(clubId: string) {
  return useQuery({ queryKey: key(clubId, 'courts'), queryFn: () => courtsApi.list(clubId) })
}

export function useCreateCourt(clubId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ClubAdminCourtCreate) => courtsApi.create(clubId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(clubId, 'courts') }),
  })
}

export function useUpdateCourt(clubId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ClubAdminCourtUpdate }) => courtsApi.update(clubId, id, body),
    onSuccess: (_court, { id }) => {
      queryClient.invalidateQueries({ queryKey: key(clubId, 'courts') })
      // The base price is part of the price rules and the preview.
      queryClient.invalidateQueries({ queryKey: key(clubId, 'court', id) })
    },
  })
}

export function useCourtSchedule(clubId: string, courtId: string) {
  return useQuery({
    queryKey: key(clubId, 'court', courtId, 'schedule'),
    queryFn: () => courtsApi.getSchedule(clubId, courtId),
  })
}

/** The preview depends on the schedule, the price rules and the exceptions, so the three invalidate it. */
function invalidatePreview(queryClient: ReturnType<typeof useQueryClient>, clubId: string, courtId: string) {
  queryClient.invalidateQueries({ queryKey: key(clubId, 'court', courtId, 'preview') })
}

export function useReplaceSchedule(clubId: string, courtId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CourtScheduleReplace) => courtsApi.replaceSchedule(clubId, courtId, body),
    onSuccess: (schedule) => {
      queryClient.setQueryData(key(clubId, 'court', courtId, 'schedule'), schedule)
      invalidatePreview(queryClient, clubId, courtId)
    },
  })
}

export function usePriceRules(clubId: string, courtId: string) {
  return useQuery({
    queryKey: key(clubId, 'court', courtId, 'price-rules'),
    queryFn: () => courtsApi.getPriceRules(clubId, courtId),
  })
}

export function useReplacePriceRules(clubId: string, courtId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CourtPriceRulesReplace) => courtsApi.replacePriceRules(clubId, courtId, body),
    onSuccess: (rules) => {
      queryClient.setQueryData(key(clubId, 'court', courtId, 'price-rules'), rules)
      invalidatePreview(queryClient, clubId, courtId)
    },
  })
}

export function usePreview(clubId: string, courtId: string, date: string) {
  return useQuery({
    queryKey: key(clubId, 'court', courtId, 'preview', date),
    queryFn: () => courtsApi.preview(clubId, courtId, date),
    enabled: date !== '',
  })
}

/** Exceptions from today on (the API default), for the whole club or one court. */
export function useExceptions(clubId: string) {
  return useQuery({
    queryKey: key(clubId, 'exceptions'),
    queryFn: () => courtsApi.listExceptions(clubId, {}),
  })
}

export function useCreateException(clubId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ScheduleExceptionCreate) => courtsApi.createException(clubId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(clubId, 'exceptions') })
      queryClient.invalidateQueries({ queryKey: key(clubId, 'court') })
    },
  })
}

export function useDeleteException(clubId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => courtsApi.deleteException(clubId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(clubId, 'exceptions') })
      queryClient.invalidateQueries({ queryKey: key(clubId, 'court') })
    },
  })
}
