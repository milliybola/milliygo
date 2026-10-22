import { message } from 'antd'
import { useEffect, useState } from 'react'
import { productLine, setLine, useCart } from '../lib/cart'
import { useRequireLocation } from '../lib/session'
import type { Partner, Product, ProductOptionGroup, ProductSet } from '../lib/types'
import { dealLabel, freeCount, som } from '../lib/utils'
import { IconClose, IconGift, IconMinus, IconPlus } from '../ui/icons'
import { Img, Notice, Sheet } from '../ui/primitives'
import OptionGroups, { useOptionSelection } from './OptionGroups'
import { DealBadges } from './ProductCard'

const NO_GROUPS: ProductOptionGroup[] = []

interface Props {
  partner: Partner
  closed: boolean
  product?: Product | null
  set?: ProductSet | null
  suggestions?: Product[]
  onClose: () => void
  onOpenProduct?: (p: Product) => void
}

export default function ProductSheet({
  partner,
  closed,
  product,
  set,
  suggestions = [],
  onClose,
  onOpenProduct,
}: Props) {
  const open = !!(product || set)
  const groups = product?.option_groups ?? set?.option_groups ?? NO_GROUPS
  const hasGroups = groups.length > 0
  const { picked, toggle, selected, valid, missing } = useOptionSelection(
    groups,
    product?.uuid || set?.uuid || ''
  )
  const [showMissing, setShowMissing] = useState(false)
  const line = product ? productLine(product, selected) : set ? setLine(set, selected) : null
  const inCart = useCart((s) =>
    line ? s.carts[partner.uuid]?.lines.find((l) => l.key === line.key)?.quantity || 0 : 0
  )
  const setQty = useCart((s) => s.setQty)
  const requireLocation = useRequireLocation()
  const [qty, setLocal] = useState(1)

  useEffect(() => {
    // Opsiyali mahsulotda har ochilganda 1 dan boshlanadi (tanlangan variant savatga qo'shiladi)
    if (open) setLocal(hasGroups ? 1 : Math.max(1, inCart))
    setShowMissing(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.uuid, set?.uuid])

  if (!line)
    return (
      <Sheet open={false} onClose={onClose}>
        {null}
      </Sheet>
    )

  const price = line.price
  const old = line.old_price
  const promo = product?.promotion
  const free = freeCount(qty, promo)
  const total = (qty - free) * price
  const deal = dealLabel(promo)
  const unavailable = product ? !product.is_available : false
  const others = suggestions.filter((s) => s.uuid !== product?.uuid && s.is_available).slice(0, 6)

  const add = () => {
    if (!closed && !requireLocation()) return
    if (closed) {
      message.info("Muassasa hozir yopiq — savatga qo'shib bo'lmaydi")
      return
    }
    if (!valid) {
      setShowMissing(true)
      message.warning(`«${missing?.name}» bo'yicha tanlovni to'ldiring`)
      return
    }
    // Opsiyali mahsulotda shu variant savatda bo'lsa — ustiga qo'shiladi; oddiyida miqdor almashtiriladi
    setQty(partner, line, hasGroups ? inCart + qty : qty)
    message.success({ content: inCart ? 'Savat yangilandi' : "Savatga qo'shildi", duration: 1.2 })
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      width={560}
      bodyClassName="!px-0"
      footer={
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center rounded-[16px] bg-[#F1F5F9] p-1">
            <button
              type="button"
              aria-label="Kamaytirish"
              onClick={() => setLocal((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border-0 bg-white text-[#1E293B]"
            >
              <IconMinus size={20} />
            </button>
            <span className="min-w-[32px] text-center text-[1.125rem] font-[900] text-[#1E293B] sm:min-w-[48px]">
              {qty}
            </span>
            <button
              type="button"
              aria-label="Ko'paytirish"
              onClick={() => setLocal((q) => q + 1)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] border-0 bg-white text-[#1E293B]"
            >
              <IconPlus size={20} />
            </button>
          </div>
          <button
            type="button"
            onClick={add}
            disabled={closed || unavailable}
            className="flex h-[54px] min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[16px] border-0 bg-[#FFD12B] px-2 text-[0.8125rem] font-[900] text-[#1E293B] disabled:cursor-not-allowed disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] sm:text-[1rem]"
          >
            <span className="whitespace-nowrap">
              {closed
                ? 'Muassasa yopiq'
                : unavailable
                  ? 'Mavjud emas'
                  : inCart && !hasGroups
                    ? 'Yangilash'
                    : "Savatga qo'shish"}
            </span>
            {!closed && !unavailable && (
              <>
                <span className="h-1 w-1 shrink-0 rounded-full bg-[#1E293B]" />
                <span className="whitespace-nowrap">{som(total)}</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="px-5">
        <div className="relative h-[280px] w-full overflow-hidden rounded-[24px] bg-[#F8FAFC]">
          {line.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={line.image} alt={line.name} className="h-full w-full object-contain" />
          ) : (
            <Img src={line.image} alt={line.name} className="h-full w-full" />
          )}
          <div className="absolute left-3 top-3">
            <DealBadges product={product || undefined} isSet={!!set} />
          </div>
          <button
            type="button"
            aria-label="Yopish"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-white/90 text-[#1E293B] shadow-[0_4px_10px_rgba(0,0,0,0.06)]"
          >
            <IconClose size={24} />
          </button>
        </div>
        <div className="mt-5 flex items-start gap-3">
          <h3 className="m-0 min-w-0 flex-1 text-[1.625rem] font-[900] leading-tight tracking-[-0.5px] text-[#1E293B]">
            {line.name}
          </h3>
          <div className="shrink-0 text-right">
            <div
              className={`text-[1.25rem] font-[900] ${old && old > price ? 'text-go-red' : 'text-[#1E293B]'}`}
            >
              {som(price)}
            </div>
            {old && old > price ? (
              <div className="text-[0.875rem] font-[600] text-[#94A3B8] line-through">
                {som(old)}
              </div>
            ) : null}
          </div>
        </div>
        {deal && (
          <Notice tone="warn" icon={<IconGift size={18} />} className="mt-3">
            <b>{deal} aksiya:</b> har {promo!.buy_quantity} ta xaridga {promo!.get_quantity} ta
            bepul.
            {free > 0 ? ` Hozir ${free} tasi bepul.` : ''}
          </Notice>
        )}

        {set && (
          <div className="mt-4">
            <div className="mb-2 text-[0.9375rem] font-[800] text-go-ink">Set tarkibi</div>
            {set.items.length ? (
              <ul className="m-0 list-none space-y-2 p-0">
                {set.items.map((i, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Img src={i.image} alt={i.name} className="h-11 w-11 shrink-0 rounded-[12px]" />
                    <span className="flex-1 text-[0.9375rem] text-go-ink">{i.name}</span>
                    <span className="text-[0.9375rem] font-[800] text-go-muted">{i.quantity}×</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[0.875rem] text-go-muted">{set.description}</p>
            )}
          </div>
        )}

        {product?.description && product.description !== product.name && (
          <p className="mb-0 mt-3 whitespace-pre-line text-[0.9375rem] leading-relaxed text-[#4B5563]">
            {product.description}
          </p>
        )}

        {hasGroups && (
          <OptionGroups
            groups={groups}
            picked={picked}
            onToggle={toggle}
            highlight={showMissing ? missing : null}
          />
        )}
      </div>

      {others.length > 0 && (
        <div className="mt-5">
          <div className="mb-3 px-5 text-[1.125rem] font-[900] text-[#1E293B]">Birga olishadi</div>
          <div className="no-scrollbar flex gap-4 overflow-x-auto px-5 pb-3 pt-1">
            {others.map((o) => (
              <button
                key={o.uuid}
                type="button"
                onClick={() => onOpenProduct?.(o)}
                className="w-[140px] shrink-0 cursor-pointer overflow-hidden rounded-[20px] border-0 bg-white p-0 text-left shadow-[0_4px_10px_rgba(0,0,0,0.05)]"
              >
                <Img src={o.image} alt={o.name} className="aspect-[4/3] w-full" />
                <div className="p-3">
                  <div className="truncate text-[0.875rem] font-[700] text-[#1E293B]">{o.name}</div>
                  <div className="mt-1 text-[0.8125rem] font-[900] text-[#1E293B]">
                    {som(o.final_price)}
                  </div>
                </div>
              </button>
            ))}
          </div>{' '}
        </div>
      )}
    </Sheet>
  )
}
