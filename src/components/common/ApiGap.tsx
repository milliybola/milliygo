import { Tooltip } from 'antd'
import type { CSSProperties } from 'react'

/**
 * API'da hali yo'q ma'lumot/endpoint o'rnini ko'rsatuvchi belgi.
 * Ma'lumot to'qib chiqarilmaydi — o'rniga shu belgi turadi. Hammasi API_GAPS.md da.
 * O'chirish: NEXT_PUBLIC_SHOW_API_GAPS=false
 */
export const SHOW_API_GAPS = process.env.NEXT_PUBLIC_SHOW_API_GAPS !== 'false'

interface ApiGapProps {
  /** Nima yetishmaydi (tooltip matni): maydon yoki endpoint */
  note: string
  /** Qisqa yorliq (standart: "API") */
  label?: string
  className?: string
  style?: CSSProperties
}

export default function ApiGap({ note, label = 'API', className, style }: ApiGapProps) {
  if (!SHOW_API_GAPS) return null
  return (
    <Tooltip title={note}>
      <span
        title={note}
        aria-label={`API yetishmaydi: ${note}`}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          border: '1.5px dashed #F59E0B',
          color: '#B45309',
          background: 'rgba(245, 158, 11, 0.08)',
          borderRadius: 999,
          padding: '1px 8px',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.3,
          lineHeight: '16px',
          whiteSpace: 'nowrap',
          cursor: 'help',
          verticalAlign: 'middle',
          ...style,
        }}
      >
        {label}
      </span>
    </Tooltip>
  )
}
