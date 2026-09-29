import { WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

// Card #27 (R18): visible everywhere in the app (mounted once in App.tsx,
// outside the router) so losing connection is always explained, not just on
// screens that happen to check navigator.onLine themselves.
export function OfflineBanner() {
  const { t } = useTranslation()
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div
      role="status"
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 bg-destructive text-destructive-foreground text-sm font-medium py-2 px-4"
      style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))' }}
    >
      <WifiOff size={16} className="flex-shrink-0" />
      {t('common.offline')}
    </div>
  )
}
