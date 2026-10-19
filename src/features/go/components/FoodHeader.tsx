import Link from 'next/link'
import { useUi, useUserLocation } from '../lib/session'
import { useFavoriteIds } from '../lib/favorites'
import { IconChevronRight, IconClose, IconHeart } from '../ui/icons'

/**
 * Superapp `_FoodHeader`: logotip, sarlavha ("Taomlar" / "Do'konlar"), manzil, sevimlilar va yopish.
 * Telefon/planshetda umumiy sayt sarlavhasi o'rniga turadi (kompyuterda ko'rinmaydi).
 */
export default function FoodHeader({ title }: { title: string }) {
  const { address, hasLocation } = useUserLocation()
  const setLocationOpen = useUi((s) => s.setLocationOpen)
  const { ids } = useFavoriteIds()
  const count = ids.length

  return (
    <div className="sticky top-0 z-[60] bg-white/[0.97] backdrop-blur lg:hidden">
      <div className="mx-auto flex h-16 w-full max-w-[720px] items-center gap-3 px-4">
        <Link
          href="/"
          aria-label="MilliyGo — bosh sahifa"
          className="shrink-0 rounded-full shadow-[0_3px_10px_rgba(21,128,61,0.18)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/go/logo.png"
            alt=""
            className="block h-[50px] w-[50px] rounded-full object-cover"
          />
        </Link>
        <button
          type="button"
          onClick={() => setLocationOpen(true)}
          className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left"
        >
          <span className="block text-[1.625rem] font-[800] leading-[1.1] tracking-[-0.5px] text-[#111]">
            {title}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5">
            <span className="truncate text-[0.875rem] font-[500] text-[#6B7280]">
              {hasLocation ? address || 'Tanlangan manzil' : 'Manzilni tanlang'}
            </span>
            <span className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-[#1F2937] text-white">
              <IconChevronRight size={13} />
            </span>
          </span>
        </button>
        <Link
          href="/favorites/"
          aria-label="Sevimlilar"
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EDEEF0] no-underline"
        >
          <IconHeart
            size={20}
            filled={count > 0}
            className={count > 0 ? 'text-go-red' : 'text-[#4B5563]'}
          />
          {count > 0 && (
            <span className="absolute -right-[3px] -top-[3px] flex h-4 min-w-[16px] items-center justify-center rounded-lg border-[1.5px] border-solid border-white bg-go-green px-[3px] text-[0.5625rem] font-[800] leading-none text-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Link>
        <Link
          href="/"
          aria-label="Yopish"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EDEEF0] text-[#4B5563] no-underline"
        >
          <IconClose size={22} />
        </Link>
      </div>
    </div>
  )
}
