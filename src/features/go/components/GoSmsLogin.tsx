import { Input, message } from 'antd'
import { useEffect, useState, type MutableRefObject } from 'react'
import { apiErrorMessage, loginWithSmsCode, sendSmsCode } from '../lib/api'
import { useCompleteLogin } from '../lib/session'
import { Button } from '../ui/primitives'

const RESEND_SECONDS = 60

/** "901234567" → "90 123 45 67" */
const pretty = (d: string) =>
  [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ')

/** SMS orqali kirish: telefon → 6 xonali kod. Telegram'siz mijozlar uchun. */
export default function GoSmsLogin({
  device,
  onBack,
  onDone,
}: {
  device: MutableRefObject<string>
  onBack: () => void
  onDone?: () => void
}) {
  const [digits, setDigits] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [wait, setWait] = useState(0)
  const complete = useCompleteLogin()
  const phone = `998${digits}`

  useEffect(() => {
    if (wait <= 0) return
    const t = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  const send = async () => {
    if (digits.length !== 9) {
      message.warning("Telefon raqamini to'liq kiriting")
      return
    }
    setLoading(true)
    try {
      await sendSmsCode(phone)
      setSent(true)
      setCode('')
      setWait(RESEND_SECONDS)
    } catch (e) {
      message.error(apiErrorMessage(e, "SMS yuborib bo'lmadi. Keyinroq urinib ko'ring"))
    } finally {
      setLoading(false)
    }
  }

  const verify = async (value = code) => {
    if (value.length !== 6) return
    setLoading(true)
    try {
      const tokens = await loginWithSmsCode(phone, value, device.current)
      await complete(tokens)
      message.success('Muvaffaqiyatli kirdingiz')
      onDone?.()
    } catch (e) {
      message.error(apiErrorMessage(e, "Kod noto'g'ri yoki muddati o'tgan"))
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-1 py-2">
      <h2 className="m-0 text-[1.5rem] font-[900] tracking-[-0.5px] text-go-ink">
        SMS orqali kirish
      </h2>
      <p className="mb-0 mt-1 text-[0.9062rem] text-go-muted">
        {sent
          ? `+${phone.slice(0, 3)} ${pretty(digits)} raqamiga yuborilgan 6 xonali kodni kiriting`
          : "Telefon raqamingizga tasdiqlash kodi yuboramiz. Raqam bo'lmasa, hisob avtomatik ochiladi"}
      </p>

      {!sent ? (
        <>
          <Input
            className="mt-5"
            size="large"
            addonBefore="+998"
            inputMode="numeric"
            autoFocus
            placeholder="90 123 45 67"
            value={pretty(digits)}
            onChange={(e) => setDigits(e.target.value.replace(/\D/g, '').slice(0, 9))}
            onPressEnter={send}
          />
          <Button
            block
            className="mt-5"
            onClick={send}
            loading={loading}
            disabled={digits.length !== 9}
          >
            SMS kod yuborish
          </Button>
        </>
      ) : (
        <>
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
              onClick={() => setSent(false)}
              className="cursor-pointer border-0 bg-transparent font-[700] text-go-muted"
            >
              Raqamni o&apos;zgartirish
            </button>
            <button
              type="button"
              disabled={wait > 0 || loading}
              onClick={send}
              className="cursor-pointer border-0 bg-transparent font-[700] text-go-green disabled:cursor-default disabled:opacity-50"
            >
              {wait > 0 ? `Qayta yuborish (${wait}s)` : 'Qayta yuborish'}
            </button>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onBack}
        className="mt-4 cursor-pointer border-0 bg-transparent text-[0.8438rem] font-[700] text-go-muted"
      >
        ← Orqaga
      </button>
    </div>
  )
}
