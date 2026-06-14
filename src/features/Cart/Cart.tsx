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
import { CheckCircleFilled, CreditCardOutlined, EnvironmentOutlined, RightOutlined } from '@ant-design/icons'

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
  const selectedCoords = useMemo(() => storeLocation ? [storeLocation.lat, storeLocation.lng] : null, [storeLocation])
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
    enabled: isAuthenticated
  })

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return querySlug
      ? (carts[querySlug as string]?.items?.reduce((s: number, i: any) => s + i.price * i.quantity, 0) || 0)
      : Object.values(carts).flatMap(c => c.items || []).reduce((s: number, i: any) => s + i.price * i.quantity, 0)
  }, [carts, querySlug])

  const partnerData = categoriesData?.data as any
  const deliveryFee = partnerData?.delivery_fee !== undefined ? Number(partnerData.delivery_fee) : 8000
  const freeDeliveryThreshold = partnerData?.free_delivery_threshold !== undefined ? Number(partnerData.free_delivery_threshold) : 50000
  const minOrderAmount = partnerData?.min_order_amount !== undefined ? Number(partnerData.min_order_amount) : 0

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
      message.warning("Iltimos, yetkazib berish manzilini tanlang.")
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
    const activeStoreId = querySlug as string || Object.keys(carts).find(id => (carts[id].items?.length || 0) > 0)
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
        items: cartItems.map(item => ({
          product_uuid: item.uuid,
          quantity: item.quantity
        }))
      }

      const response = await createOrder(orderData)

      if (response) {
        message.success("Buyurtmangiz muvaffaqiyatli qabul qilindi!")
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
      message.error(error?.response?.data?.message || "Buyurtma berishda xatolik yuz berdi.")
    } finally {
      setOrderLoading(false)
    }
  }

  const fmt = (n: number) => n.toLocaleString('uz-UZ').replace(/,/g, ' ')

  return (
    <div className="container mx-auto px-4 pb-48 mt-6 relative">
      <div className="mb-8 flex items-baseline justify-between px-1">
        <Typography.Title level={2} className="!m-0 text-[32px] font-black text-[#111] tracking-tight">
          Savatcha
        </Typography.Title>
        <Typography.Text className="text-[14px] text-gray-400 font-bold uppercase tracking-widest">
          {Object.values(carts).reduce((acc, c) => acc + (c.items?.length || 0), 0)} MAHSULOT
        </Typography.Text>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <main className="flex-1 min-w-0 w-full animate-fade-up space-y-8">
          <CartDetail
            restaurantData={restaurantData}
            restaurantLoading={restaurantLoading}
          />

          {/* Mobile Checkout Details (Visible only on mobile before sidebar) */}
          <div className="xl:hidden space-y-4">
            <div className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-50 flex flex-col gap-4">
              <Text className="text-[18px] font-black text-[#111]">Buyurtma tafsilotlari</Text>

              <div className="divide-y divide-gray-50">
                <div
                  onClick={() => setIsLocationModalOpen(true)}
                  className="flex items-center gap-4 py-4 active:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <EnvironmentOutlined className="text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text className="text-[12px] text-gray-400 block mb-0.5">YETKAZIB BERISH MANZILI</Text>
                    <Text className={`text-[15px] font-black block truncate ${selectedCoords ? 'text-[#00D166]' : 'text-gray-900'}`}>
                      {addressText}
                      {selectedCoords && <CheckCircleFilled className="ml-2" />}
                    </Text>
                  </div>
                  <RightOutlined className="text-gray-300 text-[12px]" />
                </div>

                <div className="flex items-center gap-4 py-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <CreditCardOutlined className="text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text className="text-[12px] text-gray-400 block mb-0.5">TO'LOV USULI</Text>
                    <Select
                      value={paymentMethod}
                      onChange={setPaymentMethod}
                      className="w-full !font-black !text-[15px] checkout-select-mobile"
                      variant="borderless"
                      options={[{ value: 'cash', label: 'Naqd pul orqali' }]}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <Text className="text-[12px] text-gray-400 font-bold block mb-2 px-1">BUYURTMAGA IZOH</Text>
                <TextArea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Masalan: Uy raqami, podyezd..."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  className="!bg-gray-50 !border-none !rounded-2xl !p-3 !text-[14px] hover:!bg-gray-100 focus:!bg-gray-100 placeholder:!text-gray-300"
                />
              </div>
            </div>
          </div>
        </main>

        <aside className="hidden xl:block xl:w-[380px] xl:shrink-0 xl:sticky xl:top-24">
          <StoreItemCart
            restaurantData={restaurantData}
            restaurantLoading={restaurantLoading}
            // Passing props for potential sync, though sidebar might need own copy or shared state
            customLogic={{
              comment, setComment,
              selectedCoords,
              addressText,
              paymentMethod, setPaymentMethod,
              deliveryTime, setDeliveryTime,
              handleCreateOrder, orderLoading
            }}
          />
        </aside>
      </div>

      {/* Extreme Premium Mobile Bottom Bar */}
      {subtotal > 0 && (
        <div className="xl:hidden fixed bottom-16 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-t border-gray-100 px-6 py-6 pb-safe-area shadow-[0_-15px_40px_rgba(0,0,0,0.08)] rounded-t-[32px]">
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-gray-400 font-medium">Mahsulotlar summasi</span>
                <span className="text-[15px] text-[#111] font-bold">{fmt(subtotal)} <span className="text-[10px]">UZS</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-gray-400 font-medium">Yetkazib berish</span>
                <span className="text-[15px] text-[#111] font-bold">
                  {activeDeliveryFee === 0 ? "Bepul" : `${fmt(activeDeliveryFee)} UZS`}
                </span>
              </div>
              {activeDeliveryFee > 0 && freeDeliveryThreshold > 0 && (
                <div className="text-[11px] text-gray-400 text-right">
                  Yana {fmt(remaining)} UZSlik buyurtma qilsangiz, bepul!
                </div>
              )}
              <div className="h-px bg-gray-50 my-3" />
              <div className="flex items-center justify-between">
                <span className="text-[17px] text-[#111] font-black">Jami:</span>
                <span className="text-[24px] text-[#111] font-black tracking-tighter">{fmt(total)} <span className="text-[13px]">UZS</span></span>
              </div>
            </div>

            {/* Minimum order amount warning */}
            {!isMinOrderSatisfied && (
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5 text-[12px] text-amber-800 font-semibold flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>
                  Eng kam buyurtma miqdori {fmt(minOrderAmount)} UZS. Yana {fmt(minOrderAmount - subtotal)} UZSlik mahsulot qo'shing.
                </span>
              </div>
            )}

            <button
              onClick={handleCreateOrder}
              disabled={orderLoading || !isMinOrderSatisfied}
              className={`w-full active:scale-[0.96] transition-all rounded-[24px] py-4.5 flex items-center justify-center gap-4 shadow-[0_12px_30px_rgba(255,214,0,0.35)] border-b-4 ${
                isMinOrderSatisfied
                  ? 'bg-[#FFD600] border-[#E6C000]'
                  : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className={`text-[18px] font-black ${isMinOrderSatisfied ? 'text-black' : 'text-gray-400'}`}>
                {orderLoading 
                  ? 'YUBORILMOQDA...' 
                  : isMinOrderSatisfied 
                    ? 'BUYURTMA BERISH' 
                    : `ENG KAM BUYURTMA: ${fmt(minOrderAmount)} UZS`}
              </span>
              {!orderLoading && isMinOrderSatisfied && (
                <div className="bg-black/5 rounded-full p-1.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Location Modal */}
      <LocationModal
        open={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

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
          <div className="bg-gray-50 p-5 rounded-[24px] space-y-4">
            <div>
              <Text className="text-[12px] text-gray-400 font-bold uppercase block mb-1">Yetkazib berish manzili</Text>
              <Text className="text-[16px] font-bold text-[#111] block leading-snug">
                {addressText}
              </Text>
            </div>
            
            <div className="flex items-center justify-between">
              <Text className="text-[15px] text-gray-500">Mahsulotlar summasi:</Text>
              <Text className="text-[15px] font-bold text-gray-900">{fmt(subtotal)} <span className="text-[10px]">UZS</span></Text>
            </div>
            <div className="flex items-center justify-between">
              <Text className="text-[15px] text-gray-500">Yetkazib berish:</Text>
              <Text className="text-[15px] font-bold text-gray-900">{activeDeliveryFee === 0 ? "Bepul" : `${fmt(activeDeliveryFee)} UZS`}</Text>
            </div>
            
            <div className="h-px bg-gray-200" />
            
            <div className="flex items-center justify-between">
              <Text className="text-[17px] font-bold text-[#111]">Umumiy summa:</Text>
              <Text className="text-[20px] font-black text-[#111]">{fmt(total)} <span className="text-[12px]">UZS</span></Text>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleConfirmOrder}
              disabled={orderLoading}
              className="w-full bg-[#FFD600] active:scale-[0.98] transition-all rounded-[20px] py-4 flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(255,214,0,0.25)] border-b-4 border-[#E6C000]"
            >
              <span className="text-[17px] font-black text-black">
                {orderLoading ? 'YUBORILMOQDA...' : 'TASDIQLASH VA BUYURTMA BERISH'}
              </span>
            </button>
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="w-full py-3 text-[15px] font-black text-gray-400 hover:text-gray-600 transition-colors"
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
           .location-modal .ant-modal-content, .confirm-order-modal .ant-modal-content {
                overflow: hidden;
                border-radius: 32px;
                padding: 24px !important;
            }
      `}</style>
    </div>
  )
}

export default CartFullPage
