import { cartCount, cartSubtotal, useCart } from '../lib/cart'
import { useHydrated } from '../lib/session'
import type { Partner } from '../lib/types'
import { som } from '../lib/utils'
import { IconCart } from '../ui/icons'
import { Button, StickyBar } from '../ui/primitives'

/** Hamkor sahifasidagi pastki savat paneli (oltin tugma) */
export default function CartBar({ partner }: { partner: Partner }) {
  const cart = useCart((s) => s.carts[partner.uuid])
  const hydrated = useHydrated()
  if (!hydrated || !cart || !cart.lines.length) return null
  const n = cartCount(cart)
  const sum = cartSubtotal(cart)
  const min = partner.min_order_amount
  const left = min > 0 && sum < min ? min - sum : 0
  return (
    <StickyBar className="lg:sticky lg:bottom-4 lg:z-[60]">
      <div className="lg:mx-auto lg:max-w-[560px]">
        {left > 0 && (
          <div className="mb-2 text-center text-[0.8125rem] font-[700] text-go-goldtext">
            Minimal buyurtma {som(min)} — yana {som(left)} qo&apos;shing
          </div>
        )}
        <Button
          variant="gold"
          block
          href={`/cart/?partner=${partner.uuid}`}
          className="justify-between shadow-[0_6px_20px_rgba(245,180,0,0.35)]"
        >
          <span className="flex items-center gap-2">
            <span className="relative">
              <IconCart size={22} />
              <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-go-ink px-1 text-[0.6562rem] text-white">
                {n}
              </span>
            </span>
            <span className="ml-1">Savat</span>
          </span>
          <span>{som(sum)}</span>
        </Button>
      </div>
    </StickyBar>
  )
}
