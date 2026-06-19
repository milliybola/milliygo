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
import {
  YMaps,
  Map,
  Placemark,
  ZoomControl,
  FullscreenControl,
  SearchControl,
  GeolocationControl,
} from '@pbe/react-yandex-maps'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TextArea } = Input

// G'allaorol center coordinates
const GALLAOROL_COORDS = [39.998492, 67.585542]
const MAX_DISTANCE_KM = 5 // Allowed radius for central part

import { createOrder } from '../api'

const StoreItemCart = ({
  restaurantData,
  restaurantLoading,
}: {
  restaurantData: any
  restaurantLoading: boolean
}) => {
  const router = useRouter()
  const { slug: querySlug } = router.query
  const { carts, clearCart } = useCartStore()
  const authContext = useContext(AuthContext) as any
  const isAuthenticated = authContext?.authStore?.isAuthenticated
  const openLogin = authContext?.openLogin

  const [comment, setComment] = useState('')
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [selectedCoords, setSelectedCoords] = useState<number[] | null>(null)
  const [addressText, setAddressText] = useState('Manzil tanlanmagan')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [deliveryTime, setDeliveryTime] = useState<string>('Hozir')
  const [loading, setLoading] = useState(false)

  // Distance calculation helper
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const handleMapClick = (e: any) => {
    const coords = e.get('coords')
    const dist = calculateDistance(coords[0], coords[1], GALLAOROL_COORDS[0], GALLAOROL_COORDS[1])

    if (dist > MAX_DISTANCE_KM) {
      message.error("Kechirasiz, yetkazib berish faqat G'allaorol shahri ichida amalga oshiriladi.")
      return
    }

    setSelectedCoords(coords)
    setAddressText(`G'allaorol (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`)
  }

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

  const fmt = (n: number) => n.toLocaleString('uz-UZ').replace(/,/g, ' ')

  const handleCreateOrder = async () => {
    alert('Tugma bosildi! (Start)')

    if (!isAuthenticated) {
      alert('Xatolik: Tizimga kirilmagan!')
      openLogin?.()
      return
    }
    if (!selectedCoords) {
      alert('Xatolik: Manzil tanlanmagan!')
      message.warning('Iltimos, yetkazib berish manzilini tanlang.')
      setIsLocationModalOpen(true)
      return
    }

    const activeStoreId =
      (querySlug as string) || Object.keys(carts).find((id) => (carts[id].items?.length || 0) > 0)
    if (!activeStoreId) {
      alert("Xatolik: Do'kon (Store) aniqlanmadi!")
      return
    }

    setLoading(true)
    try {
      const cartItems = carts[activeStoreId]?.items || []

      // Check for legacy items without UUID
      const hasMissingUuid = cartItems.some((item) => !item.uuid)
      if (hasMissingUuid) {
        alert('Xatolik: Savatda eski mahsulotlar bor! UUID topilmadi.')
        message.error(
          "Savatchangizda eski mahsulotlar bor. Iltimos, savatni tozalab, mahsulotlarni qayta qo'shing."
        )
        setLoading(false)
        return
      }

      alert('Request yuborilyapti...')
      // Get user phone from authState in localStorage
      const authStateRaw = localStorage.getItem('authState')
      const authState = authStateRaw ? JSON.parse(authStateRaw) : {}
      const userPhone = authState?.userInfo?.phone_number || ''

      if (!userPhone) {
        message.error('Telefon raqami topilmadi. Iltimos, tizimga qayta kiring.')
        setLoading(false)
        return
      }

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
        router.push('/')
      }
    } catch (error: any) {
      console.error('Order creation failed:', error)
      message.error(error?.message || 'Buyurtma berishda xatolik yuz berdi.')
    } finally {
      setLoading(false)
    }
  }

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

        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="mb-6 flex items-center justify-between px-1">
            <Text className="font-['Outfit'] text-[15px] font-medium text-gray-500">
              Jami summa:
            </Text>
            <div className="text-right">
              <span className="text-[22px] font-bold text-gray-900">{fmt(subtotal)}</span>
              <span className="ml-1.5 text-[15px] font-bold uppercase text-gray-900">UZS</span>
            </div>
          </div>

          <button
            onClick={handleCreateOrder}
            disabled={subtotal === 0 || loading}
            className={`w-full ${subtotal === 0 || loading ? 'cursor-not-allowed bg-gray-200 opacity-60' : 'bg-[#FFD600] hover:bg-[#FFC800] active:scale-[0.98]'} py-4.5 flex h-[58px] items-center justify-center rounded-[20px] text-[17px] font-bold text-gray-900 shadow-[0_8px_20px_rgba(255,214,0,0.25)] transition-all`}
          >
            {loading ? 'Yuborilmoqda...' : 'Buyurtma berish'}
          </button>
        </div>
      </div>

      {/* Location Selection Modal */}
      <Modal
        title={
          <div className="px-1 py-1">
            <Text className="block text-[18px] font-bold">Xaritadan tanlash</Text>
            <Text className="text-[13px] font-normal text-gray-400">
              G'allaorol shahri ichida manzilni belgilang
            </Text>
          </div>
        }
        open={isLocationModalOpen}
        onCancel={() => setIsLocationModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsLocationModalOpen(false)}
            className="h-10 rounded-xl px-6"
          >
            Bekor qilish
          </Button>,
          <Button
            key="submit"
            type="primary"
            disabled={!selectedCoords}
            onClick={() => setIsLocationModalOpen(false)}
            className="h-10 rounded-xl border-none bg-[#FFD600] px-8 font-bold text-black hover:bg-[#FFC800]"
          >
            Tasdiqlash
          </Button>,
        ]}
        width={800}
        centered
        styles={{ body: { padding: 0 } }}
        className="location-modal"
      >
        <div className="relative h-[500px] w-full">
          <YMaps query={{ apikey: 'fe54f19b-c408-41e7-8b01-925206263595', lang: 'ru_RU' }}>
            <Map
              defaultState={{ center: GALLAOROL_COORDS, zoom: 14 }}
              width="100%"
              height="100%"
              onClick={handleMapClick}
              instanceRef={(ref: any) => {
                if (ref) {
                  ref.behaviors.disable('scrollZoom')
                }
              }}
            >
              <ZoomControl options={{ size: 'small' }} />
              <GeolocationControl options={{ float: 'left' }} />
              <FullscreenControl />
              <SearchControl options={{ float: 'right' }} />
              {selectedCoords && (
                <Placemark
                  geometry={selectedCoords}
                  options={{
                    preset: 'islands#yellowDotIcon',
                  }}
                />
              )}
            </Map>
          </YMaps>
          {!selectedCoords && (
            <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border border-yellow-200 bg-white/90 px-4 py-2 shadow-md backdrop-blur">
              <Text className="text-[13px] font-medium text-gray-800">
                Xaritani bosing va manzilni belgilang
              </Text>
            </div>
          )}
        </div>
      </Modal>

      <style jsx global>{`
        .checkout-select .ant-select-selector {
          padding: 0 !important;
          height: auto !important;
          display: flex !important;
          align-items: center !important;
        }
        .checkout-select .ant-select-selection-item {
          font-size: 16px !important;
          font-weight: 700 !important;
          color: #111827 !important;
          transition: color 0.2s;
        }
        .checkout-select:hover .ant-select-selection-item {
          color: #ffd600 !important;
        }
        .location-modal .ant-modal-content {
          overflow: hidden;
          border-radius: 24px;
        }
        .location-modal .ant-modal-header {
          padding: 20px 24px 15px;
          border-bottom: 1px solid #f0f0f0;
          margin: 0;
        }
        .location-modal .ant-modal-footer {
          padding: 15px 24px 20px;
          border-top: 1px solid #f0f0f0;
          margin: 0;
        }
      `}</style>
    </>
  )
}

export default StoreItemCart
