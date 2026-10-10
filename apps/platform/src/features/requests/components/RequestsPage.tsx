import { Inbox } from 'lucide-react'
import { PageHeader } from '@match-padel/ui'

/** Placeholder: the applications inbox arrives with Admin F1. */
export function RequestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Solicitudes" />
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-600 text-sm font-medium">Solicitudes (próximamente)</p>
        <p className="text-gray-400 text-sm mt-1">
          Acá vas a revisar las solicitudes de alta de los clubes.
        </p>
      </div>
    </div>
  )
}
