import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { auditLogApi, type AuditLogQuery } from '../api/audit-log.api'

export function useAuditLog(query: AuditLogQuery) {
  return useQuery({
    queryKey: ['platform', 'audit-log', query],
    queryFn: () => auditLogApi.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useClubOptions() {
  return useQuery({
    queryKey: ['platform', 'clubs'],
    queryFn: auditLogApi.listClubs,
  })
}
