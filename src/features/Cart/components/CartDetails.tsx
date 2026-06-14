




import { Button, Typography } from 'antd'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useCartStore } from '@/store/cartStore'
import { CloseOutlined, MinusOutlined, PlusOutlined, ShoppingOutlined } from '@ant-design/icons'
import Link from 'next/link'

interface CartDetailProps {
  restaurantData: any
  restaurantLoading: boolean
}

const CartDetail = ({ restaurantData, restaurantLoading }: CartDetailProps) => {
  const router = useRouter()
  const querySlug = (router.query.store || router.query.slug) as string
  const { carts, updateQuantity, removeItem } = useCartStore()

  // If a slug is provided, we focus on that one. 
  // Otherwise, we show all stores that have items.
  const activeStoreIds = querySlug 
    ? [querySlug as string] 
    : Object.keys(carts).filter(id => (carts[id].items?.length || 0) > 0)

  if (restaurantLoading && querySlug) {
    return <div className="animate-pulse space-y-4">
      <div className="h-20 bg-gray-100 rounded-2xl" />
      <div className="h-32 bg-gray-100 rounded-2xl" />
    </div>
  }

  if (activeStoreIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[24px] border border-gray-100">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
           <ShoppingOutlined className="text-gray-300 text-4xl" />
        </div>
        <Typography.Text className="text-gray-400 text-lg font-medium">Savatchangiz bo'sh</Typography.Text>
        <Button 
          type="primary" 
          className="mt-6 bg-[#FFD600] text-black border-none font-bold h-12 px-10 rounded-2xl hover:bg-[#FFC800] transition-colors"
          onClick={() => router.push('/')}
        >
          Haridni boshlash
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {activeStoreIds.map(storeId => {
        const cartData = carts[storeId]
        const currentCartItems = cartData?.items || []
        const cartRestaurant = cartData?.restaurant as any
        
        if (currentCartItems.length === 0) return null

        return (
          <div key={storeId} className="space-y-3">
            {/* Store Name & Action */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#FFD600] rounded-full" />
                <span className="text-[17px] font-extrabold text-[#111]">
                  {cartRestaurant?.name || 'Hamkor do\'kon'}
                </span>
              </div>
              <Link 
                 href={`/restaurant/${cartRestaurant?.uuid || storeId}`}
                 className="text-[13px] font-bold text-[#00D166] bg-[#00D166]/10 px-3 py-1 rounded-full active:scale-95 transition-all"
              >
                + Qo'shish
              </Link>
            </div>

            {/* Cart Items Cards */}
            <div className="space-y-3">
              {currentCartItems.map((item: any) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-[28px] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex items-center gap-4 relative"
                >
                  {/* Remove Button - Top Right */}
                  <button 
                    onClick={() => removeItem(storeId, item.id)}
                    className="absolute -top-1 -right-1 w-7 h-7 bg-white shadow-md border border-gray-100 flex items-center justify-center rounded-full text-gray-400 active:scale-90 z-10"
                  >
                    <CloseOutlined style={{ fontSize: 10 }} />
                  </button>

                  {/* Image with subtle shadow */}
                  <div className="relative w-[90px] h-[90px] rounded-[22px] overflow-hidden bg-gray-50 shadow-inner">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between self-stretch py-0.5 min-w-0">
                    <div>
                      <h4 className="text-[15px] font-bold text-[#111] leading-tight truncate pr-4">
                        {item.name}
                      </h4>
                      <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                        {item.price.toLocaleString('uz-UZ').replace(/,/g, ' ')} UZS / dona
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      {/* Price Tag */}
                      <span className="text-[16px] font-black text-[#111]">
                        {(item.price * item.quantity).toLocaleString('uz-UZ').replace(/,/g, ' ')} <span className="text-[10px] font-bold">UZS</span>
                      </span>

                      {/* Pill Style Quantity Control */}
                      <div className="flex items-center bg-[#F5F5F7] rounded-full p-1 border border-gray-100">
                        <button
                          onClick={() => updateQuantity(storeId, item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-900 active:scale-90 transition-all"
                        >
                          <MinusOutlined style={{ fontSize: 10 }} />
                        </button>
                        
                        <span className="w-8 text-center text-[13px] font-black text-[#111]">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(storeId, item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-[#FFD600] rounded-full shadow-sm text-black active:scale-90 transition-all"
                        >
                          <PlusOutlined style={{ fontSize: 10 }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>


  )
}

export default CartDetail
