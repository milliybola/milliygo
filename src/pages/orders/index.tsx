import OrderFullPage from '@/features/Orders/Orders'
import { useTranslations } from 'next-intl'

interface IProps {
  locales: string[]
  locale: string
  defaultLocale: string
}

export async function getStaticProps(context: any) {
  let messages = {}
  try {
    if (context && context.locale) {
      messages = (await import(`../../locales/${context.locale}.json`)).default
    } else {
      messages = (await import(`../../locales/uz.json`)).default
    }
  } catch (err) {
    console.warn('Failed to load locales for', context?.locale)
  }
  return { props: { messages } }
}

const OrdersPage = () => {
  const t = useTranslations()

  return (
    <main className="bg-[#F8F8FA]">
      <div className="orders-page-container">
        <OrderFullPage />
      </div>

      <style jsx>{`
        .orders-page-container {
          width: 100%;
          max-width: 100%;
          margin-left: auto;
          margin-right: auto;
          padding-left: 0;
          padding-right: 0;
        }
        @media (min-width: 768px) {
          .orders-page-container {
            padding-left: 80px;
            padding-right: 80px;
          }
        }
        @media (min-width: 1280px) {
          .orders-page-container {
            padding-left: 160px;
            padding-right: 160px;
          }
        }
      `}</style>
    </main>
  )
}

export default OrdersPage
