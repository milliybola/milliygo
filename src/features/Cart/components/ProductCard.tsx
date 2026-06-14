import { useRouter } from 'next/router'
import { useCartStore } from '@/store/cartStore'

const ProductCard = ({ product }: { product: any }) => {
    const router = useRouter()
    const storeId = (router.query.store || router.query.slug) as string

    const { carts, addItem, updateQuantity } = useCartStore()
    const cartData = carts[storeId]
    const cartItems = cartData?.items || []
    const cartItem = cartItems.find((i) => i.id === product.id)
    const qty = cartItem?.quantity ?? 0

    const finalPrice = Number(product.price)
    const discount = Number(product.discount || 0)
    const oldPrice = discount > 0 ? Math.round(finalPrice / (1 - discount / 100) / 100) * 100 : null

    const mainImage =
        product.images?.find((img: any) => img.is_main && img.is_active) ||
        product.images?.find((img: any) => img.is_active)

    const handleAdd = () => {
        addItem(storeId, {
            id: product.id,
            uuid: product.uuid,
            name: product.name,
            price: finalPrice,
            image: mainImage?.image || '',
            weight: product.description || undefined,
            oldPrice: oldPrice || undefined,
        })
    }

    const handleIncrease = () => updateQuantity(storeId, product.id, qty + 1)
    const handleDecrease = () => updateQuantity(storeId, product.id, qty - 1)

    return (
        <div
            className="group flex flex-col overflow-hidden rounded-[20px] bg-white transition-all duration-300 hover:shadow-xl"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
        >
            {/* ── Rasm ── */}
            <div className="relative bg-[#F9FAFB] overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                {/* Badges */}
                <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5">
                    {discount > 0 && (
                        <div
                            className="rounded-[8px] px-2 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm"
                            style={{ background: 'linear-gradient(135deg, #FF4B6E 0%, #FF2B5E 100%)' }}
                        >
                            -{discount}%
                        </div>
                    )}
                    {product.is_new && (
                        <div
                            className="rounded-[8px] px-2 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm"
                            style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                        >
                            YANGI
                        </div>
                    )}
                </div>

                {qty > 0 && (
                    <div
                        className="absolute right-2.5 top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-md"
                        style={{ background: '#0c0c0c' }}
                    >
                        {qty}
                    </div>
                )}

                {mainImage ? (
                    <img
                        src={mainImage.image}
                        alt={product.name}
                        className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#F3F4F6]">
                        <span className="text-[10px] text-[#9CA3AF]">Rasm yo'q</span>
                    </div>
                )}
            </div>

            {/* ── Ma'lumot ── */}
            <div className="flex flex-1 flex-col justify-between p-3.5">
                <div>
                    <div className="flex flex-wrap items-baseline gap-1.5">
                        <p className="text-[16px] font-extrabold text-[#0c0c0c]">
                            {finalPrice.toLocaleString('uz-UZ')}
                            <span className="text-[12px] font-bold ml-0.5">so'm</span>
                        </p>
                        {oldPrice && (
                            <p className="text-[12px] font-medium text-[#9CA3AF] line-through decoration-[#FF4B6E]/40">
                                {oldPrice.toLocaleString('uz-UZ')}
                            </p>
                        )}
                    </div>

                    <p className="mt-1.5 text-[13px] font-medium leading-snug text-[#374151] line-clamp-2 min-h-[36px]">
                        {product.name}
                    </p>

                    {product.description && (
                        <p className="mt-1 text-[11px] font-medium text-[#9CA3AF] bg-[#F3F4F6] inline-block px-1.5 py-0.5 rounded-md">
                            {product.description}
                        </p>
                    )}
                </div>

                {/* ── Tugma ── */}
                <div className="mt-4">
                    {qty === 0 ? (
                        <button
                            onClick={handleAdd}
                            className="flex w-full items-center justify-center gap-1 rounded-[12px] border border-[#E5E7EB] py-2.5 text-[13px] font-bold text-[#0c0c0c] transition-all hover:bg-[#F9FAFB] hover:border-[#0c0c0c] active:scale-[0.98]"
                        >
                            <span className="text-[16px] leading-none">+</span> Qo'shish
                        </button>
                    ) : (
                        <div className="flex items-center justify-between rounded-[12px] bg-[#F9FAFB] border border-[#E5E7EB] p-1 shadow-inner">
                            <button
                                onClick={handleDecrease}
                                className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[20px] font-bold text-[#0c0c0c] transition-colors hover:bg-white active:scale-90"
                            >
                                −
                            </button>
                            <span className="min-w-[24px] text-center text-[15px] font-bold text-[#0c0c0c]">
                                {qty}
                            </span>
                            <button
                                onClick={handleIncrease}
                                className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[20px] font-bold text-[#0c0c0c] transition-colors hover:bg-white active:scale-90"
                            >
                                +
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductCard
