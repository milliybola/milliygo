import HeroCarousel from '@/features/Main/containers/ContentInstagram/post-carousel'
import RestaurantsList from '@/features/Main/containers/RestaurantsList'
import StoreList from '@/features/Main/containers/StoreList'
import QuickCategories from '@/features/Main/components/QuickCategories'
import ServicesSelector from '@/features/Main/components/ServicesSelector'
import { StarFilled, ThunderboltFilled, ShopFilled } from '@ant-design/icons'

import { useQuery } from '@tanstack/react-query'
import { useContext, useState, useEffect, useMemo } from 'react'
import { AuthContext } from '@/features/Account/auth/context/authContext'
import { useAuthStore } from '@/features/Account/auth/store/authStore'
import { getOrders } from '@/features/Cart/api'
import { rateCourier } from '@/features/Orders/api'
import { Modal, Typography, Input, message } from 'antd'

const { Text, Title } = Typography
const { TextArea } = Input

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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Fetch client orders
  const { data: ordersData, refetch: refetchOrders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getOrders,
    enabled: !!isAuthenticated,
  })

  // Extract orders list robustly supporting both array and results object structure
  const orders = useMemo(() => {
    if (!ordersData) return []
    if (Array.isArray(ordersData)) return ordersData
    if (Array.isArray(ordersData.results)) return ordersData.results
    return []
  }, [ordersData])

  // Find the newest order by created_at and fallback to ID
  const newestOrder = useMemo(() => {
    if (!orders || orders.length === 0) return null
    return [...orders].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      if (dateB !== dateA) {
        return dateB - dateA
      }
      return Number(b.id || 0) - Number(a.id || 0)
    })[0]
  }, [orders])

  // Rating Modal states
  const [modalVisible, setModalVisible] = useState(false)
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [comment, setComment] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Console log for debugging order rating state
  useEffect(() => {
    if (newestOrder) {
      const orderTime = newestOrder.updated_at || newestOrder.created_at
      const orderTimestamp = orderTime ? new Date(orderTime).getTime() : 0
      const hoursSinceOrder = orderTimestamp ? (Date.now() - orderTimestamp) / (1000 * 60 * 60) : 0

      console.log('Newest Order info for rating:', {
        id: newestOrder.id,
        uuid: newestOrder.uuid,
        status: newestOrder.status,
        evaluation: newestOrder.evaluation,
        isDelivered: newestOrder.status?.toUpperCase() === 'DELIVERED',
        isEvaluated: newestOrder.evaluation === true || newestOrder.evaluation === 'true',
        hoursSinceOrder: hoursSinceOrder.toFixed(2),
        isWithin24Hours: hoursSinceOrder <= 24,
        sessionDismissed: sessionStorage.getItem(`dismissed_rate_${newestOrder.uuid}`),
      })
    }
  }, [newestOrder])

  // Trigger modal when newest order is DELIVERED, evaluation is false/falsy/null/undefined, and is within 24 hours
  useEffect(() => {
    if (newestOrder) {
      const isDelivered = newestOrder.status?.toUpperCase() === 'DELIVERED'
      const isEvaluated = newestOrder.evaluation === true || newestOrder.evaluation === 'true'

      const orderTime = newestOrder.updated_at || newestOrder.created_at
      const orderTimestamp = orderTime ? new Date(orderTime).getTime() : 0
      const hoursSinceOrder = orderTimestamp ? (Date.now() - orderTimestamp) / (1000 * 60 * 60) : 0
      const isWithin24Hours = hoursSinceOrder <= 24

      if (isDelivered && !isEvaluated && isWithin24Hours) {
        const dismissed = sessionStorage.getItem(`dismissed_rate_${newestOrder.uuid}`)
        if (!dismissed) {
          setModalVisible(true)
        }
      } else {
        setModalVisible(false)
      }
    } else {
      setModalVisible(false)
    }
  }, [newestOrder])

  const handleClose = () => {
    if (newestOrder) {
      sessionStorage.setItem(`dismissed_rate_${newestOrder.uuid}`, 'true')
    }
    setModalVisible(false)
    setRating(0)
    setComment('')
    setIsSubmitted(false)
  }

  const handleSubmitRating = async () => {
    if (rating === 0) {
      message.warning('Iltimos, kuryerni baholash uchun yulduzchalarni tanlang.')
      return
    }
    if (!newestOrder) return

    setSubmitting(true)
    try {
      await rateCourier(newestOrder.uuid, {
        score: rating,
        comment: comment || 'Yaxshi xizmat',
      })
      if (newestOrder) {
        sessionStorage.setItem(`dismissed_rate_${newestOrder.uuid}`, 'true')
      }
      setIsSubmitted(true)
      refetchOrders()
    } catch (err: any) {
      message.error(err?.message || 'Baholashni yuborishda xatolik yuz berdi.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        handleClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isSubmitted])

  return (
    <main className="milliy-ikat-pattern relative flex min-h-screen flex-col bg-[#F9FAFB]">
      {/* Milliy-Classic Header Section */}
      <div className="relative overflow-hidden rounded-b-[28px] border-b border-[#C5A059]/20 bg-gradient-to-br from-[#FAF9F6] via-[#FDFBF7] to-[#FAF9F6] px-4 pb-5 pt-6 shadow-[0_15px_35px_rgba(197,160,89,0.06)] md:rounded-b-[36px] md:px-[80px] md:pb-7 md:pt-8 xl:px-[160px]">
        {/* Girih blueprint texture */}
        <div className="milliy-girih-blueprint pointer-events-none absolute inset-0 opacity-70" />

        <div className="relative z-10 flex flex-col items-center justify-between gap-8 lg:flex-row">
          {/* Left Text Column */}
          <div className="flex max-w-xl flex-1 flex-col gap-1.5 text-left">
            {/* <span className="flex w-fit select-none items-center gap-1.5 rounded-full border border-[#C5A059]/25 bg-[#C5A059]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#B38F4D] shadow-[inset_0_1px_8px_rgba(197,160,89,0.05)]"> */}
            {/* <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-[#C5A059]" />
              O&#39;zimizniki
            </span> */}
            <h1 className="!m-0 text-lg font-black leading-[1.25] tracking-tight text-gray-900 md:text-3xl lg:text-[36px]">
              Assalomu alaykum! Xo'jayin👋
            </h1>
            <p className="!m-0 text-[12.5px] font-semibold leading-relaxed text-gray-600 md:text-base">
              G'allaorolda restoran, kafe va do'konlardan tezkor yetkazib beramiz.
            </p>

            {/* Trust stats row */}
            {/* <div className="mt-2 flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C5A059]/10">
                  <ThunderboltFilled className="text-[13px] text-[#C5A059]" />
                </span>
                <div className="leading-tight">
                  <div className="text-[13px] font-black text-gray-900">30 daqiqa</div>
                  <div className="text-[10.5px] font-medium text-gray-500">tezkor yetkazish</div>
                </div>
              </div>

              <div className="h-8 w-px bg-[#C5A059]/15" />

              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C5A059]/10">
                  <StarFilled className="text-[13px] text-[#C5A059]" />
                </span>
                <div className="leading-tight">
                  <div className="text-[13px] font-black text-gray-900">4.9 reyting</div>
                  <div className="text-[10.5px] font-medium text-gray-500">mijozlar bahosi</div>
                </div>
              </div>

              <div className="h-8 w-px bg-[#C5A059]/15" />

              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C5A059]/10">
                  <ShopFilled className="text-[13px] text-[#C5A059]" />
                </span>
                <div className="leading-tight">
                  <div className="text-[13px] font-black text-gray-900">50+ hamkor</div>
                  <div className="text-[10.5px] font-medium text-gray-500">restoran va do'kon</div>
                </div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Signature ikat divider along the hero's bottom edge */}
        <div className="milliy-ikat-strip absolute bottom-0 left-0 z-10 h-[4px] w-full opacity-90" />
      </div>

      {/* Mobile-only Search Bar (Sticky & Elegant) */}

      <div className="animate-fade-up pb-20 md:px-[80px] xl:px-[160px]">
        <div className="mt-4">
          <HeroCarousel />
        </div>

        {/* <div className="mt-12">
          <h2 className="section-title px-4 md:px-0">Kategoriyalar</h2>
          <QuickCategories />
        </div> */}
        <section id="restaurants-section" className="mt-14 scroll-mt-24">
          {/* <h2 className="section-title px-4 md:px-0">Restoranlar</h2> */}
          <RestaurantsList />
        </section>

        <section id="stores-section" className="mt-14 scroll-mt-24">
          {/* <h2 className="section-title px-4 md:px-0">Do'konlar</h2> */}
          <StoreList />
        </section>

        {/* Tez kunda Section */}
        <div className="relative mx-4 mt-16 overflow-hidden rounded-[28px] border border-[#C5A059]/15 bg-gradient-to-br from-white via-[#FDFBF7] to-white px-4 py-8 shadow-[0_4px_24px_rgba(197,160,89,0.05)] md:mx-0 md:px-8">
          <div className="milliy-girih-blueprint pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative z-10">
            <h2 className="section-title">Tez kunda</h2>
            <p className="section-subtitle -mt-2 mb-6">
              Yaqin orada qo'shilishi kutilayotgan yangi xizmatlarimiz
            </p>
            <ServicesSelector />
          </div>
        </div>
      </div>

      {/* Spacing for bottom nav */}
      <div className="h-0 h-24 md:hidden" />

      {/* Premium Courier Rating Modal */}
      <Modal
        open={modalVisible}
        onCancel={handleClose}
        footer={null}
        width={440}
        centered
        destroyOnClose
        className="premium-rate-modal"
        styles={{ body: { padding: 0 } }}
      >
        <div className="relative select-none overflow-hidden rounded-[32px] bg-white p-6 text-center">
          {/* Decorative Top Accent Gradient */}
          <div className="absolute left-0 right-0 top-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

          {isSubmitted ? (
            <div className="animate-fade-in mt-4 flex flex-col items-center py-6">
              {/* Success Graphic */}
              <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 shadow-inner">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-10" />
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="relative z-10"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <Title
                level={3}
                className="!m-0 !text-[22px] font-black tracking-tight text-gray-900"
              >
                Fikringiz uchun rahmat! ❤️
              </Title>
              <Text className="mt-3 max-w-[280px] text-[14px] font-medium text-gray-500">
                Sizning bahoingiz xizmatimiz sifatini yanada yaxshilashga yordam beradi.
              </Text>

              <div className="mt-8 w-full">
                <button
                  onClick={handleClose}
                  className="w-full cursor-pointer rounded-[20px] border-none bg-gray-900 py-3.5 text-[15px] font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-gray-800 active:scale-[0.98]"
                >
                  Yopish
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center">
              {/* Courier/Delivery Graphic / Icon */}
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-yellow-100 bg-yellow-50 shadow-inner">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFD600"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-bounce"
                >
                  <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>

              <Title
                level={3}
                className="!m-0 !text-[22px] font-black tracking-tight text-gray-900"
              >
                Buyurtmangiz yetkazildi! 🎉
              </Title>
              <Text className="mt-1 text-[14px] font-medium text-gray-400">
                Kuryerimiz xizmatini baholang va fikringizni ulashing
              </Text>

              {newestOrder?.partner_name && (
                <div className="mt-3 rounded-full border border-gray-100 bg-gray-50 px-3 py-1">
                  <Text className="text-[12px] font-bold text-gray-500">
                    {newestOrder.partner_name}
                  </Text>
                </div>
              )}

              {/* Interactive Stars Row */}
              <div className="my-6 flex items-center gap-2.5 rounded-2xl border border-gray-50 bg-gray-50/50 px-4 py-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = star <= (hoverRating || rating)
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="cursor-pointer p-1 transition-transform duration-150 hover:scale-125 focus:outline-none"
                    >
                      <StarFilled
                        className={`text-4xl transition-colors duration-200 ${
                          isActive
                            ? 'text-[#FFD600] drop-shadow-[0_2px_4px_rgba(255,214,0,0.3)] filter'
                            : 'text-gray-200'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>

              {/* Star Description text */}
              <div className="-mt-2 mb-4 h-6">
                <Text className="animate-pulse text-[14px] font-bold uppercase tracking-wider text-amber-500">
                  {rating === 1 && 'Juda yomon 😞'}
                  {rating === 2 && 'Yomon 🙁'}
                  {rating === 3 && "O'rtacha 😐"}
                  {rating === 4 && 'Yaxshi 🙂'}
                  {rating === 5 && 'Ajoyib! 😍'}
                  {rating === 0 &&
                    (hoverRating === 0
                      ? 'Baholashni tanlang'
                      : hoverRating === 1
                        ? 'Juda yomon 😞'
                        : hoverRating === 2
                          ? 'Yomon 🙁'
                          : hoverRating === 3
                            ? "O'rtacha 😐"
                            : hoverRating === 4
                              ? 'Yaxshi 🙂'
                              : 'Ajoyib! 😍')}
                </Text>
              </div>

              {/* Feedback comment input */}
              <div className="mt-2 w-full space-y-1.5 text-left">
                <Text className="pl-1 text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
                  Fikr-mulohazalar (Ixtiyoriy)
                </Text>
                <TextArea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Xizmat haqida batafsilroq fikringizni yozing..."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  maxLength={500}
                  className="!p-4.5 !rounded-[18px] !border-none border-none !bg-gray-50 !text-[14px] transition-colors placeholder:!text-gray-300 hover:!bg-gray-100/80 focus:!bg-gray-100/80 focus:!shadow-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-6 w-full space-y-3">
                <button
                  onClick={handleSubmitRating}
                  disabled={rating === 0 || submitting}
                  className={`flex w-full cursor-pointer items-center justify-center gap-3 rounded-[20px] border-b-4 py-4 shadow-lg transition-all active:scale-[0.98] ${
                    rating > 0 && !submitting
                      ? 'border-[#E6C000] bg-[#FFD600] text-black shadow-[0_8px_20px_rgba(255,214,0,0.25)]'
                      : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 shadow-none'
                  }`}
                >
                  <span className="text-[16px] font-black uppercase tracking-wider">
                    {submitting ? 'YUBORILMOQDA...' : 'BAHOLASH'}
                  </span>
                </button>

                <button
                  onClick={handleClose}
                  className="w-full cursor-pointer border-none bg-transparent py-2 text-[14px] font-bold text-gray-400 transition-colors hover:text-gray-600"
                >
                  KEYINROQ
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <style jsx global>{`
        .premium-rate-modal .ant-modal-content {
          overflow: hidden;
          border-radius: 32px;
          padding: 0 !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </main>
  )
}
