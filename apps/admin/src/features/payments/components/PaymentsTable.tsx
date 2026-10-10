import type { PaymentRow, PaymentTotals } from '@match-padel/types'
import { StatusBadge, formatDateTime, formatMoney, type StatusTone } from '@match-padel/ui'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
}

const STATUS_TONES: Record<string, StatusTone> = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
  cancelled: 'gray',
  refunded: 'purple',
}

const COLLECTED_VIA_LABELS: Record<PaymentRow['collected_via'], string> = {
  platform: 'Cuenta de la plataforma',
  club: 'Cuenta del club',
}

function percent(value: number | null): string {
  return value === null ? '—' : `${value.toLocaleString('es-AR', { maximumFractionDigits: 2 })}%`
}

/** Gross / fee / net of the approved payments of the current filter. */
export function PaymentsTotalsBar({ totals }: { totals: PaymentTotals }) {
  const items = [
    { label: 'Bruto cobrado', value: totals.gross },
    { label: 'Comisión', value: totals.fee },
    { label: 'Neto', value: totals.net },
  ]
  return (
    <div className="space-y-1">
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <dt className="text-xs text-gray-500">{item.label}</dt>
            <dd className="text-2xl font-bold text-gray-900">{formatMoney(item.value)}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-gray-400">
        Solo pagos aprobados de todo el filtro (no solo de esta página). El neto es el bruto menos la comisión, antes
        del costo de procesamiento de Mercado Pago.
      </p>
    </div>
  )
}

export function PaymentsTable({ rows, showClub }: { rows: PaymentRow[]; showClub: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[960px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
            {showClub && <th className="text-left px-4 py-3 font-medium text-gray-600">Club</th>}
            <th className="text-right px-4 py-3 font-medium text-gray-600">Monto</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Comisión %</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Comisión</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Neto</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Cobrado en</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">ID Mercado Pago</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateTime(p.created_at)}</td>
              {showClub && <td className="px-4 py-3 text-gray-900">{p.club?.name ?? '—'}</td>}
              <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatMoney(p.amount)}</td>
              <td className="px-4 py-3 text-right text-gray-600">{percent(p.commission_percent)}</td>
              <td className="px-4 py-3 text-right text-gray-600">{formatMoney(p.marketplace_fee)}</td>
              <td className="px-4 py-3 text-right text-gray-900">{formatMoney(p.net_amount)}</td>
              <td className="px-4 py-3">
                <StatusBadge label={STATUS_LABELS[p.status] ?? p.status} tone={STATUS_TONES[p.status] ?? 'gray'} />
              </td>
              <td className="px-4 py-3 text-gray-600">{COLLECTED_VIA_LABELS[p.collected_via] ?? p.collected_via}</td>
              <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.mp_payment_id ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
