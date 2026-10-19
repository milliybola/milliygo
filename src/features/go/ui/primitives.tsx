import { Drawer, Modal } from 'antd'
import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import { cx } from '../lib/utils'
import { IconArrowRight, IconBack, IconClose, IconMinus, IconPlus } from './icons'

export function useIsMobile(breakpoint = 1024) {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const on = () => setMobile(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [breakpoint])
  return mobile
}

/** Sahifa kengligi: telefon — 16px yon oraliq, desktop — markazda */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('mx-auto w-full max-w-[720px] px-4 lg:max-w-[1180px] lg:px-6', className)}>
      {children}
    </div>
  )
}

export function Card({
  children,
  className,
  as: As = 'div',
}: {
  children: ReactNode
  className?: string
  as?: any
}) {
  return (
    <As className={cx('rounded-[20px] border border-solid border-go-line bg-white', className)}>
      {children}
    </As>
  )
}

export function SectionTitle({
  children,
  action,
  className,
}: {
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('mb-3 flex items-center justify-between gap-3', className)}>
      <h2 className="m-0 text-[1.125rem] font-[800] leading-tight tracking-[-0.4px] text-[#1B1F2E]">
        {children}
      </h2>
      {action}
    </div>
  )
}

export function SeeAll({ href, label = 'Barchasi' }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[36px] items-center gap-1 text-[0.875rem] font-[800] text-go-green no-underline hover:opacity-80"
    >
      {label} <IconArrowRight size={18} />
    </Link>
  )
}
type BtnVariant = 'primary' | 'gold' | 'ghost' | 'outline' | 'danger' | 'blue'

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  loading,
  className,
  type = 'button',
  href,
  block,
  size = 'lg',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: BtnVariant
  disabled?: boolean
  loading?: boolean
  className?: string
  type?: 'button' | 'submit'
  href?: string
  block?: boolean
  size?: 'md' | 'lg'
}) {
  const styles: Record<BtnVariant, string> = {
    primary: 'bg-go-green text-white hover:bg-[#136B33]',
    gold: 'bg-go-gold text-go-ink hover:bg-[#E5A800]',
    ghost: 'bg-go-chip text-go-ink hover:bg-[#E9EAEE]',
    outline: 'bg-white text-go-ink border border-solid border-go-line2 hover:border-go-green',
    danger: 'bg-[#FEF2F2] text-[#B91C1C] hover:bg-[#FEE2E2]',
    blue: 'bg-go-blue text-white hover:bg-[#1D4ED8]',
  }
  const cls = cx(
    'inline-flex select-none items-center justify-center gap-2 rounded-[16px] font-[800] no-underline transition-colors',
    size === 'lg' ? 'min-h-[52px] px-5 text-[1rem]' : 'min-h-[44px] px-4 text-[0.9375rem]',
    styles[variant],
    (disabled || loading) && 'pointer-events-none opacity-50',
    block && 'w-full',
    className
  )
  const content = (
    <>
      {loading && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-t-transparent" />
      )}
      {children}
    </>
  )
  if (href) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    )
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cx(cls, 'cursor-pointer border-0')}
    >
      {content}
    </button>
  )
}

export function IconButton({
  children,
  onClick,
  label,
  className,
  href,
}: {
  children: ReactNode
  onClick?: () => void
  label: string
  className?: string
  href?: string
}) {
  const cls = cx(
    'inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-solid border-go-line2 bg-white text-go-ink no-underline hover:bg-go-chip',
    className
  )
  if (href)
    return (
      <Link href={href} aria-label={label} title={label} className={cls}>
        {children}
      </Link>
    )
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={cls}>
      {children}
    </button>
  )
}

export function BackButton({ fallback = '/' }: { fallback?: string }) {
  return (
    <IconButton
      label="Orqaga"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) window.history.back()
        else window.location.href = fallback
      }}
    >
      <IconBack size={22} />
    </IconButton>
  )
}

export function Chip({
  active,
  children,
  onClick,
  className,
  icon,
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
  className?: string
  /** Ilovadagidek chip ikonkasi (faol bo'lganda oq rangga o'tadi) */
  icon?: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'inline-flex min-h-[38px] shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border-0 px-[13px] text-[0.8125rem] font-[500] transition-colors',
        active
          ? 'bg-go-green text-white'
          : 'bg-white text-[#4B5563] shadow-[0_1px_10px_rgba(0,0,0,0.07)] hover:bg-go-chip',
        className
      )}
    >
      {icon}
      {children}
    </button>
  )
}
/** "Yetkazish | O'zi olib ketish" segment */
export function Segment<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T
  options: { value: T; label: ReactNode; activeClass?: string }[]
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div className={cx('flex rounded-[16px] bg-go-chip p-1', className)} role="tablist">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cx(
              'flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-[12px] border-0 text-[0.9375rem] font-[800] transition-all',
              active
                ? cx('bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]', o.activeClass || 'text-go-ink')
                : 'bg-transparent text-go-muted'
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** "+" ↔ "− N +" (superapp _AddStepper) */
export function Stepper({
  count,
  onInc,
  onDec,
  size = 44,
  disabled,
  className,
  floating = true,
}: {
  count: number
  onInc: () => void
  onDec: () => void
  size?: number
  disabled?: boolean
  className?: string
  floating?: boolean
}) {
  const expanded = count > 0
  const btn = (icon: ReactNode, onClick: () => void, label: string) => (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent text-go-green disabled:opacity-40"
      style={{ width: size, height: size }}
    >
      {icon}
    </button>
  )
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cx(
        'inline-flex items-center overflow-hidden rounded-full bg-white transition-all duration-200',
        floating && 'shadow-[0_3px_10px_rgba(0,0,0,0.12)]',
        className
      )}
      style={{ height: size, width: expanded ? undefined : size }}
    >
      {expanded ? (
        <>
          {btn(<IconMinus size={size * 0.5} />, onDec, 'Kamaytirish')}
          <span
            className="min-w-[22px] text-center text-[1.0625rem] font-[800] text-go-ink"
            aria-live="polite"
          >
            {count}
          </span>
          {btn(<IconPlus size={size * 0.5} />, onInc, "Qo'shish")}
        </>
      ) : (
        btn(<IconPlus size={size * 0.55} />, onInc, "Savatga qo'shish")
      )}
    </div>
  )
}

export function Img({
  src,
  alt,
  className,
  grayscale,
}: {
  src?: string | null
  alt: string
  className?: string
  grayscale?: boolean
}) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={cx('relative overflow-hidden bg-go-chip', className)}>
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={cx('h-full w-full object-cover', grayscale && 'grayscale-[90%]')}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-[1.75rem] text-[#C9CDD4]"
          aria-hidden
        >
          🍽
        </div>
      )}
    </div>
  )
}

export function Badge({
  children,
  tone = 'red',
}: {
  children: ReactNode
  tone?: 'red' | 'gold' | 'green' | 'blue' | 'dark'
}) {
  const t = {
    red: 'bg-go-red text-white',
    gold: 'bg-go-gold text-go-ink',
    green: 'bg-go-green text-white',
    blue: 'bg-go-blue text-white',
    dark: 'bg-[rgba(17,17,17,0.78)] text-white',
  }[tone]
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-[8px] px-[7px] py-[3px] text-[0.75rem] font-[900] leading-none',
        t
      )}
    >
      {children}
    </span>
  )
}

export function Notice({
  children,
  tone = 'warn',
  icon,
  className,
}: {
  children: ReactNode
  tone?: 'warn' | 'danger' | 'info' | 'success'
  icon?: ReactNode
  className?: string
}) {
  const t = {
    warn: 'bg-[#FFF7E6] text-[#92400E]',
    danger: 'bg-[#FEF2F2] text-[#991B1B]',
    info: 'bg-go-bluesoft text-[#1E40AF]',
    success: 'bg-go-soft text-go-green',
  }[tone]
  return (
    <div
      className={cx(
        'flex items-start gap-2.5 rounded-[14px] px-3.5 py-2.5 text-[0.8438rem] font-[600] leading-snug',
        t,
        className
      )}
    >
      {icon && <span className="mt-[1px] shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-[16px] bg-go-chip', className)} />
}

export function EmptyState({
  emoji = '🍽',
  title,
  text,
  action,
}: {
  emoji?: string
  title: string
  text?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-go-soft text-[2.375rem]"
        aria-hidden
      >
        {emoji}
      </div>
      <h3 className="m-0 text-[1.25rem] font-[900] tracking-[-0.4px] text-go-ink">{title}</h3>
      {text && (
        <p className="mx-auto mb-0 mt-2 max-w-[360px] text-[0.9375rem] leading-relaxed text-go-muted">
          {text}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Telefonda — pastdan chiquvchi varaq, desktopda — markaziy oyna */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 520,
  bodyClassName,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  width?: number
  bodyClassName?: string
}) {
  const mobile = useIsMobile()
  const header = title ? (
    <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-1">
      <div className="min-w-0">
        <h3 className="m-0 text-[1.375rem] font-[900] leading-tight tracking-[-0.4px] text-go-ink">
          {title}
        </h3>
        {subtitle && (
          <p className="mb-0 mt-1 text-[0.875rem] leading-snug text-go-muted">{subtitle}</p>
        )}
      </div>
      <IconButton label="Yopish" onClick={onClose} className="!h-10 !w-10 border-0 bg-go-chip">
        <IconClose size={20} />
      </IconButton>
    </div>
  ) : null
  const body = (
    <>
      {header}
      <div className={cx('px-5 pb-4', bodyClassName)}>{children}</div>
      {footer && (
        <div className="sticky bottom-0 border-0 border-t border-solid border-go-line bg-white px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
          {footer}
        </div>
      )}
    </>
  )
  if (mobile) {
    return (
      <Drawer
        open={open}
        onClose={onClose}
        placement="bottom"
        height="auto"
        closable={false}
        destroyOnHidden
        rootClassName="go-sheet"
        styles={{
          wrapper: { maxHeight: '92vh' },
          content: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92vh' },
          body: { padding: 0 },
        }}
      >
        <div className="flex justify-center pb-2 pt-2.5" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-[#E5E7EB]" />
        </div>
        {body}
      </Drawer>
    )
  }
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={width}
      destroyOnHidden
      rootClassName="go-modal"
      styles={{ content: { padding: 0, borderRadius: 24, overflow: 'hidden' } }}
    >
      <div className="max-h-[86vh] overflow-y-auto pt-4">{body}</div>
    </Modal>
  )
}

/** Telefonda pastki sticky harakat paneli; desktopda oddiy blok */
export function StickyBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'fixed inset-x-0 bottom-0 z-[60] border-0 border-t border-solid border-go-line bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:static lg:z-auto lg:mt-4 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none',
        className
      )}
    >
      <div className="mx-auto w-full max-w-[720px] lg:max-w-[1180px]">{children}</div>
    </div>
  )
}

export function Row({
  icon,
  title,
  subtitle,
  right,
  onClick,
  href,
  className,
}: {
  icon?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  right?: ReactNode
  onClick?: () => void
  href?: string
  className?: string
}) {
  const inner = (
    <>
      {icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-go-chip text-go-ink">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[1rem] font-[600] text-go-ink">{title}</span>
        {subtitle && (
          <span className="mt-0.5 block text-[0.8438rem] leading-snug text-go-muted">
            {subtitle}
          </span>
        )}
      </span>
      {right}
    </>
  )
  const cls = cx(
    'flex min-h-[56px] w-full items-center gap-3 border-0 bg-transparent py-2 text-inherit no-underline',
    (onClick || href) && 'cursor-pointer',
    className
  )
  if (href)
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    )
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={cls}>
        {inner}
      </button>
    )
  return <div className={cls}>{inner}</div>
}
