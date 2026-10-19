import { Input } from 'antd'
import { useQuery } from '@tanstack/react-query'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import PartnerCard from '../components/PartnerCard'
import { search } from '../lib/api'
import { useBaseCategories } from '../lib/queries'
import { useQueryParam } from '../lib/route'
import { useUserLocation } from '../lib/session'
import type { PartnerType } from '../lib/types'
import { cx, som } from '../lib/utils'
import { IconSearch } from '../ui/icons'
import { BackButton, Chip, EmptyState, Img, Page, SectionTitle, Skeleton } from '../ui/primitives'

const RECENT_KEY = 'go_recent_search'

function useDebounced<T>(v: T, ms = 350) {
  const [d, setD] = useState(v)
  useEffect(() => {
    const t = setTimeout(() => setD(v), ms)
    return () => clearTimeout(t)
  }, [v, ms])
  return d
}

export default function SearchPage() {
  const router = useRouter()
  const initial = useQueryParam('q') || ''
  const [text, setText] = useState(initial)
  const [type, setType] = useState<PartnerType | 'ALL'>('ALL')
  const [recent, setRecent] = useState<string[]>([])
  const q = useDebounced(text.trim())
  const { lat, lng } = useUserLocation()
  const cats = useBaseCategories('RESTAURANT')

  useEffect(() => {
    if (initial && !text) setText(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial])
  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'))
    } catch {
      setRecent([])
    }
  }, [])

  const res = useQuery({
    queryKey: ['go', 'search', q, type],
    queryFn: () => search(q, type === 'ALL' ? undefined : type),
    enabled: q.length >= 2,
    staleTime: 60 * 1000,
  })

  useEffect(() => {
    if (q.length < 2) return
    router.replace({ pathname: '/search', query: { q } }, undefined, { shallow: true })
    if (res.isSuccess) {
      const next = [q, ...recent.filter((r) => r !== q)].slice(0, 8)
      setRecent(next)
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, res.isSuccess])

  const partners = res.data?.partners || []
  const products = res.data?.products || []

  return (
    <Page className="max-w-[900px] pb-8 pt-3">
      <Head>
        <title>Qidiruv — MilliyGo</title>
      </Head>
      <div className="flex items-center gap-2">
        <BackButton />
        <Input
          autoFocus
          size="large"
          value={text}
          onChange={(e) => setText(e.target.value)}
          prefix={<IconSearch size={20} />}
          allowClear
          placeholder="Taom, restoran yoki mahsulot qidirish..."
          className="!h-12 flex-1 !rounded-full !border-0 !bg-go-chip"
        />
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {(
          [
            ['ALL', 'Hammasi'],
            ['RESTAURANT', 'Taomlar'],
            ['SHOP', "Do'konlar"],
          ] as const
        ).map(([v, l]) => (
          <Chip key={v} active={type === v} onClick={() => setType(v)}>
            {l}
          </Chip>
        ))}
      </div>

      {q.length < 2 ? (
        <>
          {recent.length > 0 && (
            <section className="mt-6">
              <SectionTitle
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setRecent([])
                      localStorage.removeItem(RECENT_KEY)
                    }}
                    className="cursor-pointer border-0 bg-transparent text-[0.875rem] font-[700] text-go-muted"
                  >
                    Tozalash
                  </button>
                }
              >
                Oxirgi qidiruvlar
              </SectionTitle>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <Chip key={r} onClick={() => setText(r)}>
                    {r}
                  </Chip>
                ))}
              </div>
            </section>
          )}
          {(cats.data || []).length > 0 && (
            <section className="mt-6">
              <SectionTitle>Mashhur toifalar</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {(cats.data || []).map((c) => (
                  <Chip key={c.uuid} onClick={() => setText(c.name)}>
                    {c.name}
                  </Chip>
                ))}
              </div>
            </section>
          )}
        </>
      ) : res.isLoading ? (
        <div className="mt-5 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : !partners.length && !products.length ? (
        <EmptyState
          emoji="🔍"
          title="Hech narsa topilmadi"
          text={`"${q}" bo'yicha natija yo'q. Boshqa so'z bilan urinib ko'ring.`}
        />
      ) : (
        <>
          {partners.length > 0 && (
            <section className="mt-6">
              <SectionTitle>Maskanlar</SectionTitle>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {partners.map((p) => (
                  <PartnerCard key={p.uuid} partner={p} lat={lat} lng={lng} />
                ))}
              </div>
            </section>
          )}
          {products.length > 0 && (
            <section className="mt-6">
              <SectionTitle>Mahsulotlar</SectionTitle>
              <div className="divide-y divide-solid divide-go-line">
                {products.map((p) => {
                  const final =
                    p.discount > 0 ? Math.round((p.price * (100 - p.discount)) / 100) : p.price
                  return (
                    <Link
                      key={p.uuid}
                      href={
                        p.partner_type === 'SHOP'
                          ? `/store/?id=${p.partner_uuid}`
                          : `/restaurant/?id=${p.partner_uuid}`
                      }
                      className="flex items-center gap-3 py-3 text-inherit no-underline"
                    >
                      <Img src={p.image} alt="" className="h-16 w-16 shrink-0 rounded-[16px]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.9688rem] font-[700] text-go-ink">
                          {p.name}
                        </span>
                        <span className="flex items-center gap-1.5 text-[0.8125rem] text-go-muted">
                          <Img src={p.partner_logo} alt="" className="h-4 w-4 rounded-full" />
                          <span className="truncate">{p.partner_name}</span>
                        </span>
                      </span>
                      <span
                        className={cx(
                          'shrink-0 text-[0.9375rem] font-[900]',
                          final < p.price ? 'text-go-red' : 'text-go-ink'
                        )}
                      >
                        {som(final)}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}
    </Page>
  )
}
