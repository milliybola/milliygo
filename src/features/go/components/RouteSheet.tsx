import { message } from 'antd'
import { IconChevronRight, IconNavigate } from '../ui/icons'
import { Sheet } from '../ui/primitives'

type App = { name: string; sub: string; href: string; same?: boolean }

/** "Restoranga borish": xarita ilovasini foydalanuvchi tanlaydi (superapp `_goToRestaurant` ning veb varianti) */
export default function RouteSheet({
  open,
  onClose,
  lat,
  lng,
  label,
}: {
  open: boolean
  onClose: () => void
  lat: number
  lng: number
  label?: string
}) {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent
  const ios = /iPhone|iPad|iPod/i.test(ua)
  const android = /Android/i.test(ua)
  const dest = `${lat},${lng}`
  const apps: App[] = [
    ...(ios
      ? [
          {
            name: 'Apple Xaritalar',
            sub: "O'rnatilgan xarita",
            href: `maps://?daddr=${dest}&dirflg=d`,
            same: true,
          },
        ]
      : []),
    ...(android
      ? [
          {
            name: 'Xarita ilovasi',
            sub: 'Telefondagi ilovalardan tanlaysiz',
            href: `geo:${dest}?q=${dest}(${encodeURIComponent(label || 'Restoran')})`,
            same: true,
          },
        ]
      : []),
    {
      name: 'Yandex Maps',
      sub: "Yo'nalish bilan",
      href: `https://yandex.uz/maps/?rtext=~${dest}&rtt=auto`,
    },
    {
      name: 'Google Maps',
      sub: "Yo'nalish bilan",
      href: `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
    },
  ]
  const go = (a: App) => {
    onClose()
    if (a.same) window.location.assign(a.href)
    else if (!window.open(a.href, '_blank', 'noopener'))
      message.error('Xarita ilovasini ochib bo‘lmadi')
  }
  return (
    <Sheet open={open} onClose={onClose} title="Qaysi ilovada ochamiz?" width={420}>
      <div className="-mt-1">
        {apps.map((a) => (
          <button
            key={a.name}
            type="button"
            onClick={() => go(a)}
            className="flex min-h-[60px] w-full cursor-pointer items-center gap-3.5 border-0 bg-transparent px-1 text-left"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-go-soft text-go-green">
              <IconNavigate size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[1rem] font-[700] text-[#111]">{a.name}</span>
              <span className="block text-[0.813rem] text-[#6B7280]">{a.sub}</span>
            </span>
            <IconChevronRight size={22} className="text-[#9CA3AF]" />
          </button>
        ))}
      </div>
    </Sheet>
  )
}
