import { api } from '../../../lib/axios'

export interface ChatMessage {
  id: string
  match_id: string
  user_id: string
  message: string
  created_at: string
  users: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

// Card #59: plain REST, polled by the client — no realtime transport exists
// in the API yet (see chats/chat.service.ts on the API side).
export const chatService = {
  getMessages: (matchId: string) =>
    api
      .get<{ success: boolean; data: ChatMessage[] }>(`/matches/${matchId}/chat`)
      .then((r) => r.data.data),

  sendMessage: (matchId: string, message: string) =>
    api
      .post<{ success: boolean; data: ChatMessage }>(`/matches/${matchId}/chat`, { message })
      .then((r) => r.data.data),
}
