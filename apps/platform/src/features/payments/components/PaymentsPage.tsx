import { useState } from 'react'
import { Notice, PageHeader, Pagination } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { usePaymentClubOptions, usePayments } from '../hooks/usePayments'
import { PaymentsTable, PaymentsTotalsBar } from './PaymentsTable'

const PAGE_SIZE = 25
const inputClass =
  'px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500'

/** Every payment of the platform with its commission, fee and net, filterable by club and dates (superadmin). */
export function PaymentsPage() {
  const [clubId, setClubId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)

  const rangeInvalid = !!from && !!to && to < from
  // An inverted range is a 400 in the API: do not send it, tell the user instead.
  const query = { clubId, from, to: rangeInvalid ? '' : to, page, limit: PAGE_SIZE }
  const { data, isLoading, error } = usePayments(query)
  const { data: clubs } = usePaymentClubOptions()

  const reset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Cobros" subtitle={`${data?.meta.total ?? 0} pagos`} />

      <div className="flex gap-3 flex-wrap items-end">
        <label className="text-xs text-gray-500 space-y-1">
          <span className="block">Club</span>
          <select
            aria-label="Filtrar por club"
            value={clubId}
            onChange={(e) => reset(setClubId)(e.target.value)}
            className={inputClass}
          >
            <option value="">Todos los clubes</option>
            {clubs?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-gray-500 space-y-1">
          <span className="block">Desde</span>
          <input type="date" value={from} onChange={(e) => reset(setFrom)(e.target.value)} className={inputClass} />
        </label>
        <label className="text-xs text-gray-500 space-y-1">
          <span className="block">Hasta (incluido)</span>
          <input type="date" value={to} onChange={(e) => reset(setTo)(e.target.value)} className={inputClass} />
        </label>
        {(clubId || from || to) && (
          <button
            type="button"
            onClick={() => {
              setClubId('')
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
          <PaymentsTable rows={data.items} showClub />
        )}
        {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />}
      </div>
    </div>
  )
}
