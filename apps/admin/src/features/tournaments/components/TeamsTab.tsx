import type { ClubTournamentDetail, ClubTournamentTeam } from '@match-padel/types'
import { Notice, StatusBadge, formatMoney } from '@match-padel/ui'
import { formatClubDateTime } from '@/lib/club-time'
import { TEAM_STATUS } from '../lib/labels'

const REFUND: Record<string, string> = {
  none: 'Sin devolución',
  partial: 'Devolución parcial',
  full: 'Devuelto',
  pending: 'Devolución pendiente',
  failed: 'Devolución fallida',
}
const PAYMENT: Record<string, string> = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  cancelled: 'Anulado',
  rejected: 'Rechazado',
  refunded: 'Devuelto',
}

function person(p: ClubTournamentTeam['player1']): string {
  if (!p) return '—'
  const name = `${p.first_name} ${p.last_name}`.trim()
  return `${name || p.username} (${p.elo})`
}

export function TeamsTab({ tournament: t }: { tournament: ClubTournamentDetail }) {
  const now = Date.now()
  return (
    <div className="space-y-4">
      {t.status === 'draft' && (
        <Notice tone="info">Es un borrador: las inscripciones se abren cuando publicás el torneo.</Notice>
      )}
      {t.counts.teams_pending_payment > 0 && (
        <Notice tone="warning">
          {t.counts.teams_pending_payment} inscripción(es) esperan el pago. Reservan el lugar 30 minutos: si no pagan
          se liberan solas, y al iniciar el torneo se liberan todas.
        </Notice>
      )}
      {t.entry_fee > 0 && (
        <p className="text-sm text-gray-600">
          Pagos aprobados: <strong>{t.payments_summary.approved}</strong> · cobrado{' '}
          <strong>{formatMoney(t.payments_summary.gross)}</strong> · comisión {formatMoney(t.payments_summary.fee)} ·
          devuelto {formatMoney(t.payments_summary.refunded)}
          {t.payments_summary.refunds_pending > 0 && ` · ${t.payments_summary.refunds_pending} devolución(es) pendiente(s)`}
        </p>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {t.teams.length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-500">Todavía no hay inscripciones.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Seed', 'Pareja', 'Jugadores (ELO)', 'Estado', 'Inscripta', 'Pago'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {t.teams.map((team) => {
                  const expired = team.status === 'pending_payment' && team.expires_at && new Date(team.expires_at).getTime() < now
                  return (
                    <tr key={team.id}>
                      <td className="px-4 py-3 text-gray-500">{team.seed ?? '—'}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{team.name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <div>{person(team.player1)}</div>
                        <div>{person(team.player2)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge label={TEAM_STATUS[team.status].label} tone={TEAM_STATUS[team.status].tone} />
                        {team.status === 'pending_payment' && team.expires_at && (
                          <p className={`text-xs mt-1 ${expired ? 'text-red-600' : 'text-gray-500'}`}>
                            {expired ? 'Venció' : 'Vence'} {formatClubDateTime(team.expires_at)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatClubDateTime(team.registered_at)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {team.payment ? (
                          <>
                            <div>
                              {PAYMENT[team.payment.status] ?? team.payment.status} · {formatMoney(team.payment.amount)}
                            </div>
                            {team.payment.net_amount !== null && (
                              <div className="text-xs text-gray-500">Neto {formatMoney(team.payment.net_amount)}</div>
                            )}
                            {team.payment.refund_status !== 'none' && (
                              <div className="text-xs text-gray-500">
                                {REFUND[team.payment.refund_status] ?? team.payment.refund_status}
                                {team.payment.refunded_amount > 0 && ` (${formatMoney(team.payment.refunded_amount)})`}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">{t.entry_fee > 0 ? 'Sin pago' : 'Gratis'}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
