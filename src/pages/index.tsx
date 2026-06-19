import HeroCarousel from '@/features/Main/containers/ContentInstagram/post-carousel'
import RestaurantsList from '@/features/Main/containers/RestaurantsList'
import StoreList from '@/features/Main/containers/StoreList'
import QuickCategories from '@/features/Main/components/QuickCategories'
import ServicesSelector from '@/features/Main/components/ServicesSelector'
import { SearchOutlined, StarFilled } from '@ant-design/icons'
import { useRouter } from 'next/router'
import Image from 'next/image'
import logo from '/public/logo.png'

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
  const router = useRouter()

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
      message.success('Kuryerni baholaganingiz uchun rahmat!')
      if (newestOrder) {
        sessionStorage.setItem(`dismissed_rate_${newestOrder.uuid}`, 'true')
      }
      setModalVisible(false)
      refetchOrders()
    } catch (err: any) {
      message.error(err?.message || 'Baholashni yuborishda xatolik yuz berdi.')
    } finally {
      setSubmitting(false)
    }
  }

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

        {/* <div className="mt-12">
          <h2 className="section-title px-4 md:px-0">Kategoriyalar</h2>
          <QuickCategories />
        </div> */}

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

            <Title level={3} className="!m-0 !text-[22px] font-black tracking-tight text-gray-900">
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
        </div>
      </Modal>

      <style jsx global>{`
        .premium-rate-modal .ant-modal-content {
          overflow: hidden;
          border-radius: 32px;
          padding: 0 !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
        }
      `}</style>
    </main>
  )
}
