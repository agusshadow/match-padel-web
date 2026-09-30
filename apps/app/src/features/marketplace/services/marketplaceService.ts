import { api } from '../../../lib/axios'

// Card #63: matches the shape of the /marketplace/* endpoints.
export type CosmeticType = 'palette_skin' | 'avatar' | 'emblem'

export interface Cosmetic {
  id: string
  code: string
  name: string
  description: string
  type: CosmeticType
  image_url: string
  price_currency: number
}

export interface OwnedCosmetic {
  id: string
  acquired_at: string
  cosmetic: Cosmetic
}

export interface EquippedSlots {
  equipped_palette_cosmetic_id: string | null
  equipped_avatar_cosmetic_id: string | null
  equipped_emblem_cosmetic_id: string | null
}

export interface CheckoutPreference {
  preference_id: string
  init_point: string
  sandbox_init_point: string
}

export const marketplaceService = {
  getCatalog: () =>
    api.get<{ success: boolean; data: Cosmetic[] }>('/marketplace/cosmetics').then((r) => r.data.data),

  getMyCosmetics: () =>
    api.get<{ success: boolean; data: OwnedCosmetic[] }>('/marketplace/cosmetics/me').then((r) => r.data.data),

  getMyEquipped: () =>
    api.get<{ success: boolean; data: EquippedSlots }>('/marketplace/equipped').then((r) => r.data.data),

  getMyBalance: () =>
    api
      .get<{ success: boolean; data: { balance: number } }>('/marketplace/balance')
      .then((r) => r.data.data.balance),

  purchaseCosmetic: (cosmeticId: string) =>
    api.post(`/marketplace/cosmetics/${cosmeticId}/purchase`).then((r) => r.data.data),

  equipCosmetic: (cosmeticId: string) =>
    api.post(`/marketplace/cosmetics/${cosmeticId}/equip`).then((r) => r.data.data),

  purchaseCurrency: () =>
    api
      .post<{ success: boolean; data: CheckoutPreference }>('/marketplace/currency/purchase')
      .then((r) => r.data.data),
}
