import HeroCarousel from '@/features/Main/containers/ContentInstagram/post-carousel'
import RestaurantsList from '@/features/Main/containers/RestaurantsList'
import StoreList from '@/features/Main/containers/StoreList'
import QuickCategories from '@/features/Main/components/QuickCategories'
import { SearchOutlined } from '@ant-design/icons'
import { useRouter } from 'next/router'
import Image from 'next/image'
import logo from '/public/logo.png'

export async function getStaticProps(context: any) {
  let messages = {};
  try {
    if (context && context.locale) {
        messages = (await import(`../locales/${context.locale}.json`)).default;
    } else {
        messages = (await import(`../locales/uz.json`)).default;
    }
  } catch (err) {
    console.warn("Failed to load locales for", context?.locale);
  }
  return { props: { messages } }
}

export default function Home() {
  const router = useRouter()
  
  return (
    <main className="relative flex flex-col bg-[#F9FAFB] milliy-ikat-pattern min-h-screen">
      {/* Milliy-Classic Header Section */}
      <div className="px-4 md:px-[80px] xl:px-[160px] pt-8 pb-8 bg-gradient-to-br from-[#FAF9F6] via-[#FDFBF7] to-[#FAF9F6] border-b border-[#C5A059]/20 relative overflow-hidden rounded-b-[36px] shadow-[0_15px_35px_rgba(197,160,89,0.06)]">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Text Column */}
          <div className="flex-1 flex flex-col gap-3 text-left max-w-xl">
            <span className="text-[#B38F4D] font-extrabold text-[10px] uppercase tracking-[0.25em] bg-[#C5A059]/10 border border-[#C5A059]/25 w-fit px-3 py-1 rounded-full select-none shadow-[inset_0_1px_8px_rgba(197,160,89,0.05)] flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-ping" />
              O'ZBEKONA MEHMONDO'STLIK
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-[36px] font-black tracking-tight text-gray-900 leading-[1.2] !m-0">
              Assalomu alaykum! Xo'jayin👋
            </h1>
            <p className="text-gray-600 text-[14.5px] md:text-base font-semibold leading-relaxed !m-0">
              G'allaorolda restoran, kafe va do'konlardan tezkor yetkazib berish.
            </p>
            
          </div>

        </div>
      </div>

      {/* Mobile-only Search Bar (Sticky & Elegant) */}
      <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md px-4 py-3 border-b border-[#efefed] flex items-center gap-3">
        <div className="flex-shrink-0" onClick={() => router.push('/')}>
          <Image 
            src={logo} 
            alt="MilliyGo" 
            width={40} 
            height={40} 
            className="object-contain"
          />
        </div>
        
        <div 
          onClick={() => router.push('/search')}
          className="flex-1 flex items-center gap-3 bg-[#F3F4F6] rounded-2xl px-4 py-2.5 active:scale-[0.98] transition-all"
        >
          <SearchOutlined className="text-[#999] text-lg" />
          <span className="text-[#999] text-[13px] font-medium">Restoran yoki taom qidiring...</span>
        </div>
      </div>

      <div className="animate-fade-up md:px-[80px] xl:px-[160px] pb-20">
        <div className="mt-4">
          <HeroCarousel />
        </div>
        
        <div className="mt-12">
          <h2 className="section-title px-4 md:px-0">Kategoriyalar</h2>
          <QuickCategories />
        </div>

        <section className="mt-14">
          {/* <h2 className="section-title px-4 md:px-0">Do'konlar</h2> */}
          <StoreList />
        </section>

        <section className="mt-14">
          {/* <h2 className="section-title px-4 md:px-0">Restoranlar</h2> */}
          <RestaurantsList />
        </section>
      </div>

      {/* Spacing for bottom nav */}
      <div className="h-24 md:hidden" />
    </main>
  )
}
