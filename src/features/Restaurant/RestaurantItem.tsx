import { Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import RegionCardSkeleton from './components/RegionCardSkeleton'
import { useTranslations } from 'next-intl'
import { getBaseCategories, getRestaurantsList } from '../Main/api'
import HeartIcon from '@/components/icons/heart-icon'
import StarIcon from '@/components/icons/star'
import Link from 'next/link'
import { getRestaurantDetail, getStoreItemCategories } from './api'

import { ICategory } from '../Main/types'
import { useContext } from 'react'
import { AuthContext } from '@/features/Account/auth/context/authContext'

const RiderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="2.5" />
    <circle cx="18.5" cy="17.5" r="2.5" />
    <path d="M8 17.5h7" />
    <path d="M15 6h2l2 5" />
    <path d="M9 6l1.5 5H19" />
    <path d="M5.5 15l2-6h5" />
  </svg>
)

const FreeDeliveryIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#A855F7" />
    <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
)

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

import { useRouter } from 'next/router'
import StoreItemCategories from './components/StoreItemCategories'
import StoreItemDetails from './components/StoreItemDetails'
import StoreItemCart from './components/StoreItemCart'
import { useCartStore } from '@/store/cartStore'

const StoreItem = () => {
  const t = useTranslations()
  const router = useRouter()
  const { slug, id } = router.query

  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())

  const { data: restaurantData, isLoading: restaurantLoading } = useQuery({
    queryKey: ['restaurant-detail', slug],
    queryFn: () => getRestaurantDetail({ uuid: id as string }),
    enabled: !!slug,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['restaurant-list'],
    queryFn: () => getRestaurantsList({ partner_type: "SHOP" }),
  })



  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['item-base-categories', slug],
    queryFn: () => getStoreItemCategories({ id: slug as string }),
    enabled: !!slug,
  })


  const restaurants = data?.data?.partners || []
  const filteredRestaurants = activeCategory
    ? restaurants.filter((r: any) =>
      r?.base_categories?.includes(activeCategory) ||
      r?.categories?.some((c: any) => c?.id === activeCategory)
    )
    : restaurants

  const toggleLike = (e: React.MouseEvent, id: number) => {
    e.preventDefault()
    e.stopPropagation()
    setLikedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const categoryList: ICategory[] = categoriesData?.data?.categories || []


  const { carts } = useCartStore()
  const subtotal = carts[slug as string]?.items?.reduce((s: number, i: any) => s + i.price * i.quantity, 0) || 0

  const authContext = useContext(AuthContext)
  const isAuthenticated = authContext?.authStore?.isAuthenticated
  const openLogin = authContext?.openLogin

  const partnerData = categoriesData?.data as any
  const minOrderAmount = partnerData?.min_order_amount !== undefined ? Number(partnerData.min_order_amount) : 0
  const isMinOrderSatisfied = subtotal >= minOrderAmount

  return (
    <div className="container mx-auto px-4 pb-20 mt-4 relative">
      {/* Header section */}
      <div className="mb-6">
        <Typography.Title level={2} className="!m-0 text-[24px] lg:text-[32px] font-bold text-gray-900">
          {restaurantData?.name || "Restoran"}
        </Typography.Title>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Sidebar: Categories */}
        <aside className="w-full lg:w-[280px] lg:shrink-0 lg:sticky lg:top-24">
          <StoreItemCategories />
        </aside>

        {/* Middle content: Products */}
        <main className="flex-1 min-w-0">
          <StoreItemDetails
            restaurantData={restaurantData}
            restaurantLoading={restaurantLoading}
          />
        </main>

        {/* Right Sidebar: Cart (visible from XL up) */}
        <aside className="hidden xl:block xl:w-[350px] xl:shrink-0 xl:sticky xl:top-24">
          <StoreItemCart
            restaurantData={restaurantData}
            restaurantLoading={restaurantLoading}
          />
        </aside>
      </div>

      {/* Mobile Cart Bar (visible when main cart is hidden) */}
      {subtotal > 0 && (
        <div className="xl:hidden fixed bottom-6 left-4 right-4 z-50">
          <button
            disabled={!isMinOrderSatisfied}
            onClick={() => {
              if (isAuthenticated) {
                router.push(`/checkout?store=${slug}`)
              } else {
                openLogin?.()
              }
            }}
            className={`w-full active:scale-[0.98] transition-all rounded-2xl py-4 px-6 flex items-center justify-between shadow-[0_8px_24px_rgba(255,214,0,0.3)] border border-white/20 ${
              isMinOrderSatisfied
                ? 'bg-[#FFD600] text-gray-900 font-bold'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed font-bold'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={isMinOrderSatisfied ? "bg-white/20 rounded-lg p-1.5" : "bg-gray-200 rounded-lg p-1.5"}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <span className="text-[15px]">
                {isMinOrderSatisfied ? "Savatni ko'rish" : `Eng kam buyurtma: ${minOrderAmount.toLocaleString('uz-UZ').replace(/,/g, ' ')} so'm`}
              </span>
            </div>
            <span className="text-[17px]">
              {subtotal.toLocaleString('uz-UZ').replace(/,/g, ' ')} so'm
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

export default StoreItem
