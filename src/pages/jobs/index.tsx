import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Jobs from '@/features/Jobs/Jobs'

const isDev = process.env.NODE_ENV === 'development'

export async function getStaticProps(context: any) {
  let messages = {}
  try {
    if (context && context.locale) {
      messages = (await import(`../../locales/${context.locale}.json`)).default
    } else {
      messages = (await import(`../../locales/uz.json`)).default
    }
  } catch (err) {
    console.warn('Failed to load locales for', context?.locale)
  }
  return { props: { messages } }
}

const JobsPage = () => {
  const router = useRouter()

  useEffect(() => {
    if (!isDev) {
      router.replace('/')
    }
  }, [router])

  if (!isDev) {
    return null
  }

  return <Jobs />
}

export default JobsPage
