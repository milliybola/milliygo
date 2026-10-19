import { message } from 'antd'
import { productLine, setLine, useCart, useLineQty } from '../lib/cart'
import type { Partner, Product, ProductSet } from '../lib/types'
import { cx, dealLabel, formatSum, som } from '../lib/utils'
import { useRequireLocation } from '../lib/session'
import { Badge, Img, Stepper } from '../ui/primitives'

export function DealBadges({ product, isSet }: { product?: Product; isSet?: boolean }) {
  const deal = dealLabel(product?.promotion)
  const disc = product && product.discount > 0 ? product.discount : 0
  if (!deal && !disc && !isSet) return null
  return (
    <div className="flex flex-col items-start gap-1">
      {disc > 0 && <Badge tone="red">−{disc}%</Badge>}
      {deal && <Badge tone="gold">{deal}</Badge>}
      {isSet && <Badge tone="green">SET</Badge>}
    </div>
  )
}

export function PriceLine({
  price,
  old,
  size = 17,
  className,
}: {
  price: number
  old?: number | null
  size?: number
  className?: string
}) {
  const sale = !!old && old > price
  return (
    <div className={cx('flex flex-wrap items-baseline gap-x-1.5', className)}>
      <span
        className={cx(
          'whitespace-nowrap font-[900] tracking-[-0.3px]',
          sale ? 'text-go-red' : 'text-go-ink'
        )}
        style={{ fontSize: size }}
      >
        {som(price)}
      </span>
      {sale && (
        <span className="text-[0.7812rem] text-go-hint line-through">{formatSum(old!)}</span>
      )}
    </div>
  )
}

function useClosedGuard(partner: Partner, closed: boolean) {
  const requireLocation = useRequireLocation()
  return () => {
    if (!closed && !requireLocation()) return false
    if (closed) {
      message.info(
        partner.partner_type === 'SHOP'
          ? "Do'kon hozir yopiq — savatga qo'shib bo'lmaydi"
          : "Muassasa hozir yopiq — savatga qo'shib bo'lmaydi"
      )
      return false
    }
    return true
  }
}

interface Props {
  partner: Partner
  product: Product
  closed: boolean
  onOpen?: (p: Product) => void
  /** Do'kon kartasi: rasm kvadrat, ixchamroq */
  compact?: boolean
}

export default function ProductCard({ partner, product, closed, onOpen, compact }: Props) {
  const line = productLine(product)
  const qty = useLineQty(partner.uuid, line.key)
  const setQty = useCart((s) => s.setQty)
  const guard = useClosedGuard(partner, closed)
  const unavailable = !product.is_available

  return (
    <div
      onClick={() => onOpen?.(product)}
      className={cx('group min-w-0 cursor-pointer', (closed || unavailable) && 'opacity-60')}
    >
      <div
        className={cx(
          'relative aspect-square overflow-hidden',
          compact ? 'rounded-[18px]' : 'rounded-[22px]'
        )}
      >
        <Img src={product.image} alt={product.name} className="h-full w-full" />
        <div className="absolute left-2.5 top-2.5">
          <DealBadges product={product} />
        </div>
        {unavailable && (
          <div className="absolute inset-x-2 bottom-2 rounded-full bg-black/70 py-1 text-center text-[0.75rem] font-[700] text-white">
            Mavjud emas
          </div>
        )}
        {!closed && !unavailable && (
          <div className="absolute bottom-2 left-2 right-2 flex justify-end">
            <Stepper
              count={qty}
              size={compact ? 36 : 44}
              className={qty > 0 ? 'w-full justify-between' : ''}
              onInc={() => guard() && setQty(partner, line, qty + 1)}
              onDec={() => setQty(partner, line, qty - 1)}
            />
          </div>
        )}
      </div>
      <PriceLine
        price={product.final_price}
        old={product.final_price < product.price ? product.price : null}
        className="mt-2"
        size={compact ? 16 : 17}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onOpen?.(product)
        }}
        className="mt-0.5 line-clamp-2 w-full cursor-pointer border-0 bg-transparent p-0 text-left text-[0.875rem] leading-[1.25] text-[#374151]"
      >
        {product.name}
      </button>
    </div>
  )
}

export function SetCard({
  partner,
  set,
  closed,
  onOpen,
}: {
  partner: Partner
  set: ProductSet
  closed: boolean
  onOpen?: (s: ProductSet) => void
}) {
  const line = setLine(set)
  const qty = useLineQty(partner.uuid, line.key)
  const setQty = useCart((s) => s.setQty)
  const guard = useClosedGuard(partner, closed)
  const saving = set.old_price && set.old_price > set.price ? set.old_price - set.price : 0
  return (
    <div
      onClick={() => onOpen?.(set)}
      className={cx(
        'flex w-[280px] shrink-0 cursor-pointer gap-3 rounded-[20px] border border-solid border-go-line bg-white p-2.5 lg:w-[320px]',
        closed && 'opacity-60'
      )}
    >
      <div className="relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-[16px]">
        <Img src={set.image} alt={set.name} className="h-full w-full" />
        <div className="absolute left-1.5 top-1.5">
          <DealBadges isSet />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onOpen?.(set)
          }}
          className="cursor-pointer truncate border-0 bg-transparent p-0 text-left text-[1rem] font-[800] text-go-ink"
        >
          {set.name}
        </button>
        <div className="mt-0.5 line-clamp-2 text-[0.8125rem] leading-snug text-go-muted">
          {set.items.length
            ? set.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')
            : set.description || ''}
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div>
            <PriceLine price={set.price} old={set.old_price} size={16} />
            {saving > 0 && (
              <div className="text-[0.75rem] font-[800] text-go-green">−{som(saving)} tejaysiz</div>
            )}
          </div>
          {!closed && (
            <Stepper
              count={qty}
              size={36}
              onInc={() => guard() && setQty(partner, line, qty + 1)}
              onDec={() => setQty(partner, line, qty - 1)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
