import { useState } from 'react'
import type { ApplicationDetail, ClubAdminDocument } from '@match-padel/types'
import { Notice, formatDateTime } from '@match-padel/ui'
import { DOCUMENT_KIND_LABELS } from '../constants'

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface Props {
  documents: ClubAdminDocument[]
  /** Seconds a signed URL lasts, counted from the moment the detail was fetched. */
  expiresIn: number
  /** `Date.now()` of the last successful detail fetch. */
  fetchedAt: number
  refetch: () => Promise<{ data?: ApplicationDetail }>
}

/**
 * Documents of the application, opened through the signed `url` of the detail payload. When that
 * URL is missing or about to expire, the detail is refetched first to get a fresh one.
 */
export function ApplicationDocuments({ documents, expiresIn, fetchedAt, refetch }: Props) {
  const [opening, setOpening] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const open = async (doc: ClubAdminDocument) => {
    setError(null)
    let url = doc.url
    const ageSeconds = (Date.now() - fetchedAt) / 1000
    if (!url || ageSeconds > expiresIn - 30) {
      setOpening(doc.id)
      try {
        const result = await refetch()
        url = result.data?.documents.find((d) => d.id === doc.id)?.url ?? null
      } catch {
        url = null
      } finally {
        setOpening(null)
      }
    }
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    else setError('No pudimos generar el enlace del documento. Intentá de nuevo.')
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Documentación ({documents.length})</h2>
      {error && <Notice className="mb-3">{error}</Notice>}
      {documents.length === 0 ? (
        <p className="text-sm text-gray-400">El club no cargó documentos.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {documents.map((doc) => (
            <li key={doc.id} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.file_name}</p>
                <p className="text-xs text-gray-500">
                  {DOCUMENT_KIND_LABELS[doc.kind]} · {formatSize(doc.size_bytes)} · {formatDateTime(doc.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => open(doc)}
                disabled={opening === doc.id}
                className="shrink-0 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {opening === doc.id ? 'Abriendo...' : 'Abrir'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
