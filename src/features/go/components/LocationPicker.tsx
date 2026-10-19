import { useQuery } from '@tanstack/react-query'
import { message } from 'antd'
import { Map, Placemark, Polygon, useYMaps } from '@pbe/react-yandex-maps'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { DEFAULT_MAP_CENTER } from '@/constants/location'
import { checkServiceArea } from '@/helpers/location-helper'
import { useNeighborhoods } from '@/hooks/useNeighborhoods'
import { LocationService, type PopularLocation } from '@/services/location-service'
import { useLocationStore } from '@/store/useLocationStore'
import { fetchAddresses } from '../lib/api'
import { reverseGeocode } from '../lib/geocode'
import { useSession, writeStorage } from '../lib/session'
import { cx } from '../lib/utils'
import { IconBack, IconChevronRight, IconClose, IconPin, IconSearch } from '../ui/icons'

/** Superapp `LocationResult` ning veb varianti */
interface LocResult {
  title: string
  subtitle: string
  lat: number | null
  lng: number | null
  inside: boolean
  uuid?: string
  locationType?: string
  orientir?: string
  address?: string
  kind?: 'home' | 'work' | 'saved'
}

const HISTORY_KEY = 'go_location_history'

const CATEGORIES = [
  { key: '', label: 'Barchasi' },
  { key: 'GOVERNMENT', label: 'Idoralar' },
  { key: 'MARKET', label: 'Bozorlar' },
  { key: 'HOSPITAL', label: 'Shifoxonalar' },
  { key: 'EDUCATION', label: "Ta'lim" },
  { key: 'TRANSPORT', label: 'Transport' },
  { key: 'SHOPPING', label: "Do'konlar" },
  { key: 'LANDMARK', label: "Mo'ljallar" },
  { key: 'RESIDENTIAL', label: 'Turar joylar' },
  { key: 'OTHER', label: 'Boshqalar' },
]

const TYPE_COLOR: Record<string, string> = {
  GOVERNMENT: '#2196F3',
  MARKET: '#4CAF50',
  HOSPITAL: '#F44336',
  EDUCATION: '#3F51B5',
  TRANSPORT: '#009688',
  SHOPPING: '#E91E63',
  LANDMARK: '#FF9800',
  RESIDENTIAL: '#9C27B0',
}

/** Turga mos oq belgi (24×24 viewBox) */
const GLYPH: Record<string, string> = {
  GOVERNMENT:
    'M12 3 3 8v2h18V8L12 3zM5 11v7h2v-7H5zm4 0v7h2v-7H9zm4 0v7h2v-7h-2zm4 0v7h2v-7h-2zM3 19v2h18v-2H3z',
  MARKET:
    'M3 9h18l-1.7 10a2 2 0 0 1-2 1.7H6.7a2 2 0 0 1-2-1.7L3 9zm5-5.2L11 9H9L6.4 5 8 3.8zm8 0L17.6 5 15 9h-2l3-5.2z',
  HOSPITAL: 'M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6V4z',
  EDUCATION:
    'M12 4 1 9l11 5 9-4.1V16h2V9L12 4zm-6 9.2V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-3.8l-6 2.8-6-2.8z',
  TRANSPORT:
    'M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-1 1.7V19h-3v-2H7v2H4v-2.3A2 2 0 0 1 3 15V6a2 2 0 0 1 2-2zm0 3v4h14V7H5zm2.5 6.4a1.3 1.3 0 1 0 .01 0zm9 0a1.3 1.3 0 1 0 .01 0z',
  SHOPPING: 'M6 8h12l1 12H5L6 8zm3-1a3 3 0 0 1 6 0h-2a1 1 0 0 0-2 0H9z',
  LANDMARK: 'm12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8z',
  RESIDENTIAL: 'M12 3 2 12h3v8h5v-5h4v5h5v-8h3L12 3z',
  OTHER: 'M12 6a4 4 0 1 0 .01 0z',
}

/** Tomchi shaklidagi rangli belgi + turga mos belgi; tanlanganda kattaroq (ilovadagi stilga mos) */
function markerIcon(type: string, color: string, selected: boolean) {
  const k = selected ? 1.22 : 1
  const w = Math.round(44 * k)
  const h = Math.round(58 * k)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 44 58"><ellipse cx="22" cy="55" rx="7" ry="2.4" fill="rgba(0,0,0,0.22)"/><path d="M22 2C12 2 4 10 4 20c0 13 18 34 18 34s18-21 18-34C40 10 32 2 22 2z" fill="${color}" stroke="#fff" stroke-width="2.5"/><circle cx="22" cy="20" r="12.5" fill="rgba(255,255,255,0.18)"/><g transform="translate(10 8)"><path d="${GLYPH[type] || GLYPH.OTHER}" fill="#fff"/></g></svg>`
  return { href: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, w, h }
}

/** Tanlangan joy nomi — belgi ostida oq yozuvli kapsula */
function labelIcon(text: string) {
  const t = text.length > 26 ? `${text.slice(0, 25)}…` : text
  const w = Math.min(230, 22 + t.length * 7.4)
  const esc = t.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w + 8}" height="34" viewBox="0 0 ${w + 8} 34"><rect x="4" y="5" width="${w}" height="24" rx="12" fill="rgba(0,0,0,0.12)"/><rect x="4" y="3" width="${w}" height="24" rx="12" fill="#fff" stroke="#E2E8F0"/><text x="${4 + w / 2}" y="19" text-anchor="middle" font-family="Roboto,Arial,sans-serif" font-size="12.5" font-weight="700" fill="#1E293B">${esc}</text></svg>`
  return { href: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, w: w + 8, h: 34 }
}
function loadHistory(): LocResult[] {
  try {
    const v = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function saveHistory(r: LocResult) {
  if (r.lat == null || r.lng == null) return
  const rest = loadHistory().filter((h) => {
    if (r.uuid && h.uuid) return r.uuid !== h.uuid
    if (h.lat != null && h.lng != null)
      return Math.abs(h.lat - r.lat!) >= 0.0001 || Math.abs(h.lng - r.lng!) >= 0.0001
    return h.title !== r.title
  })
  writeStorage(HISTORY_KEY, JSON.stringify([r, ...rest].slice(0, 5)))
}

function fromApi(l: PopularLocation, inArea: (lat: number, lng: number) => boolean): LocResult {
  const lat = parseFloat(l.latitude)
  const lng = parseFloat(l.longitude)
  const ok = Number.isFinite(lat) && Number.isFinite(lng)
  return {
    title: l.name,
    subtitle: l.orientir ? `${l.address} (${l.orientir})` : l.address,
    lat: ok ? lat : null,
    lng: ok ? lng : null,
    inside: ok ? inArea(lat, lng) : true,
    uuid: l.uuid,
    locationType: l.location_type,
    orientir: l.orientir,
    address: l.address,
  }
}

/* ───────────────────────── Bottom sheet: "Manzilni tanlang" ───────────────────────── */

function Section({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 mt-1 flex items-center gap-2">
      <span className="h-3.5 w-1 rounded-sm bg-[#FFD12B]" />
      <span className="text-[0.844rem] font-[900] tracking-[0.5px] text-[#64748B]">{children}</span>
    </div>
  )
}

function Tile({
  icon,
  tone,
  title,
  subtitle,
  badge,
  onClick,
}: {
  icon: ReactNode
  tone: { fg: string; bg: string }
  title: string
  subtitle: string
  badge?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3.5 rounded-[16px] border-0 bg-transparent px-2 py-3 text-left"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px]"
        style={{ background: tone.bg, color: tone.fg }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.969rem] font-[800] text-[#1E293B]">{title}</span>
        <span className="mt-0.5 block truncate text-[0.781rem] font-[600] text-[#64748B]">
          {subtitle}
        </span>
      </span>
      {badge ? (
        <span className="rounded-full bg-[#FEF9C3] px-2.5 py-[5px] text-[0.625rem] font-[900] uppercase text-[#854D0E]">
          {badge}
        </span>
      ) : (
        <IconChevronRight size={20} className="shrink-0 text-[#CBD5E1]" />
      )}
    </button>
  )
}

const TILE_DEFAULT = { fg: '#FFB800', bg: '#FFFBEB' }
const TILE_HISTORY = { fg: '#64748B', bg: '#F1F5F9' }
const kindTone = (k?: LocResult['kind']) =>
  k === 'home'
    ? { fg: '#2563EB', bg: '#EFF6FF' }
    : k === 'work'
      ? { fg: '#EA580C', bg: '#FFF7ED' }
      : { fg: '#8B5CF6', bg: '#F5F3FF' }

function Empty({ text }: { text: string }) {
  return <p className="m-0 px-2 py-3.5 text-[0.8125rem] font-[600] text-[#94A3B8]">{text}</p>
}

function QuickAction({
  icon,
  title,
  subtitle,
  color,
  bg,
  onClick,
}: {
  icon: ReactNode
  title: string
  subtitle: string
  color: string
  bg: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 cursor-pointer rounded-[16px] p-3.5 text-left"
      style={{ background: bg, border: `1px solid ${color}26` }}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white"
        style={{ color, boxShadow: `0 2px 6px ${color}1A` }}
      >
        {icon}
      </span>
      <span className="mt-3 block text-[0.906rem] font-[900] text-[#1E293B]">{title}</span>
      <span className="mt-0.5 block text-[0.6875rem] font-[600] text-[#64748B]">{subtitle}</span>
    </button>
  )
}

const IconGps = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    aria-hidden
  >
    <circle cx="12" cy="12" r="3.2" />
    <circle cx="12" cy="12" r="7" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </svg>
)
const IconMap = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" />
  </svg>
)
const IconHistory = ({ size = 22 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 8v4l3 2" />
  </svg>
)

function SheetView({
  onClose,
  onPick,
  onOpenMap,
  current,
}: {
  onClose: () => void
  onPick: (r: LocResult) => void
  onOpenMap: () => void
  current: { title: string; subtitle: string; lat: number | null; lng: number | null } | null
}) {
  const { isAuthenticated } = useSession()
  const { neighborhoods } = useNeighborhoods()
  const ymaps = useYMaps(['geocode'])
  const inArea = useCallback(
    (lat: number, lng: number) => checkServiceArea(lat, lng, neighborhoods),
    [neighborhoods]
  )
  const [q, setQ] = useState('')
  const [results, setResults] = useState<LocResult[]>([])
  const [searching, setSearching] = useState(false)
  const [gps, setGps] = useState(false)
  const [history] = useState<LocResult[]>(() => loadHistory())
  const saved = useQuery({
    queryKey: ['go-addresses'],
    queryFn: fetchAddresses,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })

  const savedList: LocResult[] = useMemo(
    () =>
      (saved.data || []).map((a) => ({
        title: a.name || a.address,
        subtitle: a.address,
        lat: a.lat,
        lng: a.lng,
        inside: a.lat != null && a.lng != null ? inArea(a.lat, a.lng) : true,
        kind: /uy|home|dom/i.test(a.name)
          ? 'home'
          : /ish|work|ofis|office/i.test(a.name)
            ? 'work'
            : 'saved',
      })),
    [saved.data, inArea]
  )

  useEffect(() => {
    const term = q.trim()
    if (!term) {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    let live = true
    const t = setTimeout(async () => {
      try {
        const res = await LocationService.getPopularLocations({ search: term })
        if (live) setResults((res?.data?.locations || []).map((l) => fromApi(l, inArea)))
      } catch {
        if (live) setResults([])
      } finally {
        if (live) setSearching(false)
      }
    }, 300)
    return () => {
      live = false
      clearTimeout(t)
    }
  }, [q, inArea])

  const norm = (s: string) => s.trim().toLowerCase()
  const savedFiltered = savedList.filter(
    (a) => norm(a.title).includes(norm(q)) || norm(a.subtitle).includes(norm(q))
  )

  const useGps = () => {
    if (!navigator.geolocation) return message.error("Joylashuvni aniqlab bo'lmadi")
    setGps(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        const title = await reverseGeocode(latitude, longitude, ymaps)
        const ok = inArea(latitude, longitude)
        setGps(false)
        onPick({
          title,
          subtitle: ok ? 'Belgilangan manzil' : "Xizmat ko'rsatish hududidan tashqarida",
          lat: latitude,
          lng: longitude,
          inside: ok,
        })
      },
      () => {
        setGps(false)
        message.error("GPS joylashuvni aniqlab bo'lmadi")
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const searchMode = q.trim().length > 0
  const savedRow = (a: LocResult, i: number) => (
    <Tile
      key={`${a.title}-${i}`}
      icon={<IconPin size={22} />}
      tone={kindTone(a.kind)}
      title={a.title}
      subtitle={a.subtitle}
      onClick={() => onPick(a)}
    />
  )

  return (
    <div className="absolute inset-x-0 bottom-0 mx-auto flex h-[93dvh] w-full max-w-[640px] flex-col rounded-t-[30px] bg-white pb-[env(safe-area-inset-bottom)] lg:inset-y-0 lg:my-auto lg:h-[min(760px,88vh)] lg:rounded-[30px] lg:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.3)]">
      <div className="mx-auto mt-3 h-1 w-[38px] rounded-[10px] bg-[#E2E8F0]" />
      <div className="mt-4 flex items-center px-5">
        <h2 className="m-0 flex-1 text-[1.375rem] font-[900] tracking-[-0.6px] text-[#1E293B]">
          Manzilni tanlang
        </h2>
        <button
          type="button"
          aria-label="Yopish"
          onClick={onClose}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-[#F1F5F9] text-[#64748B]"
        >
          <IconClose size={20} />
        </button>
      </div>

      <div className="mx-5 mt-4 flex h-[54px] shrink-0 items-center gap-3 rounded-[16px] border border-solid border-[#E2E8F0] bg-[#F8FAFC] px-4">
        <IconSearch size={22} className="shrink-0 text-[#64748B]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Shahar, ko‘cha, maktab, bino nomi..."
          enterKeyHint="search"
          className="min-w-0 flex-1 border-0 bg-transparent text-[0.969rem] font-[700] text-[#1E293B] outline-none placeholder:text-[0.906rem] placeholder:font-[600] placeholder:text-[#94A3B8]"
        />
        {searching ? (
          <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-solid border-[#FFD12B] border-t-transparent" />
        ) : (
          q && (
            <button
              type="button"
              aria-label="Tozalash"
              onClick={() => setQ('')}
              className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-full border-0 bg-[#E2E8F0] text-[#64748B]"
            >
              <IconClose size={16} />
            </button>
          )
        )}
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
        {searchMode ? (
          <>
            <Section>Qidiruv natijalari</Section>
            {results.length === 0 && !searching ? (
              <Empty text="Hech qanday manzil topilmadi" />
            ) : (
              results.map((l, i) => (
                <Tile
                  key={l.uuid || i}
                  icon={<IconPin size={22} />}
                  tone={TILE_DEFAULT}
                  title={l.title}
                  subtitle={l.subtitle}
                  onClick={() => onPick(l)}
                />
              ))
            )}
            <div className="h-6" />
            <Section>Saqlangan manzillardan</Section>
            {savedFiltered.length === 0 ? (
              <Empty text="Mos keluvchi saqlangan manzillar yo'q" />
            ) : (
              savedFiltered.map(savedRow)
            )}
          </>
        ) : (
          <>
            <Section>Hozirgi faol manzil</Section>
            <Tile
              icon={current ? <IconGps size={22} /> : <IconPin size={22} />}
              tone={current ? { fg: '#2563EB', bg: '#EFF6FF' } : { fg: '#94A3B8', bg: '#F1F5F9' }}
              title={current ? current.title : 'Manzil tanlanmagan'}
              subtitle={current ? current.subtitle : "Iltimos, xaritadan yoki ro'yxatdan tanlang"}
              badge={current ? 'Tanlangan' : undefined}
              onClick={
                current && current.lat != null && current.lng != null
                  ? () => onPick({ ...current, inside: inArea(current.lat!, current.lng!) })
                  : undefined
              }
            />
            <div className="mt-5 flex gap-3">
              <QuickAction
                icon={
                  gps ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-t-transparent" />
                  ) : (
                    <IconGps />
                  )
                }
                title="GPS aniqlash"
                subtitle="Hozirgi joylashuv"
                color="#10B981"
                bg="#ECFDF5"
                onClick={useGps}
              />
              <QuickAction
                icon={<IconMap />}
                title="Xaritadan tanlash"
                subtitle="Pinni belgilash"
                color="#F59E0B"
                bg="#FFFBEB"
                onClick={onOpenMap}
              />
            </div>

            {history.length > 0 && (
              <>
                <div className="h-6" />
                <Section>Yaqinda tanlanganlar</Section>
                {history.map((h, i) => (
                  <Tile
                    key={`${h.title}-${i}`}
                    icon={<IconHistory />}
                    tone={TILE_HISTORY}
                    title={h.title}
                    subtitle={h.subtitle}
                    onClick={() => onPick(h)}
                  />
                ))}
              </>
            )}

            <div className="h-6" />
            <Section>Mening manzillarim</Section>
            {!isAuthenticated ? (
              <Empty text="Saqlangan manzillarni ko'rish uchun tizimga kiring" />
            ) : savedList.length === 0 ? (
              <Empty text="Saqlangan shaxsiy manzillar yo'q" />
            ) : (
              savedList.map(savedRow)
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ───────────────────────── To'liq ekran xarita sahifasi (MapPickerPage) ───────────────────────── */

const FAB =
  'flex cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#1E293B] shadow-[0_8px_20px_rgba(0,0,0,0.12)]'

function MapView({
  onBack,
  onPick,
  initial,
}: {
  onBack: () => void
  onPick: (r: LocResult) => void
  initial: [number, number] | null
}) {
  const ymaps = useYMaps(['geocode'])
  const { neighborhoods } = useNeighborhoods()
  const inArea = useCallback(
    (lat: number, lng: number) => checkServiceArea(lat, lng, neighborhoods),
    [neighborhoods]
  )
  const mapRef = useRef<any>(null)
  const userGesture = useRef(false)

  const start = useMemo<[number, number]>(() => {
    if (initial) return initial
    let minLat = Infinity
    let maxLat = -Infinity
    let minLng = Infinity
    let maxLng = -Infinity
    neighborhoods.forEach((n) =>
      n.coordinates?.[0]?.forEach(([lng, lat]) => {
        minLat = Math.min(minLat, lat)
        maxLat = Math.max(maxLat, lat)
        minLng = Math.min(minLng, lng)
        maxLng = Math.max(maxLng, lng)
      })
    )
    return Number.isFinite(minLat)
      ? [(minLat + maxLat) / 2, (minLng + maxLng) / 2]
      : (DEFAULT_MAP_CENTER as [number, number])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [point, setPoint] = useState<[number, number]>(start)
  const [moving, setMoving] = useState(false)
  const [addr, setAddr] = useState<string>('Manzil tanlanmoqda...')
  const [loadingAddr, setLoadingAddr] = useState(false)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [places, setPlaces] = useState<PopularLocation[]>([])
  const [loadingPlaces, setLoadingPlaces] = useState(false)
  const [selected, setSelected] = useState<PopularLocation | null>(null)
  const addrSeq = useRef(0)

  const fetchAddr = useCallback(
    async (p: [number, number]) => {
      const seq = ++addrSeq.current
      setLoadingAddr(true)
      const t = await reverseGeocode(p[0], p[1], ymaps)
      if (seq === addrSeq.current) {
        setAddr(t)
        setLoadingAddr(false)
      }
    },
    [ymaps]
  )

  // Boshlang'ich manzil
  useEffect(() => {
    fetchAddr(start)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ymaps])

  // Mashhur joylar (qidiruv + kategoriya)
  const fitAfter = useRef(false)
  useEffect(() => {
    let live = true
    setLoadingPlaces(true)
    const t = setTimeout(async () => {
      try {
        const res = await LocationService.getPopularLocations({
          search: search.trim() || undefined,
          location_type: category || undefined,
        })
        if (!live) return
        const list = res?.data?.locations || []
        setPlaces(list)
        if (fitAfter.current && list.length && mapRef.current) {
          fitAfter.current = false
          const pts = list
            .map((l) => [parseFloat(l.latitude), parseFloat(l.longitude)])
            .filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]))
          if (pts.length === 1) mapRef.current.setCenter(pts[0], 16, { duration: 300 })
          else if (pts.length)
            mapRef.current.setBounds(ymaps?.util?.bounds?.fromPoints?.(pts) || [pts[0], pts[0]], {
              checkZoomRange: true,
              zoomMargin: [170, 40, 320, 40],
              duration: 300,
            })
        }
      } catch {
        if (live) setPlaces([])
      } finally {
        if (live) setLoadingPlaces(false)
      }
    }, 300)
    return () => {
      live = false
      clearTimeout(t)
    }
  }, [search, category, ymaps])

  const bindMap = (m: any) => {
    if (!m || mapRef.current === m) return
    mapRef.current = m
    m.events.add(['mousedown', 'multitouchstart', 'wheel'], () => {
      userGesture.current = true
    })
    m.events.add('actionbegin', () => setMoving(true))
    m.events.add('actionend', () => {
      setMoving(false)
      const c = m.getCenter() as [number, number]
      if (userGesture.current) {
        userGesture.current = false
        setSelected(null)
        setAccuracy(null)
        setPoint(c)
        fetchAddr(c)
      }
    })
  }

  const goMyLocation = () => {
    if (!navigator.geolocation) return message.error("GPS joylashuvni aniqlab bo'lmadi")
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const p: [number, number] = [coords.latitude, coords.longitude]
        userGesture.current = false
        mapRef.current?.setCenter(p, 16, { duration: 300 })
        setSelected(null)
        setPoint(p)
        setAccuracy(coords.accuracy)
        fetchAddr(p)
      },
      () => message.error("GPS joylashuvni aniqlab bo'lmadi"),
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const zoomBy = (d: number) => {
    const m = mapRef.current
    if (m) m.setZoom(Math.max(3, Math.min(19, m.getZoom() + d)), { duration: 200 })
  }

  const pickPlace = (l: PopularLocation) => {
    const lat = parseFloat(l.latitude)
    const lng = parseFloat(l.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    userGesture.current = false
    setSelected(l)
    setPoint([lat, lng])
    mapRef.current?.setCenter([lat, lng], 16, { duration: 300 })
  }

  const polygons = useMemo(
    () =>
      neighborhoods
        .map((n) => ({ key: n.uuid, ring: (n.coordinates?.[0] || []).map((p) => [p[1], p[0]]) }))
        .filter((z) => z.ring.length >= 3),
    [neighborhoods]
  )

  const confirm = () => {
    const res: LocResult = selected
      ? fromApi(selected, inArea)
      : {
          title: addr,
          subtitle: inArea(point[0], point[1])
            ? 'Belgilangan manzil'
            : "Xizmat ko'rsatish hududidan tashqarida",
          lat: point[0],
          lng: point[1],
          inside: inArea(point[0], point[1]),
        }
    if (!res.inside) {
      message.error("Kechirasiz, tanlangan hududda xizmat ko'rsatilmaydi")
      return
    }
    onPick(res)
  }

  const busy = loadingAddr || moving
  const title = selected?.name ?? addr
  const subtitle = selected
    ? selected.address
    : inArea(point[0], point[1])
      ? 'Belgilangan manzil'
      : "Xizmat ko'rsatish hududidan tashqarida"

  return (
    <div className="absolute inset-0 bg-white lg:inset-auto lg:left-1/2 lg:top-1/2 lg:h-[min(760px,90vh)] lg:w-[min(1180px,94vw)] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:overflow-hidden lg:rounded-[28px] lg:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-x-0 bottom-[190px] top-0 lg:bottom-0 lg:left-[420px]">
        <Map
          defaultState={{ center: start, zoom: 16, controls: [] }}
          width="100%"
          height="100%"
          options={{ suppressMapOpenBlock: true, yandexMapDisablePoiInteractivity: true }}
          instanceRef={bindMap}
        >
          {polygons.map((z) => (
            <Polygon
              key={z.key}
              geometry={[z.ring]}
              options={{
                fillColor: 'rgba(22,163,74,0.08)',
                strokeColor: 'rgba(22,163,74,0.55)',
                strokeWidth: 2,
                fillOpacity: 1,
                interactivityModel: 'default#transparent',
              }}
            />
          ))}
          {places.map((l) => {
            const lat = parseFloat(l.latitude)
            const lng = parseFloat(l.longitude)
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
            const sel = selected?.uuid === l.uuid
            const icon = markerIcon(l.location_type, TYPE_COLOR[l.location_type] || '#16A34A', sel)
            const label = sel ? labelIcon(l.name) : null
            return (
              <Fragment key={l.uuid}>
                <Placemark
                  geometry={[lat, lng]}
                  options={{
                    iconLayout: 'default#image',
                    iconImageHref: icon.href,
                    iconImageSize: [icon.w, icon.h],
                    iconImageOffset: [-icon.w / 2, -icon.h + 3],
                    zIndex: sel ? 2000 : 1000,
                  }}
                  onClick={() => pickPlace(l)}
                />
                {label && (
                  <Placemark
                    geometry={[lat, lng]}
                    options={{
                      iconLayout: 'default#image',
                      iconImageHref: label.href,
                      iconImageSize: [label.w, label.h],
                      iconImageOffset: [-label.w / 2, 4],
                      zIndex: 2001,
                      interactivityModel: 'default#transparent',
                    }}
                  />
                )}
              </Fragment>
            )
          })}{' '}
        </Map>
      </div>

      {/* Markaziy pin (sozlanma tanlanmagan bo'lsa) */}
      {!selected && (
        <div className="pointer-events-none absolute left-1/2 top-[calc((100%-190px)/2)] z-[1] -translate-x-1/2 -translate-y-full lg:left-[calc(420px+(100%-420px)/2)] lg:top-1/2">
          <div
            className={cx(
              'mx-auto mb-3.5 w-[260px] max-w-[70vw] rounded-[16px] bg-white px-[18px] py-3.5 text-center shadow-[0_6px_16px_rgba(0,0,0,0.1)] transition-opacity duration-200 lg:hidden',
              moving ? 'opacity-0' : 'opacity-100'
            )}
          >
            <div className="text-[0.906rem] font-[800] text-[#1A1A1A]">
              Hammasi to&apos;g&apos;rimi?
            </div>
            <div className="mt-1 text-[0.75rem] font-[600] leading-[1.4] text-[#6B7280]">
              Marker kirish joyida ekanligiga ishonch hosil qiling va manzilni tasdiqlang
            </div>
          </div>
          <div className="relative mx-auto h-[78px] w-[52px]">
            <span
              className={cx(
                'absolute bottom-0.5 left-1/2 h-[7px] w-[18px] -translate-x-1/2 rounded-full bg-black/20 transition-transform',
                moving && 'scale-[0.65]'
              )}
            />
            <svg
              viewBox="0 0 24 24"
              width="52"
              height="52"
              aria-hidden
              className={cx(
                'absolute left-0 transition-[bottom] duration-200',
                moving
                  ? 'bottom-[26px]'
                  : 'bottom-[10px] animate-[goPinBounce_0.9s_ease-in-out_infinite_alternate]'
              )}
            >
              <path
                d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7z"
                fill="#16A34A"
              />
              <circle cx="12" cy="9" r="2.6" fill="#fff" />
            </svg>
          </div>
        </div>
      )}

      {/* Zoom va mening joylashuvim */}
      <div className="absolute bottom-[300px] right-4 z-[2] flex flex-col gap-2.5 lg:bottom-[96px]">
        <button
          type="button"
          aria-label="Kattalashtirish"
          onClick={() => zoomBy(1)}
          className={cx(FAB, 'h-11 w-11 text-[1.5rem] leading-none')}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Kichraytirish"
          onClick={() => zoomBy(-1)}
          className={cx(FAB, 'h-11 w-11 text-[1.5rem] leading-none')}
        >
          −
        </button>
      </div>
      <button
        type="button"
        aria-label="Mening joylashuvim"
        onClick={goMyLocation}
        className={cx(FAB, 'absolute bottom-[230px] right-4 z-[2] h-[54px] w-[54px] lg:bottom-6')}
      >
        <IconGps size={24} />
      </button>

      <div className="contents lg:absolute lg:inset-y-0 lg:left-0 lg:z-[3] lg:flex lg:w-[420px] lg:flex-col lg:border-0 lg:border-r lg:border-solid lg:border-[#EEF0F3] lg:bg-white">
        {/* Yuqori suzuvchi panel: orqaga, qidiruv, kategoriyalar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] px-4 pt-[max(12px,env(safe-area-inset-top))] lg:pointer-events-auto lg:static lg:shrink-0 lg:px-5 lg:pt-5">
          <div className="mx-auto max-w-[640px] lg:max-w-none">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Orqaga"
                onClick={onBack}
                className={cx(FAB, 'pointer-events-auto h-[54px] w-[54px] shrink-0')}
              >
                <IconBack size={22} />
              </button>
              <div className="pointer-events-auto flex h-[54px] min-w-0 flex-1 items-center gap-3 rounded-[18px] bg-white px-4 shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
                <IconSearch size={24} className="shrink-0 text-go-green" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nom yoki manzil..."
                  enterKeyHint="search"
                  className="min-w-0 flex-1 border-0 bg-transparent text-[1rem] font-[600] text-[#1E293B] outline-none placeholder:text-[#94A3B8]"
                />
                {loadingPlaces || loadingAddr ? (
                  <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-solid border-go-green border-t-transparent" />
                ) : (
                  search && (
                    <button
                      type="button"
                      aria-label="Tozalash"
                      onClick={() => setSearch('')}
                      className="flex cursor-pointer border-0 bg-transparent p-0 text-[#64748B]"
                    >
                      <IconClose size={20} />
                    </button>
                  )
                )}
              </div>
            </div>
            <div className="no-scrollbar pointer-events-auto -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
              {CATEGORIES.map((c) => {
                const on = category === c.key
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => {
                      fitAfter.current = !!c.key
                      setCategory(c.key)
                    }}
                    className={cx(
                      'h-9 shrink-0 cursor-pointer whitespace-nowrap rounded-full border-[1.2px] border-solid px-3.5 text-[0.781rem] font-[700] shadow-[0_3px_10px_rgba(0,0,0,0.05)]',
                      on
                        ? 'border-go-green bg-go-green text-white'
                        : 'border-[#E5E7EB] bg-white text-[#1A1A1A]'
                    )}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="hidden min-h-0 flex-1 overflow-y-auto px-5 pb-3 lg:block">
          <div className="mb-2 text-[0.75rem] font-[800] tracking-[0.5px] text-[#64748B]">
            MASHHUR JOYLAR
          </div>
          {places.length === 0 ? (
            <p className="m-0 py-3 text-[0.844rem] font-[600] leading-[1.4] text-[#94A3B8]">
              {loadingPlaces
                ? 'Yuklanmoqda…'
                : "Joylar topilmadi. Xaritani surib, kerakli joyga pinni qo'ying."}
            </p>
          ) : (
            places.map((l) => (
              <button
                key={l.uuid}
                type="button"
                onClick={() => pickPlace(l)}
                className={cx(
                  'flex w-full cursor-pointer items-center gap-3 rounded-[14px] border-0 px-2.5 py-2.5 text-left',
                  selected?.uuid === l.uuid ? 'bg-go-soft' : 'bg-transparent hover:bg-[#F8FAFC]'
                )}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-white"
                  style={{ background: TYPE_COLOR[l.location_type] || '#16A34A' }}
                >
                  <IconPin size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.938rem] font-[800] text-[#1E293B]">
                    {l.name}
                  </span>
                  <span className="block truncate text-[0.781rem] font-[600] text-[#64748B]">
                    {l.address}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
        {/* Pastki karta: "Qayerga olib boraylik?" */}
        <div className="absolute inset-x-0 bottom-0 z-[3] rounded-t-[28px] bg-white px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_40px_rgba(0,0,0,0.12)] lg:static lg:shrink-0 lg:rounded-none lg:border-0 lg:border-t lg:border-solid lg:border-[#EEF0F3] lg:pb-5 lg:shadow-none">
          <div className="mx-auto max-w-[640px] lg:max-w-none">
            <div className="mx-auto h-1 w-9 rounded-[10px] bg-[#E2E8F0] lg:hidden" />
            <div className="mt-3.5 flex items-center justify-between">
              <h3 className="m-0 text-[1.0625rem] font-[900] text-[#1A1A1A]">
                Qayerga olib boraylik?
              </h3>
              {accuracy != null && (
                <span className="rounded-full bg-[#E7F6EC] px-[9px] py-[5px] text-[0.6875rem] font-[800] text-go-bright">
                  Aniqlik: ~{Math.round(accuracy)}m
                </span>
              )}
            </div>
            <div className="mt-3 flex items-start gap-3">
              <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[13px] bg-go-bright/10 text-go-bright">
                <IconPin size={21} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[0.969rem] font-[800] text-[#1A1A1A]">{title}</div>
                <div className="mt-0.5 line-clamp-2 text-[0.781rem] font-[600] text-[#6B7280]">
                  {subtitle}
                </div>
                {selected?.orientir && (
                  <div className="mt-1.5 text-[0.75rem] font-[700] text-[#D97706]">
                    Mo&apos;ljal: {selected.orientir}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={confirm}
              className={cx(
                'mt-4 h-[54px] w-full cursor-pointer rounded-[18px] border-0 text-[1rem] font-[800]',
                busy
                  ? 'bg-[#F1F5F9] text-[#94A3B8]'
                  : 'bg-gradient-to-r from-[#15803D] to-[#22C55E] text-white'
              )}
            >
              {loadingAddr ? 'Aniqlanmoqda...' : 'Manzilni tasdiqlash'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── Kirish nuqtasi ───────────────────────── */

/** Telefon va planshet uchun manzil tanlash: superapp'dagi bottom sheet + to'liq ekran xarita sahifasi */
export default function LocationPicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Har ochilganda holat yangidan boshlanadi (sheet ko`rinishi)
  if (!open || typeof document === 'undefined') return null
  return <PickerInner onClose={onClose} />
}

function PickerInner({ onClose }: { onClose: () => void }) {
  const { location, setLocation, setIsInServiceArea } = useLocationStore()
  const [view, setView] = useState<'sheet' | 'map'>('sheet')

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (view === 'map') setView('sheet')
      else onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [view, onClose])

  const pick = (r: LocResult) => {
    if (r.lat == null || r.lng == null) return
    setLocation({ lat: r.lat, lng: r.lng, address: r.title })
    setIsInServiceArea(r.inside)
    saveHistory(r)
    onClose()
  }

  const current = location
    ? {
        title: location.address || 'Tanlangan manzil',
        subtitle: 'Belgilangan manzil',
        lat: location.lat,
        lng: location.lng,
      }
    : null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Manzilni tanlang"
      className="fixed inset-0 z-[1100]"
    >
      <button
        type="button"
        aria-label="Yopish"
        onClick={onClose}
        className={cx(
          'absolute inset-0 cursor-default border-0 bg-black/50',
          view === 'map' && 'max-lg:hidden'
        )}
      />
      {view === 'sheet' ? (
        <SheetView
          onClose={onClose}
          onPick={pick}
          onOpenMap={() => setView('map')}
          current={current}
        />
      ) : (
        <MapView
          onBack={() => setView('sheet')}
          onPick={pick}
          initial={location ? [location.lat, location.lng] : null}
        />
      )}
    </div>,
    document.body
  )
}
