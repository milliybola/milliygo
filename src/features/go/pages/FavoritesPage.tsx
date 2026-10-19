import { FoodRestaurantCard, StoreListCard } from '../components/FoodRestaurantCard'
import { useFavoriteIds } from '../lib/favorites'
import { usePartners } from '../lib/queries'
import { useUserLocation } from '../lib/session'
import { BackButton, EmptyState, Page, Skeleton } from '../ui/primitives'

/** Sevimli maskanlar (brauzerda saqlanadi, login talab qilinmaydi) */
export default function FavoritesPage() {
  const { ids } = useFavoriteIds()
  const { lat, lng } = useUserLocation()
  const partnersQ = usePartners()
  const list = (partnersQ.data || []).filter((p) => ids.includes(p.uuid))

  return (
    <Page className="pb-8 pt-3 lg:pt-6">
      <div className="mb-4 flex items-center gap-3">
        <BackButton fallback="/restaurants/" />
        <h1 className="m-0 text-[1.625rem] font-[800] tracking-[-0.5px] text-[#111]">Sevimlilar</h1>
      </div>
      {partnersQ.isLoading ? (
        <Skeleton className="aspect-video rounded-[16px]" />
      ) : list.length === 0 ? (
        <EmptyState
          emoji="♥"
          title="Sevimlilar bo'sh"
          text="Maskan rasmidagi yurakchani bossangiz, u shu yerda paydo bo'ladi."
        />
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) =>
            p.partner_type === 'SHOP' ? (
              <StoreListCard key={p.uuid} partner={p} lat={lat} lng={lng} />
            ) : (
              <FoodRestaurantCard key={p.uuid} partner={p} lat={lat} lng={lng} />
            )
          )}
        </div>
      )}
    </Page>
  )
}
