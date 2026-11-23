import { useMemo, useState } from 'react'
import type { ProductOptionGroup, SelectedOption } from '../lib/types'
import { cx, som } from '../lib/utils'
import { IconCheck } from '../ui/icons'

const availableCount = (g: ProductOptionGroup) => g.options.filter((o) => o.is_available).length

/** Guruhdagi eng kam majburiy tanlov (mavjud opsiyalardan ko'p talab qilinmaydi — server ham shunday) */
const needed = (g: ProductOptionGroup) => Math.min(g.min_select, availableCount(g))

/**
 * Tanlov holati: guruh uuid → tanlangan opsiya uuid'lari.
 * `resetKey` o'zgarganda (boshqa mahsulot ochilganda) tanlov tozalanadi.
 */
/** Majburiy bitta tanlov (o'lcham kabi) — doim biror variant tanlangan bo'ladi */
const isRequiredSingle = (g: ProductOptionGroup) => g.max_select === 1 && needed(g) >= 1

/** Boshlang'ich tanlov: majburiy bitta tanlovli guruhda birinchi mavjud variant (odatda eng arzoni) */
function defaultPicks(groups: ProductOptionGroup[]): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const g of groups) {
    if (!isRequiredSingle(g)) continue
    const first = g.options.find((o) => o.is_available)
    if (first) out[g.uuid] = [first.uuid]
  }
  return out
}

/**
 * Narxni belgilaydigan guruh (o'lcham): majburiy, bitta tanlov, variant narxlari har xil.
 * Menyu kartasida narxlar «110 000 / 130 000 so'm» ko'rinishida chiqadi.
 */
export function variantPrices(base: number, groups: ProductOptionGroup[] | undefined): number[] {
  const g = (groups || []).find(
    (x) =>
      isRequiredSingle(x) &&
      new Set(x.options.filter((o) => o.is_available).map((o) => o.price_delta)).size > 1
  )
  if (!g) return []
  const prices = g.options.filter((o) => o.is_available).map((o) => base + o.price_delta)
  return Array.from(new Set(prices)).sort((a, b) => a - b)
}

export function useOptionSelection(groups: ProductOptionGroup[], resetKey: string) {
  const defaults = useMemo(() => defaultPicks(groups), [groups])
  // Tanlov o'z kaliti bilan saqlanadi: boshqa mahsulot ochilsa eski tanlov avtomatik "eskirgan" bo'ladi
  const [state, setState] = useState<{ key: string; picked: Record<string, string[]> } | null>(null)
  const picked = state && state.key === resetKey ? state.picked : defaults

  const toggle = (g: ProductOptionGroup, optionUuid: string) =>
    setState((prev) => {
      const base = prev && prev.key === resetKey ? prev.picked : defaults
      const current = base[g.uuid] || []
      let next = base
      if (current.includes(optionUuid)) {
        // Bitta majburiy tanlovni bekor qilib bo'lmaydi — faqat boshqasiga almashtiriladi
        if (!(g.max_select === 1 && g.min_select >= 1))
          next = { ...base, [g.uuid]: current.filter((u) => u !== optionUuid) }
      } else if (g.max_select === 1) next = { ...base, [g.uuid]: [optionUuid] }
      else if (current.length < g.max_select) next = { ...base, [g.uuid]: [...current, optionUuid] }
      return { key: resetKey, picked: next }
    })

  const selected = useMemo<SelectedOption[]>(
    () =>
      groups.flatMap((g) =>
        g.options
          .filter((o) => (picked[g.uuid] || []).includes(o.uuid))
          .map((o) => ({
            uuid: o.uuid,
            group_name: g.name,
            name: o.name,
            price_delta: o.price_delta,
          }))
      ),
    [groups, picked]
  )

  const missing = groups.find((g) => (picked[g.uuid]?.length || 0) < needed(g)) || null

  return { picked, toggle, selected, valid: !missing, missing }
}

function hint(g: ProductOptionGroup) {
  const need = needed(g)
  if (g.max_select === 1) return need >= 1 ? '' : 'Ixtiyoriy'
  if (need >= 1)
    return need === g.max_select
      ? `Majburiy · ${g.max_select} tasini tanlang`
      : `Majburiy · kamida ${need} ta, ko'pi bilan ${g.max_select} ta`
  return `Ixtiyoriy · ko'pi bilan ${g.max_select} ta`
}

export default function OptionGroups({
  groups,
  picked,
  onToggle,
  highlight,
  basePrice,
}: {
  groups: ProductOptionGroup[]
  picked: Record<string, string[]>
  onToggle: (g: ProductOptionGroup, optionUuid: string) => void
  /** Majburiy, lekin to'ldirilmagan guruh — qizil ajratiladi */
  highlight?: ProductOptionGroup | null
  /** Opsiyasiz narx: o'lcham tugmalarida «+20 000» emas, to'liq narx ko'rsatiladi */
  basePrice?: number
}) {
  const deltaOf = (g: ProductOptionGroup) =>
    g.options
      .filter((o) => (picked[g.uuid] || []).includes(o.uuid))
      .reduce((sum, o) => sum + o.price_delta, 0)
  const allExtra = groups.reduce((sum, g) => sum + deltaOf(g), 0)

  return (
    <div className="mt-5 space-y-5">
      {groups.map((g) => {
        const chosen = picked[g.uuid] || []
        const radio = g.max_select === 1
        const full = !radio && chosen.length >= g.max_select
        const warn = highlight?.uuid === g.uuid
        if (radio) {
          // Bitta tanlov — katta tugmalar: nomi va (majburiy bo'lsa) to'liq narxi
          const required = needed(g) >= 1
          const others = basePrice !== undefined ? basePrice + allExtra - deltaOf(g) : null
          const priced = g.options.some((o) => o.price_delta > 0)
          return (
            <div key={g.uuid}>
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-[1.0625rem] font-[800] text-go-ink">{g.name}</div>
                {hint(g) && (
                  <div
                    className={cx(
                      'shrink-0 text-[0.8125rem] font-[700]',
                      warn ? 'text-go-red' : 'text-go-muted'
                    )}
                  >
                    {hint(g)}
                  </div>
                )}
              </div>
              <div
                className={cx(
                  'mt-2 grid gap-2',
                  g.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
                )}
              >
                {g.options.map((o) => {
                  const on = chosen.includes(o.uuid)
                  const price = !o.is_available
                    ? 'Mavjud emas'
                    : required && others !== null && priced
                      ? som(others + o.price_delta)
                      : o.price_delta > 0
                        ? `+${som(o.price_delta)}`
                        : ''
                  return (
                    <button
                      key={o.uuid}
                      type="button"
                      disabled={!o.is_available}
                      aria-pressed={on}
                      onClick={() => onToggle(g, o.uuid)}
                      className={cx(
                        'flex min-h-[56px] cursor-pointer flex-col items-center justify-center rounded-[14px] border-2 border-solid px-2 py-2 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-45',
                        on
                          ? 'border-go-green bg-[#ECFDF3] text-go-ink'
                          : warn
                            ? 'border-go-red bg-white text-go-ink'
                            : 'border-go-line bg-white text-go-ink'
                      )}
                    >
                      <span className="text-[0.9375rem] font-[800] leading-tight">{o.name}</span>
                      {price && (
                        <span
                          className={cx(
                            'mt-0.5 whitespace-nowrap text-[0.8125rem] font-[700]',
                            on ? 'text-go-green' : 'text-go-muted'
                          )}
                        >
                          {price}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        }
        return (
          <div key={g.uuid}>
            <div className="flex items-baseline justify-between gap-3">
              <div className="text-[1.0625rem] font-[800] text-go-ink">{g.name}</div>
              <div
                className={cx(
                  'shrink-0 text-[0.8125rem] font-[700]',
                  warn ? 'text-go-red' : 'text-go-muted'
                )}
              >
                {hint(g)}
              </div>
            </div>
            <div className="mt-1.5 border-0 border-t border-solid border-go-line">
              {g.options.map((o) => {
                const on = chosen.includes(o.uuid)
                const disabled = !o.is_available || (full && !on)
                return (
                  <button
                    key={o.uuid}
                    type="button"
                    disabled={disabled}
                    aria-pressed={on}
                    onClick={() => onToggle(g, o.uuid)}
                    className="flex min-h-[52px] w-full cursor-pointer items-center gap-3 border-0 border-b border-solid border-go-line bg-transparent px-0 py-2 text-left disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <span
                      className={cx(
                        'flex h-6 w-6 shrink-0 items-center justify-center border-2 border-solid',
                        radio ? 'rounded-full' : 'rounded-[7px]',
                        on ? 'border-go-green bg-go-green text-white' : 'border-[#CBD5E1] bg-white'
                      )}
                    >
                      {on && <IconCheck size={15} />}
                    </span>
                    <span className="min-w-0 flex-1 text-[0.9375rem] font-[600] text-go-ink">
                      {o.name}
                    </span>
                    <span className="shrink-0 text-[0.875rem] font-[700] text-go-muted">
                      {!o.is_available
                        ? 'Mavjud emas'
                        : o.price_delta > 0
                          ? `+${som(o.price_delta)}`
                          : ''}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
