import StorePage from '@/features/go/pages/StorePage'

/** Eski havolalar (/store/<uuid>/) uchun. Yangi havolalar: /store/?id=<uuid> */
export async function getStaticPaths() {
  try {
    const res = await fetch('https://mytizim.uz/partner/?partner_type=SHOP').then((v) => v.json())
    const partners = res?.data?.partners || res?.results || []
    return {
      paths: partners.map((p: any) => ({ params: { slug: String(p.uuid || p.id) } })),
      fallback: false,
    }
  } catch {
    return { paths: [], fallback: false }
  }
}

export async function getStaticProps() {
  return { props: {} }
}

export default function StoreBySlug() {
  return <StorePage />
}
