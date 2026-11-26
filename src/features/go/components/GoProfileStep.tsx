import { DatePicker, Input, message } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import dayjs, { type Dayjs } from 'dayjs'
import { useState } from 'react'
import { apiErrorMessage, saveBasicProfile } from '../lib/api'
import { Button } from '../ui/primitives'

/** SMS bilan kirgan, ismi yoki tug'ilgan sanasi bo'sh mijoz: Ism (majburiy), Familiya (ixtiyoriy), Tug'ilgan kun (majburiy) */
export default function GoProfileStep({
  initialName = '',
  onDone,
}: {
  initialName?: string
  onDone?: () => void
}) {
  const [first, ...rest] = initialName.trim().split(/\s+/)
  const [firstName, setFirstName] = useState(first || '')
  const [lastName, setLastName] = useState(rest.join(' '))
  const [birth, setBirth] = useState<Dayjs | null>(null)
  const [loading, setLoading] = useState(false)
  const qc = useQueryClient()

  const valid = firstName.trim().length > 0 && !!birth

  const save = async () => {
    if (!firstName.trim()) {
      message.warning('Ismingizni kiriting')
      return
    }
    if (!birth) {
      message.warning("Tug'ilgan kuningizni kiriting")
      return
    }
    setLoading(true)
    try {
      await saveBasicProfile({
        full_name: [firstName.trim(), lastName.trim()].filter(Boolean).join(' '),
        birth_date: birth.format('YYYY-MM-DD'),
      })
      qc.invalidateQueries({ queryKey: ['go', 'me'] })
      message.success('Muvaffaqiyatli kirdingiz')
      onDone?.()
    } catch (e) {
      message.error(apiErrorMessage(e, "Saqlab bo'lmadi. Qayta urinib ko'ring"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-1 py-2">
      <h2 className="m-0 text-[1.5rem] font-[900] tracking-[-0.5px] text-go-ink">
        Ma&apos;lumotlaringiz
      </h2>
      <p className="mb-0 mt-1 text-[0.9062rem] text-go-muted">
        Buyurtmangizni to&apos;g&apos;ri yetkazishimiz uchun o&apos;zingiz haqingizda yozing
      </p>

      <label className="mt-5 block text-[0.8438rem] font-[700] text-go-ink">
        Ism <span className="text-red-500">*</span>
      </label>
      <Input
        className="mt-1"
        size="large"
        autoFocus
        maxLength={50}
        placeholder="Ismingiz"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />

      <label className="mt-4 block text-[0.8438rem] font-[700] text-go-ink">Familiya</label>
      <Input
        className="mt-1"
        size="large"
        maxLength={49}
        placeholder="Familiyangiz (ixtiyoriy)"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />

      <label className="mt-4 block text-[0.8438rem] font-[700] text-go-ink">
        Tug&apos;ilgan kun <span className="text-red-500">*</span>
      </label>
      <DatePicker
        className="mt-1 w-full"
        size="large"
        format="DD.MM.YYYY"
        placeholder="kk.oo.yyyy"
        value={birth}
        onChange={(d) => setBirth(d)}
        defaultPickerValue={dayjs().subtract(20, 'year')}
        disabledDate={(d) => d.isAfter(dayjs(), 'day') || d.isBefore(dayjs().subtract(110, 'year'))}
        inputReadOnly={false}
      />

      <Button block className="mt-6" onClick={save} loading={loading} disabled={!valid}>
        Davom etish
      </Button>
    </div>
  )
}
