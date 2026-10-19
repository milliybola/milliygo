import Seo from '@/components/common/Seo'
import PartnersListPage from '@/features/go/pages/PartnersListPage'
import StorePage from '@/features/go/pages/StorePage'
import { useRouteId } from '@/features/go/lib/route'

/** /store/ — do'konlar ro'yxati; /store/?id=<uuid> — do'kon sahifasi */
export default function StoreRoute() {
  const id = useRouteId('store')
  if (id) return <StorePage />
  return (
    <>
      <Seo
        title="Do'konlar va marketlar"
        description="G'allaorol do'konlari va marketlari: meva-sabzavot, go'sht, sut mahsulotlari, ichimliklar va uy-ro'zg'or mollari. Uyga tez yetkazib berish — MilliyGo."
        path="/store/"
      />
      <PartnersListPage type="SHOP" />
    </>
  )
}
