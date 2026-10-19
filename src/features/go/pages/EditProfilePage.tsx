import { message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { updateProfile } from '../lib/api'
import { useSession } from '../lib/session'
import { cx } from '../lib/utils'
import { Button, EmptyState } from '../ui/primitives'

const card = 'rounded-[22px] bg-white p-4 shadow-[0_6px_18px_rgba(0,0,0,0.03)]'
const MAX = 5 * 1024 * 1024

function Label({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-1.5 text-[0.813rem] font-[700] text-[#475569]">
      <span className="text-[#16A34A]">{icon}</span>
      {children}
    </div>
  )
}

/** Superapp `EditProfilePage`: shaxsiy ma'lumotlar va avatar */
export default function EditProfilePage() {
  const router = useRouter()
  const qc = useQueryClient()
  const { isAuthenticated, profile, openLogin } = useSession()
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const filled = useRef(false)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile && !filled.current) {
      filled.current = true
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(profile.full_name || '')
    }
  }, [profile])
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview]
  )

  const save = useMutation({
    mutationFn: () =>
      updateProfile({
        full_name: name.trim(),
        phone_number: profile?.phone_number || '',
        email: profile?.email || undefined,
        avatar: file,
      }),
    onSuccess: () => {
      message.success('Profil muvaffaqiyatli saqlandi!')
      qc.invalidateQueries({ queryKey: ['go', 'me'] })
      router.push('/profile/')
    },
    onError: (e: any) => message.error(e?.message || "Saqlab bo'lmadi. Qaytadan urinib ko'ring."),
  })

  const pick = (f?: File | null) => {
    if (!f) return
    if (!/^image\/(jpeg|png)$/.test(f.type))
      return void message.warning('Faqat JPG yoki PNG rasm tanlang')
    if (f.size > MAX) return void message.warning('Rasm hajmi 5 MB dan oshmasin')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }
  const removePicked = () => {
    if (!file) return void message.info('Hozircha yangi rasm tanlanmagan')
    setFile(null)
    setPreview(null)
    if (input.current) input.current.value = ''
  }
  const submit = () => {
    if (!name.trim()) return void message.warning('Ismingizni kiriting')
    save.mutate()
  }

  const avatar = preview || profile?.avatar
  const shown = name.trim() || profile?.full_name || ''

  if (!isAuthenticated) {
    return (
      <div className="bg-[#FAF8F5]">
        <EmptyState
          emoji="🔐"
          title="Profilni tahrirlash uchun kiring"
          action={<Button onClick={openLogin}>Kirish</Button>}
        />
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] bg-[#FAF8F5]">
      <Head>
        <title>Shaxsiy ma&apos;lumotlar — MilliyGo</title>
      </Head>
      <div className="mx-auto w-full max-w-[560px] px-4 pb-8">
        <div className="flex items-center gap-2 pb-4 pt-3">
          <button
            type="button"
            aria-label="Orqaga"
            onClick={() => router.push('/profile/')}
            className="flex h-9 w-9 cursor-pointer items-center justify-center border-0 bg-transparent p-1 text-[#1F2937]"
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
          <h1 className="m-0 flex-1 text-[1.0625rem] font-[800] text-[#1F2937]">
            Shaxsiy ma&apos;lumotlar
          </h1>
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#16A34A] text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
            </svg>
          </span>
        </div>

        <div className={cx(card, 'flex items-center')}>
          <div className="flex-1">
            <div className="text-[0.719rem] font-[800] tracking-[0.3px] text-[#16A34A]">
              Shaxsiy sozlamalar
            </div>
            <div className="mt-1.5 text-[1.1875rem] font-[900] text-[#0F172A]">
              Profilni tahrirlash
            </div>
            <div className="mt-1 text-[0.781rem] font-[600] text-[#6B7280]">
              Shaxsiy ma&apos;lumotlar va avatar
            </div>
          </div>
          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#16A34A]/10 text-[#16A34A]">
            ⚙
          </span>
        </div>

        <div className="mt-3.5 flex flex-col items-center rounded-[22px] bg-gradient-to-bl from-[#E9FBF0] to-white px-4 py-[22px] shadow-[0_6px_18px_rgba(0,0,0,0.03)]">
          <div className="relative">
            <span
              className="flex h-[104px] w-[104px] items-center justify-center rounded-full p-1"
              style={{ background: 'conic-gradient(#16A34A, #FFD12B, #16A34A)' }}
            >
              <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-solid border-white bg-white text-[#94A3B8]">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
                  </svg>
                )}
              </span>
            </span>
            <button
              type="button"
              aria-label="Rasm tanlash"
              onClick={() => input.current?.click()}
              className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-[2.5px] border-solid border-white bg-[#16A34A] text-white"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
              </svg>
            </button>
            <input
              ref={input}
              type="file"
              accept="image/jpeg,image/png"
              hidden
              onChange={(e) => pick(e.target.files?.[0])}
            />
          </div>
          <div className="mt-3.5 max-w-full truncate text-[1.031rem] font-[800] text-[#0F172A]">
            {shown || 'Foydalanuvchi'}
          </div>
          <div className="mt-1 text-center text-[0.719rem] font-[600] text-[#6B7280]">
            Rasm yuklash yoki o&apos;zgartirish (JPG, PNG, maks 5MB)
          </div>
          <div className="mt-3.5 flex gap-2.5">
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="flex cursor-pointer items-center gap-1.5 rounded-[20px] border border-solid border-[#16A34A]/30 bg-[#16A34A]/10 px-3.5 py-[9px] text-[0.781rem] font-[800] text-[#16A34A]"
            >
              Yangi rasm
            </button>
            <button
              type="button"
              onClick={removePicked}
              className="flex cursor-pointer items-center gap-1.5 rounded-[20px] border border-solid border-[#EF4444]/30 bg-[#EF4444]/10 px-3.5 py-[9px] text-[0.781rem] font-[800] text-[#EF4444]"
            >
              O&apos;chirish
            </button>
          </div>
        </div>

        <div className={cx(card, 'mt-[18px]')}>
          <div className="mb-[18px] flex items-center justify-between">
            <span className="text-[0.75rem] font-[800] tracking-[0.5px] text-[#0F5A47]">
              ASOSIY MA&apos;LUMOTLAR
            </span>
            <span className="flex items-center gap-[5px] text-[0.719rem] font-[700] text-[#16A34A]">
              <span className="h-[7px] w-[7px] rounded-full bg-[#16A34A]" />
              Faol profil
            </span>
          </div>
          <Label
            icon={
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                aria-hidden
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
              </svg>
            }
          >
            To&apos;liq ism
          </Label>
          <div className="flex items-center rounded-xl bg-[#E8EAED]">
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 80))}
              placeholder="Ismingizni kiriting"
              className="min-w-0 flex-1 border-0 bg-transparent px-3.5 py-[13px] text-[0.875rem] font-[700] text-[#1A1A1A] outline-none placeholder:font-[600] placeholder:text-[#9CA3AF]"
            />
            {name && (
              <button
                type="button"
                aria-label="Tozalash"
                onClick={() => setName('')}
                className="mr-3 cursor-pointer border-0 bg-transparent p-0 text-[1.125rem] leading-none text-[#CBD5E1]"
              >
                ⊗
              </button>
            )}
          </div>
          <div className="mt-[18px]">
            <Label
              icon={
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
                </svg>
              }
            >
              Telefon raqam
            </Label>
            <div className="flex items-center rounded-xl bg-[#E8EAED] px-3.5 py-[13px]">
              <span className="flex-1 text-[0.875rem] font-[700] text-[#1A1A1A]">
                {profile?.phone_number || "Ma'lumot yo'q"}
              </span>
              <button
                type="button"
                onClick={() => message.info("Telefon raqamni o'zgartirish tez orada qo'shiladi")}
                className="cursor-pointer border-0 bg-transparent p-0 text-[0.781rem] font-[800] text-[#16A34A]"
              >
                O&apos;zgartirish
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={save.isPending}
          className={cx(
            'mt-5 flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-[18px] border-0 text-[1rem] font-[800] text-white',
            save.isPending ? 'bg-[#CBD5E1]' : 'bg-gradient-to-r from-[#15803D] to-[#22C55E]'
          )}
        >
          {save.isPending ? (
            <span className="h-[22px] w-[22px] animate-spin rounded-full border-[2.5px] border-solid border-white border-t-transparent" />
          ) : (
            '✓ Saqlash'
          )}
        </button>
      </div>
    </div>
  )
}
