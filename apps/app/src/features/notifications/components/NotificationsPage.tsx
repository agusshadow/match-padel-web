import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  ChevronLeft,
  Bell,
  BellOff,
  Swords,
  Zap,
  XCircle,
  ClipboardList,
  CheckCircle2,
  CalendarCheck,
  CalendarX,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications'

const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  match_invite: Swords,
  match_started: Zap,
  match_cancelled: XCircle,
  score_submitted: ClipboardList,
  score_accepted: CheckCircle2,
  reservation_confirmed: CalendarCheck,
  reservation_cancelled: CalendarX,
  elo_updated: TrendingUp,
}

function timeAgo(dateStr: string, t: TFunction) {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return t('notifications.timeAgo.now')
  if (mins < 60) return t('notifications.timeAgo.minutes', { count: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t('notifications.timeAgo.hours', { count: hours })
  const days = Math.floor(hours / 24)
  return t('notifications.timeAgo.days', { count: days })
}

export function NotificationsPage() {
  const { t } = useTranslation()
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
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{t('notifications.title')}</h1>
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
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {/* Content */}
      <div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">{t('common.loading')}</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <BellOff className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-foreground font-medium">{t('notifications.noNotifications')}</p>
            <p className="text-muted-foreground text-sm mt-1">{t('notifications.noNotificationsBody')}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => {
              const NotificationIcon = NOTIFICATION_ICONS[n.type] ?? Bell
              return (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`w-full text-left px-4 py-4 flex items-start gap-3 transition-colors hover:bg-accent ${
                  !n.is_read ? 'bg-primary/5' : ''
                }`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  !n.is_read ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  <NotificationIcon className="w-5 h-5 text-foreground" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-tight ${!n.is_read ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                      {n.title}
                    </p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {timeAgo(n.created_at, t)}
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
