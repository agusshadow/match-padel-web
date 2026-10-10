import { useState } from 'react'
import { Notice, PageHeader, Pagination } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useCurrentClub } from '@/shared/club-context'
import { useClubPayments } from '../hooks/usePayments'
import { PaymentsTable, PaymentsTotalsBar } from './PaymentsTable'

const PAGE_SIZE = 25
const inputClass =
  'px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500'

/** The club's own payments with the commission charged and the net amount (owner only; read only). */
export function PaymentsPage() {
  const club = useCurrentClub()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)

  const rangeInvalid = !!from && !!to && to < from
  const { data, isLoading, error } = useClubPayments(club.clubId, {
    from,
    to: rangeInvalid ? '' : to,
    page,
    limit: PAGE_SIZE,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cobros"
        subtitle={`${data?.meta.total ?? 0} pagos. La comisión la define la plataforma y se muestra en cada cobro.`}
      />

      <div className="flex gap-3 flex-wrap items-end">
        <label className="text-xs text-gray-500 space-y-1">
          <span className="block">Desde</span>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value)
              setPage(1)
            }}
            className={inputClass}
          />
        </label>
        <label className="text-xs text-gray-500 space-y-1">
          <span className="block">Hasta (incluido)</span>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value)
              setPage(1)
            }}
            className={inputClass}
          />
        </label>
        {(from || to) && (
          <button
            type="button"
            onClick={() => {
              setFrom('')
              setTo('')
              setPage(1)
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline pb-2"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {rangeInvalid && <Notice tone="warning">La fecha "Hasta" no puede ser anterior a "Desde".</Notice>}
      {error && <Notice>{getErrorMessage(error)}</Notice>}

      {data && <PaymentsTotalsBar totals={data.totals} />}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No hay pagos para este filtro</div>
        ) : (
          <PaymentsTable rows={data.items} showClub={false} />
        )}
        {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />}
      </div>
    </div>
  )
}
