import { Input, message } from 'antd'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { fingerprint } from '@/utils/fingerprint'
import { SUPPORT_TELEGRAM } from '../layout/GoFooter'
import { loginWithTelegramCode } from '../lib/api'
import { useCompleteLogin } from '../lib/session'
import { IconLock, IconTelegram } from '../ui/icons'
import { Button } from '../ui/primitives'

const BOT_URL = 'https://t.me/MilliyGoApp_bot'

/** Telegram bot orqali kirish (superapp auth_page bilan bir xil oqim) */
export default function GoLogin({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState<'start' | 'code'>('start')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const device = useRef<string>('')
  const complete = useCompleteLogin()

  useEffect(() => {
    fingerprint
      .generate()
      .then((r: any) => (device.current = r?.visitorId || ''))
      .catch(() => undefined)
  }, [])

  const verify = async (value = code) => {
    if (value.length < 6) {
      message.warning('6 ta raqamni kiriting')
      return
    }
    setLoading(true)
    try {
      const tokens = await loginWithTelegramCode(value, device.current)
      await complete(tokens)
      message.success('Muvaffaqiyatli kirdingiz')
      onDone?.()
    } catch {
      message.error("Kod noto'g'ri yoki muddati o'tgan")
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'start') {
    return (
      <div className="flex flex-col items-center px-1 py-2 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/go/logo.png" alt="MilliyGo" className="h-16 w-16 rounded-[18px]" />
        <h2 className="mb-0 mt-3 text-[1.625rem] font-[900] tracking-[-0.6px] text-go-ink">
          Tizimga kirish
        </h2>
        <p className="mb-0 mt-1 text-[0.9375rem] text-go-muted">
          Hisob ochish shart emas — bir bosishda kiring
        </p>
        <button
          type="button"
          onClick={() => {
            window.open(BOT_URL, '_blank', 'noopener')
            setStep('code')
          }}
          className="mt-6 flex min-h-[60px] w-full cursor-pointer items-center gap-3 rounded-[18px] border-0 bg-[#2AABEE] px-4 text-left text-white hover:bg-[#229ED9]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <IconTelegram size={22} />
          </span>
          <span className="flex-1">
            <span className="block text-[1.0312rem] font-[800]">Telegram</span>
            <span className="block text-[0.8125rem] opacity-90">Rasmiy bot orqali</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setStep('code')}
          className="mt-3 cursor-pointer border-0 bg-transparent text-[0.875rem] font-[700] text-go-green"
        >
          Menda kod bor
        </button>
        <div className="mt-5 flex items-center gap-2 text-[0.8125rem] text-go-muted">
          <IconLock size={15} /> Xavfsiz kirish — parol kerak emas
        </div>
        <p className="mb-0 mt-3 text-[0.7812rem] text-go-muted">
          Kirish orqali siz bizning{' '}
          <Link href="/privacy/" className="text-go-green">
            maxfiylik siyosatimizga
          </Link>{' '}
          rozilik bildirasiz
        </p>
      </div>
    )
  }

  return (
    <div className="px-1 py-2">
      <h2 className="m-0 text-[1.5rem] font-[900] tracking-[-0.5px] text-go-ink">
        Telegram orqali tasdiqlash
      </h2>
      <p className="mb-0 mt-1 text-[0.9062rem] text-go-muted">
        Telegram <b>@MilliyGoApp_bot</b> orqali yuborilgan 6 xonali maxfiy kodni kiriting
      </p>
      <ol className="mb-0 mt-4 space-y-1.5 rounded-[16px] bg-go-chip p-4 pl-8 text-[0.875rem] text-go-ink">
        <li>
          Telegram botga kiring:{' '}
          <a
            href={BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-[800] text-[#229ED9]"
          >
            @MilliyGoApp_bot
          </a>
        </li>
        <li>
          <b>/start</b> tugmasini bosing
        </li>
        <li>Bot yuborgan 6 xonali kodni kiriting</li>
      </ol>
      <div className="mt-5 flex justify-center">
        <Input.OTP
          length={6}
          size="large"
          value={code}
          onChange={(v) => {
            setCode(v)
            if (v.length === 6) verify(v)
          }}
          formatter={(s) => s.replace(/\D/g, '')}
        />
      </div>
      <Button
        block
        className="mt-5"
        onClick={() => verify()}
        loading={loading}
        disabled={code.length < 6}
      >
        Tasdiqlash
      </Button>
      <div className="mt-3 flex items-center justify-between text-[0.8438rem]">
        <button
          type="button"
          onClick={() => setStep('start')}
          className="cursor-pointer border-0 bg-transparent font-[700] text-go-muted"
        >
          ← Orqaga
        </button>
        <a
          href={BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-[700] text-go-green no-underline"
        >
          Botdan qayta olish
        </a>
      </div>
      <p className="mb-0 mt-4 text-center text-[0.7812rem] text-go-muted">
        Yordam kerakmi?{' '}
        <a
          href={SUPPORT_TELEGRAM}
          target="_blank"
          rel="noopener noreferrer"
          className="text-go-green"
        >
          Qo&apos;llab-quvvatlash
        </a>
      </p>
    </div>
  )
}
