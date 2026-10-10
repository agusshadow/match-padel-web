import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mercadoPagoApi } from '../api/mercadopago.api'

export const mercadoPagoKey = (clubId: string) => ['club-admin', clubId, 'mercadopago'] as const

/** Status of the club's Mercado Pago link. Owner only: pass `enabled: false` for any other role. */
export function useMercadoPagoAccount(clubId: string, enabled = true) {
  return useQuery({
    queryKey: mercadoPagoKey(clubId),
    queryFn: () => mercadoPagoApi.getAccount(clubId),
    enabled,
    // A 503 (not configured) or 403 will not fix itself within a retry.
    retry: false,
  })
}

export function useConnectMercadoPago(clubId: string) {
  return useMutation({ mutationFn: () => mercadoPagoApi.connect(clubId) })
}

export function useDisconnectMercadoPago(clubId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => mercadoPagoApi.disconnect(clubId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: mercadoPagoKey(clubId) }),
  })
}
