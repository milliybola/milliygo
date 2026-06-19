import { useRouter } from 'next/router'
import { useCartStore } from '@/store/cartStore'
import { useContext, useState, useMemo } from 'react'
import { AuthContext } from '@/features/Account/auth/context/authContext'
import { Typography, Input, Modal, Select, Button, TimePicker, message } from 'antd'
import {
  EnvironmentOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  RightOutlined,
  CheckCircleFilled,
} from '@ant-design/icons'
import { useLocationStore } from '@/store/useLocationStore'
import LocationModal from '@/components/common/CHeader/components/LocationModal'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TextArea } = Input

import { useQuery } from '@tanstack/react-query'
import { createOrder, getStoreItemCategories } from '../api'

const StoreItemCart = ({
  restaurantData,
  restaurantLoading,
  customLogic,
}: {
  restaurantData: any
  restaurantLoading: boolean
  customLogic?: any
}) => {
  const router = useRouter()
  const querySlug = (router.query.store || router.query.slug) as string
  const { carts, clearCart } = useCartStore()
  const authContext = useContext(AuthContext) as any
  const isAuthenticated = authContext?.authStore?.isAuthenticated
  const openLogin = authContext?.openLogin

  const { location: storeLocation } = useLocationStore()

  // Use logic from props if provided (from CartFullPage), otherwise use local state (legacy/fallback)
  const [localComment, setLocalComment] = useState('')
  const [localIsLocationModalOpen, setLocalIsLocationModalOpen] = useState(false)
  const [localPaymentMethod, setLocalPaymentMethod] = useState('cash')
  const [localDeliveryTime, setLocalDeliveryTime] = useState<string>('Hozir')
  const [localLoading, setLocalLoading] = useState(false)

  const comment = customLogic?.comment ?? localComment
  const setComment = customLogic?.setComment ?? setLocalComment
  const isLocationModalOpen = customLogic?.isLocationModalOpen ?? localIsLocationModalOpen
  const setIsLocationModalOpen = customLogic?.setIsLocationModalOpen ?? setLocalIsLocationModalOpen

  // Derived from store
  const selectedCoords = useMemo(
    () =>
      customLogic?.selectedCoords ??
      (storeLocation ? [storeLocation.lat, storeLocation.lng] : null),
    [customLogic?.selectedCoords, storeLocation]
  )

  const addressText = customLogic?.addressText ?? (storeLocation?.address || 'Manzil tanlanmagan')

  const paymentMethod = customLogic?.paymentMethod ?? localPaymentMethod
  const setPaymentMethod = customLogic?.setPaymentMethod ?? setLocalPaymentMethod
  const deliveryTime = customLogic?.deliveryTime ?? localDeliveryTime
  const setDeliveryTime = customLogic?.setDeliveryTime ?? setLocalDeliveryTime
  const loading = customLogic?.orderLoading ?? localLoading

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

  const { data: categoriesData } = useQuery({
    queryKey: ['item-base-categories', querySlug],
    queryFn: () => getStoreItemCategories({ id: querySlug as string }),
    enabled: !!querySlug,
  })

  const partnerData = categoriesData?.data
  const deliveryFee =
    partnerData?.delivery_fee !== undefined ? Number(partnerData.delivery_fee) : 8000
  const freeDeliveryThreshold =
    partnerData?.free_delivery_threshold !== undefined
      ? Number(partnerData.free_delivery_threshold)
      : 60000
  const minOrderAmount =
    partnerData?.min_order_amount !== undefined ? Number(partnerData.min_order_amount) : 0

  const remaining = Math.max(0, freeDeliveryThreshold - subtotal)
  const activeDeliveryFee = remaining > 0 ? deliveryFee : 0
  const total = subtotal + activeDeliveryFee
  const isMinOrderSatisfied = subtotal >= minOrderAmount

  const fmt = (n: number) => n.toLocaleString('uz-UZ').replace(/,/g, ' ')

  const handleCreateOrder =
    customLogic?.handleCreateOrder ??
    (async () => {
      if (!isAuthenticated) {
        openLogin?.()
        return
      }
      if (!selectedCoords) {
        message.warning('Iltimos, yetkazib berish manzilini tanlang.')
        setIsLocationModalOpen(true)
        return
      }

      const activeStoreId =
        (querySlug as string) || Object.keys(carts).find((id) => (carts[id].items?.length || 0) > 0)
      if (!activeStoreId) return

      setLocalLoading(true)
      try {
        const cartItems = carts[activeStoreId]?.items || []
        const userPhone = authContext?.authStore?.user?.phone_number || ''

        const orderData = {
          description: comment || "Izoh yo'q",
          address: addressText,
          contact_phone: userPhone,
          latitude: String(selectedCoords[0]),
          longitude: String(selectedCoords[1]),
          items: cartItems.map((item) => ({
            product_uuid: item.uuid,
            quantity: item.quantity,
          })),
        }

        const response = await createOrder(orderData)

        if (response) {
          message.success('Buyurtmangiz muvaffaqiyatli qabul qilindi!')
          clearCart(activeStoreId)
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
        setLocalLoading(false)
      }
    })

  return (
    <>
      <div className="flex flex-col gap-2 rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <Title level={4} className="!mb-4 !text-[22px] font-bold text-gray-900">
          Buyurtmani rasmiylashtirish
        </Title>

        <div className="flex flex-col divide-y divide-gray-100/80">
          {/* Location Selection */}
          <div
            onClick={() => setIsLocationModalOpen(true)}
            className="group -mx-2 flex cursor-pointer items-center gap-4 rounded-xl px-2 py-4 transition-colors hover:bg-gray-50/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-all group-hover:bg-white group-hover:shadow-sm">
              <EnvironmentOutlined className="text-xl" />
            </div>
            <div className="min-w-0 flex-1">
              <Text className="mb-0.5 block text-[13px] text-gray-400">
                Yetkazib berish manzili
              </Text>
              <Text
                className={`block truncate text-[16px] font-bold ${selectedCoords ? 'text-[#059669]' : 'text-gray-900'}`}
              >
                {addressText}
                {selectedCoords && <CheckCircleFilled className="ml-2 text-[14px]" />}
              </Text>
            </div>
            <RightOutlined className="text-[12px] text-gray-300" />
          </div>

          {/* Payment Dropdown */}
          <div className="-mx-2 flex items-center gap-4 px-2 py-3 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
              <CreditCardOutlined className="text-xl" />
            </div>
            <div className="min-w-0 flex-1">
              <Text className="mb-0.5 block text-[13px] text-gray-400">To'lov usuli</Text>
              <Select
                value={paymentMethod}
                onChange={setPaymentMethod}
                className="checkout-select w-full !text-[16px] !font-bold"
                variant="borderless"
                options={[{ value: 'cash', label: 'Naqd pul orqali' }]}
              />
            </div>
          </div>

          {/* Delivery Time Selection */}
          <div className="group -mx-2 flex items-center gap-4 px-2 py-3 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
              <ClockCircleOutlined className="text-xl" />
            </div>
            <div className="min-w-0 flex-1">
              <Text className="mb-0.5 block text-[13px] text-gray-400">Yetkazib berish vaqti</Text>
              <Select
                value={deliveryTime}
                onChange={setDeliveryTime}
                className="checkout-select w-full !text-[16px] !font-bold"
                variant="borderless"
                options={[
                  { value: 'Hozir', label: 'Hozir' },
                  { value: '15 daqiqada', label: '15 daqiqada' },
                  { value: '30 daqiqada', label: '30 daqiqada' },
                  { value: '60 daqiqada', label: '60 daqiqada' },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[20px] bg-[#F2F4F7] p-4">
          <Text className="mb-2 block px-1 text-[13px] font-medium text-gray-500">
            Buyurtmaga izoh
          </Text>
          <TextArea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Izohingizni kiriting"
            autoSize={{ minRows: 3, maxRows: 5 }}
            className="!rounded-[14px] !border-none !bg-white !p-3 !text-[14px] placeholder:!text-gray-300 hover:!bg-white focus:!bg-white focus:!shadow-none"
          />
        </div>

        <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between px-1">
            <Text className="text-[14px] font-medium text-gray-500">Mahsulotlar summasi:</Text>
            <Text className="text-[15px] font-bold text-gray-800">{fmt(subtotal)} UZS</Text>
          </div>
          <div className="flex items-center justify-between px-1">
            <Text className="text-[14px] font-medium text-gray-500">Yetkazib berish:</Text>
            <Text className="text-[15px] font-bold text-gray-800">
              {activeDeliveryFee === 0 ? 'Bepul' : `${fmt(deliveryFee)} UZS`}
            </Text>
          </div>
          {activeDeliveryFee > 0 && freeDeliveryThreshold > 0 && (
            <div className="px-1 text-right text-[11px] text-gray-400">
              Yana {fmt(remaining)} UZSlik buyurtma qilsangiz, bepul!
            </div>
          )}
          <div className="h-px bg-gray-100" />
          <div className="flex items-center justify-between px-1">
            <Text className="font-['Outfit'] text-[15px] font-medium text-gray-500">
              Jami summa:
            </Text>
            <div className="text-right">
              <span className="text-[22px] font-bold text-gray-900">{fmt(total)}</span>
              <span className="ml-1.5 text-[15px] font-bold uppercase text-gray-900">UZS</span>
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
            disabled={subtotal === 0 || loading || !isMinOrderSatisfied}
            className={`py-4.5 flex h-[58px] w-full items-center justify-center rounded-[20px] text-[17px] font-bold shadow-[0_8px_20px_rgba(255,214,0,0.25)] transition-all ${
              subtotal === 0 || loading || !isMinOrderSatisfied
                ? 'cursor-not-allowed bg-gray-200 text-gray-400 opacity-60'
                : 'bg-[#FFD600] text-gray-900 hover:bg-[#FFC800] active:scale-[0.98]'
            }`}
          >
            {loading
              ? 'Yuborilmoqda...'
              : isMinOrderSatisfied
                ? 'Buyurtma berish'
                : `Eng kam buyurtma: ${fmt(minOrderAmount)} UZS`}
          </button>
        </div>
      </div>

      {/* Location Selection Modal (Desktop Sidebar) */}
      <LocationModal open={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />

      <style jsx global>{`
        .checkout-select .ant-select-selection-item {
          font-size: 16px !important;
          font-weight: 700 !important;
          color: #111 !important;
        }
        .location-modal .ant-modal-content {
          overflow: hidden;
          border-radius: 24px;
        }
      `}</style>
    </>
  )
}

export default StoreItemCart
