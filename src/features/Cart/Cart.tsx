import { Typography, Input, Modal, Select, Button, message } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { useState, useContext, useMemo } from 'react'

import { useTranslations } from 'next-intl'
import { getRestaurantDetail, createOrder, getStoreItemCategories } from './api'
import { getAccountMe } from '@/features/Account/api'

import { AuthContext } from '@/features/Account/auth/context/authContext'
import { useRouter } from 'next/router'
import { useCartStore } from '@/store/cartStore'
import CartDetail from './components/CartDetails'
import StoreItemCart from './components/StoreItemCart'
import { useLocationStore } from '@/store/useLocationStore'
import LocationModal from '@/components/common/CHeader/components/LocationModal'
import {
  CheckCircleFilled,
  CreditCardOutlined,
  EnvironmentOutlined,
  RightOutlined,
} from '@ant-design/icons'

const { Text } = Typography
const { TextArea } = Input

const CartFullPage = () => {
  const t = useTranslations()
  const router = useRouter()
  const querySlug = (router.query.store || router.query.slug) as string
  const { id } = router.query
  const { carts, clearCart } = useCartStore()

  const authContext = useContext(AuthContext) as any
  const isAuthenticated = authContext?.authStore?.isAuthenticated
  const openLogin = authContext?.openLogin

  const { location: storeLocation } = useLocationStore()

  // Checkout States
  const [comment, setComment] = useState('')
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [deliveryTime, setDeliveryTime] = useState<string>('Hozir')
  const [orderLoading, setOrderLoading] = useState(false)

  // Derived location from store
  const selectedCoords = useMemo(
    () => (storeLocation ? [storeLocation.lat, storeLocation.lng] : null),
    [storeLocation]
  )
  const addressText = storeLocation?.address || 'Manzil tanlanmagan'

  const { data: restaurantData, isLoading: restaurantLoading } = useQuery({
    queryKey: ['restaurant-detail', querySlug],
    queryFn: () => getRestaurantDetail({ uuid: id as string }),
    enabled: !!querySlug,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['item-base-categories', querySlug],
    queryFn: () => getStoreItemCategories({ id: querySlug as string }),
    enabled: !!querySlug,
  })

  const { data: userData } = useQuery({
    queryKey: ['account-me'],
    queryFn: getAccountMe,
    enabled: isAuthenticated,
  })

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return querySlug
      ? carts[querySlug as string]?.items?.reduce(
          (s: number, i: any) => s + i.price * i.quantity,
          0
        ) || 0
      : Object.values(carts)
          .flatMap((c) => c.items || [])
          .reduce((s: number, i: any) => s + i.price * i.quantity, 0)
  }, [carts, querySlug])

  const partnerData = categoriesData?.data as any
  const deliveryFee =
    partnerData?.delivery_fee !== undefined ? Number(partnerData.delivery_fee) : 8000
  const freeDeliveryThreshold =
    partnerData?.free_delivery_threshold !== undefined
      ? Number(partnerData.free_delivery_threshold)
      : 50000
  const minOrderAmount =
    partnerData?.min_order_amount !== undefined ? Number(partnerData.min_order_amount) : 0

  const remaining = Math.max(0, freeDeliveryThreshold - subtotal)
  const activeDeliveryFee = remaining > 0 ? deliveryFee : 0
  const total = subtotal + activeDeliveryFee
  const isMinOrderSatisfied = subtotal >= minOrderAmount

  const handleCreateOrder = () => {
    if (!isAuthenticated) {
      openLogin?.()
      return
    }
    if (!selectedCoords) {
      message.warning('Iltimos, yetkazib berish manzilini tanlang.')
      setIsLocationModalOpen(true)
      return
    }
    if (!isMinOrderSatisfied) {
      message.warning(`Eng kam buyurtma miqdori ${fmt(minOrderAmount)} UZS`)
      return
    }

    setIsConfirmModalOpen(true)
  }

  const handleConfirmOrder = async () => {
    const activeStoreId =
      (querySlug as string) || Object.keys(carts).find((id) => (carts[id].items?.length || 0) > 0)
    if (!activeStoreId) return

    setOrderLoading(true)
    try {
      const cartItems = carts[activeStoreId]?.items || []
      const userPhone = userData?.phone_number || ''

      const orderData = {
        description: comment || "Izoh yo'q",
        address: addressText,
        contact_phone: userPhone,
        latitude: String(selectedCoords![0]),
        longitude: String(selectedCoords![1]),
        items: cartItems.map((item) => ({
          product_uuid: item.uuid,
          quantity: item.quantity,
        })),
      }

      const response = await createOrder(orderData)

      if (response) {
        message.success('Buyurtmangiz muvaffaqiyatli qabul qilindi!')
        clearCart(activeStoreId)
        setIsConfirmModalOpen(false)
        const orderUuid = (response as any).uuid
        if (orderUuid) {
          router.push(`/orders/track?uuid=${orderUuid}`)
        } else {
          router.push('/orders')
        }
      }
    } catch (error: any) {
      message.error(error?.message || 'Buyurtma berishda xatolik yuz berdi.')
    } finally {
      setOrderLoading(false)
    }
  }

  const fmt = (n: number) => n.toLocaleString('uz-UZ').replace(/,/g, ' ')

  return (
    <div className="container relative mx-auto mt-6 px-4 pb-48">
      <div className="mb-8 flex items-baseline justify-between px-1">
        <Typography.Title
          level={2}
          className="!m-0 text-[32px] font-black tracking-tight text-[#111]"
        >
          Savatcha
        </Typography.Title>
        <Typography.Text className="text-[14px] font-bold uppercase tracking-widest text-gray-400">
          {Object.values(carts).reduce((acc, c) => acc + (c.items?.length || 0), 0)} MAHSULOT
        </Typography.Text>
      </div>

      <div className="flex flex-col items-start gap-10 lg:flex-row">
        <main className="animate-fade-up w-full min-w-0 flex-1 space-y-8">
          <CartDetail restaurantData={restaurantData} restaurantLoading={restaurantLoading} />

          {/* Mobile Checkout Details (Visible only on mobile before sidebar) */}
          <div className="space-y-4 xl:hidden">
            <div className="flex flex-col gap-4 rounded-[28px] border border-gray-50 bg-white p-5 shadow-sm">
              <Text className="text-[18px] font-black text-[#111]">Buyurtma tafsilotlari</Text>

              <div className="divide-y divide-gray-50">
                <div
                  onClick={() => setIsLocationModalOpen(true)}
                  className="flex items-center gap-4 py-4 transition-colors active:bg-gray-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                    <EnvironmentOutlined className="text-xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text className="mb-0.5 block text-[12px] text-gray-400">
                      YETKAZIB BERISH MANZILI
                    </Text>
                    <Text
                      className={`block truncate text-[15px] font-black ${selectedCoords ? 'text-[#00D166]' : 'text-gray-900'}`}
                    >
                      {addressText}
                      {selectedCoords && <CheckCircleFilled className="ml-2" />}
                    </Text>
                  </div>
                  <RightOutlined className="text-[12px] text-gray-300" />
                </div>

                <div className="flex items-center gap-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                    <CreditCardOutlined className="text-xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text className="mb-0.5 block text-[12px] text-gray-400">TO'LOV USULI</Text>
                    <Select
                      value={paymentMethod}
                      onChange={setPaymentMethod}
                      className="checkout-select-mobile w-full !text-[15px] !font-black"
                      variant="borderless"
                      options={[{ value: 'cash', label: 'Naqd pul orqali' }]}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <Text className="mb-2 block px-1 text-[12px] font-bold text-gray-400">
                  BUYURTMAGA IZOH
                </Text>
                <TextArea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Masalan: Uy raqami, podyezd..."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  className="!rounded-2xl !border-none !bg-gray-50 !p-3 !text-[14px] placeholder:!text-gray-300 hover:!bg-gray-100 focus:!bg-gray-100"
                />
              </div>
            </div>
          </div>
        </main>

        <aside className="hidden xl:sticky xl:top-24 xl:block xl:w-[380px] xl:shrink-0">
          <StoreItemCart
            restaurantData={restaurantData}
            restaurantLoading={restaurantLoading}
            // Passing props for potential sync, though sidebar might need own copy or shared state
            customLogic={{
              comment,
              setComment,
              selectedCoords,
              addressText,
              paymentMethod,
              setPaymentMethod,
              deliveryTime,
              setDeliveryTime,
              handleCreateOrder,
              orderLoading,
            }}
          />
        </aside>
      </div>

      {/* Extreme Premium Mobile Bottom Bar */}
      {subtotal > 0 && (
        <div className="pb-safe-area fixed bottom-16 left-0 right-0 z-50 rounded-t-[32px] border-t border-gray-100 bg-white/70 px-6 py-6 shadow-[0_-15px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl xl:hidden">
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-gray-400">Mahsulotlar summasi</span>
                <span className="text-[15px] font-bold text-[#111]">
                  {fmt(subtotal)} <span className="text-[10px]">UZS</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-gray-400">Yetkazib berish</span>
                <span className="text-[15px] font-bold text-[#111]">
                  {activeDeliveryFee === 0 ? 'Bepul' : `${fmt(activeDeliveryFee)} UZS`}
                </span>
              </div>
              {activeDeliveryFee > 0 && freeDeliveryThreshold > 0 && (
                <div className="text-right text-[11px] text-gray-400">
                  Yana {fmt(remaining)} UZSlik buyurtma qilsangiz, bepul!
                </div>
              )}
              <div className="my-3 h-px bg-gray-50" />
              <div className="flex items-center justify-between">
                <span className="text-[17px] font-black text-[#111]">Jami:</span>
                <span className="text-[24px] font-black tracking-tighter text-[#111]">
                  {fmt(total)} <span className="text-[13px]">UZS</span>
                </span>
              </div>
            </div>

            {/* Minimum order amount warning */}
            {!isMinOrderSatisfied && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-2.5 text-[12px] font-semibold text-amber-800">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="mt-0.5 flex-shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>
                  Eng kam buyurtma miqdori {fmt(minOrderAmount)} UZS. Yana{' '}
                  {fmt(minOrderAmount - subtotal)} UZSlik mahsulot qo'shing.
                </span>
              </div>
            )}

            <button
              onClick={handleCreateOrder}
              disabled={orderLoading || !isMinOrderSatisfied}
              className={`py-4.5 flex w-full items-center justify-center gap-4 rounded-[24px] border-b-4 shadow-[0_12px_30px_rgba(255,214,0,0.35)] transition-all active:scale-[0.96] ${
                isMinOrderSatisfied
                  ? 'border-[#E6C000] bg-[#FFD600]'
                  : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
              }`}
            >
              <span
                className={`text-[18px] font-black ${isMinOrderSatisfied ? 'text-black' : 'text-gray-400'}`}
              >
                {orderLoading
                  ? 'YUBORILMOQDA...'
                  : isMinOrderSatisfied
                    ? 'BUYURTMA BERISH'
                    : `ENG KAM BUYURTMA: ${fmt(minOrderAmount)} UZS`}
              </span>
              {!orderLoading && isMinOrderSatisfied && (
                <div className="rounded-full bg-black/5 p-1.5">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="black"
                    strokeWidth="3"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Location Modal */}
      <LocationModal open={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />

      {/* Confirmation Modal */}
      <Modal
        title={<Text className="text-[20px] font-black">Buyurtmani tasdiqlash</Text>}
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        footer={null}
        width={450}
        centered
        className="confirm-order-modal"
      >
        <div className="space-y-6 pt-2">
          <div className="space-y-4 rounded-[24px] bg-gray-50 p-5">
            <div>
              <Text className="mb-1 block text-[12px] font-bold uppercase text-gray-400">
                Yetkazib berish manzili
              </Text>
              <Text className="block text-[16px] font-bold leading-snug text-[#111]">
                {addressText}
              </Text>
            </div>

            <div className="flex items-center justify-between">
              <Text className="text-[15px] text-gray-500">Mahsulotlar summasi:</Text>
              <Text className="text-[15px] font-bold text-gray-900">
                {fmt(subtotal)} <span className="text-[10px]">UZS</span>
              </Text>
            </div>
            <div className="flex items-center justify-between">
              <Text className="text-[15px] text-gray-500">Yetkazib berish:</Text>
              <Text className="text-[15px] font-bold text-gray-900">
                {activeDeliveryFee === 0 ? 'Bepul' : `${fmt(activeDeliveryFee)} UZS`}
              </Text>
            </div>

            <div className="h-px bg-gray-200" />

            <div className="flex items-center justify-between">
              <Text className="text-[17px] font-bold text-[#111]">Umumiy summa:</Text>
              <Text className="text-[20px] font-black text-[#111]">
                {fmt(total)} <span className="text-[12px]">UZS</span>
              </Text>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleConfirmOrder}
              disabled={orderLoading}
              className="flex w-full items-center justify-center gap-3 rounded-[20px] border-b-4 border-[#E6C000] bg-[#FFD600] py-4 shadow-[0_8px_20px_rgba(255,214,0,0.25)] transition-all active:scale-[0.98]"
            >
              <span className="text-[17px] font-black text-black">
                {orderLoading ? 'YUBORILMOQDA...' : 'TASDIQLASH VA BUYURTMA BERISH'}
              </span>
            </button>
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="w-full py-3 text-[15px] font-black text-gray-400 transition-colors hover:text-gray-600"
            >
              BEKOR QILISH
            </button>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .checkout-select-mobile .ant-select-selection-item {
          font-size: 15px !important;
          font-weight: 900 !important;
          color: #111 !important;
          padding-left: 0 !important;
        }
        .location-modal .ant-modal-content,
        .confirm-order-modal .ant-modal-content {
          overflow: hidden;
          border-radius: 32px;
          padding: 24px !important;
        }
      `}</style>
    </div>
  )
}

export default CartFullPage
