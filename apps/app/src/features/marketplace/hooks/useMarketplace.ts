import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { marketplaceService } from '../services/marketplaceService'

export function useCatalog() {
  return useQuery({
    queryKey: ['marketplace', 'catalog'],
    queryFn: () => marketplaceService.getCatalog(),
    staleTime: 1000 * 60 * 10,
  })
}

export function useMyCosmetics() {
  return useQuery({
    queryKey: ['marketplace', 'me'],
    queryFn: () => marketplaceService.getMyCosmetics(),
  })
}

export function useMyEquipped() {
  return useQuery({
    queryKey: ['marketplace', 'equipped'],
    queryFn: () => marketplaceService.getMyEquipped(),
  })
}

export function useMyBalance() {
  return useQuery({
    queryKey: ['marketplace', 'balance'],
    queryFn: () => marketplaceService.getMyBalance(),
  })
}

function useInvalidateMarketplace() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['marketplace'] })
  }
}

export function usePurchaseCosmetic() {
  const invalidate = useInvalidateMarketplace()
  return useMutation({
    mutationFn: (cosmeticId: string) => marketplaceService.purchaseCosmetic(cosmeticId),
    onSuccess: invalidate,
  })
}

export function useEquipCosmetic() {
  const invalidate = useInvalidateMarketplace()
  return useMutation({
    mutationFn: (cosmeticId: string) => marketplaceService.equipCosmetic(cosmeticId),
    onSuccess: invalidate,
  })
}

export function usePurchaseCurrency() {
  return useMutation({
    mutationFn: () => marketplaceService.purchaseCurrency(),
  })
}
