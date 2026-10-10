import type {
  CatalogAchievement,
  CatalogAchievementDetail,
  CatalogChallenge,
  CatalogChallengeDetail,
  CatalogCosmetic,
  CatalogCosmeticDetail,
} from '@match-padel/types'
import { useCatalogDetail, useCatalogSetActive } from '../hooks/useCatalogs'
import { catalogErrorMessage } from '../lib/errors'
import { DeactivateDialog } from './CatalogUi'

interface Props<T> {
  item: T
  onClose: () => void
  onDone: (message: string) => void
}

export function DeactivateAchievement({ item, onClose, onDone }: Props<CatalogAchievement>) {
  const detail = useCatalogDetail<CatalogAchievementDetail>('achievements', item.id)
  const setActive = useCatalogSetActive<CatalogAchievementDetail>('achievements')
  return (
    <DeactivateDialog
      name={item.name}
      entityLabel="logro"
      consequence="Deja de aparecer en el listado de la app y no se otorga más."
      usageLines={detail.data ? [`${detail.data.usage.owners_count} jugadores ya lo obtuvieron.`] : []}
      isPending={setActive.isPending}
      error={setActive.error ? catalogErrorMessage(setActive.error) : null}
      onClose={onClose}
      onConfirm={() =>
        setActive.mutate(
          { id: item.id, isActive: false },
          {
            onSuccess: () => {
              onDone(`Logro "${item.name}" desactivado.`)
              onClose()
            },
          },
        )
      }
    />
  )
}

export function DeactivateChallenge({ item, onClose, onDone }: Props<CatalogChallenge>) {
  const detail = useCatalogDetail<CatalogChallengeDetail>('challenges', item.id)
  const setActive = useCatalogSetActive<CatalogChallengeDetail>('challenges')
  const usage = detail.data?.usage
  return (
    <DeactivateDialog
      name={item.name}
      entityLabel="desafío"
      consequence="Se dejan de crear asignaciones nuevas y deja de listarse. Las que están en curso siguen avanzando y pagan su recompensa hasta que termine el período; el historial se mantiene."
      usageLines={
        usage
          ? [
              `${usage.active_assignments_count} asignaciones en curso (de ${usage.assignments_count} en total).`,
              'Si debe dejar de pagar ya, editá la recompensa a 0 antes de desactivarlo.',
            ]
          : []
      }
      isPending={setActive.isPending}
      error={setActive.error ? catalogErrorMessage(setActive.error) : null}
      onClose={onClose}
      onConfirm={() =>
        setActive.mutate(
          { id: item.id, isActive: false },
          {
            onSuccess: () => {
              onDone(`Desafío "${item.name}" desactivado.`)
              onClose()
            },
          },
        )
      }
    />
  )
}

export function DeactivateCosmetic({ item, onClose, onDone }: Props<CatalogCosmetic>) {
  const detail = useCatalogDetail<CatalogCosmeticDetail>('cosmetics', item.id)
  const setActive = useCatalogSetActive<CatalogCosmeticDetail>('cosmetics')
  return (
    <DeactivateDialog
      name={item.name}
      entityLabel="cosmético"
      consequence="Deja de aparecer en la tienda y no se puede comprar. Quienes lo poseen pueden seguir equipándolo."
      usageLines={detail.data ? [`${detail.data.usage.owners_count} jugadores lo poseen.`] : []}
      isPending={setActive.isPending}
      error={setActive.error ? catalogErrorMessage(setActive.error) : null}
      onClose={onClose}
      onConfirm={() =>
        setActive.mutate(
          { id: item.id, isActive: false },
          {
            onSuccess: () => {
              onDone(`Cosmético "${item.name}" desactivado.`)
              onClose()
            },
          },
        )
      }
    />
  )
}
