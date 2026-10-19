import { useRouter } from 'next/router'
import { useHydrated } from './session'

/**
 * Hamkor ID: `?id=` (asosiy), `[slug]` (eski oldindan yaratilgan sahifalar)
 * yoki URL yo'li (statik hostingda `/restaurant/<uuid>/` → `/restaurant/index.html`
 * ga qayta yozilganda router query bo'sh bo'ladi).
 */
export function useRouteId(prefix: 'restaurant' | 'store'): string | undefined {
  const router = useRouter()
  const hydrated = useHydrated()
  const q = (router.query.id || router.query.slug) as string | undefined
  if (q) return q
  if (!hydrated || !router.isReady) return undefined
  const m = window.location.pathname.match(new RegExp(`/${prefix}/([^/?#]+)`))
  return m && m[1] && m[1] !== 'index.html' ? decodeURIComponent(m[1]) : undefined
}

export function useQueryParam(name: string): string | undefined {
  const router = useRouter()
  const v = router.query[name]
  return Array.isArray(v) ? v[0] : v
}
