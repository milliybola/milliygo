import Seo from '@/components/common/Seo'
import { SITE_URL } from '@/constants/seo'
import type { Partner } from '../lib/types'
import { workingHoursLabel } from '../lib/utils'

/** Restoran / do'kon sahifasi SEO'si (title, description, OG rasm, schema.org). Faqat API'dagi haqiqiy ma'lumotlar */
export default function PartnerSeo({ partner: p }: { partner: Partner }) {
  const shop = p.partner_type === 'SHOP'
  const hours = workingHoursLabel(p)
  const clean = (v?: string | null) => (v && /[A-Za-zА-Яа-я0-9]/.test(v) ? v : null)
  const desc = [
    shop ? `${p.name} — G'allaorolda do'kon.` : `${p.name} — G'allaorolda restoran.`,
    clean(p.description) && clean(p.description) !== p.name ? clean(p.description) : null,
    hours ? `Ish vaqti: ${hours}.` : null,
    'Menyu va narxlar, uyga tez yetkazib berish yoki olib ketish — MilliyGo.',
  ]
    .filter(Boolean)
    .join(' ')
  const path = `${shop ? '/store/' : '/restaurant/'}?id=${p.uuid}`
  const image = p.banner || p.logo || undefined
  const from = p.opening_hours?.from_hour?.slice(0, 5)
  const to = p.opening_hours?.to_hour?.slice(0, 5)
  return (
    <Seo
      title={`${p.name} — ${shop ? "do'kon" : 'restoran'} menyusi va yetkazib berish`}
      description={desc}
      path={path}
      image={image}
      jsonLd={{
        '@context': 'https://schema.org',
        '@type': shop ? 'Store' : 'Restaurant',
        name: p.name,
        url: `${SITE_URL}${path}`,
        ...(image ? { image } : {}),
        ...(p.phone ? { telephone: p.phone } : {}),
        ...(clean(p.address)
          ? {
              address: {
                '@type': 'PostalAddress',
                streetAddress: clean(p.address),
                addressLocality: "G'allaorol",
                addressCountry: 'UZ',
              },
            }
          : {}),
        ...(p.lat != null && p.lng != null
          ? { geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng } }
          : {}),
        ...(from && to ? { openingHours: `${from}-${to}` } : {}),
        ...(shop ? {} : { servesCuisine: 'Milliy taomlar' }),
      }}
    />
  )
}
