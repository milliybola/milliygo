import PrerenderedPartner from '@/features/go/components/PrerenderedPartner'
import {
  partnerStaticPaths,
  partnerStaticProps,
  type PartnerStaticProps,
} from '@/features/go/lib/seoBuild'

/**
 * /restaurant/<slug>/ — build vaqtida har bir restoran uchun to'liq SEO bilan yaratiladi (kanonik havola).
 * /restaurant/<uuid>/ — eski havolalar uchun ham yaratiladi (kanonik → slug).
 * Build'dan keyin qo'shilgan restoranlar /restaurant/?id=<uuid> orqali ishlaydi.
 */
export async function getStaticPaths() {
  return partnerStaticPaths('RESTAURANT')
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  return partnerStaticProps('RESTAURANT', params.slug)
}

export default function RestaurantBySlug(props: PartnerStaticProps) {
  return <PrerenderedPartner {...props} type="RESTAURANT" />
}
