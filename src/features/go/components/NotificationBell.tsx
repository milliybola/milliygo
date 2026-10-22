import { message } from 'antd'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useNotificationActions, useNotifications, useUnreadCount } from '../lib/queries'
import { useHydrated, useSession } from '../lib/session'
import type { UserNotification } from '../lib/types'
import { canOfferWebPush, enableWebPush, syncWebPushToken } from '../lib/webPush'
import { cx, timeAgo } from '../lib/utils'
import { IconBell, IconCheck, IconClose, IconGift, IconReceipt } from '../ui/icons'
import { Button, EmptyState, Sheet, Skeleton } from '../ui/primitives'

/** Bildirishnoma bosilganda qayerga o'tiladi: buyurtma → kuzatuv sahifasi, hamkor → uning sahifasi */
function targetOf(n: UserNotification): string | null {
  if (n.data?.order_uuid) return `/orders/track/?uuid=${n.data.order_uuid}`
  if (n.data?.partner_uuid)
    return n.data.partner_type === 'SHOP'
      ? `/store/?id=${n.data.partner_uuid}`
      : `/restaurant/?id=${n.data.partner_uuid}`
  return null
}

function TypeIcon({ type }: { type: UserNotification['type'] }) {
  const Icon = type === 'ORDER_STATUS' ? IconReceipt : type === 'PROMO' ? IconGift : IconBell
  const tone =
    type === 'ORDER_STATUS'
      ? 'bg-[#E8F5EC] text-[#15803D]'
      : type === 'PROMO'
        ? 'bg-[#FEF3C7] text-[#B45309]'
        : 'bg-go-chip text-[#4B5563]'
  return (
    <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', tone)}>
      <Icon size={20} />
    </span>
  )
}

/** Headerdagi qo'ng'iroqcha: o'qilmaganlar soni + bildirishnomalar ro'yxati */
export default function NotificationBell() {
  const router = useRouter()
  const { isAuthenticated, openLogin } = useSession()
  const [open, setOpen] = useState(false)
  const unreadQ = useUnreadCount()
  const listQ = useNotifications(open && isAuthenticated)
  const { read, readAll, remove } = useNotificationActions()
  // Push taklifi: faqat brauzerda (hydratsiyadan keyin), ruxsat hali so'ralmagan bo'lsa
  const hydrated = useHydrated()
  const [pushHandled, setPushHandled] = useState(false)
  const offerPush = hydrated && isAuthenticated && !pushHandled && canOfferWebPush()
  const unread = isAuthenticated ? unreadQ.data || 0 : 0
  const items = listQ.data?.results || []

  // Kirgan foydalanuvchi: ruxsat allaqachon berilgan bo'lsa token yangilanadi (foydalanuvchiga bog'lanadi)
  useEffect(() => {
    if (isAuthenticated) void syncWebPushToken()
  }, [isAuthenticated])

  const toggle = () => {
    if (!isAuthenticated) return openLogin()
    setOpen((v) => !v)
  }

  const openItem = (n: UserNotification) => {
    if (!n.is_read) read.mutate(n.uuid)
    const target = targetOf(n)
    if (target) {
      setOpen(false)
      void router.push(target)
    }
  }

  const enablePush = async () => {
    const result = await enableWebPush()
    if (result === 'enabled') {
      message.success('Push bildirishnomalar yoqildi')
      setPushHandled(true)
    } else if (result === 'denied') {
      message.warning('Brauzer sozlamalarida bildirishnomalarga ruxsat bering')
      setPushHandled(true)
    } else {
      message.error("Push bildirishnomalarni yoqib bo'lmadi")
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label={unread ? `Bildirishnomalar, ${unread} ta yangi` : 'Bildirishnomalar'}
        onClick={toggle}
        className="relative flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border-[1.2px] border-solid border-go-line2 bg-transparent text-[#1F2937] lg:h-11 lg:w-11"
      >
        <IconBell size={19} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-solid border-white bg-[#EF4444] px-1 text-[0.656rem] font-[800] leading-none text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Bildirishnomalar"
        subtitle={unread ? `${unread} ta yangi` : undefined}
        bodyClassName="!px-0"
        footer={
          offerPush || unread > 0 ? (
            <div className="flex flex-col gap-2">
              {offerPush && (
                <Button block onClick={enablePush}>
                  <IconBell size={18} /> Telefon/brauzer yopiq bo&apos;lsa ham xabar olish
                </Button>
              )}
              {unread > 0 && (
                <Button
                  block
                  variant="ghost"
                  onClick={() => readAll.mutate()}
                  disabled={readAll.isPending}
                >
                  <IconCheck size={18} /> Hammasini o&apos;qilgan qilish
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {listQ.isLoading ? (
          <div className="space-y-3 px-5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[68px] rounded-[16px]" />
            ))}
          </div>
        ) : listQ.isError ? (
          <EmptyState
            emoji="📡"
            title="Yuklab bo'lmadi"
            text="Internetni tekshirib, qaytadan urinib ko'ring"
            action={<Button onClick={() => listQ.refetch()}>Qayta urinish</Button>}
          />
        ) : items.length === 0 ? (
          <EmptyState
            emoji="🔔"
            title="Hozircha bildirishnoma yo'q"
            text="Buyurtma holati va aksiyalar haqidagi xabarlar shu yerda ko'rinadi"
          />
        ) : (
          <ul className="m-0 list-none p-0">
            {items.map((n) => (
              <li
                key={n.uuid}
                className={cx(
                  'flex items-start gap-3 border-0 border-b border-solid border-go-line px-5 py-3.5',
                  !n.is_read && 'bg-[#F0FDF4]'
                )}
              >
                <button
                  type="button"
                  onClick={() => openItem(n)}
                  className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 border-0 bg-transparent p-0 text-left"
                >
                  <TypeIcon type={n.type} />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cx(
                        'block text-[0.9375rem] leading-snug text-go-ink',
                        n.is_read ? 'font-[600]' : 'font-[800]'
                      )}
                    >
                      {n.title}
                    </span>
                    {n.body && (
                      <span className="mt-0.5 block text-[0.844rem] leading-snug text-go-muted">
                        {n.body}
                      </span>
                    )}
                    <span className="mt-1 block text-[0.75rem] font-[600] text-[#9CA3AF]">
                      {timeAgo(n.created_at)}
                    </span>
                  </span>
                  {!n.is_read && (
                    <span
                      aria-label="O'qilmagan"
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#16A34A]"
                    />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="O'chirish"
                  onClick={() => remove.mutate(n.uuid)}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[#9CA3AF] hover:bg-go-chip"
                >
                  <IconClose size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Sheet>
    </>
  )
}
