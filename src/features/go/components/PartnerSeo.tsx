import Seo from '@/components/common/Seo'
import { SITE_NAME, SITE_URL } from '@/constants/seo'
import { partnerPath } from '../lib/seoBuild'
import type { MenuCategory, Partner } from '../lib/types'
import { workingHoursLabel } from '../lib/utils'

const DAYS: [keyof NonNullable<Partner['opening_hours']>, string][] = [
  ['mon', 'Monday'],
  ['tue', 'Tuesday'],
  ['wed', 'Wednesday'],
  ['thu', 'Thursday'],
  ['fri', 'Friday'],
  ['sat', 'Saturday'],
  ['sun', 'Sunday'],
]

/** Menyudagi mahsulotlar soni schema.org'da cheklanadi (sahifa hajmi uchun) */
const MAX_MENU_ITEMS = 300

const clean = (v?: string | null) => (v && /[A-Za-zА-Яа-я0-9]/.test(v) ? v.trim() : null)

/**
 * Restoran / do'kon sahifasi SEO'si: title, description, kanonik havola (/restaurant/<slug>/),
 * OG rasm va schema.org (Restaurant|Store + Menu + BreadcrumbList). Faqat API'dagi haqiqiy ma'lumotlar.
 */
export default function PartnerSeo({
  partner: p,
  menu,
}: {
  partner: Partner
  menu?: MenuCategory[]
}) {
  const shop = p.partner_type === 'SHOP'
  const hours = workingHoursLabel(p)
  const cuisines = (p.cuisines || []).map((c) => c.name).filter(Boolean)
  const sections = (menu || []).filter((c) => c.products.length > 0)
  const sampleNames = sections
    .flatMap((c) => c.products.map((x) => x.name))
    .slice(0, 4)
    .join(', ')

  const desc = [
    shop ? `${p.name} — G'allaorolda do'kon.` : `${p.name} — G'allaorolda restoran.`,
    clean(p.description) && clean(p.description) !== p.name ? clean(p.description) : null,
    !shop && cuisines.length ? `${cuisines.slice(0, 3).join(', ')}.` : null,
    sampleNames ? `Menyuda: ${sampleNames}.` : null,
    hours ? `Ish vaqti: ${hours}.` : null,
    'Uyga tez yetkazib berish yoki olib ketish — MilliyGo.',
  ]
    .filter(Boolean)
    .join(' ')

  const path = partnerPath(p)
  const url = `${SITE_URL}${path}`
  const image = p.banner || p.logo || undefined
  const from = p.opening_hours?.from_hour?.slice(0, 5)
  const to = p.opening_hours?.to_hour?.slice(0, 5)
  const oh = p.opening_hours
  const days = oh ? DAYS.filter(([k]) => oh[k]).map(([, d]) => `https://schema.org/${d}`) : []

  let left = MAX_MENU_ITEMS
  const hasMenu =
    !shop && sections.length
      ? {
          '@type': 'Menu',
          name: `${p.name} menyusi`,
          inLanguage: 'uz',
          hasMenuSection: sections
            .map((c) => {
              const items = c.products.slice(0, Math.max(0, left))
              left -= items.length
              return {
                '@type': 'MenuSection',
                name: c.name,
                hasMenuItem: items.map((x) => ({
                  '@type': 'MenuItem',
                  name: x.name,
                  ...(clean(x.description) ? { description: clean(x.description) } : {}),
                  ...(x.image ? { image: x.image } : {}),
                  offers: {
                    '@type': 'Offer',
                    price: x.final_price || x.price,
                    priceCurrency: 'UZS',
                    availability: x.is_available
                      ? 'https://schema.org/InStock'
                      : 'https://schema.org/OutOfStock',
                  },
                })),
              }
            })
            .filter((s) => s.hasMenuItem.length > 0),
        }
      : undefined

  const business = {
    '@context': 'https://schema.org',
    '@type': shop ? 'GroceryStore' : 'Restaurant',
    '@id': `${url}#business`,
    name: p.name,
    url,
    ...(image ? { image } : {}),
    ...(p.logo ? { logo: p.logo } : {}),
    ...(clean(p.description) && clean(p.description) !== p.name
      ? { description: clean(p.description) }
      : {}),
    ...(p.phone ? { telephone: p.phone } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(clean(p.address) ? { streetAddress: clean(p.address) } : {}),
      addressLocality: "G'allaorol",
      addressRegion: 'Jizzax viloyati',
      addressCountry: 'UZ',
    },
    ...(p.lat != null && p.lng != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng } }
      : {}),
    ...(from && to && days.length
      ? {
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: days,
              opens: from,
              // 00:00 gacha ishlasa — schema.org'da 23:59
              closes: to === '00:00' ? '23:59' : to,
            },
          ],
        }
      : {}),
    ...(!shop ? { servesCuisine: cuisines.length ? cuisines : ["O'zbek milliy taomlari"] } : {}),
    ...(!shop ? { acceptsReservations: false } : {}),
    currenciesAccepted: 'UZS',
    paymentAccepted: 'Naqd, karta',
    areaServed: { '@type': 'City', name: "G'allaorol" },
    ...(hasMenu ? { hasMenu } : {}),
  }

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: shop ? "Do'konlar" : 'Restoranlar',
        item: `${SITE_URL}${shop ? '/store/' : '/restaurants/'}`,
      },
      { '@type': 'ListItem', position: 3, name: p.name, item: url },
    ],
  }

  return (
    <Seo
      title={
        shop
          ? `${p.name} — G'allaorolda mahsulot yetkazib berish`
          : `${p.name} — menyu va narxlar, G'allaorolda yetkazib berish`
      }
      description={desc}
      path={path}
      image={image}
      jsonLd={[business, breadcrumbs]}
    />
  )
}
