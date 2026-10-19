import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { cx, formatSum, som } from '../lib/utils'
import { IconCelebrate, IconChevronRight, IconLock, IconScooter, IconWalk } from '../ui/icons'

/**
 * Restoran sahifasi pastidagi panel (superapp `DeliveryProgressPanel`):
 * savat summasi bepul yetkazish chegarasiga qanchalik yaqinligini ko'rsatadi,
 * savatda mahsulot bo'lsa — to'liq enli "Savatga o'tish" tugmasi bilan.
 */
export default function DeliveryProgressPanel({
  total,
  count,
  fee,
  freeThreshold,
  cartHref,
  pickupAddress,
  actionLabel = "Savatga o'tish",
  actionEnabled = true,
  onAction,
  aboveNav,
  floating,
}: {
  /** Savatdagi mahsulotlar summasi */
  total: number
  count: number
  /** Odatdagi yetkazish narxi */
  fee: number
  /** Bepul yetkazish chegarasi (0 — yo'q) */
  freeThreshold: number
  cartHref: string
  /** Berilsa — "Olib ketish" rejimi */
  pickupAddress?: string | null
  /** Tugma yozuvi: restoranda «Savatga o'tish», savatda «To'lovga» */
  actionLabel?: string
  /** false — tugma kulrang (masalan, minimal summaga yetmagan); bosilganda onAction baribir chaqiriladi */
  actionEnabled?: boolean
  /** Berilsa — havola o'rniga tugma (savat sahifasida to'lovga tekshiruv bilan) */
  onAction?: () => void
  /** Pastki menyu ustida turadi (savat sahifasi) */
  aboveNav?: boolean
  /** Panel ustida o'ngda suzib turadigan element (do'konda — oltin savat tugmasi) */
  floating?: ReactNode
}) {
  const reached = !pickupAddress && freeThreshold > 0 && total >= freeThreshold
  const hasThreshold = freeThreshold > 0
  const progress = hasThreshold ? Math.min(1, total / freeThreshold) : 1
  const left = Math.max(0, freeThreshold - total)

  // Chegaradan endi o'tildi — qisqa "konfetti" (render paytida o'zgarishni aniqlaymiz)
  const [wasReached, setWasReached] = useState(reached)
  const [burstId, setBurstId] = useState(0)
  if (wasReached !== reached) {
    setWasReached(reached)
    if (reached) setBurstId((n) => n + 1)
  }

  let body: ReactNode
  if (count > 0 && pickupAddress) {
    body = (
      <>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1 rounded-[12px] bg-go-blue/10 px-2.5 py-[5px] text-[0.8125rem] font-[800] text-go-blue">
            <IconWalk size={16} /> Olib ketish
          </span>
          <span className="min-w-0 flex-1 truncate text-[0.844rem] font-[600] text-[#374151]">
            {pickupAddress}
          </span>
        </div>
        <CartButton
          count={count}
          total={total}
          href={cartHref}
          label={actionLabel}
          enabled={actionEnabled}
          onAction={onAction}
        />
      </>
    )
  } else if (count > 0) {
    const status = reached
      ? 'Yetkazish bepul'
      : hasThreshold
        ? `Yana ${som(left)} — yetkazish bepul`
        : fee > 0
          ? 'Yetkazish narxi'
          : 'Yetkazish bepul'
    body = (
      <>
        <div className="flex items-center gap-2">
          {reached ? (
            <IconCelebrate size={20} className="text-go-bright" />
          ) : (
            <IconScooter size={20} className="text-go-bright" />
          )}
          <span
            className={cx(
              'min-w-0 flex-1 truncate text-center text-[0.844rem]',
              reached ? 'font-[800] text-go-green' : 'font-[600] text-[#374151]'
            )}
          >
            {status}
          </span>
          {reached && fee > 0 ? (
            <span className="text-[0.781rem] text-[#9CA3AF] line-through">{som(fee)}</span>
          ) : (
            <span className="text-[0.844rem] font-[800] text-go-green">
              {fee > 0 ? som(fee) : "0 so'm"}
            </span>
          )}
        </div>
        {hasThreshold && (
          <div className="mt-2 h-[5px] overflow-hidden rounded-[3px] bg-go-soft">
            <div
              className="h-full rounded-[3px] bg-go-bright transition-[width] duration-500 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}
        <CartButton
          count={count}
          total={total}
          href={cartHref}
          label={actionLabel}
          enabled={actionEnabled}
          onAction={onAction}
        />
      </>
    )
  } else if (pickupAddress) {
    body = (
      <div className="flex items-center gap-2.5">
        <span className="inline-flex items-center gap-1 rounded-[12px] bg-go-blue/10 px-2.5 py-[5px] text-[0.8125rem] font-[800] text-go-blue">
          <IconWalk size={16} /> Olib ketish
        </span>
        <span className="min-w-0 flex-1 truncate text-[0.844rem] font-[600] text-[#374151]">
          {pickupAddress}
        </span>
      </div>
    )
  } else if (reached) {
    body = (
      <div className="flex flex-col items-center">
        <span className="inline-flex items-center gap-1.5 rounded-[18px] bg-go-bright px-3 py-1.5 text-[0.906rem] font-[800] text-white">
          <IconScooter size={18} /> Bepul yetkazish
        </span>
        {fee > 0 && (
          <span className="mt-1 text-[0.8125rem]">
            <span className="font-[600] text-go-bright">Chegirmali</span>
            <span className="text-[#6B7280]">{`  /  chegirmasiz: ${som(fee)}`}</span>
          </span>
        )}
      </div>
    )
  } else if (hasThreshold) {
    body = (
      <>
        <div className="flex items-center gap-2">
          <Courier />
          <span className="text-[1.0625rem] font-[900] text-go-green">{som(fee)}</span>
          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-[4px] bg-[#DCFCE7]">
            <div
              className="h-full rounded-[4px] bg-go-bright transition-[width] duration-500 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="relative rounded-[14px] border-[1.4px] border-solid border-go-bright px-2.5 py-1 text-[0.875rem] font-[800] text-go-green">
            0 so&apos;m
            <span className="absolute -right-1 -top-3.5 -rotate-[4deg] rounded-[5px] bg-go-green px-[5px] py-px text-[0.625rem] font-[900] text-white">
              −100%
            </span>
          </span>
        </div>
        <div className="mt-1.5 truncate text-[0.844rem] text-[#374151]">
          {total === 0
            ? `${som(freeThreshold)} dan boshlanadigan buyurtma uchun bepul`
            : `Bepul yetkazish uchun yana ${som(left)} qo'shing`}
        </div>
      </>
    )
  } else {
    body = (
      <div className="flex items-center justify-center gap-2">
        <Courier />
        <span className="text-[0.938rem] font-[800] text-go-green">
          {fee > 0 ? `Yetkazish: ${som(fee)}` : 'Yetkazish bepul'}
        </span>
      </div>
    )
  }

  return (
    <PanelShell aboveNav={aboveNav}>
      {floating && <div className="absolute bottom-full right-4 mb-2.5">{floating}</div>}
      {body}
      {burstId > 0 && <Confetti key={burstId} />}
    </PanelShell>
  )
}

/** Yopiq muassasa: pastki chiziq */
export function ClosedBar({ hours }: { hours: string | null }) {
  return (
    <PanelShell>
      <div className="flex items-center justify-center gap-2 py-1 text-[0.938rem] font-[800] text-[#6B7280]">
        <IconLock size={20} className="text-[#9CA3AF]" />
        {hours ? `Yopiq · ${hours}` : 'Hozir yopiq'}
      </div>
    </PanelShell>
  )
}

function PanelShell({ children, aboveNav }: { children: ReactNode; aboveNav?: boolean }) {
  return (
    <div
      className={cx(
        'fixed inset-x-0 z-[60] lg:sticky lg:inset-x-auto lg:bottom-4 lg:mt-4 lg:px-6',
        aboveNav ? 'bottom-[calc(66px+env(safe-area-inset-bottom))]' : 'bottom-0'
      )}
    >
      <div
        className={cx(
          'relative mx-auto w-full max-w-[720px] rounded-t-[22px] bg-white px-4 pt-2.5 shadow-[0_-3px_16px_rgba(0,0,0,0.06)] lg:max-w-[560px] lg:rounded-[22px] lg:pb-2.5 lg:shadow-[0_8px_30px_rgba(0,0,0,0.14)]',
          aboveNav ? 'pb-2.5' : 'pb-[max(10px,env(safe-area-inset-bottom))]'
        )}
      >
        {children}
      </div>
    </div>
  )
}
function Courier() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-go-green text-white">
      <IconScooter size={17} />
    </span>
  )
}

/** [N] Savatga o'tish ............ 60 000 so'm › */
function CartButton({
  count,
  total,
  href,
  label,
  enabled,
  onAction,
}: {
  count: number
  total: number
  href: string
  label: string
  enabled: boolean
  onAction?: () => void
}) {
  const cls = cx(
    'mt-3 flex h-[54px] w-full cursor-pointer items-center gap-3 rounded-[16px] border-0 px-3 text-left text-white no-underline',
    enabled ? 'bg-go-green shadow-[0_4px_12px_rgba(21,128,61,0.4)]' : 'bg-[#B8BEC6]'
  )
  const inner = (
    <>
      <span className="flex h-[30px] min-w-[30px] items-center justify-center rounded-[15px] bg-white/20 px-2 text-[0.938rem] font-[900]">
        {count}
      </span>
      <span className="min-w-0 flex-1 truncate text-[1.031rem] font-[800]">{label}</span>
      <span className="text-[1.031rem] font-[900]">{formatSum(total)} so&apos;m</span>
      <IconChevronRight size={24} className="-ml-1" />
    </>
  )
  if (onAction)
    return (
      <button type="button" onClick={onAction} className={cls}>
        {inner}
      </button>
    )
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  )
}
const CONFETTI = Array.from({ length: 26 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 7919 + n * 131) + 1) / 2) % 1
  return {
    left: `${Math.round(r(1) * 100)}%`,
    dx: `${Math.round((r(2) - 0.5) * 90)}px`,
    rot: `${Math.round((r(3) - 0.5) * 720)}deg`,
    dur: `${(1.1 + r(4) * 0.5).toFixed(2)}s`,
    w: 5 + Math.round(r(5) * 6),
    color: ['#16A34A', '#22C55E', '#FFD12B', '#15803D'][i % 4],
  }
})

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-2 h-0" aria-hidden>
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="absolute rounded-[1.5px]"
          style={
            {
              left: c.left,
              top: 0,
              width: c.w,
              height: c.w * 0.45,
              background: c.color,
              animation: `goConfetti ${c.dur} ease-out forwards`,
              ['--dx' as string]: c.dx,
              ['--rot' as string]: c.rot,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
