/**
 * Build vaqtida (getStaticPaths / getStaticProps) hamkor sahifalarini oldindan yaratish uchun.
 * Brauzer kodi emas: oddiy fetch, axios interceptorlari va localStorage ishlatilmaydi.
 * Props JSON bo'lishi shart — shuning uchun API javobi xom holda uzatiladi, normalize komponentda qilinadi.
 */
import { API_BASE } from '@/constants/env'
import type { Partner, PartnerType } from './types'

export interface PartnerStaticProps {
  uuid: string
  partnerRaw: unknown
  menuRaw: unknown | null
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/

/** Inson o'qiy oladigan, URL uchun xavfsiz slug bo'lsa — uni, aks holda null */
export function cleanSlug(slug?: string | null): string | null {
  const s = (slug || '').trim().toLowerCase()
  return SLUG_RE.test(s) ? s : null
}

/** Hamkor sahifasining kanonik yo'li: /restaurant/<slug>/ (slug bo'lmasa — uuid) */
export function partnerPath(p: Pick<Partner, 'uuid' | 'slug' | 'partner_type'>): string {
  const base = p.partner_type === 'SHOP' ? '/store/' : '/restaurant/'
  return `${base}${cleanSlug(p.slug) || p.uuid}/`
}

async function getJson(path: string): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'Accept-Language': 'uz' } })
  if (!res.ok) throw new Error(`${path}: ${res.status}`)
  return res.json()
}

/** API'dagi faol hamkorlar (xom ko'rinishda) */
export async function fetchPartnersRaw(type: PartnerType): Promise<any[]> {
  try {
    const body = await getJson(`/partner/?partner_type=${type}`)
    const list = body?.data?.partners || body?.results || []
    return Array.isArray(list) ? list.filter((p: any) => p && p.uuid) : []
  } catch (e) {
    console.warn(`[seo] ${type} hamkorlar olinmadi:`, e)
    return []
  }
}

/** Har bir hamkor uchun ikkita yo'l: slug (kanonik) va uuid (eski havolalar) */
export async function partnerStaticPaths(type: PartnerType) {
  const partners = await fetchPartnersRaw(type)
  const seen = new Set<string>()
  const paths: { params: { slug: string } }[] = []
  for (const p of partners) {
    for (const key of [cleanSlug(p.slug), String(p.uuid)]) {
      if (key && !seen.has(key)) {
        seen.add(key)
        paths.push({ params: { slug: key } })
      }
    }
  }
  return { paths, fallback: false as const }
}

/** Slug yoki uuid bo'yicha hamkor + menyu (xom JSON) */
export async function partnerStaticProps(type: PartnerType, key: string) {
  const partners = await fetchPartnersRaw(type)
  const found = partners.find((p) => cleanSlug(p.slug) === key || String(p.uuid) === key)
  if (!found) return { notFound: true as const }
  const uuid = String(found.uuid)
  let partnerRaw: unknown = found
  let menuRaw: unknown | null = null
  try {
    partnerRaw = await getJson(`/partner/${uuid}/`)
  } catch {
    /* ro'yxatdagi ma'lumot yetarli */
  }
  try {
    menuRaw = await getJson(`/partner/category/?partner=${encodeURIComponent(uuid)}`)
  } catch {
    menuRaw = null
  }
  const props: PartnerStaticProps = { uuid, partnerRaw, menuRaw }
  return { props }
}
