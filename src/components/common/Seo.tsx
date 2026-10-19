import Head from 'next/head'
import { useRouter } from 'next/router'
import { DEFAULT_DESCRIPTION, OG_IMAGE, SITE_NAME, SITE_URL } from '@/constants/seo'

interface SeoProps {
  title: string
  description?: string
  /** Kanonik yo'l (query'siz). Berilmasa joriy yo'ldan olinadi */
  path?: string
  image?: string
  /** Shaxsiy sahifalar (savat, profil...) qidiruv tizimlariga ko'rsatilmaydi */
  noindex?: boolean
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

/** Sahifa SEO'si: title, description, canonical, Open Graph, Twitter va (ixtiyoriy) JSON-LD */
export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = OG_IMAGE,
  noindex,
  type = 'website',
  jsonLd,
}: SeoProps) {
  const { asPath } = useRouter()
  const clean = (path ?? asPath.split('?')[0].split('#')[0]) || '/'
  const url = `${SITE_URL}${clean.includes('?') || clean.endsWith('/') ? clean : `${clean}/`}`
  const full = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`
  const desc = description.length > 160 ? `${description.slice(0, 157)}…` : description
  return (
    <Head>
      <title>{full}</title>
      <meta name="description" content={desc} />
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}
      />
      <link rel="canonical" href={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="uz_UZ" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={full} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  )
}
