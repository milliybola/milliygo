import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { getStoreItemCategories } from '../api'
import HeartIcon from '@/components/icons/heart-icon'
import StarIcon from '@/components/icons/star'
import ProductCard from './ProductCard'
import { useCategoryScrollStore } from '../store/categoryScrollStore'


// ─── Icons ────────────────────────────────────────────────────────────────────

const RiderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="2.5" /><circle cx="18.5" cy="17.5" r="2.5" />
    <path d="M8 17.5h7" /><path d="M15 6h2l2 5" />
    <path d="M9 6l1.5 5H19" /><path d="M5.5 15l2-6h5" />
  </svg>
)

const InfoCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

// ─── Skeletons ────────────────────────────────────────────────────────────────

const HeroSkeleton = () => (
  <div className="relative h-[220px] w-full overflow-hidden rounded-[20px] bg-[#E5E7EB] animate-pulse">
    <div className="absolute bottom-5 left-5 flex flex-col gap-3">
      <div className="h-7 w-32 rounded-[8px] bg-white/30" />
      <div className="flex items-center gap-2">
        <div className="h-8 w-28 rounded-full bg-white/30" />
        <div className="h-8 w-24 rounded-full bg-white/30" />
        <div className="h-8 w-8 rounded-full bg-white/30" />
      </div>
    </div>
  </div>
)

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className="overflow-hidden rounded-[16px] animate-pulse bg-white"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        <div className="aspect-square bg-[#F3F4F6]" />
        <div className="space-y-2 p-3">
          <div className="h-4 w-2/3 rounded bg-[#E5E7EB]" />
          <div className="h-3 w-full rounded bg-[#E5E7EB]" />
          <div className="h-3 w-1/3 rounded bg-[#E5E7EB]" />
          <div className="mt-3 h-8 w-full rounded-[10px] bg-[#E5E7EB]" />
        </div>
      </div>
    ))}
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────

const StoreItemDetails = ({
  restaurantData,
  restaurantLoading,
}: {
  restaurantData: any
  restaurantLoading: boolean
}) => {
  const router = useRouter()
  const { slug } = router.query
  const [liked, setLiked] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const { activeCategoryId, scrollTrigger, setActiveCategoryId } = useCategoryScrollStore()

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['item-base-categories', slug],
    queryFn: () => getStoreItemCategories({ id: slug as string }),
    enabled: !!slug,
  })

  const categoryList: any[] = (categoriesData?.data?.categories || []).filter(
    (cat: any) => cat.is_active
  )

  // ─── 1. Sidebar click → scroll ─────────────────────────────────────────────
  // scrollTrigger har sidebar click da oshadi → shu useEffect ishlaydi
  useEffect(() => {
    if (scrollTrigger === 0) return // mount paytida ishlamasin

    if (activeCategoryId === null) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // products yuklanishini kutib, retry qilamiz
    const tryScroll = (attempt = 0) => {
      const el = document.getElementById(`category-section-${activeCategoryId}`)
      if (!el) {
        if (attempt < 10) setTimeout(() => tryScroll(attempt + 1), 150)
        return
      }
      const OFFSET = 120
      const top = el.getBoundingClientRect().top + window.scrollY - OFFSET
      window.scrollTo({ top, behavior: 'smooth' })
    }

    tryScroll()
  }, [scrollTrigger]) // ← activeCategoryId emas, scrollTrigger ga bog'liq!

  // ─── 2. User scroll → sidebar highlight ────────────────────────────────────
  // IntersectionObserver faqat setActiveCategoryId chaqiradi (triggerScroll emas)
  useEffect(() => {
    if (categoryList.length === 0) return

    const observers: IntersectionObserver[] = []

    categoryList.forEach((cat) => {
      const el = document.getElementById(`category-section-${cat.id}`)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveCategoryId(cat.id) // scroll trigger oshirmaydi → loop yo'q
          }
        },
        { rootMargin: '-80px 0px -55% 0px', threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [categoryList.length])

  // ─── Restaurant meta ────────────────────────────────────────────────────────
  const restaurant = restaurantData?.data || restaurantData || null
  const bannerUrl = restaurant?.banner?.replace('http://', 'https://')
  const name = restaurant?.name || ''
  const deliveryTime = restaurant?.delivery_time || '15–25'
  const rating = restaurant?.rating
  const reviewCount = restaurant?.review_count || restaurant?.reviews_count
  const description = restaurant?.description

  if (restaurantLoading) return <HeroSkeleton />

  return (
    <>
      {/* ── Hero Banner ───────────────────────────────────────────────────────── */}
      <div
        className="relative h-[220px] w-full overflow-hidden rounded-[20px] bg-[#1a1a1a]"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
      >
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: 'center 40%' }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.08) 100%)',
          }}
        />

        {/* Like button */}
        <button
          onClick={() => setLiked((p) => !p)}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-transform duration-200 hover:scale-110 active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.18)',
            border: '1.5px solid rgba(255,255,255,0.28)',
          }}
          aria-label="Sevimlilar"
        >
          <HeartIcon
            style={{ fontSize: 18, color: liked ? '#FF4B6E' : 'rgba(255,255,255,0.9)' }}
          />
        </button>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-5">
          <p
            className="mb-3 font-bold leading-tight text-white"
            style={{ fontSize: 22, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
          >
            {name || "Do'kon"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255,255,255,0.25)',
              }}
            >
              <RiderIcon />
              <span className="text-[13px] font-semibold text-white">{deliveryTime} daqiqa</span>
            </div>

            {rating && (
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                }}
              >
                <StarIcon style={{ fontSize: 13, color: '#FBBF24' }} />
                <span className="text-[13px] font-semibold text-white">
                  {rating}
                  {reviewCount && (
                    <span className="ml-1 font-normal opacity-75">{reviewCount}</span>
                  )}
                </span>
              </div>
            )}

            <button
              onClick={() => setInfoOpen((p) => !p)}
              className="flex items-center justify-center rounded-full transition-opacity hover:opacity-80 active:scale-95"
              style={{
                width: 36,
                height: 36,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              <InfoCircleIcon />
            </button>
          </div>
        </div>
      </div>

      {/* ── Info Drawer ───────────────────────────────────────────────────────── */}
      {infoOpen && description && (
        <div
          className="mt-3 rounded-[14px] border border-[#E5E7EB] bg-white p-4 text-[14px] text-[#374151]"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold text-[#0c0c0c]">Do'kon haqida</span>
            <button
              onClick={() => setInfoOpen(false)}
              className="text-[#9CA3AF] hover:text-[#0c0c0c] transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="leading-relaxed">{description}</p>
        </div>
      )}

      {/* ── Kategoriyalar + Mahsulotlar ────────────────────────────────────────── */}
      <div className="mt-5 space-y-10">
        {categoriesLoading ? (
          <ProductGridSkeleton />
        ) : (
          categoryList.map((cat) => {
            const products: any[] = cat.products || []
            const activeProducts = products.filter((p: any) => p.is_active && p.is_available)

            if (activeProducts.length === 0) return null

            return (
              <div key={cat.id} id={`category-section-${cat.id}`}>
                <div className="mb-3 flex items-center gap-2">
                  {cat.category_details?.logo && (
                    <img
                      src={cat.category_details.logo}
                      alt={cat.category_details.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  )}
                  <h2 className="text-[16px] font-bold text-[#0c0c0c]">
                    {cat.category_details?.name || cat.name}
                  </h2>
                  <span className="text-[13px] text-[#9CA3AF]">
                    {`${activeProducts.length} ta`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeProducts.map((product: any) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      restaurantInfo={{
                         id: restaurant?.uuid || slug as string,
                         name: name,
                         slug: slug as string,
                         image: bannerUrl || '',
                         deliveryTime: deliveryTime,
                         rating: rating,
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}

export default StoreItemDetails
