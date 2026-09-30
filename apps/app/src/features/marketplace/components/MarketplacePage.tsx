import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Coins, Check, ShoppingBag } from 'lucide-react'
import {
  useCatalog,
  useMyCosmetics,
  useMyEquipped,
  useMyBalance,
  usePurchaseCosmetic,
  useEquipCosmetic,
  usePurchaseCurrency,
} from '../hooks/useMarketplace'
import type { Cosmetic, CosmeticType } from '../services/marketplaceService'

const TYPE_ORDER: CosmeticType[] = ['palette_skin', 'avatar', 'emblem']

const EQUIPPED_SLOT_KEY: Record<CosmeticType, 'equipped_palette_cosmetic_id' | 'equipped_avatar_cosmetic_id' | 'equipped_emblem_cosmetic_id'> = {
  palette_skin: 'equipped_palette_cosmetic_id',
  avatar: 'equipped_avatar_cosmetic_id',
  emblem: 'equipped_emblem_cosmetic_id',
}

export function MarketplacePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: catalog, isLoading: catalogLoading } = useCatalog()
  const { data: owned } = useMyCosmetics()
  const { data: equipped } = useMyEquipped()
  const { data: balance } = useMyBalance()

  const purchase = usePurchaseCosmetic()
  const equip = useEquipCosmetic()
  const purchaseCurrency = usePurchaseCurrency()

  const ownedIds = new Set((owned ?? []).map((o) => o.cosmetic.id))

  const byType = new Map<CosmeticType, Cosmetic[]>()
  for (const item of catalog ?? []) {
    const list = byType.get(item.type) ?? []
    list.push(item)
    byType.set(item.type, list)
  }

  const handleBuyCurrency = async () => {
    const pref = await purchaseCurrency.mutateAsync()
    const url = import.meta.env.PROD ? pref.init_point : pref.sandbox_init_point
    window.location.href = url
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 pt-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t('marketplace.title')}</h1>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins size={18} className="text-yellow-500" />
            <span className="text-lg font-bold text-foreground">{balance ?? 0}</span>
            <span className="text-xs text-muted-foreground">{t('marketplace.currency')}</span>
          </div>
          <button
            onClick={handleBuyCurrency}
            disabled={purchaseCurrency.isPending}
            className="text-sm font-medium text-primary disabled:opacity-60"
          >
            {purchaseCurrency.isPending ? t('matches.creating') : t('marketplace.buyCurrency')}
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 pt-0 space-y-6">
        {catalogLoading ? (
          <div className="py-12 text-center text-muted-foreground text-sm">{t('common.loading')}</div>
        ) : !catalog || catalog.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-foreground font-medium">{t('marketplace.empty')}</p>
          </div>
        ) : (
          TYPE_ORDER.filter((type) => byType.has(type)).map((type) => (
            <div key={type}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {t(`marketplace.type.${type}`)}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {byType.get(type)!.map((item) => {
                  const isOwned = ownedIds.has(item.id)
                  const isEquipped = equipped?.[EQUIPPED_SLOT_KEY[item.type]] === item.id
                  const canAfford = (balance ?? 0) >= item.price_currency

                  return (
                    <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden">
                      <img src={item.image_url} alt={item.name} className="w-full aspect-square object-cover" />
                      <div className="p-3 space-y-2">
                        <p className="text-sm font-semibold text-foreground leading-tight">{item.name}</p>
                        <p className="text-xs text-muted-foreground leading-tight line-clamp-2">{item.description}</p>

                        {isEquipped ? (
                          <div className="flex items-center gap-1 text-xs text-primary font-medium">
                            <Check size={14} /> {t('marketplace.equipped')}
                          </div>
                        ) : isOwned ? (
                          <button
                            onClick={() => equip.mutate(item.id)}
                            disabled={equip.isPending}
                            className="w-full py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground disabled:opacity-60"
                          >
                            {t('marketplace.equip')}
                          </button>
                        ) : (
                          <button
                            onClick={() => purchase.mutate(item.id)}
                            disabled={purchase.isPending || !canAfford}
                            className="w-full py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground disabled:opacity-40 flex items-center justify-center gap-1"
                          >
                            <Coins size={12} />
                            {item.price_currency}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
