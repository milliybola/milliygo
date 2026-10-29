import { Input, message, Modal } from 'antd'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import DeliveryProgressPanel from '../components/DeliveryProgressPanel'
import { partnerHref } from '../components/PartnerCard'
import ProductCard from '../components/ProductCard'
import ProductSheet from '../components/ProductSheet'
import { cartCount, cartSaving, cartSubtotal, cartsOfType, nextQty, useCart } from '../lib/cart'
import { useMenu } from '../lib/queries'
import { useQueryParam } from '../lib/route'
import { useHydrated, useUserLocation } from '../lib/session'
import type { CartLine, PartnerCart, PartnerType, Product } from '../lib/types'
import {
  cx,
  dealNote,
  giftCount,
  deliveryFeeFor,
  etaRange,
  formatSum,
  isOpenNow,
  formatQty,
  lineTotal,
  opensAtLabel,
  som,
  workingHoursLabel,
  zoneFor,
} from '../lib/utils'
import {
  IconBack,
  IconChevronRight,
  IconClose,
  IconGift,
  IconLock,
  IconScooter,
  IconTrash,
  IconWalk,
} from '../ui/icons'
import { Button, Img, Notice, Page, Sheet } from '../ui/primitives'

const MUTED = 'text-[#6B7280]'

const ChatIcon = ({ size = 23 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8l-4.3 3.6A.8.8 0 0 1 2.4 21V5A2 2 0 0 1 4 3z" />
  </svg>
)

/** Savatdagi qator: rasm, nom, qator summasi, kulrang "− N +" (superapp `_CartLineRow`) */
function LineRow({ cart, line, last }: { cart: PartnerCart; line: CartLine; last: boolean }) {
  const setQty = useCart((s) => s.setQty)
  const gift = giftCount(line)
  const total = lineTotal(line)
  const full = Math.round(
    (line.old_price && line.old_price > line.price ? line.old_price : line.price) * line.quantity
  )
  const note = dealNote(line)
  const { quantity: _q, ...base } = line
  // Kg qatorida "1.5 kg", qadoqda — qadoqlar soni
  const unitForQty = line.packaging ? undefined : line.unit
  const inc = () => {
    const next = nextQty(line, line.quantity, 1)
    if (next === null)
      message.warning(`Faqat ${formatQty(line.max_quantity ?? 0, unitForQty)} qoldi`)
    else change(next)
  }
  const dec = () => change(nextQty(line, line.quantity, -1) ?? line.quantity)

  const change = (qty: number) => {
    const previous = line.quantity
    setQty(cart.partner, base, qty)
    if (qty <= 0 && previous > 0) {
      const key = `undo-${line.key}`
      message.open({
        key,
        duration: 4,
        content: (
          <span>
            «{line.name}» savatdan olib tashlandi{' '}
            <button
              type="button"
              onClick={() => {
                setQty(cart.partner, base, previous)
                message.destroy(key)
              }}
              className="cursor-pointer border-0 bg-transparent p-0 text-[0.9375rem] font-[800] text-go-green"
            >
              Qaytarish
            </button>
          </span>
        ),
      })
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 py-3">
        <Img
          src={line.image}
          alt={line.name}
          className="h-[84px] w-[84px] shrink-0 rounded-[18px]"
        />
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 text-[0.9375rem] leading-[1.25] text-[#111]">
            {line.kind === 'set' && (
              <span className="mr-1.5 rounded-[6px] bg-go-green px-1.5 py-px align-middle text-[0.656rem] font-[900] text-white">
                SET
              </span>
            )}
            {line.name}
          </div>
          {line.options?.length ? (
            <div className="mt-0.5 line-clamp-2 text-[0.781rem] text-[#6B7280]">
              {line.options.map((o) => o.name).join(', ')}
            </div>
          ) : null}
          {line.unit === 'KG' && !line.packaging ? (
            <div className="mt-0.5 text-[0.781rem] text-[#6B7280]">
              {formatSum(line.price)} so&apos;m / kg
            </div>
          ) : null}
          {line.packaging ? (
            <div className="mt-0.5 text-[0.781rem] text-[#6B7280]">
              1 {line.packaging.name.toLowerCase()} = {formatQty(line.packaging.multiplier)}{' '}
              {line.unit === 'KG' ? 'kg' : 'dona'}
            </div>
          ) : null}
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={cx(
                'whitespace-nowrap text-[0.969rem] font-[900]',
                full > total ? 'text-go-red' : 'text-[#111]'
              )}
            >
              {som(total)}
            </span>
            {full > total && (
              <span className="whitespace-nowrap text-[0.781rem] text-[#9CA3AF] line-through">
                {formatSum(full)}
              </span>
            )}
          </div>
          {line.kind === 'set' && line.set_items?.length ? (
            <div className="mt-0.5 line-clamp-2 text-[0.781rem] text-[#6B7280]">
              {line.set_items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
            </div>
          ) : null}
          {gift > 0 ? (
            <div className="mt-1 text-[0.781rem] font-[800] text-go-green">
              {line.quantity} ta olindi + {gift} ta sovg'a 🎁
            </div>
          ) : (
            note && <div className="mt-1 text-[0.781rem] font-[800] text-[#B45309]">{note}</div>
          )}
        </div>
        <div className="flex h-[46px] shrink-0 items-center rounded-[16px] bg-[#F2F3F5]">
          <button
            type="button"
            aria-label="Kamaytirish"
            onClick={dec}
            className="flex h-[46px] w-11 cursor-pointer items-center justify-center border-0 bg-transparent text-go-green"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M5 12h14" />
            </svg>
          </button>
          <span
            className="min-w-[26px] px-0.5 text-center text-[1rem] font-[800] text-[#111]"
            aria-live="polite"
          >
            {formatQty(line.quantity, unitForQty)}
          </span>
          <button
            type="button"
            aria-label="Ko'paytirish"
            onClick={inc}
            className="flex h-[46px] w-11 cursor-pointer items-center justify-center border-0 bg-transparent text-go-green"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
      {!last && <div className="ml-[96px] h-px bg-[#F0F1F3]" />}
    </div>
  )
}

function Suggestions({ cart, onOpen }: { cart: PartnerCart; onOpen: (p: Product) => void }) {
  const menu = useMenu(cart.partner.uuid)
  const inCart = new Set(cart.lines.map((l) => l.uuid))
  const items = (menu.data?.categories || [])
    .flatMap((c) => c.products)
    .filter((p) => !inCart.has(p.uuid) && p.is_available)
    .slice(0, 9)
  if (!items.length || !isOpenNow(cart.partner)) return null
  return (
    <section className="px-4 pt-[18px]">
      <h2 className="m-0 mb-3 text-[1.5rem] font-[900] tracking-[-0.6px] text-[#111]">
        Yana nimadir kerakmi?
      </h2>
      <div className="grid grid-cols-3 gap-x-2.5 gap-y-4 sm:grid-cols-4 lg:grid-cols-5">
        {items.map((p) => (
          <ProductCard
            key={p.uuid}
            partner={cart.partner}
            product={p}
            closed={false}
            onOpen={onOpen}
            compact
          />
        ))}
      </div>
    </section>
  )
}

/** Yuqori panel: orqaga, "Savat" (aylantirilganda restoran nomi · summa), tozalash, yopish */
function TopBar({
  title,
  sub,
  onClear,
}: {
  title: string
  sub?: string | null
  onClear?: () => void
}) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 60)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const icon =
    'flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[#111] no-underline hover:bg-go-chip'
  return (
    <div className="sticky top-0 z-[60] bg-white lg:top-[72px]">
      <div className="mx-auto flex h-14 w-full max-w-[720px] items-center gap-0.5 px-1.5 lg:max-w-[760px] lg:px-4">
        <button
          type="button"
          aria-label="Orqaga"
          className={icon}
          onClick={() => {
            if (window.history.length > 1) window.history.back()
            else window.location.href = '/'
          }}
        >
          <IconBack size={26} />
        </button>
        <div className="min-w-0 flex-1 text-center leading-tight">
          {scrolled && sub ? (
            <>
              <div className="truncate text-[1.0625rem] font-[800] text-[#111]">{title}</div>
              <div className="truncate text-[0.781rem] text-[#6B7280]">{sub}</div>
            </>
          ) : (
            <div className="text-[1.125rem] font-[700] text-[#111]">Savat</div>
          )}
        </div>
        {onClear ? (
          <button type="button" aria-label="Savatni tozalash" className={icon} onClick={onClear}>
            <IconTrash size={26} />
          </button>
        ) : (
          <span className="w-11" />
        )}
        <Link
          href="/"
          aria-label="Yopish"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EDEEF0] text-[#4B5563] no-underline"
        >
          <IconClose size={22} />
        </Link>
        <span className="w-1" />
      </div>
    </div>
  )
}

export default function CartPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const partnerParam = useQueryParam('partner')
  const typeParam = useQueryParam('type')
  const carts = useCart((s) => s.carts)
  const { setComment, clear } = useCart()
  const { lat, lng } = useUserLocation()
  const food = cartsOfType(carts, 'RESTAURANT')
  const shop = cartsOfType(carts, 'SHOP')

  const initialType: PartnerType =
    (partnerParam && carts[partnerParam]?.partner.partner_type) ||
    (typeParam === 'shop' ? 'SHOP' : food.length || !shop.length ? 'RESTAURANT' : 'SHOP')
  const [type, setType] = useState<PartnerType>(initialType)
  const [selected, setSelected] = useState<string | undefined>(partnerParam)
  const [commentOpen, setCommentOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (!hydrated) return
    if (partnerParam && carts[partnerParam]) {
      setType(carts[partnerParam].partner.partner_type)
      setSelected(partnerParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, partnerParam])

  const list = useMemo(() => [...food, ...shop], [food, shop])
  const cart = useMemo(
    () => list.find((c) => c.partner.uuid === selected) || list[0],
    [list, selected]
  )

  if (!hydrated) return null

  const empty = !food.length && !shop.length

  if (empty) {
    return (
      <div className="bg-white">
        <Head>
          <title>Savat — MilliyGo</title>
        </Head>
        <TopBar title="Savat" />
        <Page className="max-w-[720px]">
          <div className="flex flex-col items-center px-8 py-16 text-center">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#BBF7D0"
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3.2 9.6h17.6l-1.7 9.2a2 2 0 0 1-2 1.6H6.9a2 2 0 0 1-2-1.6z" />
              <path d="M7.6 9.6 10.6 4M16.4 9.6 13.4 4M9.4 13.2v3.6M12 13.2v3.6M14.6 13.2v3.6" />
            </svg>
            <h1 className="m-0 mt-4 text-[1.25rem] font-[900] text-[#111]">
              Savat hozircha bo&apos;sh
            </h1>
            <p className="mb-5 mt-1.5 text-[0.875rem] leading-[1.4] text-[#6B7280]">
              Restoranlardan mazali taomlar yoki do&apos;konlardan kerakli mahsulotlarni tanlang —
              ular shu yerda paydo bo&apos;ladi
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button href="/restaurants/">Taomlar</Button>
              <Button variant="ghost" href="/store/">
                Do&apos;konlar
              </Button>
            </div>
          </div>
        </Page>
      </div>
    )
  }

  const p = cart?.partner
  const sum = cartSubtotal(cart)
  const saving = cartSaving(cart)
  const pickup = cart?.mode === 'PICKUP'
  const open = p ? isOpenNow(p) : false
  const zone = p ? zoneFor(p, lat, lng) : null
  const fee = p && !pickup ? deliveryFeeFor(p, 0, zone) : 0
  const min = p?.min_order_amount || 0
  const belowMin = min > 0 && sum < min
  const eta = etaRange(zone?.estimated_minutes)
  const count = cartCount(cart)

  const goCheckout = () => {
    if (!cart || !p) return
    if (!open) return void message.info('Muassasa hozir yopiq — buyurtma qabul qilinmaydi')
    if (belowMin)
      return void message.info(`Minimal buyurtma: ${som(min)}. Yana ${som(min - sum)} qo'shing`)
    router.push(`/checkout/?partner=${p.uuid}`)
  }

  const clearCart = () =>
    cart &&
    Modal.confirm({
      title: 'Savatni tozalash',
      content: `${cart.partner.name} savatidagi barcha mahsulotlar o'chiriladi.`,
      okText: 'Tozalash',
      cancelText: 'Bekor qilish',
      okButtonProps: { danger: true },
      centered: true,
      onOk: () => clear(cart.partner.uuid),
    })

  const rowCls =
    'flex min-h-[52px] items-center gap-3 border-0 border-t border-solid border-[#F0F1F3] bg-transparent py-3.5 text-left'

  return (
    <div className="bg-white">
      <Head>
        <title>Savat — MilliyGo</title>
      </Head>
      <TopBar
        title={p?.name || 'Savat'}
        sub={
          cart
            ? pickup
              ? `${som(sum)} · Olib ketish`
              : `${som(sum)}${eta ? ` · ${eta}` : ''}`
            : null
        }
        onClear={cart ? clearCart : undefined}
      />

      <div className="mx-auto w-full max-w-[720px] pb-[200px] lg:max-w-[760px] lg:pb-6">
        {!cart ? (
          <div className="px-8 py-14 text-center">
            <h2 className="m-0 text-[1.125rem] font-[900] text-[#111]">Bu savat bo&apos;sh</h2>
            <p className="mb-4 mt-1 text-[0.875rem] text-[#6B7280]">
              {type === 'SHOP'
                ? "Do'konlardan kerakli mahsulotlarni tanlang"
                : 'Restoranlardan mazali taomlar tanlang'}
            </p>
            <Button href={type === 'SHOP' ? '/store/' : '/restaurants/'}>
              {type === 'SHOP' ? "Do'konlarga" : 'Restoranlarga'}
            </Button>
          </div>
        ) : (
          <>
            {/* Savatlardagi maskanlar (chip) */}
            <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-2 pt-1">
              {list.map((c) => {
                const sel = c.partner.uuid === cart.partner.uuid
                const cz = zoneFor(c.partner, lat, lng)
                const ce = etaRange(cz?.estimated_minutes)
                return (
                  <button
                    key={c.partner.uuid}
                    type="button"
                    onClick={() => {
                      if (sel) return
                      setSelected(c.partner.uuid)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                      router.replace(
                        { pathname: '/cart', query: { partner: c.partner.uuid } },
                        undefined,
                        { shallow: true }
                      )
                    }}
                    className={cx(
                      'shrink-0 cursor-pointer rounded-[18px] px-4 py-2 text-left transition-colors',
                      sel
                        ? 'border-[2.2px] border-solid border-go-green bg-[#F0FDF4]'
                        : 'border-[1.2px] border-solid border-[#E5E7EB] bg-white'
                    )}
                  >
                    <div className="whitespace-nowrap text-[1.031rem] font-[800] text-[#111]">
                      {c.partner.name}
                    </div>
                    {c.mode === 'PICKUP' ? (
                      <div className="mt-px flex items-center gap-[3px] text-[0.8125rem] font-[600] text-go-blue">
                        <IconWalk size={15} /> O&apos;zi olib ketish
                      </div>
                    ) : (
                      <div
                        className={cx(
                          'mt-px flex items-center gap-[3px] whitespace-nowrap text-[0.8125rem]',
                          MUTED
                        )}
                      >
                        <IconScooter size={15} />
                        {sel
                          ? `${som(cartSubtotal(c))}${ce ? ` · ${ce}` : ''}`
                          : ce || som(cartSubtotal(c))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {!open && (
              <div className="px-4 pb-2 pt-1">
                <Notice tone="danger" icon={<IconLock size={18} />}>
                  Muassasa hozir yopiq
                  {opensAtLabel(p!)
                    ? ` · ${opensAtLabel(p!)} da ochiladi`
                    : workingHoursLabel(p!)
                      ? ` · ${workingHoursLabel(p!)}`
                      : ''}
                </Notice>
              </div>
            )}
            {open && belowMin && (
              <div className="px-4 pb-2 pt-1">
                <Notice tone="warn">
                  Minimal buyurtma {som(min)} — yana {som(min - sum)} qo&apos;shing
                </Notice>
              </div>
            )}

            <div className="px-4">
              {cart.lines.map((l, i) => (
                <LineRow key={l.key} cart={cart} line={l} last={i === cart.lines.length - 1} />
              ))}
              {saving > 0 && (
                <div className="flex items-center justify-between pb-2 pt-1 text-[0.875rem] font-[800] text-go-green">
                  <span className="flex items-center gap-1.5">
                    <IconGift size={16} /> Tejovingiz
                  </span>
                  <span>−{som(saving)}</span>
                </div>
              )}
            </div>

            {/* Menyuni ochish · fikr · (restoranda) rejim va anjomlar */}
            <div className="px-4 pt-1">
              <div className="h-px bg-[#F0F1F3]" />
              <Link
                href={partnerHref(cart.partner, pickup)}
                className="mt-3.5 flex h-[54px] items-center justify-center rounded-[18px] bg-[#F2F3F5] text-[1rem] font-[600] text-[#111] no-underline"
              >
                {p!.partner_type === 'SHOP' ? 'Katalogni ochish' : 'Menyuni ochish'}
              </Link>
              <div className="mt-3.5" />
              <button
                type="button"
                onClick={() => {
                  setDraft(cart.comment || '')
                  setCommentOpen(true)
                }}
                className={cx(rowCls, 'w-full cursor-pointer')}
              >
                <span className="text-[#111]">
                  <ChatIcon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[1rem] text-[#111]">
                    {p!.partner_type === 'SHOP' ? "Do'konga fikr" : 'Restoranga fikr'}
                  </span>
                  {cart.comment && (
                    <span className="block truncate text-[0.8125rem] text-go-green">
                      {cart.comment}
                    </span>
                  )}
                </span>
                <IconChevronRight size={24} className="text-[#111]" />
              </button>
            </div>

            <Suggestions cart={cart} onOpen={setProduct} />
          </>
        )}
      </div>

      {cart && p && (
        <DeliveryProgressPanel
          total={sum}
          count={count}
          fee={fee}
          freeThreshold={p.free_delivery_threshold}
          cartHref={`/checkout/?partner=${p.uuid}`}
          pickupAddress={pickup ? p.address || p.name : null}
          actionLabel="To'lovga"
          actionEnabled={open && !belowMin}
          onAction={goCheckout}
          aboveNav
        />
      )}

      {cart && (
        <>
          <Sheet
            open={commentOpen}
            onClose={() => setCommentOpen(false)}
            title={p!.partner_type === 'SHOP' ? "Do'konga fikr" : 'Restoranga fikr'}
            subtitle={
              p!.partner_type === 'SHOP'
                ? 'Masalan: pishgan olmalarni tanlang, sutni yangisidan'
                : "Masalan: piyozsiz, achchiqroq bo'lsin"
            }
            footer={
              <Button
                block
                onClick={() => {
                  setComment(cart.partner.uuid, draft.trim())
                  setCommentOpen(false)
                }}
              >
                Saqlash
              </Button>
            }
          >
            <Input.TextArea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Fikringizni yozing"
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={300}
              showCount
            />
          </Sheet>

          <ProductSheet
            partner={cart.partner}
            closed={!open}
            product={product}
            onClose={() => setProduct(null)}
          />
        </>
      )}
    </div>
  )
}
