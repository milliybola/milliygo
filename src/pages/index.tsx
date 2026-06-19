import HeroCarousel from '@/features/Main/containers/ContentInstagram/post-carousel'
import RestaurantsList from '@/features/Main/containers/RestaurantsList'
import StoreList from '@/features/Main/containers/StoreList'
import QuickCategories from '@/features/Main/components/QuickCategories'
import ServicesSelector from '@/features/Main/components/ServicesSelector'
import { SearchOutlined } from '@ant-design/icons'
import { useRouter } from 'next/router'
import Image from 'next/image'
import logo from '/public/logo.png'

export async function getStaticProps(context: any) {
  let messages = {}
  try {
    if (context && context.locale) {
      messages = (await import(`../locales/${context.locale}.json`)).default
    } else {
      messages = (await import(`../locales/uz.json`)).default
    }
  } catch (err) {
    console.warn('Failed to load locales for', context?.locale)
  }
  return { props: { messages } }
}

export default function Home() {
  const router = useRouter()

  return (
    <main className="milliy-ikat-pattern relative flex min-h-screen flex-col bg-[#F9FAFB]">
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-[#efefed] bg-white/90 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex-shrink-0" onClick={() => router.push('/')}>
          <Image src={logo} alt="MilliyGo" width={40} height={40} className="object-contain" />
        </div>

        <div
          onClick={() => router.push('/search')}
          className="flex flex-1 items-center gap-3 rounded-2xl bg-[#F3F4F6] px-4 py-2.5 transition-all active:scale-[0.98]"
        >
          <SearchOutlined className="text-lg text-[#999]" />
          <span className="text-[13px] font-medium text-[#999]">
            Restoran yoki taom qidiring...
          </span>
        </div>
      </div>
      {/* Milliy-Classic Header Section */}
      <div className="relative overflow-hidden rounded-b-[36px] border-b border-[#C5A059]/20 bg-gradient-to-br from-[#FAF9F6] via-[#FDFBF7] to-[#FAF9F6] px-4 pb-8 pt-8 shadow-[0_15px_35px_rgba(197,160,89,0.06)] md:px-[80px] xl:px-[160px]">
        <div className="relative z-10 flex flex-col items-center justify-between gap-8 lg:flex-row">
          {/* Left Text Column */}
          <div className="flex max-w-xl flex-1 flex-col gap-3 text-left">
            {/* <span className="text-[#B38F4D] font-extrabold text-[10px] uppercase tracking-[0.25em] bg-[#C5A059]/10 border border-[#C5A059]/25 w-fit px-3 py-1 rounded-full select-none shadow-[inset_0_1px_8px_rgba(197,160,89,0.05)] flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-ping" />
              O'ZIMIZNIKI
            </span> */}
            <h1 className="!m-0 text-2xl font-black leading-[1.2] tracking-tight text-gray-900 md:text-3xl lg:text-[36px]">
              Assalomu alaykum! Xo'jayin👋
            </h1>
            <p className="!m-0 text-[14.5px] font-semibold leading-relaxed text-gray-600 md:text-base">
              G'allaorolda restoran, kafe va do'konlardan tezkor yetkazib beramiz.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile-only Search Bar (Sticky & Elegant) */}

      <div className="animate-fade-up pb-20 md:px-[80px] xl:px-[160px]">
        <div className="mt-4">
          <HeroCarousel />
        </div>

        <div className="mt-12">
          <h2 className="section-title px-4 md:px-0">Kategoriyalar</h2>
          <QuickCategories />
        </div>

        <section id="stores-section" className="mt-14 scroll-mt-24">
          {/* <h2 className="section-title px-4 md:px-0">Do'konlar</h2> */}
          <StoreList />
        </section>

        <section id="restaurants-section" className="mt-14 scroll-mt-24">
          {/* <h2 className="section-title px-4 md:px-0">Restoranlar</h2> */}
          <RestaurantsList />
        </section>

        {/* Tez kunda Section */}
        <div className="mt-16 border-t border-gray-100 pt-10">
          <h2 className="section-title px-4 md:px-0">Tez kunda</h2>
          <p className="section-subtitle -mt-2 mb-6 px-4 md:px-0">
            Yaqin orada qo'shilishi kutilayotgan yangi xizmatlarimiz
          </p>
          <ServicesSelector />
        </div>
      </div>

      {/* Spacing for bottom nav */}
      <div className="h-24 md:hidden" />
    </main>
  )
}
