import { useMemo, useState, type ReactNode } from 'react'
import type { PartnerFilters } from '../lib/types'
import { cx } from '../lib/utils'
import {
  IconBolt,
  IconClose,
  IconMoon,
  IconSliders,
  IconStar,
  IconTag,
  IconTruck,
} from '../ui/icons'

export type FilterKey = 'fast' | 'allday' | 'top' | 'promo' | 'free'

/** Chip → GET /partner/ so'rov parametri (Taomlar/Do'konlar va bosh sahifada bir xil) */
export const FILTER_PARAM: Record<FilterKey, keyof PartnerFilters> = {
  fast: 'fast',
  allday: 'all_day',
  top: 'top_rated',
  promo: 'promo',
  free: 'free_delivery',
}

const FILTERS: { key: FilterKey; label: string; icon: (on: boolean) => ReactNode }[] = [
  {
    key: 'fast',
    label: '30 daqiqagacha',
    icon: (on) => <IconBolt size={17} className={on ? '' : 'text-[#1F2937]'} />,
  },
  {
    key: 'allday',
    label: 'Tun-u kun',
    icon: (on) => <IconMoon size={17} className={on ? '' : 'text-[#1F2937]'} />,
  },
  {
    key: 'top',
    label: 'Reyting 4.5+',
    icon: (on) => <IconStar size={17} className={on ? '' : 'text-go-gold'} />,
  },
  {
    key: 'promo',
    label: 'Aksiya',
    icon: (on) => <IconTag size={17} className={on ? '' : 'text-[#1F2937]'} />,
  },
  {
    key: 'free',
    label: 'Bepul yetkazish',
    icon: (on) => <IconTruck size={17} className={on ? '' : 'text-[#1F2937]'} />,
  },
]

/** Tanlangan filtrlar holati va ularni server so'rovi parametrlariga aylantirish */
export function usePartnerFilters(disabled = false) {
  const [filters, setFilters] = useState<FilterKey[]>([])
  const serverFilters = useMemo<PartnerFilters>(
    () => (disabled ? {} : Object.fromEntries(filters.map((f) => [FILTER_PARAM[f], true]))),
    [filters, disabled]
  )
  const toggle = (f: FilterKey) =>
    setFilters((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]))
  return { filters, setFilters, toggle, serverFilters, hasActive: filters.length > 0 }
}

/** Superapp `_QuickFiltersBar`: birinchi doira — filtr belgisi / hammasini tozalash (✕), keyin chiplar */
export default function PartnerFilterBar({
  filters,
  onToggle,
  onReset,
  className,
}: {
  filters: FilterKey[]
  onToggle: (f: FilterKey) => void
  onReset: () => void
  className?: string
}) {
  const hasActive = filters.length > 0
  return (
    <div className={cx('no-scrollbar flex h-10 gap-2 overflow-x-auto', className)}>
      <button
        type="button"
        aria-label={hasActive ? 'Filtrlarni tozalash' : 'Filtrlar'}
        onClick={() => hasActive && onReset()}
        className={cx(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-0 transition-colors',
          hasActive
            ? 'cursor-pointer bg-go-green text-white'
            : 'cursor-default bg-[#F2F3F5] text-[#1F2937]'
        )}
      >
        {hasActive ? <IconClose size={20} /> : <IconSliders size={20} />}
      </button>
      {FILTERS.map((f) => {
        const on = filters.includes(f.key)
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => onToggle(f.key)}
            aria-pressed={on}
            className={cx(
              'flex h-10 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[20px] border-0 px-3.5 text-[0.844rem] font-[600] transition-colors',
              on ? 'bg-go-green text-white' : 'bg-[#F2F3F5] text-[#1F2937]'
            )}
          >
            {f.icon(on)}
            {f.label}
          </button>
        )
      })}
    </div>
  )
}
