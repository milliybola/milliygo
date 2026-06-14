import { useRouter } from 'next/router'
import { useCartStore } from '@/store/cartStore'
import { useContext } from 'react'
import { AuthContext } from '@/features/Account/auth/context/authContext'
import { useQuery } from '@tanstack/react-query'
import { getStoreItemCategories } from '../api'

const SERVICE_FEE_PERCENT = 0 // 0% for now

const StoreItemCart = ({
    restaurantData,
    restaurantLoading,
}: {
    restaurantData: any
    restaurantLoading: boolean
}) => {
    const router = useRouter()
    const { slug } = router.query
    const { carts, updateQuantity, clearCart } = useCartStore()
    
    // Use slug if available, otherwise find the first store with items
    const storeId = (slug as string) || Object.keys(carts).find(id => (carts[id].items?.length || 0) > 0) || ''
    const cartData = carts[storeId]
    const cartItems = cartData?.items || []
    
    const authContext = useContext(AuthContext) as any
    const openLogin = authContext?.openLogin
    const isAuthenticated = authContext?.authStore?.isAuthenticated

    const { data: categoriesData } = useQuery({
        queryKey: ['item-base-categories', slug],
        queryFn: () => getStoreItemCategories({ id: slug as string }),
        enabled: !!slug,
    })

    const partnerData = categoriesData?.data as any
    const deliveryFee = partnerData?.delivery_fee !== undefined ? Number(partnerData.delivery_fee) : 8000
    const freeDeliveryThreshold = partnerData?.free_delivery_threshold !== undefined ? Number(partnerData.free_delivery_threshold) : 60000
    const minOrderAmount = partnerData?.min_order_amount !== undefined ? Number(partnerData.min_order_amount) : 0

    const subtotal = cartItems.reduce((s: number, i: any) => s + i.price * i.quantity, 0)
    const serviceFee = Math.round(subtotal * SERVICE_FEE_PERCENT)
    const remaining = Math.max(0, freeDeliveryThreshold - subtotal)
    const activeDeliveryFee = remaining > 0 ? deliveryFee : 0
    const total = subtotal + activeDeliveryFee
    const isMinOrderSatisfied = subtotal >= minOrderAmount

    const fmt = (n: number) =>
        n.toLocaleString('uz-UZ').replace(/,/g, ' ') + " so'm"

    return (
        <div className="sticky top-24 w-full h-[calc(100vh-120px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col z-40 transition-all">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
                <span className="text-[18px] font-bold text-gray-900">Savatcha</span>
                {cartItems.length > 0 && (
                    <button
                        onClick={() => clearCart(storeId)}
                        className="text-[13px] text-gray-400 hover:text-red-500 transition-colors"
                    >
                        Tozalash
                    </button>
                )}
            </div>

            {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                    </div>
                    <p className="text-[14px] font-medium text-gray-500">Savatcha bo'sh</p>
                    <p className="text-[12px] text-gray-400 mt-1">Mahsulot qo'shing</p>
                </div>
            ) : (
                <>
                    {/* Items */}
                    <div className="flex-1 overflow-y-auto flex flex-col divide-y divide-gray-100">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                                <div className="w-[52px] h-[52px] rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-gray-900 truncate">{item.name}</p>
                                    <div className="flex items-baseline gap-1.5 mt-0.5">
                                        <p className="text-[13px] font-bold text-gray-900">
                                            {fmt(item.price)}
                                        </p>
                                        {item.oldPrice && (
                                            <p className="text-[11px] text-gray-400 line-through">
                                                {fmt(item.oldPrice)}
                                            </p>
                                        )}
                                    </div>
                                    {item.weight && (
                                        <p className="text-[11px] text-gray-400">{item.weight}</p>
                                    )}
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1 py-0.5 flex-shrink-0">
                                    <button
                                        onClick={() => updateQuantity(storeId, item.id, item.quantity - 1)}
                                        className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 font-bold text-[16px] hover:bg-gray-50 transition"
                                    >
                                        −
                                    </button>
                                    <span className="text-[13px] font-semibold text-gray-900 min-w-[16px] text-center">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(storeId, item.id, item.quantity + 1)}
                                        className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 font-bold text-[16px] hover:bg-gray-50 transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Service Fee */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <span className="text-[13px] text-gray-500">Xizmat haqi</span>
                        <span className="text-[13px] font-semibold text-gray-900">{fmt(serviceFee)}</span>
                    </div>

                    {/* Delivery Banner */}
                    <div className="mx-4 mb-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3 px-3 py-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <circle cx="5.5" cy="17.5" r="2.5" />
                                <circle cx="18.5" cy="17.5" r="2.5" />
                                <path d="M8 17.5h7M15 6h2l2 5M9 6l1.5 5H19M5.5 15l2-6h5" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-gray-900">
                                Yetkazib berish: {activeDeliveryFee === 0 ? "Bepul" : fmt(deliveryFee)}
                            </p>
                            {activeDeliveryFee > 0 && freeDeliveryThreshold > 0 && (
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    Yana {fmt(remaining)}lik buyurtma qilsangiz, bepul!
                                </p>
                            )}
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>

                    {/* Minimum order amount warning */}
                    {subtotal > 0 && !isMinOrderSatisfied && (
                        <div className="mx-4 mb-3 rounded-xl bg-amber-50 border border-amber-100 p-2.5 text-[12px] text-amber-800 font-semibold flex items-start gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 flex-shrink-0">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>
                                Eng kam buyurtma miqdori {fmt(minOrderAmount)}. Yana {fmt(minOrderAmount - subtotal)}lik mahsulot qo'shing.
                            </span>
                        </div>
                    )}

                    <div className="px-4 pb-4">
                        <button
                            disabled={!isMinOrderSatisfied}
                            onClick={() => {
                                if (isAuthenticated) {
                                    router.push(`/cart?store=${storeId}`)
                                } else {
                                    openLogin?.()
                                }
                            }}
                            className={`w-full active:scale-[0.98] transition-all rounded-2xl py-3.5 flex items-center justify-between px-5 shadow-sm ${
                                isMinOrderSatisfied
                                    ? 'bg-[#FFD600] hover:bg-[#FFC800] text-gray-900 font-bold'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed font-bold'
                            }`}
                        >
                            <span className="text-[15px]">
                                {isMinOrderSatisfied ? "Davom etish" : `Eng kam buyurtma: ${fmt(minOrderAmount)}`}
                            </span>
                            {isMinOrderSatisfied && <span className="text-[15px]">{fmt(total)}</span>}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default StoreItemCart