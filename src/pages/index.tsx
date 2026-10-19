import Seo from '@/components/common/Seo'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, OG_IMAGE, SITE_NAME, SITE_URL } from '@/constants/seo'
import HomePage from '@/features/go/pages/HomePage'

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/go/logo.png`,
    image: OG_IMAGE,
    description: DEFAULT_DESCRIPTION,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+998904969007',
        contactType: 'customer service',
        areaServed: 'UZ',
        availableLanguage: ['uz'],
      },
    ],
    sameAs: ['https://t.me/MilliyAppAdmin'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    inLanguage: 'uz',
  },
]

export default function Home() {
  return (
    <>
      <Seo title={DEFAULT_TITLE} path="/" jsonLd={JSON_LD} />
      <HomePage />
    </>
  )
}
