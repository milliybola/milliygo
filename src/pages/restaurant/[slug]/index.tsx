import CBreadcrumb from '@/components/common/CBreadcrumb'
import { useTranslations } from 'next-intl'
import RestaurantItem from '@/features/Restaurant/RestaurantItem'

import { baseURL } from '@/utils/axios'

export async function getStaticPaths() {
  try {
    const res = await fetch(`${baseURL}/partner/?partner_type=RESTAURANT`).then(v => v.json());
    const partners = res?.data?.partners || res?.results || [];
    
    const paths = partners.map((p: any) => ({
      params: { slug: p.uuid || p.id.toString() }
    }));

    return { paths, fallback: false }
  } catch (error) {
    console.error("Failed to fetch restaurant paths:", error);
    return { paths: [], fallback: false }
  }
}

export async function getStaticProps(context: any) {
  let messages = {};
  try {
    if (context && context.locale) {
        messages = (await import(`../../../locales/${context.locale}.json`)).default;
    } else {
        messages = (await import(`../../../locales/uz.json`)).default;
    }
  } catch (err) {
    console.warn("Failed to load locales for", context?.locale);
  }
  return { props: { messages } }
}

import { useHasHydrated } from '@/hooks/useHasHydrated'

const StoreItemPage = () => {
  const t = useTranslations()
  const hasHydrated = useHasHydrated()
  
  if (!hasHydrated) return null

  return (
    <main className="bg-white mb-20 px-0">
      <RestaurantItem />
    </main>
  )
}

export default StoreItemPage
