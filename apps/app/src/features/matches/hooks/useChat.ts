import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatService } from '../services/chatService'

const POLL_INTERVAL_MS = 5000

// Card #59: no realtime transport yet, so an open chat just polls — cheap
// enough for a 4-person match chat and avoids standing up Socket.io for it.
export function useMatchChat(matchId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['matches', matchId, 'chat'],
    queryFn: () => chatService.getMessages(matchId!),
    enabled: !!matchId && enabled,
    refetchInterval: enabled ? POLL_INTERVAL_MS : false,
  })
}

export function useSendChatMessage(matchId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (message: string) => chatService.sendMessage(matchId!, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', matchId, 'chat'] })
    },
  })
}
