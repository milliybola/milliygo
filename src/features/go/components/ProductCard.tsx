import { message } from 'antd'
import {
  decreaseProduct,
  hasOptionGroups,
  productLine,
  setLine,
  useCart,
  useLineQty,
  useProductQty,
} from '../lib/cart'
import type { Partner, Product, ProductSet } from '../lib/types'
import { cx, dealLabel, formatSum, som } from '../lib/utils'
import { useRequireLocation } from '../lib/session'
import { Badge, Img, Stepper } from '../ui/primitives'

export function DealBadges({ product, isSet }: { product?: Product; isSet?: boolean }) {
  const deal = dealLabel(product?.promotion)
  const disc = product && product.discount > 0 ? product.discount : 0
  if (!deal && !disc && !isSet) return null
  return (
    <div className="flex flex-col items-start gap-1.5">
      {disc > 0 && (
        <span className="rounded-[10px] bg-[#16A34A] px-2.5 py-1 text-[0.9375rem] font-[800] leading-none text-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
          −{disc}%
        </span>
      )}
      {deal && (
        <span className="inline-flex flex-col items-center rounded-[12px] bg-gradient-to-br from-[#FF9A1F] to-[#FF4D1A] px-3 pb-1 pt-1.5 text-white shadow-[0_3px_8px_rgba(255,77,26,0.35)]">
          <span className="text-[1.125rem] font-[900] leading-none tracking-[-0.3px]">{deal}</span>
          <span className="mt-0.5 text-[0.625rem] font-[800] uppercase leading-none tracking-[0.6px] opacity-90">
            Bepul
          </span>
        </span>
      )}
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
  // Opsiyali mahsulot: "+" oynani ochadi (tanlov kerak), son — barcha variantlar yig'indisi
  const withOptions = hasOptionGroups(product)
  const plainQty = useLineQty(partner.uuid, line.key)
  const totalQty = useProductQty(partner.uuid, product.uuid)
  const qty = withOptions ? totalQty : plainQty
  const setQty = useCart((s) => s.setQty)
  const guard = useClosedGuard(partner, closed)
  const unavailable = !product.is_available
  const inc = () => {
    if (withOptions) return onOpen?.(product)
    if (guard()) setQty(partner, line, qty + 1)
  }
  const dec = () =>
    withOptions ? decreaseProduct(partner, product.uuid) : setQty(partner, line, qty - 1)

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
              onInc={inc}
              onDec={dec}
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
  const withOptions = hasOptionGroups(set)
  const plainQty = useLineQty(partner.uuid, line.key)
  const totalQty = useProductQty(partner.uuid, set.uuid)
  const qty = withOptions ? totalQty : plainQty
  const setQty = useCart((s) => s.setQty)
  const guard = useClosedGuard(partner, closed)
  const sale = !!set.old_price && set.old_price > set.price
  const percent = sale ? Math.round(((set.old_price! - set.price) / set.old_price!) * 100) : 0
  const content = set.items.length
    ? set.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')
    : set.description || ''
  return (
    <div
      onClick={() => onOpen?.(set)}
      className={cx(
        'w-[220px] shrink-0 cursor-pointer sm:w-[250px] lg:w-auto',
        closed && 'opacity-60'
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-[22px] bg-[#E9EEF0] lg:rounded-[28px]">
        <Img src={set.image} alt={set.name} className="h-full w-full" />
        {percent > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-[9px] bg-[#16A34A] px-2 py-[5px] text-[0.8125rem] font-[700] leading-none text-white lg:left-3 lg:top-3 lg:rounded-[10px] lg:px-2.5 lg:py-1 lg:text-[1.0625rem]">
            −{percent}%
          </span>
        )}
        {!closed && (
          <div
            className="absolute bottom-2.5 right-2.5 lg:bottom-3 lg:right-3"
            onClick={(e) => e.stopPropagation()}
          >
            <Stepper
              count={qty}
              size={40}
              onInc={() => {
                if (withOptions) return onOpen?.(set)
                if (guard()) setQty(partner, line, qty + 1)
              }}
              onDec={() =>
                withOptions ? decreaseProduct(partner, set.uuid) : setQty(partner, line, qty - 1)
              }
            />
          </div>
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2">
        <span className="text-[1rem] font-[800] tracking-[-0.3px] text-[#FF5A1F] lg:text-[1.25rem]">
          {som(set.price)}
        </span>
        {sale && (
          <span className="text-[0.8125rem] font-[500] text-[#6B7280] line-through lg:text-[1.0625rem]">
            {formatSum(set.old_price!)}
          </span>
        )}
      </div>
      <div className="mt-0.5 truncate text-[0.875rem] font-[500] text-go-ink lg:text-[1.0625rem]">
        {set.name}
      </div>
      {content && (
        <div className="mt-0.5 line-clamp-2 text-[0.75rem] leading-snug text-[#8A919C] lg:text-[0.9375rem]">
          {content}
        </div>
      )}
    </div>
  )
}
