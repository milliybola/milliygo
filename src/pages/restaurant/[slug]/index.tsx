import RestaurantPage from '@/features/go/pages/RestaurantPage'

/**
 * Eski havolalar (/restaurant/<uuid>/) uchun build vaqtida yaratiladigan sahifalar.
 * Yangi havolalar /restaurant/?id=<uuid> ko'rinishida — ular build'dan keyin
 * qo'shilgan restoranlar uchun ham ishlaydi.
 */
export async function getStaticPaths() {
  try {
    const res = await fetch('https://mytizim.uz/partner/?partner_type=RESTAURANT').then((v) =>
      v.json()
    )
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

export default function RestaurantBySlug() {
  return <RestaurantPage />
}
