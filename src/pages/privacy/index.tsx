import CBreadcrumb from '@/components/common/CBreadcrumb'
import { useTranslations } from 'next-intl'
import { useHasHydrated } from '@/hooks/useHasHydrated'

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

const PrivacyPage = () => {
  const t = useTranslations()
  const hasHydrated = useHasHydrated()

  const breadCrumbItems = [
    {
      title: t('preferences.main') || 'Asosiy',
      href: '/',
    },
    {
      title: 'Maxfiylik siyosati',
    },
  ]

  if (!hasHydrated) return null

  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-16">
      <CBreadcrumb items={breadCrumbItems} />
      <div className="container flex max-w-4xl flex-col gap-8 rounded-3xl border border-gray-100 bg-white p-8 text-gray-700 shadow-sm md:p-12">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <h1 className="!m-0 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
            MilliyGo – Maxfiylik va shaxsiy ma'lumotlarni himoya qilish siyosati
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#008080]"></span>
              <strong>Kuchga kirgan sana:</strong> 9-iyun, 2026-yil
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#C5A059]"></span>
              <strong>Oxirgi yangilangan:</strong> 14-iyun, 2026-yil
            </span>
            <span className="flex items-center gap-1.5">
              <strong>Aloqa:</strong>{' '}
              <a
                href="mailto:info@milliyapp.uz"
                className="font-semibold text-[#008080] hover:underline"
              >
                info@milliyapp.uz
              </a>
            </span>
          </div>
        </div>

        <hr className="my-1 border-gray-100" />

        {/* Intro */}
        <div className="rounded-2xl border border-teal-100/50 bg-gradient-to-r from-teal-50/50 to-amber-50/30 p-6 leading-relaxed text-gray-800">
          Ushbu Maxfiylik va shaxsiy ma'lumotlarni himoya qilish siyosati (keyingi o'rinlarda —{' '}
          <strong>"Siyosat"</strong>)<strong> "MilliyGo"</strong> xizmati (keyingi o'rinlarda —{' '}
          <strong>"MilliyGo"</strong>, <strong>"Tizim"</strong> yoki
          <strong> "Biz"</strong>) foydalanuvchilarining (keyingi o'rinlarda —{' '}
          <strong>"Foydalanuvchi"</strong> yoki
          <strong> "Siz"</strong>) shaxsiy ma'lumotlarini to'plash, tizimlashtirish, saqlash,
          o'zgartirish, to'ldirish, foydalanish, berish, egasizlantirish, bloklash va yo'q qilish
          (qayta ishlash) tartibi hamda shartlarini belgilaydi.
          <br />
          <br />
          Mazkur Siyosat O'zbekiston Respublikasining 2019-yil 2-iyuldagi{' '}
          <strong>"Shaxsiy ma'lumotlar to'g'risida"gi O'RQ-547-sonli Qonuni</strong>
          va sohaga oid boshqa normativ-huquqiy hujjatlar talablariga muvofiq ishlab chiqilgan va
          amal qiladi.
        </div>

        {/* Section 1 */}
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 font-mono text-sm text-[#008080]">
              1
            </span>
            Qayta ishlanadigan shaxsiy ma'lumotlar tarkibi
          </h2>
          <p className="leading-relaxed">
            Biz foydalanuvchilarga xizmat ko'rsatish hamda Tizim faoliyatini ta'minlash maqsadida
            quyidagi shaxsiy ma'lumotlarni yig'amiz:
          </p>
          <ul className="space-y-3 border-l-2 border-gray-100 pl-4">
            <li className="leading-relaxed">
              <strong className="text-gray-900">
                1.1. Foydalanuvchi taqdim etadigan ma'lumotlar:
              </strong>{' '}
              Tizimda ro'yxatdan o'tish va identifikatsiyalash uchun telefon raqami, ism, familiya
              va ixtiyoriy ravishda elektron pochta manzili.
            </li>
            <li className="leading-relaxed">
              <strong className="text-gray-900">1.2. Geolokatsiya va manzil ma'lumotlari:</strong>{' '}
              Buyurtmalarni manziligacha aniq va tez yetkazib berish uchun foydalanuvchi tomonidan
              ko'rsatilgan yetkazish manzili (ko'cha nomi, uy raqami, kvartira) hamda qurilma
              tomonidan taqdim etiladigan GPS geolokatsiya koordinatalari (foydalanuvchi ruxsat
              berganda).
            </li>
            <li className="leading-relaxed">
              <strong className="text-gray-900">1.3. Tranzaksiya va buyurtmalar tarixi:</strong>{' '}
              Savatcha tarkibi, xarid qilingan tovarlar ro'yxati, to'lov usuli (naqd yoki karta
              orqali), tranzaksiya summasi va buyurtma amalga oshirilgan vaqt.
            </li>
            <li className="leading-relaxed">
              <strong className="text-gray-900">1.4. Texnik va tizimli ma'lumotlar:</strong>{' '}
              IP-manzil, brauzer turi va versiyasi, qurilma modeli, operatsion tizim versiyasi,
              unikal identifikatorlar (IMEI, Device ID), cookie-fayllar va Tizim bilan o'zaro aloqa
              interfeysi ma'lumotlari.
            </li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 font-mono text-sm text-[#008080]">
              2
            </span>
            Shaxsiy ma'lumotlarni qayta ishlash maqsadlari
          </h2>
          <p className="leading-relaxed">
            Biz foydalanuvchilarning shaxsiy ma'lumotlarini faqat qonuniy va quyidagi aniq
            belgilangan maqsadlar uchun qayta ishlaymiz:
          </p>
          <ul className="space-y-3 border-l-2 border-gray-100 pl-4">
            <li className="leading-relaxed">
              <strong className="text-gray-900">2.1. Shartnomaviy majburiyatlarni bajarish:</strong>{' '}
              Buyurtmalarni qabul qilish, rasmiylashtirish, tayyorlash hamda kurerlar orqali
              manzilingizga tezkor yetkazib berish.
            </li>
            <li className="leading-relaxed">
              <strong className="text-gray-900">2.2. Aloqa va xabardor qilish:</strong> Buyurtmaning
              holati o'zgarishi, yetkazib berish jarayoni hamda kurerning yetib borishi to'g'risida
              foydalanuvchini qo'ng'iroq, SMS yoki PUSH-bildirishnomalar orqali xabardor qilish.
            </li>
            <li className="leading-relaxed">
              <strong className="text-gray-900">2.3. Mijozlarni qo'llab-quvvatlash:</strong>{' '}
              Tizimdan foydalanish jarayonida yuzaga keladigan har qanday muammo, savol yoki
              e'tirozlarni tezkorlik bilan hal qilish.
            </li>
            <li className="leading-relaxed">
              <strong className="text-gray-900">
                2.4. Xizmatlarni tahlil qilish va yaxshilash:
              </strong>{' '}
              Foydalanuvchilarning afzalliklari va buyurtma tendensiyalarini tahlil qilish orqali
              Tizim interfeysini qulaylashtirish hamda xizmatlar sifatini oshirish.
            </li>
            <li className="leading-relaxed">
              <strong className="text-gray-900">2.5. Xavfsizlikni ta'minlash:</strong> Firibgarlik
              harakatlari, shaxsiy ma'lumotlarni ruxsatsiz o'zgartirish yoki tizimga kiberhujumlarni
              aniqlash, ularning oldini olish.
            </li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 font-mono text-sm text-[#008080]">
              3
            </span>
            Ma'lumotlarni uchinchi shaxslarga taqdim etish
          </h2>
          <p className="leading-relaxed">
            Biz shaxsiy ma'lumotlarni uchinchi shaxslarga sotmaymiz yoki boshqa tijoriy maqsadlarda
            ijaraga bermaymiz. Shaxsiy ma'lumotlar faqat buyurtmani bajarish hamda qonun talablariga
            muvofiq quyidagi holatlarda uchinchi shaxslarga taqdim etilishi mumkin:
          </p>
          <ul className="space-y-3 border-l-2 border-gray-100 pl-4">
            <li className="leading-relaxed">
              <strong className="text-gray-900">3.1. Hamkor do'kon va restoranlarga:</strong>{' '}
              Buyurtmani to'g'ri tarkibda tayyorlash va qadoqlash uchun faqatgina buyurtma egasining
              ismi, buyurtma kodi va tarkibi uzatiladi.
            </li>
            <li className="leading-relaxed">
              <strong className="text-gray-900">3.2. Kurerlarga (Yetkazib beruvchilarga):</strong>{' '}
              Buyurtmani ko'rsatilgan manzilga to'g'ri va kechiktirmasdan yetkazish uchun kurerga
              buyurtmachining ismi, telefon raqami, manzili hamda xaritadagi koordinatalari
              beriladi.
            </li>
            <li className="leading-relaxed">
              <strong className="text-gray-900">3.3. Vakolatli davlat organlariga:</strong>{' '}
              O'zbekiston Respublikasining amaldagi qonun hujjatlariga muvofiq, sud yoki huquqni
              muhofaza qiluvchi organlarning rasmiy, qonuniy so'rovlari va asoslantirilgan qarorlari
              mavjud bo'lgan holatlarda.
            </li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 font-mono text-sm text-[#008080]">
              4
            </span>
            Ma'lumotlar xavfsizligi va saqlash shartlari
          </h2>
          <p className="leading-relaxed">
            Biz shaxsiy ma'lumotlarning daxlsizligi va xavfsizligini ta'minlash uchun barcha
            tashkiliy va texnik choralarni ko'ramiz:
          </p>
          <ul className="space-y-3 border-l-2 border-gray-100 pl-4">
            <li className="leading-relaxed">
              <strong className="text-gray-900">4.1. Saqlash joyi:</strong> Barcha shaxsiy
              ma'lumotlar O'zbekiston Respublikasining "Shaxsiy ma'lumotlar to'g'risida"gi Qonuni
              22.1-moddasi talablariga muvofiq O'zbekiston hududida joylashgan serverlarda va
              ma'lumotlar bazalarida saqlanadi.
            </li>
            <li className="leading-relaxed">
              <strong className="text-gray-900">4.2. Himoya choralari:</strong> Tizimda
              ma'lumotlarni uzatishda SSL/TLS shifrlash texnologiyalari qo'llaniladi. Ma'lumotlar
              bazalariga kirish faqat vakolatli xodimlarga va cheklangan doirada beriladi.
            </li>
            <li className="leading-relaxed">
              <strong className="text-gray-900">4.3. Saqlash muddati:</strong> Shaxsiy ma'lumotlar
              Foydalanuvchining hisobi (akkaunti) faol bo'lgan muddatda hamda Qonun hujjatlarida
              belgilangan da'vo muddatlari yakunlangunga qadar saqlanadi.
            </li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 font-mono text-sm text-[#008080]">
              5
            </span>
            Foydalanuvchining huquqlari
          </h2>
          <p className="leading-relaxed">
            Foydalanuvchilar o'z shaxsiy ma'lumotlariga nisbatan quyidagi huquqlarga ega:
          </p>
          <ul className="space-y-3 border-l-2 border-gray-100 pl-4">
            <li className="leading-relaxed">
              <strong className="text-gray-900">5.1. Ma'lumot olish:</strong> Tizimda o'ziga
              taalluqli bo'lgan qanday shaxsiy ma'lumotlar saqlanayotganligi haqida ma'lumot olish.
            </li>
            <li className="leading-relaxed">
              <strong className="text-gray-900">5.2. Tuzatish kiritish:</strong> Noto'g'ri, to'liq
              bo'lmagan yoki eskirgan shaxsiy ma'lumotlarni o'zgartirish va to'ldirish.
            </li>
            <li className="leading-relaxed">
              <strong className="text-gray-900">5.3. Qayta ishlashni cheklash va taqiqlash:</strong>{' '}
              O'z shaxsiy ma'lumotlarini qayta ishlashga berilgan rozilikni istalgan vaqtda qaytarib
              olish.
            </li>
            <li className="leading-relaxed">
              <strong className="text-gray-900">
                5.4. Ma'lumotlarni o'chirish (Unutilish huquqi):
              </strong>{' '}
              Shaxsiy akkauntini hamda unga tegishli barcha ma'lumotlarni tizimimizdan to'liq va
              qaytarilmas tarzda o'chirib tashlashni talab qilish.
            </li>
          </ul>
        </div>

        {/* Section 6 (Important Notice box) */}
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/50 bg-amber-50/50 p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-amber-900">
            ⚠️ Shaxsiy ma'lumotlarni o'chirish tartibi
          </h3>
          <p className="!m-0 text-sm leading-relaxed text-amber-800">
            Agar siz o'z hisobingiz va tizimdagi barcha ma'lumotlaringizni o'chirishni istasangiz,
            quyidagi usullardan foydalanishingiz mumkin:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-amber-800">
            <li>
              <strong>Ilova orqali:</strong> Profil sozlamalariga kirib, "Hisobni o'chirish"
              tugmasini bosish orqali.
            </li>
            <li>
              <strong>Murojaat orqali:</strong>{' '}
              <a href="mailto:info@milliyapp.uz" className="font-semibold underline">
                info@milliyapp.uz
              </a>{' '}
              elektron manziliga yoki rasmiy Telegram qo'llab-quvvatlash botimiz orqali o'chirish
              haqida so'rov yuborish.
            </li>
          </ul>
          <p className="!m-0 text-xs font-medium leading-relaxed text-amber-700">
            * Hisobingiz o'chirilgandan so'ng, tizimdagi ma'lumotlaringiz, jumladan buyurtmalar
            tarixi, bonus va chegirmalar butunlay o'chib ketadi va qayta tiklanmaydi. Murojaatingiz
            kelib tushgan kundan boshlab maksimal 3 ish kuni ichida ma'lumotlar to'liq o'chiriladi.
          </p>
        </div>

        {/* Section 7 */}
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 font-mono text-sm text-[#008080]">
              6
            </span>
            Cookie-fayllar va kesh
          </h2>
          <p className="leading-relaxed">
            Biz veb-saytimiz va ilovamizning to'g'ri ishlashi, til sozlamalari, avtorizatsiya holati
            va savatcha ma'lumotlarini saqlab qolish uchun cookie-fayllardan (Cookies) foydalanamiz.
            Siz o'z brauzeringiz sozlamalarida cookie-fayllarni qabul qilishni cheklashingiz yoki
            butunlay o'chirishingiz mumkin, biroq bu holatda Tizimning ba'zi xizmatlari to'g'ri
            ishlamasligi mumkin.
          </p>
        </div>

        {/* Section 8 */}
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 font-mono text-sm text-[#008080]">
              7
            </span>
            Siyosatga kiritiladigan o'zgarishlar
          </h2>
          <p className="leading-relaxed">
            Ushbu Maxfiylik siyosati xizmatlarimiz rivojlanishi yoki qonunchilikdagi o'zgarishlarga
            qarab yangilanishi mumkin. O'zgarishlar kuchga kirgandan keyin ularni ushbu sahifada
            e'lon qilamiz. Tizimdan foydalanishni davom ettirishingiz yangilangan shartlarga rozi
            ekanligingizni anglatadi.
          </p>
        </div>

        {/* Section 9 */}
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 font-mono text-sm text-[#008080]">
              8
            </span>
            Bog'lanish va huquqiy rekvizitlar
          </h2>
          <p className="leading-relaxed">
            Maxfiylik siyosatiga doir savollar yoki shaxsiy ma'lumotlaringiz bo'yicha murojaatlar
            bo'lsa, quyidagi aloqa kanallari orqali murojaat qilishingiz mumkin:
          </p>
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-6 text-sm md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-gray-500">Kompaniya nomi:</span>
              <strong className="text-gray-900">MilliyGo yetkazib berish xizmati</strong>
              <span className="mt-2 text-gray-500">Manzil:</span>
              <strong className="text-gray-900">
                O'zbekiston Respublikasi, Jizzax viloyati, G'allaorol tumani
              </strong>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-gray-500">Elektron pochta:</span>
              <strong className="text-gray-900">
                <a href="mailto:info@milliyapp.uz" className="text-[#008080] hover:underline">
                  info@milliyapp.uz
                </a>
              </strong>
              <span className="mt-2 text-gray-500">Telefon raqami:</span>
              <strong className="text-gray-900">
                <a href="tel:+998904969007" className="text-[#008080] hover:underline">
                  +998 90 496 90 07
                </a>
              </strong>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center font-semibold text-[#008080]">
          Shaxsiy ma'lumotlaringiz xavfsizligini va daxlsizligini ta'minlash bizning ustuvor
          vazifamizdir!
        </p>
      </div>
    </main>
  )
}

export default PrivacyPage
