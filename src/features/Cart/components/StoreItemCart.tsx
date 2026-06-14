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
    CheckCircleFilled
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
    const selectedCoords = useMemo(() => 
        customLogic?.selectedCoords ?? (storeLocation ? [storeLocation.lat, storeLocation.lng] : null)
    , [customLogic?.selectedCoords, storeLocation])
    
    const addressText = customLogic?.addressText ?? (storeLocation?.address || 'Manzil tanlanmagan')
    
    const paymentMethod = customLogic?.paymentMethod ?? localPaymentMethod
    const setPaymentMethod = customLogic?.setPaymentMethod ?? setLocalPaymentMethod
    const deliveryTime = customLogic?.deliveryTime ?? localDeliveryTime
    const setDeliveryTime = customLogic?.setDeliveryTime ?? setLocalDeliveryTime
    const loading = customLogic?.orderLoading ?? localLoading


    const subtotal = useMemo(() => {
        return querySlug 
            ? (carts[querySlug as string]?.items?.reduce((s: number, i: any) => s + i.price * i.quantity, 0) || 0)
            : Object.values(carts).flatMap(c => c.items || []).reduce((s: number, i: any) => s + i.price * i.quantity, 0)
    }, [carts, querySlug])

    const { data: categoriesData } = useQuery({
        queryKey: ['item-base-categories', querySlug],
        queryFn: () => getStoreItemCategories({ id: querySlug as string }),
        enabled: !!querySlug,
    })

    const partnerData = categoriesData?.data
    const deliveryFee = partnerData?.delivery_fee !== undefined ? Number(partnerData.delivery_fee) : 8000
    const freeDeliveryThreshold = partnerData?.free_delivery_threshold !== undefined ? Number(partnerData.free_delivery_threshold) : 60000
    const minOrderAmount = partnerData?.min_order_amount !== undefined ? Number(partnerData.min_order_amount) : 0

    const remaining = Math.max(0, freeDeliveryThreshold - subtotal)
    const activeDeliveryFee = remaining > 0 ? deliveryFee : 0
    const total = subtotal + activeDeliveryFee
    const isMinOrderSatisfied = subtotal >= minOrderAmount

    const fmt = (n: number) => n.toLocaleString('uz-UZ').replace(/,/g, ' ')

    const handleCreateOrder = customLogic?.handleCreateOrder ?? (async () => {
        if (!isAuthenticated) {
            openLogin?.()
            return
        }
        if (!selectedCoords) {
            message.warning("Iltimos, yetkazib berish manzilini tanlang.")
            setIsLocationModalOpen(true)
            return
        }

        const activeStoreId = querySlug as string || Object.keys(carts).find(id => (carts[id].items?.length || 0) > 0)
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
                items: cartItems.map(item => ({
                    product_uuid: item.uuid,
                    quantity: item.quantity
                }))
            }

            const response = await createOrder(orderData)
            
            if (response) {
                message.success("Buyurtmangiz muvaffaqiyatli qabul qilindi!")
                clearCart(activeStoreId)
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
            setLocalLoading(false)
        }
    })

    return (
        <>
            <div className="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 flex flex-col gap-2">
                <Title level={4} className="!mb-4 !text-[22px] font-bold text-gray-900">
                    Buyurtmani rasmiylashtirish
                </Title>
                
                <div className="flex flex-col divide-y divide-gray-100/80">
                    {/* Location Selection */}
                    <div 
                        onClick={() => setIsLocationModalOpen(true)}
                        className="flex items-center gap-4 py-4 cursor-pointer group hover:bg-gray-50/50 transition-colors px-2 -mx-2 rounded-xl"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                            <EnvironmentOutlined className="text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Text className="text-[13px] text-gray-400 block mb-0.5">Yetkazib berish manzili</Text>
                            <Text className={`text-[16px] font-bold block truncate ${selectedCoords ? 'text-[#059669]' : 'text-gray-900'}`}>
                                {addressText}
                                {selectedCoords && <CheckCircleFilled className="ml-2 text-[14px]" />}
                            </Text>
                        </div>
                        <RightOutlined className="text-gray-300 text-[12px]" />
                    </div>

                    {/* Payment Dropdown */}
                    <div className="flex items-center gap-4 py-3 transition-colors px-2 -mx-2">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                            <CreditCardOutlined className="text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Text className="text-[13px] text-gray-400 block mb-0.5">To'lov usuli</Text>
                            <Select 
                                value={paymentMethod}
                                onChange={setPaymentMethod}
                                className="w-full !font-bold !text-[16px] checkout-select"
                                variant="borderless"
                                options={[
                                    { value: 'cash', label: 'Naqd pul orqali' }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Delivery Time Selection */}
                    <div className="flex items-center gap-4 py-3 group transition-colors px-2 -mx-2">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                            <ClockCircleOutlined className="text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Text className="text-[13px] text-gray-400 block mb-0.5">Yetkazib berish vaqti</Text>
                            <Select 
                                value={deliveryTime}
                                onChange={setDeliveryTime}
                                className="w-full !font-bold !text-[16px] checkout-select"
                                variant="borderless"
                                options={[
                                    { value: 'Hozir', label: 'Hozir' },
                                    { value: '15 daqiqada', label: '15 daqiqada' },
                                    { value: '30 daqiqada', label: '30 daqiqada' },
                                    { value: '60 daqiqada', label: '60 daqiqada' }
                                ]}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-[#F2F4F7] rounded-[20px]">
                    <Text className="text-[13px] text-gray-500 font-medium block mb-2 px-1">
                        Buyurtmaga izoh
                    </Text>
                    <TextArea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Izohingizni kiriting"
                        autoSize={{ minRows: 3, maxRows: 5 }}
                        className="!bg-white !border-none !rounded-[14px] !p-3 !text-[14px] hover:!bg-white focus:!bg-white focus:!shadow-none placeholder:!text-gray-300"
                    />
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <Text className="text-[14px] text-gray-500 font-medium">Mahsulotlar summasi:</Text>
                        <Text className="text-[15px] font-bold text-gray-800">{fmt(subtotal)} UZS</Text>
                    </div>
                    <div className="flex items-center justify-between px-1">
                        <Text className="text-[14px] text-gray-500 font-medium">Yetkazib berish:</Text>
                        <Text className="text-[15px] font-bold text-gray-800">
                            {activeDeliveryFee === 0 ? "Bepul" : `${fmt(deliveryFee)} UZS`}
                        </Text>
                    </div>
                    {activeDeliveryFee > 0 && freeDeliveryThreshold > 0 && (
                        <div className="text-[11px] text-gray-400 text-right px-1">
                            Yana {fmt(remaining)} UZSlik buyurtma qilsangiz, bepul!
                        </div>
                    )}
                    <div className="h-px bg-gray-100" />
                    <div className="flex items-center justify-between px-1">
                        <Text className="text-[15px] text-gray-500 font-medium font-['Outfit']">Jami summa:</Text>
                        <div className="text-right">
                            <span className="text-[22px] font-bold text-gray-900">{fmt(total)}</span>
                            <span className="text-[15px] font-bold text-gray-900 ml-1.5 uppercase">UZS</span>
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
                        disabled={subtotal === 0 || loading || !isMinOrderSatisfied}
                        className={`w-full transition-all rounded-[20px] py-4.5 text-[17px] font-bold flex items-center justify-center h-[58px] shadow-[0_8px_20px_rgba(255,214,0,0.25)] ${
                            subtotal === 0 || loading || !isMinOrderSatisfied
                                ? 'bg-gray-200 cursor-not-allowed opacity-60 text-gray-400'
                                : 'bg-[#FFD600] hover:bg-[#FFC800] active:scale-[0.98] text-gray-900'
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
            <LocationModal
                open={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
            />
            
            <style jsx global>{`
                .checkout-select .ant-select-selection-item { font-size: 16px !important; font-weight: 700 !important; color: #111 !important; }
                .location-modal .ant-modal-content { overflow: hidden; border-radius: 24px; }
            `}</style>
        </>
    )
}


export default StoreItemCart