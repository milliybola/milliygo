import { App as AppAntd, ConfigProvider } from 'antd'
import { NextIntlClientProvider } from 'next-intl'
import { Onest } from 'next/font/google'
import { useRouter } from 'next/router'
import NextNProgress from 'nextjs-progressbar'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { YMaps } from '@pbe/react-yandex-maps'
import { YANDEX_API_KEY } from '@/constants/api-keys'

import type { AppProps } from 'next/app'

import CLayout from '@/components/common/CLayout'
import SupportChat from '@/components/common/SupportChat'
import { queryClient } from '@/config/queryClient'
import { AuthProvider } from '@/features/Account/auth/context/authContext'
import { getAntdLocaleCode } from '@/helpers/get-antd-locale-code'
import { useFallbackMessage } from '@/hooks/useFallbackMessage'
import { colors } from '@/styles'
import uz_UZ from 'antd/lib/locale/uz_UZ'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import theme from '../theme/themeConfig'
import '@/styles/globals.css'
import 'swiper/css'
import 'react-datepicker/dist/react-datepicker.css'
import GlobalLoginModal from '@/features/Account/auth/components/GlobalLoginModal'

export const onest = Onest({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
  variable: '--font-onest',
})

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()
  const [locale, setLocale] = useState<any>(uz_UZ)
  const { getFallbackMessage } = useFallbackMessage()

  useEffect(() => {
    async function loadLocale() {
      const localeCode = router.locale || 'uz'
      const antdLocaleCode = getAntdLocaleCode(localeCode)
      try {
        const antdLocale = await import(`antd/locale/${antdLocaleCode}`)
        if (antdLocale && antdLocale.default) {
          setLocale(antdLocale.default)
        }
      } catch (err) {
        console.warn(`Failed to load antd locale for ${antdLocaleCode}`, err)
      }
    }

    loadLocale()
  }, [router.locale])

  return (
    <>
      <Head>
        <title>Milliy Go - yetkazib berish xizmati</title>
        <meta name="description" content="Ovqat va mahsulotlarni tez va oson buyurtma qiling" />
        <meta name="agd-partner-manual-verification" />
      </Head>
      <ConfigProvider theme={theme} locale={locale}>
        <NextIntlClientProvider
          locale={router.locale || 'uz'}
          timeZone="Asia/Tashkent"
          messages={pageProps.messages ?? {}}
          getMessageFallback={({ key }) => {
            return getFallbackMessage(key)
          }}
        >
          <AppAntd>
            <style jsx global>{`
              :root {
                font-family: ${onest.style.fontFamily};
              }
            `}</style>

            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <NextNProgress color={colors.primary} height={2} options={{ showSpinner: false }} />
                <GlobalLoginModal />
                <YMaps query={{ apikey: YANDEX_API_KEY, lang: 'uz_UZ' as any }}>
                  <CLayout>
                    <Component {...pageProps} />
                    <SupportChat />
                  </CLayout>
                </YMaps>
                <ReactQueryDevtools initialIsOpen={false} />
              </AuthProvider>
            </QueryClientProvider>
          </AppAntd>
        </NextIntlClientProvider>
      </ConfigProvider>
    </>
  )
}

export default App
