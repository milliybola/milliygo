import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PromoBanner } from '../lib/types'
import { cx } from '../lib/utils'
import { partnerHref } from './PartnerCard'

/**
 * Cheksiz aylanadigan reklama karuseli: 7 soniyada keyingisiga o'tadi, surilganda to'xtaydi.
 * Bannerlar 3 nusxada joylashtiriladi; scroll to'xtagach o'rtadagi nusxaga ko'rinmas sakrab qaytiladi.
 */
export default function PromoCarousel({ banners }: { banners: PromoBanner[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [paused, setPaused] = useState(false)

  const n = banners.length
  const loop = n > 1
  const items = loop ? [...banners, ...banners, ...banners] : banners

  /** Bitta nusxaning kengligi va bitta slaydning qadami */
  const metrics = () => {
    const el = ref.current
    const first = el?.children[0] as HTMLElement | undefined
    const second = el?.children[1] as HTMLElement | undefined
    const setStart = el?.children[n] as HTMLElement | undefined
    if (!el || !first || !second || !setStart) return null
    return {
      el,
      stride: second.offsetLeft - first.offsetLeft,
      set: setStart.offsetLeft - first.offsetLeft,
    }
  }

  // Boshlanishda o'rtadagi nusxadan boshlaymiz
  useLayoutEffect(() => {
    if (!loop) return
    const m = metrics()
    if (m) m.el.scrollLeft = m.set
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  // O'lcham o'zgarganda (burilish, resize) joyni saqlab qolamiz
  useEffect(() => {
    const el = ref.current
    if (!loop || !el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      const m = metrics()
      if (m) m.el.scrollLeft = m.set + (m.el.scrollLeft % m.set)
    })
    ro.observe(el)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  useEffect(() => {
    if (!loop || paused) return
    const t = setInterval(() => {
      const m = metrics()
      if (!m) return
      const next = Math.round(m.el.scrollLeft / m.stride) + 1
      m.el.scrollTo({ left: next * m.stride, behavior: 'smooth' })
    }, 7000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, paused])

  useEffect(
    () => () => {
      if (settle.current) clearTimeout(settle.current)
    },
    []
  )

  if (!n) return null

  const onScroll = () => {
    const m = metrics()
    if (!m) return
    if (settle.current) clearTimeout(settle.current)
    settle.current = setTimeout(() => {
      const cur = m.el.scrollLeft
      if (cur < m.set * 0.5 || cur >= m.set * 1.5) {
        // Bir xil joyga (o'rta nusxada) ko'rinmas sakrash
        const wrapped = ((cur % m.set) + m.set) % m.set
        m.el.style.scrollSnapType = 'none'
        m.el.scrollLeft = m.set + wrapped
        requestAnimationFrame(() => {
          m.el.style.scrollSnapType = ''
        })
      }
    }, 150)
  }

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div
        ref={ref}
        onScroll={onScroll}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 lg:scroll-px-0 lg:px-0"
      >
        {items.map((b, i) => {
          const inner = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={b.image}
              alt={b.title || 'Aksiya'}
              className="h-full w-full object-cover object-left"
              loading="lazy"
            />
          )
          const cls = cx(
            'block aspect-[2.3/1] w-full shrink-0 snap-start overflow-hidden rounded-[20px] bg-go-chip lg:aspect-[4/1]'
          )
          return b.partner ? (
            <Link
              key={`${b.id}-${i}`}
              href={partnerHref(b.partner)}
              className={cls}
              aria-label={b.title || b.partner.name}
              aria-hidden={i < n || i >= 2 * n ? true : undefined}
              tabIndex={i < n || i >= 2 * n ? -1 : undefined}
            >
              {inner}
            </Link>
          ) : (
            <div
              key={`${b.id}-${i}`}
              className={cls}
              aria-hidden={loop && (i < n || i >= 2 * n) ? true : undefined}
            >
              {inner}
            </div>
          )
        })}
      </div>
    </div>
  )
}
