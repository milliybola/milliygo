import { Input, message } from 'antd'
import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'
import { cartSubtotal, productLine, useCart, useLineQty } from '../../lib/cart'
import { useFavorite } from '../../lib/favorites'
import { useHydrated } from '../../lib/session'
import type { MenuCategory, Partner, Product } from '../../lib/types'
import { cx, dealLabel, etaRange, formatSum, isOpenNow, zoneFor } from '../../lib/utils'
import {
  IconArrowRight,
  IconBack,
  IconBasket,
  IconChevronRight,
  IconClose,
  IconGift,
  IconHeart,
  IconMinus,
  IconPlus,
  IconScooter,
  IconSearch,
  IconStar,
} from '../../ui/icons'
import { Sheet } from '../../ui/primitives'
import DeliveryProgressPanel from '../DeliveryProgressPanel'

/*
 * Superapp `lib/features/store/store_detail_page.dart` ning 1:1 veb nusxasi.
 * O'lchamlar, ranglar va yozuvlar Flutter kodidagidek — o'zgartirsangiz ikkalasini birga o'zgartiring.
 */

export const S = {
  green: '#15803D',
  ink: '#111111',
  muted: '#8A8F98',
  tile: '#F5F4F2',
  sale: '#F0563D',
  gold: '#FFD12B',
}

/** Chegirma belgisi: "−18%" yoki "−3 000 so'm" */
export function discountLabel(p: Product): string | null {
  if (p.discount > 0) return `−${p.discount}%`
  const diff = p.price - p.final_price
  return diff > 0 ? `−${formatSum(diff)} so'm` : null
}

const hasSale = (p: Product) => p.final_price < p.price

/** "20–30 daq" — zona vaqtidan (superapp `_etaOf`) */
export function storeEta(p: Partner, lat: number | null, lng: number | null): string | null {
  return etaRange(zoneFor(p, lat, lng)?.estimated_minutes)
}

function useAddGuard(partner: Partner) {
  return () => {
    if (!isOpenNow(partner)) {
      message.info("Do'kon hozir yopiq")
      return false
    }
    return true
  }
}

/* ═════════════════════════ Tepa panel ═════════════════════════ */

/** Markazda nom + "★ 4.5 · 🛵 20–30 daq"; ostida qotib turadigan "Tezkor qidiruv" */
export function StoreTopBar({
  partner,
  lat,
  lng,
  onBack,
  onSearch,
}: {
  partner: Partner
  lat: number | null
  lng: number | null
  onBack: () => void
  onSearch: () => void
}) {
  const { fav, toggle } = useFavorite(partner.uuid)
  const eta = storeEta(partner, lat, lng)
  const open = isOpenNow(partner)
  return (
    <div className="sticky top-0 z-40 bg-white lg:static">
      <div className="mx-auto w-full max-w-[720px] lg:max-w-[1180px] lg:px-2">
        <div className="flex h-[60px] items-center gap-1 px-1">
          <RoundIcon label="Orqaga" onClick={onBack}>
            <IconBack size={26} />
          </RoundIcon>
          <div className="min-w-0 flex-1 text-center">
            <div className="truncate text-[1.1875rem] font-[900] tracking-[-0.4px] text-[#111]">
              {partner.name}
            </div>
            <div className="mt-px flex items-center justify-center gap-0.5 text-[0.8125rem] text-[#374151]">
              {partner.rating > 0 && (
                <>
                  <IconStar size={15} className="text-[#111]" />
                  <span>{partner.rating.toFixed(1)}</span>
                  <span className="w-2" />
                </>
              )}
              {!open ? (
                <span className="font-[600] text-[#DC2626]">Hozir yopiq</span>
              ) : eta ? (
                <>
                  <IconScooter size={15} />
                  <span className="ml-0.5">{eta}</span>
                </>
              ) : (
                <span className="text-[#DC2626]">Manzilingizga yetkazmaydi</span>
              )}
            </div>
          </div>
          <RoundIcon
            label={fav ? 'Sevimlilardan olib tashlash' : "Sevimlilarga qo'shish"}
            onClick={toggle}
          >
            <IconHeart size={25} filled={fav} className={fav ? 'text-[#EF4444]' : 'text-[#111]'} />
          </RoundIcon>
          <Link
            href="/store/"
            aria-label="Yopish"
            className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EDEEF0] text-[#4B5563] no-underline"
          >
            <IconClose size={22} />
          </Link>
        </div>
        <div className="px-4 pb-2.5 pt-1">
          <button
            type="button"
            onClick={onSearch}
            className="flex h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-[18px] border-0 bg-[#EFEFF0] text-[1rem] text-[#8A8F98] lg:max-w-[560px]"
          >
            <IconSearch size={24} />
            Tezkor qidiruv
          </button>
        </div>
      </div>
    </div>
  )
}

/** Toifa ichi / Barcha toifalar: chapda ←, markazda sarlavha, o'ngda qidiruv va ✕ */
export function StoreSimpleBar({
  title,
  onBack,
  onSearch,
  children,
}: {
  title: string
  onBack: () => void
  onSearch?: () => void
  children?: ReactNode
}) {
  return (
    <div className="sticky top-0 z-40 bg-white lg:static">
      <div className="mx-auto w-full max-w-[720px] lg:max-w-[1180px] lg:px-2">
        <div className="flex h-14 items-center gap-1 px-1">
          <RoundIcon label="Orqaga" onClick={onBack}>
            <IconBack size={26} />
          </RoundIcon>
          <div className="min-w-0 flex-1 truncate text-center text-[1.1875rem] font-[900] tracking-[-0.4px] text-[#111]">
            {title}
          </div>
          {onSearch ? (
            <RoundIcon label="Qidirish" onClick={onSearch}>
              <IconSearch size={26} />
            </RoundIcon>
          ) : (
            <span className="w-12" />
          )}
          <Link
            href="/store/"
            aria-label="Yopish"
            className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EDEEF0] text-[#4B5563] no-underline"
          >
            <IconClose size={22} />
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}

function RoundIcon({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[#111] hover:bg-[#F2F3F5]"
    >
      {children}
    </button>
  )
}

/* ═════════════════════════ Eslatma ═════════════════════════ */

/** Yashil eslatma kartasi (bepul yetkazish chegarasi) */
export function StoreNoteCard({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] bg-[#E6F6EC] py-3 pl-3 pr-3.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-white">
        <IconGift size={24} />
      </span>
      <span className="text-[0.906rem] leading-[1.3] text-[#15803D]">{text}</span>
    </div>
  )
}

/* ═════════════════════════ Toifalar ═════════════════════════ */

/** Toifa plitkasi: kvadrat rasm (yumaloq burchak), ostida markazda nom */
export function StoreCategoryTile({
  category,
  onClick,
}: {
  category: MenuCategory
  onClick: () => void
}) {
  const logo = category.logo || category.products[0]?.image || null
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-w-0 cursor-pointer border-0 bg-transparent p-0 text-center"
    >
      <span
        className="block aspect-square overflow-hidden rounded-[16px]"
        style={{ background: S.tile }}
      >
        <TileImg src={logo} />
      </span>
      <span className="mt-[5px] line-clamp-2 block text-[0.719rem] font-[600] leading-[1.2] text-[#111]">
        {category.name}
      </span>
    </button>
  )
}

/** "Barcha toifalar" — kulrang kvadratda o'q, ostida nom */
export function StoreAllCategoriesTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-w-0 cursor-pointer border-0 bg-transparent p-0 text-center"
    >
      <span
        className="flex aspect-square items-center justify-center rounded-[16px]"
        style={{ background: S.tile }}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#111]">
          <IconArrowRight size={22} />
        </span>
      </span>
      <span className="mt-[5px] line-clamp-2 block text-[0.719rem] font-[600] leading-[1.2] text-[#111]">
        Barcha toifalar
      </span>
    </button>
  )
}

/** Toifalar to'ri: 4 ustun (kompyuterda 8). [limit] — shuncha toifa + "Barcha toifalar" */
export function StoreCategoryGrid({
  categories,
  limit,
  onOpen,
  onAll,
}: {
  categories: MenuCategory[]
  limit?: number
  onOpen: (i: number) => void
  onAll?: () => void
}) {
  const showAll = limit != null && !!onAll && categories.length > limit + 1
  const list = showAll ? categories.slice(0, limit) : categories
  return (
    <div className="grid grid-cols-4 gap-x-2.5 gap-y-3 lg:grid-cols-8">
      {list.map((c, i) => (
        <StoreCategoryTile key={c.uuid} category={c} onClick={() => onOpen(i)} />
      ))}
      {showAll && <StoreAllCategoriesTile onClick={onAll!} />}
    </div>
  )
}

/* ═════════════════════════ Mahsulot kartasi ═════════════════════════ */

function TileImg({ src, cover = true }: { src?: string | null; cover?: boolean }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <span className="flex h-full w-full items-center justify-center text-[#C9CDD4]" aria-hidden>
        <IconBasket size={26} />
      </span>
    )
  }
  return (
    // Shaffof rasmlarda kulrang ko'rinmasin — rasm ostida oq fon
    <span className="block h-full w-full bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={cx('block h-full w-full', cover ? 'object-cover' : 'object-contain')}
      />
    </span>
  )
}

/** Oq dumaloq "+" (38px) */
function RoundAdd({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Savatga qo'shish"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#111] shadow-[0_1px_4px_rgba(0,0,0,0.22)]"
    >
      <IconPlus size={24} />
    </button>
  )
}

/** Oq "− N +" pilyula (38px) */
function PillStepper({
  count,
  onDec,
  onInc,
}: {
  count: number
  onDec: () => void
  onInc: () => void
}) {
  const btn = (icon: ReactNode, fn: () => void, label: string) => (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        fn()
      }}
      className="flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[#111]"
    >
      {icon}
    </button>
  )
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex h-[38px] w-full items-center rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.22)]"
    >
      {btn(<IconMinus size={22} />, onDec, 'Kamaytirish')}
      <span className="flex-1 text-center text-[0.9375rem] font-[800] text-[#111]">{count}</span>
      {btn(<IconPlus size={22} />, onInc, "Ko'paytirish")}
    </div>
  )
}

/**
 * Mahsulot kartasi (Yandex uslubi): kulrang fondagi rasm, chap tepada chegirma,
 * o'ng pastda "+" — savatga tushgach "− N +" pilyula. Ostida narx va nom.
 */
export function StoreProductCard({
  partner,
  product,
  onOpen,
}: {
  partner: Partner
  product: Product
  onOpen: (p: Product) => void
}) {
  const line = productLine(product)
  const count = useLineQty(partner.uuid, line.key)
  const setQty = useCart((s) => s.setQty)
  const guard = useAddGuard(partner)
  const sale = hasSale(product)
  const badge = discountLabel(product)
  const deal = dealLabel(product.promotion)
  const unavailable = !product.is_available

  const setCount = (n: number) => {
    if (n > count && !guard()) return
    setQty(partner, line, n)
  }

  return (
    <div
      onClick={() => onOpen(product)}
      className={cx('min-w-0 cursor-pointer', unavailable && 'opacity-60')}
    >
      <div
        className="relative aspect-square overflow-hidden rounded-[20px]"
        style={{ background: S.tile }}
      >
        <TileImg src={product.image} />
        {(badge || deal) && (
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {badge && (
              <span className="rounded-[8px] bg-[#16A34A] px-[7px] py-0.5 text-[0.75rem] font-[800] text-white">
                {badge}
              </span>
            )}
            {deal && (
              <span className="rounded-[8px] bg-[#F5B400] px-[7px] py-0.5 text-[0.75rem] font-[900] text-[#111]">
                {deal}
              </span>
            )}
          </div>
        )}
        {unavailable ? (
          <div className="absolute inset-x-1.5 bottom-1.5 rounded-full bg-black/70 py-1 text-center text-[0.75rem] font-[700] text-white">
            Mavjud emas
          </div>
        ) : (
          <div className={cx('absolute bottom-1.5 right-1.5', count > 0 && 'left-1.5')}>
            {count === 0 ? (
              <RoundAdd onClick={() => setCount(1)} />
            ) : (
              <PillStepper
                count={count}
                onDec={() => setCount(count - 1)}
                onInc={() => setCount(count + 1)}
              />
            )}
          </div>
        )}
      </div>
      <div
        className="mt-2 truncate text-[1.0625rem] font-[800]"
        style={{ color: sale ? S.sale : S.ink }}
      >
        {formatSum(product.final_price)} so&apos;m
      </div>
      {sale && (
        <div className="text-[0.781rem] line-through" style={{ color: S.muted }}>
          {formatSum(product.price)} so&apos;m
        </div>
      )}
      <div
        className={cx(
          'text-[0.844rem] leading-[1.25] text-[#262626]',
          sale ? 'line-clamp-2' : 'line-clamp-3'
        )}
      >
        {product.name}
      </div>
    </div>
  )
}

/* ═════════════════════════ Mahsulot qatori ═════════════════════════ */

/** Bo'lim: katta sarlavha + "Hammasi ›" va gorizontal mahsulotlar (118px) */
export function StoreProductRow({
  title,
  partner,
  items,
  onOpen,
  onSeeAll,
}: {
  title: string
  partner: Partner
  items: Product[]
  onOpen: (p: Product) => void
  onSeeAll?: () => void
}) {
  if (!items.length) return null
  return (
    <section>
      <div className="mx-auto w-full max-w-[720px] lg:max-w-[1180px] lg:px-6">
        <div className="flex items-center gap-2 px-4 pb-3 pt-[26px] lg:px-0">
          <h2 className="m-0 line-clamp-2 flex-1 text-[1.375rem] font-[900] leading-[1.1] tracking-[-0.5px] text-[#111]">
            {title}
          </h2>
          {onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              className="inline-flex shrink-0 cursor-pointer items-center rounded-[14px] border-0 py-[7px] pl-3 pr-1.5 text-[0.875rem] font-[700] text-[#111]"
              style={{ background: S.tile }}
            >
              Hammasi
              <IconChevronRight size={20} />
            </button>
          )}
        </div>
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 lg:px-0">
          {items.slice(0, 15).map((p) => (
            <div key={p.uuid} className="w-[118px] shrink-0 lg:w-[150px]">
              <StoreProductCard partner={partner} product={p} onOpen={onOpen} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** 3 ustunli mahsulotlar to'ri (toifa ichi, qidiruv) */
export function StoreProductGrid({
  partner,
  items,
  onOpen,
}: {
  partner: Partner
  items: Product[]
  onOpen: (p: Product) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-x-2.5 gap-y-4 sm:grid-cols-4 lg:grid-cols-6">
      {items.map((p) => (
        <StoreProductCard key={p.uuid} partner={partner} product={p} onOpen={onOpen} />
      ))}
    </div>
  )
}

/* ═════════════════════════ Savat tugmasi va pastki panel ═════════════════════════ */

/** Oltin "65 500 so'm 🧺" tugmasi — savatga o'tadi */
export function GoldCartButton({ partner, compact }: { partner: Partner; compact?: boolean }) {
  const cart = useCart((s) => s.carts[partner.uuid])
  const hydrated = useHydrated()
  const total = cartSubtotal(cart)
  if (!hydrated || total === 0) return null
  return (
    <Link
      href={`/cart/?partner=${partner.uuid}`}
      className={cx(
        'inline-flex items-center gap-2.5 rounded-[30px] font-[900] text-[#111] no-underline shadow-[0_6px_14px_rgba(255,209,43,0.5)]',
        compact ? 'px-[18px] py-3' : 'px-[22px] py-[15px]'
      )}
      style={{ background: S.gold }}
    >
      <span className="text-[1.125rem]">{compact ? 'Savat' : `${formatSum(total)} so'm`}</span>
      <IconBasket size={24} />
    </Link>
  )
}

/** Pastki qism: bepul yetkazish paneli + o'ng tomonda oltin savat tugmasi */
export function StoreBottomBar({
  partner,
  lat,
  lng,
}: {
  partner: Partner
  lat: number | null
  lng: number | null
}) {
  const cart = useCart((s) => s.carts[partner.uuid])
  const hydrated = useHydrated()
  const total = hydrated ? cartSubtotal(cart) : 0
  const zone = zoneFor(partner, lat, lng)
  const hasDeliveryInfo = partner.free_delivery_threshold > 0 || !!zone
  const button = total > 0 ? <GoldCartButton partner={partner} /> : null

  if (!hasDeliveryInfo) {
    if (!button) return null
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] pb-[max(12px,env(safe-area-inset-bottom))] lg:sticky lg:bottom-4">
        <div className="pointer-events-auto mx-auto flex w-full max-w-[720px] justify-end px-4 lg:max-w-[1180px] lg:px-6">
          {button}
        </div>
      </div>
    )
  }
  return (
    <DeliveryProgressPanel
      total={total}
      count={0}
      fee={zone ? (zone.delivery_fee ?? partner.delivery_fee) : partner.delivery_fee}
      freeThreshold={partner.free_delivery_threshold}
      cartHref={`/cart/?partner=${partner.uuid}`}
      floating={button}
    />
  )
}

/* ═════════════════════════ Mahsulot oynasi ═════════════════════════ */

/** Mahsulot oynasi: katta rasm, nom, do'kon, "Tovar haqida", "Yana nimadir kerakmi?", pastda narx + "Savatga" */
export function StoreProductSheet({
  partner,
  product,
  suggestions,
  onClose,
  onOpenProduct,
}: {
  partner: Partner
  product: Product | null
  suggestions: Product[]
  onClose: () => void
  onOpenProduct: (p: Product) => void
}) {
  return (
    <Sheet open={!!product} onClose={onClose} bodyClassName="!px-0 !pb-0" width={560}>
      {product && (
        <StoreProductBody
          partner={partner}
          product={product}
          suggestions={suggestions}
          onClose={onClose}
          onOpenProduct={onOpenProduct}
        />
      )}
    </Sheet>
  )
}

function StoreProductBody({
  partner,
  product: item,
  suggestions,
  onClose,
  onOpenProduct,
}: {
  partner: Partner
  product: Product
  suggestions: Product[]
  onClose: () => void
  onOpenProduct: (p: Product) => void
}) {
  const line = productLine(item)
  const count = useLineQty(partner.uuid, line.key)
  const setQty = useCart((s) => s.setQty)
  const open = isOpenNow(partner)
  const more = suggestions.filter((p) => p.uuid !== item.uuid).slice(0, 12)
  const desc = item.description.trim()
  const showDesc = !!desc && desc.toLowerCase() !== item.name.toLowerCase()
  const sale = hasSale(item)
  const badge = discountLabel(item)
  const deal = dealLabel(item.promotion)

  return (
    <div className="relative">
      <div className="px-3 pt-0">
        <div
          className="relative aspect-[1.05] overflow-hidden rounded-[26px]"
          style={{ background: S.tile }}
        >
          <TileImg src={item.image} />
          {(badge || deal) && (
            <div className="absolute left-3.5 top-3.5 flex flex-col items-start gap-1">
              {badge && (
                <span className="rounded-[9px] bg-[#16A34A] px-[9px] py-[3px] text-[0.875rem] font-[800] text-white">
                  {badge}
                </span>
              )}
              {deal && (
                <span className="rounded-[9px] bg-[#F5B400] px-[9px] py-[3px] text-[0.875rem] font-[900] text-[#111]">
                  {deal}
                </span>
              )}
            </div>
          )}
          <button
            type="button"
            aria-label="Yopish"
            onClick={onClose}
            className="absolute right-2.5 top-2.5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#111] shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
          >
            <IconClose size={24} />
          </button>
        </div>
      </div>
      <h3 className="m-0 px-4 pt-4 text-[1.5rem] font-[900] leading-[1.15] tracking-[-0.4px] text-[#111]">
        {item.name}
      </h3>
      <div className="px-4 pt-2.5">
        <span
          className="inline-block rounded-[12px] px-3 py-[7px] text-[0.844rem] font-[600] text-[#111]"
          style={{ background: S.tile }}
        >
          {partner.name}
        </span>
      </div>
      {showDesc && (
        <div className="px-4 pt-4">
          <div className="text-[1rem] font-[800] text-[#111]">Tovar haqida</div>
          <p className="m-0 mt-1 text-[0.875rem] leading-[1.4] text-[#4B5563]">{desc}</p>
        </div>
      )}
      {more.length > 0 && (
        <>
          <div className="px-4 pb-2.5 pt-[22px] text-[1.375rem] font-[900] tracking-[-0.4px] text-[#111]">
            Yana nimadir kerakmi?
          </div>
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-2">
            {more.map((p) => (
              <div key={p.uuid} className="w-[112px] shrink-0">
                <StoreProductCard partner={partner} product={p} onOpen={onOpenProduct} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pastki panel: narx + savatga qo'shish */}
      <div className="sticky bottom-0 mt-4 bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-3px_14px_rgba(0,0,0,0.06)]">
        {count > 0 && (
          <div className="pointer-events-none absolute bottom-full right-4 mb-3">
            <span className="pointer-events-auto">
              <GoldCartButton partner={partner} compact />
            </span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[1.5rem] font-[900]" style={{ color: sale ? S.sale : S.ink }}>
              {formatSum(item.final_price)} so&apos;m
            </div>
            {sale && (
              <div className="text-[0.8125rem] line-through" style={{ color: S.muted }}>
                {formatSum(item.price)} so&apos;m
              </div>
            )}
          </div>
          <div className="h-[54px] w-[170px] shrink-0">
            {!open ? (
              <div
                className="flex h-full items-center justify-center rounded-[18px] font-[700]"
                style={{ background: S.tile, color: S.muted }}
              >
                Do&apos;kon yopiq
              </div>
            ) : !item.is_available ? (
              <div
                className="flex h-full items-center justify-center rounded-[18px] font-[700]"
                style={{ background: S.tile, color: S.muted }}
              >
                Mavjud emas
              </div>
            ) : count === 0 ? (
              <button
                type="button"
                onClick={() => setQty(partner, line, 1)}
                className="h-full w-full cursor-pointer rounded-[18px] border-0 text-[1rem] font-[800] text-[#111]"
                style={{ background: S.gold }}
              >
                Savatga
              </button>
            ) : (
              <div
                className="flex h-full items-center rounded-[18px]"
                style={{ background: S.tile }}
              >
                <button
                  type="button"
                  aria-label="Kamaytirish"
                  onClick={() => setQty(partner, line, count - 1)}
                  className="flex h-12 w-12 cursor-pointer items-center justify-center border-0 bg-transparent text-[#111]"
                >
                  <IconMinus size={24} />
                </button>
                <span className="flex-1 text-center text-[1.0625rem] font-[800] text-[#111]">
                  {count}
                </span>
                <button
                  type="button"
                  aria-label="Ko'paytirish"
                  onClick={() => setQty(partner, line, count + 1)}
                  className="flex h-12 w-12 cursor-pointer items-center justify-center border-0 bg-transparent text-[#111]"
                >
                  <IconPlus size={24} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═════════════════════════ Qidiruv ═════════════════════════ */

/** Do'kon ichida qidiruv: natijalar 3 ustunli to'rda */
export function StoreSearchSheet({
  open,
  onClose,
  partner,
  items,
  onPick,
}: {
  open: boolean
  onClose: () => void
  partner: Partner
  items: Product[]
  onPick: (p: Product) => void
}) {
  const [q, setQ] = useState('')
  const s = q.trim().toLowerCase()
  const results = useMemo(
    () => (s ? items.filter((i) => i.name.toLowerCase().includes(s)) : []),
    [s, items]
  )
  return (
    <Sheet open={open} onClose={onClose} width={640} bodyClassName="!px-4">
      <Input
        autoFocus
        size="large"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        prefix={<IconSearch size={20} className="text-[#6B7280]" />}
        placeholder={`${partner.name} dan qidirish`}
        className="!rounded-[16px] !border-0 !bg-[#EFEFF0]"
      />
      <div className="min-h-[50vh] pt-3">
        {!s ? (
          <p className="pt-16 text-center" style={{ color: S.muted }}>
            Mahsulot nomini yozing
          </p>
        ) : results.length === 0 ? (
          <p className="pt-16 text-center" style={{ color: S.muted }}>
            Hech narsa topilmadi
          </p>
        ) : (
          <StoreProductGrid partner={partner} items={results} onOpen={onPick} />
        )}
      </div>
    </Sheet>
  )
}
