import { useRouter } from 'next/router'
import { useEffect } from 'react'
import RestaurantPage from '@/features/go/pages/RestaurantPage'
import { useRouteId } from '@/features/go/lib/route'

/** /restaurant/?id=<uuid> — asosiy restoran sahifasi (statik eksportda yangi restoranlar ham ishlaydi) */
export default function RestaurantByQuery() {
  const router = useRouter()
  const id = useRouteId('restaurant')
  useEffect(() => {
    if (!router.isReady || id) return
    const t = setTimeout(() => {
      if (!/\/restaurant\/[^/]+/.test(window.location.pathname)) router.replace('/restaurants/')
    }, 300)
    return () => clearTimeout(t)
  }, [router, id])
  return <RestaurantPage />
}
