import { useNavigate } from 'react-router-dom'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications'

const NOTIFICATION_ICONS: Record<string, string> = {
  match_invite: '🎾',
  match_started: '⚡',
  match_cancelled: '❌',
  score_submitted: '📋',
  score_accepted: '✅',
  reservation_confirmed: '📅',
  reservation_cancelled: '🚫',
  elo_updated: '📈',
}

function timeAgo(dateStr: string) {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export function NotificationsPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useNotifications()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const notifications = data?.data ?? []
  const unread = notifications.filter((n) => !n.is_read).length

  const handleNotificationClick = (n: any) => {
    if (!n.is_read) {
      markAsRead.mutate(n.id)
    }
    // Navigate based on notification type
    if (n.data?.match_id) {
      navigate(`/matches/${n.data.match_id}`)
    } else if (n.data?.reservation_id) {
      navigate('/reservations')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground">
            ←
          </button>
          <h1 className="text-lg font-bold text-foreground">Notificaciones</h1>
          {unread > 0 && (
            <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-medium">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllAsRead.mutate()}
            className="text-xs text-primary font-medium"
          >
            Marcar todo
          </button>
        )}
      </div>

      {/* Content */}
      <div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Cargando...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-foreground font-medium">Sin notificaciones</p>
            <p className="text-muted-foreground text-sm mt-1">
              Te avisaremos cuando haya novedades
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`w-full text-left px-4 py-4 flex items-start gap-3 transition-colors hover:bg-accent ${
                  !n.is_read ? 'bg-primary/5' : ''
                }`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  !n.is_read ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  {NOTIFICATION_ICONS[n.type] ?? '🔔'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-tight ${!n.is_read ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                      {n.title}
                    </p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-tight">
                    {n.body}
                  </p>
                </div>

                {/* Unread dot */}
                {!n.is_read && (
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
