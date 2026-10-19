import { Input, message, Modal } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY, SUPPORT_TELEGRAM } from '../layout/GoFooter'
import { addAddress, deleteAddress, fetchAddresses, setDefaultAddress } from '../lib/api'
import ActiveOrdersStrip from '../components/ActiveOrdersStrip'
import { useOrders } from '../lib/queries'
import { useSession, useUi, useUserLocation } from '../lib/session'
import { cx } from '../lib/utils'
import {
  IconChevronRight,
  IconHeart,
  IconHome,
  IconInfo,
  IconLogout,
  IconPhone,
  IconPin,
  IconReceipt,
  IconTelegram,
  IconTrash,
  IconUser,
} from '../ui/icons'
import { Button, EmptyState, Page, Sheet, Skeleton } from '../ui/primitives'

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5 mt-5 pl-1 text-[0.8125rem] font-[800] tracking-[0.4px] text-[#0F5A47]">
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <Caption>{title}</Caption>
      <div className="divide-y divide-solid divide-[#F1F5F9] overflow-hidden rounded-[22px] border border-solid border-[#ECEEF1] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
        {children}
      </div>
    </section>
  )
}

/** Superapp `ProfileMenuRow`: 40px yumshoq belgi, sarlavha, (ixtiyoriy) qiymat/belgi va › */
function MenuRow({
  icon,
  title,
  subtitle,
  inline,
  trailing,
  href,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string | null
  inline?: string | null
  trailing?: React.ReactNode
  href?: string
  onClick?: () => void
}) {
  const inner = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#0F5A47]/10 text-[#0F5A47]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        {inline ? (
          <span className="block truncate text-[0.969rem] font-[700] text-[#1E293B]">
            {title} <span className="text-[0.875rem] font-[600] text-[#94A3B8]">{inline}</span>
          </span>
        ) : (
          <>
            <span className="block text-[0.969rem] font-[700] text-[#1E293B]">{title}</span>
            {subtitle && (
              <span className="mt-0.5 block text-[0.719rem] font-[700] text-[#6B7280]">
                {subtitle}
              </span>
            )}
          </>
        )}
      </span>
      {trailing}
      <IconChevronRight size={20} className="shrink-0 text-[#CBD5E1]" />
    </>
  )
  const cls =
    'flex min-h-[68px] w-full cursor-pointer items-center gap-3.5 border-0 bg-transparent px-4 py-3.5 text-left no-underline'
  if (href) {
    const ext = href.startsWith('http')
    return (
      <a
        href={href}
        {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={cls}
      >
        {inner}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}

const Pill = ({ children, color = '#16A34A' }: { children: React.ReactNode; color?: string }) => (
  <span
    className="rounded-full px-2.5 py-1 text-[0.6875rem] font-[800]"
    style={{ background: `${color}1F`, color }}
  >
    {children}
  </span>
)
function initials(name?: string | null) {
  const p = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!p.length) return '?'
  return (p.length === 1 ? p[0][0] : p[0][0] + p[1][0]).toUpperCase()
}

export default function ProfilePage() {
  const router = useRouter()
  const qc = useQueryClient()
  const { isAuthenticated, profile, loadingProfile, openLogin, logOut } = useSession()
  const { active } = useOrders()
  const { lat, lng, address, hasLocation } = useUserLocation()
  const setLocationOpen = useUi((s) => s.setLocationOpen)
  const addressesQ = useQuery({
    queryKey: ['go', 'addresses'],
    queryFn: fetchAddresses,
    enabled: isAuthenticated,
  })
  const [addrOpen, setAddrOpen] = useState(false)
  const [addrListOpen, setAddrListOpen] = useState(false)
  const [addrName, setAddrName] = useState('')
  const [label, setLabel] = useState<'home' | 'work' | 'other'>('home')

  const addAddr = useMutation({
    mutationFn: () =>
      addAddress({
        name: addrName.trim() || (label === 'home' ? 'Uy' : label === 'work' ? 'Ish' : 'Manzil'),
        address: address || 'Tanlangan manzil',
        lat: lat!,
        lng: lng!,
        label,
        is_default: !(addressesQ.data || []).length,
      }),
    onSuccess: () => {
      message.success("Manzil qo'shildi")
      qc.invalidateQueries({ queryKey: ['go', 'addresses'] })
      setAddrOpen(false)
      setAddrName('')
    },
  })

  const refreshAddresses = () => qc.invalidateQueries({ queryKey: ['go', 'addresses'] })

  if (!isAuthenticated) {
    return (
      <Page className="max-w-[720px] pt-4">
        <Head>
          <title>Profil — MilliyGo</title>
        </Head>
        <EmptyState
          emoji="👋"
          title="Xush kelibsiz!"
          text="Buyurtma berish, manzillarni saqlash va buyurtmalarni kuzatish uchun Telegram orqali kiring."
          action={<Button onClick={openLogin}>Kirish</Button>}
        />
        <Section title="YORDAM VA MA'LUMOT">
          <MenuRow
            icon={<IconTelegram size={19} />}
            title="Yordam xizmati (24/7)"
            href={SUPPORT_TELEGRAM}
            trailing={<Pill>Online</Pill>}
          />
          <MenuRow
            icon={<IconInfo size={19} />}
            title="Ilova haqida & Maxfiylik"
            href="/privacy/"
          />
        </Section>
      </Page>
    )
  }

  const addresses = addressesQ.data || []

  return (
    <Page className="max-w-[720px] pb-8 pt-3">
      <Head>
        <title>Profil — MilliyGo</title>
      </Head>

      <div className="flex items-center gap-1.5 pb-3">
        <button
          type="button"
          aria-label="Orqaga"
          onClick={() => router.push('/')}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-1 text-[#1F2937]"
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m15 5-7 7 7 7" />
          </svg>
        </button>
        <h1 className="m-0 flex-1 text-[1.1875rem] font-[800] text-[#1F2937]">Profil</h1>
      </div>

      <div className="flex items-center gap-4 rounded-[24px] border border-solid border-[#E3F3E9] bg-gradient-to-bl from-[#E9FBF0] to-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
        <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-full border-[2.5px] border-solid border-[#16A34A] bg-white text-[1.1875rem] font-[800] text-[#16A34A]">
          {profile?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(profile?.full_name)
          )}
        </span>
        <div className="min-w-0 flex-1">
          {loadingProfile ? (
            <Skeleton className="h-6 w-40" />
          ) : (
            <>
              <div className="truncate text-[1.1875rem] font-[900] tracking-[-0.3px] text-[#0F172A]">
                {profile?.full_name || 'Foydalanuvchi'}
              </div>
              <div className="mt-1 text-[0.844rem] font-[600] text-[#64748B]">
                {profile?.phone_number || "Telefon qo'shilmagan"}
              </div>
            </>
          )}
        </div>
        <Link
          href="/profile/edit/"
          aria-label="Profilni tahrirlash"
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#334155] no-underline"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4zM13.5 6.5l4 4" />
          </svg>
        </Link>
      </div>

      {active.length > 0 && (
        <div className="mt-3.5">
          <ActiveOrdersStrip orders={active} />
        </div>
      )}

      <Section title="XIZMATLAR VA BUYURTMALAR">
        <MenuRow
          icon={<IconReceipt size={19} />}
          title="Buyurtmalar tarixi"
          href="/orders/"
          trailing={active.length > 0 ? <Pill>{active.length} faol</Pill> : null}
        />
        <MenuRow
          icon={<IconPin size={19} />}
          title="Mening manzillarim"
          inline={addresses.length ? `(${addresses.length})` : null}
          subtitle={addresses.length ? null : "Hali manzil qo'shilmagan"}
          onClick={() => setAddrListOpen(true)}
        />
        <MenuRow icon={<IconHeart size={19} />} title="Sevimli maskanlar" href="/favorites/" />
      </Section>

      <Section title="YORDAM VA MA'LUMOT">
        <MenuRow
          icon={<IconTelegram size={19} />}
          title="Yordam xizmati (24/7)"
          href={SUPPORT_TELEGRAM}
          trailing={<Pill>Online</Pill>}
        />
        <MenuRow
          icon={<IconPhone size={19} />}
          title="Qo'ng'iroq qilish"
          subtitle={SUPPORT_PHONE_DISPLAY}
          href={`tel:${SUPPORT_PHONE}`}
        />
        <MenuRow icon={<IconInfo size={19} />} title="Savol-javoblar" href="/faq/" />
        <MenuRow icon={<IconInfo size={19} />} title="Ilova haqida & Maxfiylik" href="/privacy/" />
        <MenuRow icon={<IconUser size={19} />} title="Hisobni o'chirish" href="/delete-account/" />
      </Section>

      <button
        type="button"
        onClick={() =>
          Modal.confirm({
            title: 'Hisobdan chiqish',
            content: 'Rostdan ham chiqmoqchimisiz?',
            okText: 'Chiqish',
            cancelText: 'Bekor qilish',
            okButtonProps: { danger: true },
            centered: true,
            onOk: () => logOut(),
          })
        }
        className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[30px] border-0 bg-[#FEF2F2] py-[15px] text-[0.906rem] font-[800] text-[#EF4444]"
      >
        <IconLogout size={18} /> Hisobdan chiqish
      </button>
      <Sheet
        open={addrListOpen}
        onClose={() => setAddrListOpen(false)}
        title="Mening manzillarim"
        footer={
          <Button
            block
            onClick={() => {
              setAddrListOpen(false)
              if (hasLocation) setAddrOpen(true)
              else setLocationOpen(true)
            }}
          >
            + Manzil qo'shish
          </Button>
        }
      >
        <div className="divide-y divide-solid divide-[#F1F5F9] overflow-hidden rounded-[22px] border border-solid border-[#ECEEF1] bg-white px-4">
          {addressesQ.isLoading ? (
            <Skeleton className="my-3 h-10" />
          ) : addresses.length === 0 ? (
            <div className="py-4 text-[0.844rem] font-[600] text-[#6B7280]">
              Tez buyurtma uchun uy yoki ish manzilingizni saqlang
            </div>
          ) : (
            addresses.map((a) => (
              <div key={a.id} className="flex min-h-[60px] items-center gap-3 py-2">
                <span
                  className={cx(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]',
                    a.is_default ? 'bg-go-soft text-go-green' : 'bg-go-chip text-go-ink'
                  )}
                >
                  {a.raw?.label === 'home' ? <IconHome size={19} /> : <IconPin size={19} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.969rem] font-[700] text-[#1E293B]">
                    {a.name}
                    {a.is_default && (
                      <span className="ml-2 text-[0.75rem] font-[800] text-go-green">Asosiy</span>
                    )}
                  </span>
                  <span className="block truncate text-[0.813rem] text-[#6B7280]">{a.address}</span>
                </span>
                {!a.is_default && (
                  <button
                    type="button"
                    onClick={() => setDefaultAddress(a.id).then(refreshAddresses)}
                    className="cursor-pointer whitespace-nowrap border-0 bg-transparent text-[0.813rem] font-[700] text-go-green"
                  >
                    Asosiy qilish
                  </button>
                )}
                <button
                  type="button"
                  aria-label="O'chirish"
                  onClick={() =>
                    Modal.confirm({
                      title: "Manzilni o'chirish",
                      content: a.address,
                      okText: "O'chirish",
                      cancelText: 'Bekor qilish',
                      okButtonProps: { danger: true },
                      centered: true,
                      onOk: () => deleteAddress(a.id).then(refreshAddresses),
                    })
                  }
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-go-muted hover:text-go-red"
                >
                  <IconTrash size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </Sheet>

      <Sheet
        open={addrOpen}
        onClose={() => setAddrOpen(false)}
        title="Manzilni saqlash"
        subtitle={address || 'Tanlangan manzil'}
        footer={
          <Button
            block
            onClick={() => addAddr.mutate()}
            loading={addAddr.isPending}
            disabled={lat == null}
          >
            Saqlash
          </Button>
        }
      >
        <div className="flex gap-2">
          {(
            [
              ['home', '🏠 Uy'],
              ['work', '💼 Ish'],
              ['other', '📍 Boshqa'],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setLabel(v)}
              className={cx(
                'min-h-[44px] flex-1 cursor-pointer rounded-[14px] border-2 border-solid text-[0.9062rem] font-[700]',
                label === v
                  ? 'border-go-green bg-go-soft text-go-green'
                  : 'border-go-line2 bg-white text-go-ink'
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <label className="mt-3 block text-[0.8125rem] text-go-muted">Nomi (ixtiyoriy)</label>
        <Input
          size="large"
          className="mt-1"
          value={addrName}
          onChange={(e) => setAddrName(e.target.value)}
          placeholder="Masalan: Uyim"
          maxLength={100}
        />
        <button
          type="button"
          onClick={() => {
            setAddrOpen(false)
            setLocationOpen(true)
          }}
          className="mt-3 cursor-pointer border-0 bg-transparent p-0 text-[0.875rem] font-[700] text-go-green"
        >
          Xaritada boshqa joyni tanlash
        </button>
      </Sheet>
    </Page>
  )
}
