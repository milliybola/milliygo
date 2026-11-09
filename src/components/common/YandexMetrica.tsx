import { useRouter } from 'next/router'
import Script from 'next/script'
import { useEffect } from 'react'
import { YM_ID, trackPageView } from '@/utils/analytics'

/** Yandex Metrica: skript + Next.js sahifalar o'tishini hisoblash. NEXT_PUBLIC_YM_ID bo'lmasa chizilmaydi. */
const YandexMetrica = () => {
  const router = useRouter()

  useEffect(() => {
    if (!YM_ID) return
    const onDone = (url: string) => trackPageView(url)
    router.events.on('routeChangeComplete', onDone)
    return () => router.events.off('routeChangeComplete', onDone)
  }, [router.events])

  if (!YM_ID) return null
  return (
    <Script id="yandex-metrica" strategy="afterInteractive">
      {`
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
        ym(${YM_ID}, "init", {
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          webvisor: true,
          defer: false
        });
      `}
    </Script>
  )
}

export default YandexMetrica
