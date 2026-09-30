import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, Loader2 } from 'lucide-react'
import { useMatchChat, useSendChatMessage } from '../hooks/useChat'
import { useAuthStore } from '../../auth/store/auth.store'

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Card #59: a simple chat scoped to this match's 4 players — visible from
// the moment the match is created (even before it fills), useful again
// later to sort out a disputed score.
export function MatchChat({ matchId }: { matchId: string }) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [visible, setVisible] = useState(false)
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: messages, isLoading } = useMatchChat(matchId, visible)
  const sendMessage = useSendChatMessage(matchId)

  useEffect(() => {
    if (visible) bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [visible, messages?.length])

  const handleSend = async () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    setDraft('')
    await sendMessage.mutateAsync(trimmed)
  }

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="w-full bg-card border border-border rounded-xl p-4 text-left text-sm font-medium text-foreground hover:bg-accent transition-colors"
      >
        {t('matches.openChat')}
      </button>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <p className="text-sm font-semibold text-foreground">{t('matches.chatTitle')}</p>
        <button
          onClick={() => setVisible(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {t('common.cancel')}
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-primary" />
          </div>
        ) : (messages ?? []).length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-6">{t('matches.chatEmpty')}</p>
        ) : (
          (messages ?? []).map((m) => {
            const mine = m.user_id === user?.id
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}
                >
                  {!mine && (
                    <p className="text-[10px] font-semibold opacity-70 mb-0.5">
                      {m.users?.username ?? t('matches.defaultUsername')}
                    </p>
                  )}
                  <p className="break-words">{m.message}</p>
                  <p className="text-[10px] opacity-60 mt-0.5 text-right">{formatTime(m.created_at)}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 p-3 border-t border-border">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t('matches.chatPlaceholder')}
          maxLength={1000}
          className="flex-1 bg-muted border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || sendMessage.isPending}
          className="p-2.5 rounded-full bg-primary text-primary-foreground disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
