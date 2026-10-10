import { useRef, useState } from 'react'
import type { ClubAdminDocument, ClubDocumentKind } from '@match-padel/types'
import { Notice, formatDateTime } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { ACCEPTED_DOCUMENT_TYPES, DOCUMENT_KIND_LABELS, MAX_DOCUMENT_BYTES } from '../constants'
import { openDocument, useDeleteDocument, useUploadDocument } from '../hooks/useOnboarding'
import { inputClass } from './fields'

const KINDS = Object.keys(DOCUMENT_KIND_LABELS) as ClubDocumentKind[]

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

interface Props {
  clubId: string
  documents: ClubAdminDocument[]
  editable: boolean
  onContinue: () => void
}

export function DocumentsStep({ clubId, documents, editable, onContinue }: Props) {
  const upload = useUploadDocument(clubId)
  const remove = useDeleteDocument(clubId)
  const [kind, setKind] = useState<ClubDocumentKind>('tax_id')
  const [fileError, setFileError] = useState<string | null>(null)
  const [openError, setOpenError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const onFile = (file: File | undefined) => {
    setFileError(null)
    if (!file) return
    if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type)) {
      setFileError('Formato no admitido. Subí un PDF, JPG, PNG o WebP.')
      return
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      setFileError('El archivo supera los 10 MB.')
      return
    }
    upload.mutate(
      { file, kind },
      {
        onSettled: () => {
          if (fileInput.current) fileInput.current.value = ''
        },
      },
    )
  }

  return (
    <div className="space-y-4">
      {upload.isError && <Notice>{getErrorMessage(upload.error)}</Notice>}
      {remove.isError && <Notice>{getErrorMessage(remove.error)}</Notice>}
      {fileError && <Notice>{fileError}</Notice>}
      {openError && <Notice>{openError}</Notice>}

      <p className="text-sm text-gray-500">
        Subí la documentación que respalda a tu club (constancia de CUIT, contrato social, documento del titular).
        Solo la ven vos y el equipo de la plataforma. PDF o imagen, hasta 10 MB.
      </p>

      {documents.length === 0 ? (
        <p className="text-sm text-gray-500">Todavía no subiste documentos.</p>
      ) : (
        <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg bg-white">
          {documents.map((doc) => (
            <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.file_name}</p>
                <p className="text-xs text-gray-500">
                  {DOCUMENT_KIND_LABELS[doc.kind]} · {formatSize(doc.size_bytes)} · {formatDateTime(doc.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenError(null)
                    openDocument(clubId, doc.id).catch((e) => setOpenError(getErrorMessage(e)))
                  }}
                  className="text-xs text-gray-600 underline"
                >
                  Ver
                </button>
                {editable && (
                  <button
                    type="button"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm(`¿Eliminar "${doc.file_name}"?`)) remove.mutate(doc.id)
                    }}
                    className="text-xs text-red-600 underline disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {editable && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="doc-kind" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de documento
              </label>
              <select
                id="doc-kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as ClubDocumentKind)}
                className={inputClass}
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {DOCUMENT_KIND_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="doc-file" className="block text-sm font-medium text-gray-700 mb-1">
                Archivo
              </label>
              <input
                ref={fileInput}
                id="doc-file"
                type="file"
                accept={ACCEPTED_DOCUMENT_TYPES.join(',')}
                disabled={upload.isPending}
                onChange={(e) => onFile(e.target.files?.[0])}
                className="block w-full text-sm text-gray-600 file:mr-3 file:px-3 file:py-2 file:border-0 file:rounded-lg file:bg-white file:border file:border-gray-300"
              />
            </div>
          </div>
          {upload.isPending && <p className="text-xs text-gray-500">Subiendo...</p>}
        </div>
      )}

      <div className="pt-2">
        <button
          type="button"
          onClick={onContinue}
          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
