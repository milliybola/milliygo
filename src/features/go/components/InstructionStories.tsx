import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStorageValue, writeStorage } from '../lib/session'
import { cx } from '../lib/utils'
import { IconChevronRight, IconClose } from '../ui/icons'
import { Sheet, useIsMobile } from '../ui/primitives'

interface StoryGroup {
  id: string
  label: string
  image: string
  color: string
  pages: { title: string; description: string }[]
}

/** Superapp instruction_stories.dart dagi qo'llanma (statik matn — API kerak emas) */
const GROUPS: StoryGroup[] = [
  {
    id: 'ordering',
    label: 'Buyurtma',
    image: '/go/story_order.webp',
    color: '#F97316',
    pages: [
      {
        title: "Taomlar bo'limini oching",
        description: 'Bosh sahifadagi "Taomlar" kartasini bosing.',
      },
      {
        title: 'Restoran tanlang',
        description: "Yoqtirgan restoran yoki oshxonangizni ro'yxatdan tanlang.",
      },
      {
        title: "Taomlarni savatga qo'shing",
        description: 'Menyudan kerakli taomlarni tanlab, miqdorini belgilang.',
      },
      {
        title: 'Buyurtmani rasmiylashtiring',
        description: 'Yetkazib berish manzilini tasdiqlab, buyurtma bering.',
      },
      {
        title: "Do'konlardan ham xarid qiling",
        description: 'Xuddi shu tartibda "Do\'konlar" bo\'limidan kerakli mahsulotlarni tanlang.',
      },
    ],
  },
  {
    id: 'pickup',
    label: 'Olib ketish',
    image: '/go/story_pickup.webp',
    color: '#2563EB',
    pages: [
      {
        title: "Restorandan o'zingiz oling",
        description:
          'Taomlar bo\'limidagi "Olib ketishga" tabidan restoran tanlang — yetkazish narxi to\'lanmaydi.',
      },
      {
        title: "Restoranga yo'l ko'rsatamiz",
        description: 'Buyurtma sahifasidagi "Restoranga borish" tugmasi xarita ilovasini ochadi.',
      },
    ],
  },
  {
    id: 'free_delivery',
    label: 'Bepul',
    image: '/go/story_free_delivery.webp',
    color: '#16A34A',
    pages: [
      {
        title: "Yetkazish bepul bo'lishi mumkin",
        description:
          "Ayrim restoranlar ma'lum summadan yuqori buyurtmani bepul yetkazadi — savatda qancha qolgani ko'rinadi.",
      },
    ],
  },
  {
    id: 'payment',
    label: "To'lov",
    image: '/go/story_payment.webp',
    color: '#0D9488',
    pages: [
      {
        title: "Naqd pul bilan to'lov",
        description:
          "Hozircha to'lov naqd pulda: buyurtmani qabul qilganingizda kuryerga yoki restoranda to'laysiz.",
      },
      {
        title: "Qaytim tayyor bo'ladi",
        description:
          'Buyurtma berishda "Qaytim kerakmi?" qatoridan kupyurani tanlang — kuryer qaytimni tayyorlab keladi.',
      },
    ],
  },
  {
    id: 'fast_delivery',
    label: 'Kuzatish',
    image: '/go/story_fast.webp',
    color: '#D97706',
    pages: [
      {
        title: 'Buyurtma holatini kuzating',
        description: "Buyurtma sahifasida holat, kuryer va uning transporti ko'rinadi.",
      },
    ],
  },
]

const SEEN_KEY = 'go_story_seen'

export default function InstructionStories() {
  const raw = useStorageValue(SEEN_KEY)
  const seen = useMemo<string[]>(() => {
    try {
      return JSON.parse(raw || '[]')
    } catch {
      return []
    }
  }, [raw])
  const [active, setActive] = useState<StoryGroup | null>(null)
  const [page, setPage] = useState(0)
  const mobile = useIsMobile()

  // Telefon/planshetda to'liq ekran: sahifa aylanmasin, Esc bilan yopiladi
  useEffect(() => {
    if (!active || !mobile) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [active, mobile])

  const openGroup = (g: StoryGroup) => {
    setActive(g)
    setPage(0)
    writeStorage(SEEN_KEY, JSON.stringify(Array.from(new Set([...seen, g.id]))))
  }

  const close = () => setActive(null)
  const prevPage = () => setPage((p) => Math.max(0, p - 1))
  const next = () => {
    if (!active) return
    if (page < active.pages.length - 1) setPage(page + 1)
    else {
      const i = GROUPS.findIndex((g) => g.id === active.id)
      if (i < GROUPS.length - 1) openGroup(GROUPS[i + 1])
      else close()
    }
  }

  return (
    <>
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 lg:px-0">
        {GROUPS.map((g) => {
          const isSeen = seen.includes(g.id)
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => openGroup(g)}
              className="flex w-[76px] shrink-0 cursor-pointer flex-col items-center gap-1.5 border-0 bg-transparent p-0"
            >
              <span
                className="rounded-full p-[3px]"
                style={{
                  background: isSeen
                    ? '#E5E7EB'
                    : 'conic-gradient(#FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5, #FEDA75)',
                }}
              >
                <span className="block rounded-full bg-white p-[2px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.image}
                    alt=""
                    className="block h-[62px] w-[62px] rounded-full object-cover"
                  />
                </span>
              </span>
              <span
                className={cx(
                  'text-[0.7812rem] font-[700]',
                  isSeen ? 'text-go-muted' : 'text-go-ink'
                )}
              >
                {g.label}
              </span>
            </button>
          )
        })}
      </div>

      {mobile &&
        active &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={active.label}
            className="fixed inset-0 z-[1000] flex h-[100dvh] w-screen flex-col overflow-hidden text-white"
            style={{ background: `linear-gradient(160deg, ${active.color}, #111)` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
            {/* Chap / o'ng chetga bosib sahifalarni almashtirish (Instagram kabi) */}
            <button
              type="button"
              aria-label="Oldingi"
              onClick={prevPage}
              className="absolute inset-y-0 left-0 z-[1] w-1/3 cursor-pointer border-0 bg-transparent"
            />
            <button
              type="button"
              aria-label="Keyingi"
              onClick={next}
              className="absolute inset-y-0 right-0 z-[1] w-2/3 cursor-pointer border-0 bg-transparent"
            />
            <div className="pointer-events-none relative z-[2] mx-auto flex h-full w-full max-w-[560px] flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(14px,env(safe-area-inset-top))]">
              <div className="flex gap-1">
                {active.pages.map((_, i) => (
                  <span
                    key={i}
                    className={cx(
                      'h-1 flex-1 rounded-full',
                      i <= page ? 'bg-white' : 'bg-white/35'
                    )}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[0.8125rem] font-[700] uppercase tracking-wide opacity-90">
                  {active.label}
                </span>
                <button
                  type="button"
                  aria-label="Yopish"
                  onClick={close}
                  className="pointer-events-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-black/30 text-white"
                >
                  <IconClose size={20} />
                </button>
              </div>
              <div className="mt-auto">
                <h3 className="m-0 text-[1.75rem] font-[900] leading-tight tracking-[-0.5px]">
                  {active.pages[page].title}
                </h3>
                <p className="mb-6 mt-2.5 text-[1.0625rem] leading-relaxed !text-white/90">
                  {active.pages[page].description}
                </p>
                <button
                  type="button"
                  onClick={next}
                  className="pointer-events-auto flex min-h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-[16px] border-0 bg-white text-[1rem] font-[800] text-go-ink"
                >
                  {page < active.pages.length - 1 ||
                  GROUPS.findIndex((g) => g.id === active.id) < GROUPS.length - 1
                    ? 'Keyingisi'
                    : 'Tushunarli'}{' '}
                  <IconChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      <Sheet open={!!active && !mobile} onClose={close} width={420} bodyClassName="!px-0 !pb-0">
        {active && (
          <div
            className="relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[24px] p-6 text-white lg:m-0"
            style={{ background: `linear-gradient(160deg, ${active.color}, #111)` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-x-4 top-4 flex gap-1">
              {active.pages.map((_, i) => (
                <span
                  key={i}
                  className={cx('h-1 flex-1 rounded-full', i <= page ? 'bg-white' : 'bg-white/35')}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Yopish"
              onClick={close}
              className="absolute right-3 top-7 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-black/30 text-white"
            >
              <IconClose size={20} />
            </button>
            <div className="relative">
              <div className="mb-1 text-[0.8125rem] font-[700] uppercase tracking-wide opacity-80">
                {active.label}
              </div>
              <h3 className="m-0 text-[1.625rem] font-[900] leading-tight tracking-[-0.5px]">
                {active.pages[page].title}
              </h3>
              <p className="mb-5 mt-2 text-[1rem] leading-relaxed opacity-90">
                {active.pages[page].description}
              </p>
              <button
                type="button"
                onClick={next}
                className="flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-[16px] border-0 bg-white text-[1rem] font-[800] text-go-ink"
              >
                Keyingisi <IconChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </>
  )
}
