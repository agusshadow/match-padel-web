import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type {
  ApplicationIncompleteDetails,
  ClubAdminClubUpdate,
  ClubAdminCourtCreate,
  ClubAdminCourtUpdate,
  ClubDocumentKind,
} from '@match-padel/types'
import { getErrorCode, getErrorDetails } from '@/lib/errors'
import { onboardingApi } from '../api/onboarding.api'

const key = (clubId: string, part: string) => ['club-admin', clubId, part] as const

/** Everything the application shows depends on these three queries (plus the access list for the status). */
function invalidateApplication(queryClient: QueryClient, clubId: string) {
  queryClient.invalidateQueries({ queryKey: key(clubId, 'onboarding') })
  queryClient.invalidateQueries({ queryKey: key(clubId, 'club') })
  queryClient.invalidateQueries({ queryKey: key(clubId, 'courts') })
}

export function useOnboarding(clubId: string) {
  return useQuery({ queryKey: key(clubId, 'onboarding'), queryFn: () => onboardingApi.getOnboarding(clubId) })
}

export function useApplicationClub(clubId: string) {
  return useQuery({ queryKey: key(clubId, 'club'), queryFn: () => onboardingApi.getClub(clubId) })
}

export function useCourts(clubId: string) {
  return useQuery({ queryKey: key(clubId, 'courts'), queryFn: () => onboardingApi.listCourts(clubId) })
}

export function useSaveClub(clubId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ClubAdminClubUpdate) => onboardingApi.updateClub(clubId, body),
    onSuccess: (club) => {
      queryClient.setQueryData(key(clubId, 'club'), club)
      invalidateApplication(queryClient, clubId)
      // The club name is also in the access list used by the selector.
      queryClient.invalidateQueries({ queryKey: ['me-access'] })
    },
  })
}

export function useCreateCourt(clubId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ClubAdminCourtCreate) => onboardingApi.createCourt(clubId, body),
    onSuccess: () => invalidateApplication(queryClient, clubId),
  })
}

export function useUpdateCourt(clubId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ClubAdminCourtUpdate }) =>
      onboardingApi.updateCourt(clubId, id, body),
    onSuccess: () => invalidateApplication(queryClient, clubId),
  })
}

export function useDeleteCourt(clubId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => onboardingApi.deleteCourt(clubId, id),
    onSuccess: () => invalidateApplication(queryClient, clubId),
  })
}

export function useUploadDocument(clubId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, kind }: { file: File; kind: ClubDocumentKind }) =>
      onboardingApi.uploadDocument(clubId, file, kind),
    onSuccess: () => invalidateApplication(queryClient, clubId),
  })
}

export function useDeleteDocument(clubId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => onboardingApi.deleteDocument(clubId, id),
    onSuccess: () => invalidateApplication(queryClient, clubId),
  })
}

export function useSubmitApplication(clubId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => onboardingApi.submit(clubId),
    onSuccess: () => {
      invalidateApplication(queryClient, clubId)
      // The status shown in the selector, sidebar and guards comes from the access list.
      queryClient.invalidateQueries({ queryKey: ['me-access'] })
    },
    // 422 APPLICATION_INCOMPLETE: the server's view of what is missing is the source of truth.
    onError: () => invalidateApplication(queryClient, clubId),
  })
}

export async function openDocument(clubId: string, id: string): Promise<void> {
  // Open the tab synchronously (inside the click) so the popup blocker lets it through.
  const tab = window.open('', '_blank')
  try {
    const { url } = await onboardingApi.getDocumentUrl(clubId, id)
    if (tab) tab.location.href = url
    else window.location.assign(url)
  } catch (error) {
    tab?.close()
    throw error
  }
}

/** `details` of a 422 APPLICATION_INCOMPLETE, or null for any other error. */
export function incompleteDetails(error: unknown): ApplicationIncompleteDetails | null {
  if (getErrorCode(error) !== 'APPLICATION_INCOMPLETE') return null
  const details = getErrorDetails(error)
  if (!details || typeof details !== 'object' || !('missing' in details)) return null
  const { missing } = details as { missing: unknown }
  if (!Array.isArray(missing)) return null
  return details as ApplicationIncompleteDetails
}
