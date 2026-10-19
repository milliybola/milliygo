import Seo from '@/components/common/Seo'
import PartnersListPage from '@/features/go/pages/PartnersListPage'

export default function RestaurantsPage() {
  return (
    <>
      <Seo
        title="Restoranlardan taom yetkazib berish"
        description="G'allaorol restoranlari menyusi: milliy taomlar, fast-food, pitsa va boshqalar. Uyga tez yetkazib berish yoki o'zingiz olib ketish — MilliyGo."
        path="/restaurants/"
      />
      <PartnersListPage type="RESTAURANT" />
    </>
  )
}
