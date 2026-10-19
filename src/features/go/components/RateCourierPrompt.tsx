import { Input, message } from 'antd'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { rateCourier } from '../lib/api'
import type { Order } from '../lib/types'
import { cx } from '../lib/utils'
import { IconStar } from '../ui/icons'
import { Button, Sheet } from '../ui/primitives'

const LABELS = ['', 'Yomon 😞', 'Qoniqarsiz 😕', "O'rtacha 😐", 'Yaxshi 🙂', "A'lo 🤩"]
const dismissKey = (uuid: string) => `dismissed_rate_${uuid}`

/**
 * Yetkazilgan, baholanmagan va 24 soat ichidagi eng so'nggi buyurtma uchun
 * kuryerni baholash (superapp OrderRatingDialog). Faqat yetkazish buyurtmalari.
 */
export default function RateCourierPrompt({ orders }: { orders: Order[] }) {
  const qc = useQueryClient()
  const [order, setOrder] = useState<Order | null>(null)
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const newest = orders[0]
    if (!newest || newest.delivery_type === 'PICKUP') return
    const delivered = ['DELIVERED', 'COMPLETED'].includes(newest.status)
    const t = (newest.updated_at || newest.created_at)?.getTime() || 0
    const fresh = t > 0 && Date.now() - t <= 24 * 3600 * 1000
    if (
      delivered &&
      newest.evaluation !== true &&
      fresh &&
      !localStorage.getItem(dismissKey(newest.uuid))
    ) {
      setOrder(newest)
    }
  }, [orders])

  const close = () => {
    if (order) localStorage.setItem(dismissKey(order.uuid), '1')
    setOrder(null)
  }

  const submit = async () => {
    if (!order || !score) return
    setSending(true)
    try {
      await rateCourier(order.uuid, { score, comment: comment.trim() || 'Yaxshi xizmat' })
      localStorage.setItem(dismissKey(order.uuid), '1')
      setDone(true)
      qc.invalidateQueries({ queryKey: ['go', 'orders'] })
      setTimeout(() => setOrder(null), 2500)
    } catch {
      message.error('Baholashni yuborishda xatolik yuz berdi.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Sheet
      open={!!order}
      onClose={close}
      title={done ? 'Rahmat! 🎉' : 'Buyurtmangiz yetkazildi! 🎉'}
      subtitle={
        done
          ? 'Fikringiz biz uchun juda muhim.'
          : 'Kuryerimiz xizmatini baholang va fikringizni ulashing'
      }
      width={440}
      footer={
        done ? null : (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={close} className="flex-1">
              Keyinroq
            </Button>
            <Button onClick={submit} disabled={!score} loading={sending} className="flex-[2]">
              Baholash
            </Button>
          </div>
        )
      }
    >
      {!done && (
        <>
          <div className="flex justify-center gap-2 py-2" role="radiogroup" aria-label="Baho">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={score === n}
                aria-label={`${n} yulduz`}
                onClick={() => setScore(n)}
                className={cx(
                  'cursor-pointer border-0 bg-transparent p-1',
                  n <= score ? 'text-go-gold' : 'text-[#E5E7EB]'
                )}
              >
                <IconStar size={40} />
              </button>
            ))}
          </div>
          <div className="mb-3 h-5 text-center text-[0.9375rem] font-[700] text-go-ink">
            {LABELS[score]}
          </div>
          <Input.TextArea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Xizmat haqida batafsilroq fikringizni yozing... (ixtiyoriy)"
            autoSize={{ minRows: 3, maxRows: 5 }}
            maxLength={500}
          />
        </>
      )}
    </Sheet>
  )
}
