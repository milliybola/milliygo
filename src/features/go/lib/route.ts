import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { fetchPartners } from './api'
import { useHydrated } from './session'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** URL'dagi xom ID: `?id=`, `[slug]` yoki yo'l (statik hostingda /restaurant/<x>/ → index.html) */
function useRawRouteId(prefix: 'restaurant' | 'store'): string | undefined {
  const router = useRouter()
  const hydrated = useHydrated()
  const q = (router.query.id || router.query.slug) as string | undefined
  if (q) return q
  if (!hydrated || !router.isReady) return undefined
  const m = window.location.pathname.match(new RegExp(`/${prefix}/([^/?#]+)`))
  return m && m[1] && m[1] !== 'index.html' ? decodeURIComponent(m[1]) : undefined
}

/**
 * Hamkor uuid'i. URL'da slug bo'lsa (build'dan keyin qo'shilgan hamkorning /restaurant/<slug>/
 * havolasi) — hamkorlar ro'yxatidan uuid topiladi; topilguncha undefined.
 */
export function useRouteId(
  prefix: 'restaurant' | 'store',
  /** Oldindan ma'lum uuid (slug sahifasi) — qidiruv kerak emas */
  known?: string
): string | undefined {
  const raw = useRawRouteId(prefix)
  const isSlug = !known && !!raw && !UUID_RE.test(raw)
  const resolved = useQuery({
    queryKey: ['go', 'slug', prefix, raw],
    queryFn: async () => {
      const list = await fetchPartners({ partner_type: prefix === 'store' ? 'SHOP' : 'RESTAURANT' })
      const key = raw!.toLowerCase()
      return list.find((p) => (p.slug || '').toLowerCase() === key)?.uuid ?? raw!
    },
    enabled: isSlug,
    staleTime: 10 * 60 * 1000,
  })
  if (known) return known
  if (!isSlug) return raw
  return resolved.data
}

export function useQueryParam(name: string): string | undefined {
  const router = useRouter()
  const v = router.query[name]
  return Array.isArray(v) ? v[0] : v
}
