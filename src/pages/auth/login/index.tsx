import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import GoLogin from '@/features/go/components/GoLogin'
import { Logo } from '@/features/go/layout/GoHeader'
import { useSession } from '@/features/go/lib/session'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated } = useSession()
  const next =
    typeof router.query.next === 'string' && router.query.next.startsWith('/')
      ? router.query.next
      : '/'
  useEffect(() => {
    if (isAuthenticated) router.replace(next)
  }, [isAuthenticated, next, router])
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Head>
        <title>Kirish — MilliyGo</title>
      </Head>
      <div className="px-4 py-4">
        <Logo />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-10">
        <div className="w-full max-w-[420px] rounded-[24px] border border-solid border-go-line p-5">
          <GoLogin onDone={() => router.replace(next)} />
        </div>
      </div>
    </div>
  )
}
