import { useEffect, useRef, useState } from 'react'
import { Img } from '../ui/primitives'

/**
 * Sovg'a qo'shilganda — "salyut" (konfetti) + toast kartochka.
 * `cart.setQty` `window` ga `mg:gift` hodisasini yuboradi; shu komponent eshitadi.
 * Hech qanday tashqi kutubxonasiz: konfetti — bir nechta DOM bo'lagi + CSS keyframe.
 */
type GiftDetail = { name: string; image: string | null; gift: number; added: number }

const COLORS = ['#15803D', '#22C55E', '#86EFAC', '#FACC15', '#F59E0B', '#FB7185', '#38BDF8']
const PIECES = 34

type Piece = {
  id: number
  left: number
  tx: number
  ty: number
  rot: number
  delay: number
  dur: number
  color: string
  size: number
  round: boolean
}

function makePieces(seed: number): Piece[] {
  // Markazdan "otiladigan" bo'laklar (salyut): tasodifiy burchak + masofa
  return Array.from({ length: PIECES }, (_, i) => {
    const angle = (Math.PI * 2 * i) / PIECES + (Math.random() - 0.5) * 0.5
    const dist = 90 + Math.random() * 170
    return {
      id: seed * 1000 + i,
      left: 44 + Math.random() * 12, // markazga yaqin (%)
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist - 40 - Math.random() * 60, // yuqoriga ko'proq (gravitatsiya hissi)
      rot: (Math.random() - 0.5) * 540,
      delay: Math.random() * 90,
      dur: 900 + Math.random() * 700,
      color: COLORS[i % COLORS.length],
      size: 7 + Math.round(Math.random() * 6),
      round: Math.random() > 0.5,
    }
  })
}

export default function GiftCelebration() {
  const [detail, setDetail] = useState<GiftDetail | null>(null)
  const [pieces, setPieces] = useState<Piece[]>([])
  const [seed, setSeed] = useState(0)
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const mq =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null
    let count = 0
    const onGift = (e: Event) => {
      const d = (e as CustomEvent<GiftDetail>).detail
      if (!d) return
      count += 1
      setSeed(count)
      setDetail(d)
      setPieces(mq?.matches ? [] : makePieces(count))
      if (hideRef.current) clearTimeout(hideRef.current)
      hideRef.current = setTimeout(() => setDetail(null), 2400)
    }

    window.addEventListener('mg:gift', onGift as EventListener)
    return () => {
      window.removeEventListener('mg:gift', onGift as EventListener)
      if (hideRef.current) clearTimeout(hideRef.current)
    }
  }, [])

  if (!detail) return null

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      {/* Konfetti (salyut) — ekran markazidan */}
      {pieces.length > 0 && (
        <div style={{ position: 'absolute', top: '38%', left: 0, right: 0, height: 0 }}>
          {pieces.map((p) => (
            <span
              key={p.id}
              style={
                {
                  position: 'absolute',
                  left: `${p.left}%`,
                  width: p.size,
                  height: p.size * (p.round ? 1 : 0.55),
                  background: p.color,
                  borderRadius: p.round ? '50%' : 2,
                  opacity: 0,
                  ['--tx' as any]: `${p.tx}px`,
                  ['--ty' as any]: `${p.ty}px`,
                  ['--rot' as any]: `${p.rot}deg`,
                  animation: `mg-burst ${p.dur}ms cubic-bezier(.17,.67,.37,1) ${p.delay}ms forwards`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* Toast kartochka */}
      <div
        key={seed}
        style={{
          marginTop: 'max(18px, env(safe-area-inset-top))',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 18px 12px 12px',
          borderRadius: 999,
          background: 'linear-gradient(135deg, #15803D, #22C55E)',
          color: '#fff',
          boxShadow: '0 12px 32px rgba(21,128,61,.38)',
          animation: 'mg-pop 360ms cubic-bezier(.2,.9,.3,1.3)',
          maxWidth: 'min(92vw, 420px)',
        }}
      >
        <span
          style={{
            position: 'relative',
            width: 44,
            height: 44,
            borderRadius: 14,
            background: 'rgba(255,255,255,.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {detail.image ? (
            <Img src={detail.image} alt="" className="h-full w-full" />
          ) : (
            <span style={{ fontSize: 24 }}>🎁</span>
          )}
          <span
            style={{
              position: 'absolute',
              right: -2,
              bottom: -2,
              fontSize: 18,
              animation: 'mg-gift-bounce 700ms ease',
            }}
          >
            🎁
          </span>
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 15, fontWeight: 900, lineHeight: 1.1 }}>
            {detail.added > 1 ? `${detail.added} ta sovg'a qo'shildi!` : "Sovg'a qo'shildi! 🎉"}
          </span>
          <span
            style={{
              display: 'block',
              fontSize: 12.5,
              fontWeight: 600,
              opacity: 0.92,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {detail.name} · bepul
          </span>
        </span>
      </div>

      <style jsx global>{`
        @keyframes mg-burst {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0);
          }
          12% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx), calc(var(--ty) + 220px)) rotate(var(--rot));
          }
        }
        @keyframes mg-pop {
          0% {
            opacity: 0;
            transform: translateY(-14px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes mg-gift-bounce {
          0% {
            transform: scale(0) rotate(-20deg);
          }
          55% {
            transform: scale(1.35) rotate(8deg);
          }
          100% {
            transform: scale(1) rotate(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes mg-pop {
            0%,
            100% {
              opacity: 1;
              transform: none;
            }
          }
        }
      `}</style>
    </div>
  )
}
