import PrerenderedPartner from '@/features/go/components/PrerenderedPartner'
import {
  partnerStaticPaths,
  partnerStaticProps,
  type PartnerStaticProps,
} from '@/features/go/lib/seoBuild'

/** /store/<slug>/ — build vaqtida to'liq SEO bilan. Build'dan keyin qo'shilganlar: /store/?id=<uuid> */
export async function getStaticPaths() {
  return partnerStaticPaths('SHOP')
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  return partnerStaticProps('SHOP', params.slug)
}

export default function StoreBySlug(props: PartnerStaticProps) {
  return <PrerenderedPartner {...props} type="SHOP" />
}
