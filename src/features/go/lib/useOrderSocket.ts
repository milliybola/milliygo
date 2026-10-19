import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { normalizeCourier } from './normalize'
import type { Order } from './types'

/**
 * Jonli kuzatish: wss://mytizim.uz/ws/order/<uuid>/ (superapp bilan bir xil kanal).
 * Superapp tokenni `Authorization` sarlavhasida yuboradi — brauzer WebSocket'ida
 * sarlavha yuborib bo'lmaydi, shuning uchun `?token=` bilan urinamiz. Ulanmasa —
 * sahifa 15 soniyalik so'rov (polling) bilan ishlashda davom etadi.
 */
export function useOrderSocket(uuid: string | undefined, enabled: boolean) {
  const qc = useQueryClient()
  const [connected, setConnected] = useState(false)
  const [courierPos, setCourierPos] = useState<[number, number] | null>(null)
  const retry = useRef(0)

  useEffect(() => {
    if (!uuid || !enabled || typeof window === 'undefined') return
    let ws: WebSocket | null = null
    let ping: ReturnType<typeof setInterval> | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    let closed = false

    const connect = () => {
      const token = localStorage.getItem('access_token') || ''
      try {
        ws = new WebSocket(
          `wss://mytizim.uz/ws/order/${uuid}/${token ? `?token=${encodeURIComponent(token)}` : ''}`
        )
      } catch {
        return
      }
      ws.onopen = () => {
        retry.current = 0
        setConnected(true)
        ping = setInterval(
          () => ws?.readyState === 1 && ws.send(JSON.stringify({ action: 'ping' })),
          30000
        )
      }
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data)
          if (data?.action === 'pong') return
          if (data?.lat != null && data?.lng != null) {
            const la = parseFloat(data.lat)
            const ln = parseFloat(data.lng)
            if (Number.isFinite(la) && Number.isFinite(ln)) setCourierPos([la, ln])
          }
          qc.setQueryData<Order | undefined>(['go', 'order', uuid], (old) => {
            if (!old) return old
            const courier = normalizeCourier(data)
            return {
              ...old,
              status: data?.status ? String(data.status).toUpperCase() : old.status,
              courier: courier ? { ...(old.courier || {}), ...courier } : old.courier,
            }
          })
          if (data?.status) qc.invalidateQueries({ queryKey: ['go', 'orders'] })
        } catch {
          /* noto'g'ri xabar */
        }
      }
      ws.onclose = () => {
        setConnected(false)
        if (ping) clearInterval(ping)
        if (closed || retry.current > 5) return
        retry.current += 1
        timer = setTimeout(connect, 5000 * retry.current)
      }
      ws.onerror = () => ws?.close()
    }
    connect()
    return () => {
      closed = true
      if (ping) clearInterval(ping)
      if (timer) clearTimeout(timer)
      ws?.close()
    }
  }, [uuid, enabled, qc])

  return { connected, courierPos }
}
