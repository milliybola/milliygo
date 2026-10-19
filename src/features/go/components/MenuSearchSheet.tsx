import { Input } from 'antd'
import { useMemo, useState } from 'react'
import type { Product } from '../lib/types'
import { som } from '../lib/utils'
import { IconSearch } from '../ui/icons'
import { Img, Sheet } from '../ui/primitives'

export default function MenuSearchSheet({
  open,
  onClose,
  products,
  onPick,
  placeholder = 'Menyudan qidirish',
}: {
  open: boolean
  onClose: () => void
  products: Product[]
  onPick: (p: Product) => void
  placeholder?: string
}) {
  const [q, setQ] = useState('')
  const found = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return products.slice(0, 30)
    return products.filter(
      (p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)
    )
  }, [q, products])
  return (
    <Sheet open={open} onClose={onClose} title={placeholder}>
      <Input
        autoFocus
        size="large"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        allowClear
        prefix={<IconSearch size={18} />}
        placeholder="Nomini yozing"
        className="!rounded-full !border-0 !bg-go-chip"
      />
      <div className="mt-3 max-h-[55vh] overflow-y-auto">
        {found.length === 0 ? (
          <p className="py-8 text-center text-go-muted">Hech narsa topilmadi</p>
        ) : (
          found.map((p) => (
            <button
              key={p.uuid}
              type="button"
              onClick={() => {
                onPick(p)
                onClose()
              }}
              className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent py-2 text-left"
            >
              <Img src={p.image} alt="" className="h-14 w-14 shrink-0 rounded-[14px]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.9375rem] font-[600] text-go-ink">
                  {p.name}
                </span>
                <span
                  className={
                    p.final_price < p.price
                      ? 'text-[0.875rem] font-[800] text-go-red'
                      : 'text-[0.875rem] font-[800] text-go-ink'
                  }
                >
                  {som(p.final_price)}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </Sheet>
  )
}
