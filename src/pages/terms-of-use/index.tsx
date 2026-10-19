import Seo from '@/components/common/Seo'
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

const TermsOfUsePage = () => {
  const t = useTranslations()
  const hasHydrated = useHasHydrated()

  const breadCrumbItems = [
    {
      title: t('preferences.main') || 'Asosiy',
      href: '/',
    },
    {
      title: 'Foydalanish shartlari',
    },
  ]

  if (!hasHydrated) return null

  return (
    <>
      <Seo
        title="Foydalanish shartlari"
        description="MilliyGo xizmatidan foydalanish shartlari: buyurtma berish, yetkazib berish, to'lov va tomonlarning mas'uliyati."
        path="/terms-of-use/"
      />
      <main className="min-h-screen bg-[#FAF9F6] pb-16">
        <CBreadcrumb items={breadCrumbItems} />
        <div className="container flex max-w-4xl flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-8 text-gray-700 shadow-sm md:p-12">
          <h1 className="!m-0 text-3xl font-black text-gray-900">
            MilliyGo – Foydalanish shartlari
          </h1>
          <p className="!m-0 text-sm text-gray-500">
            <strong>Kuchga kirgan sana:</strong> 9-iyun, 2026-yil
          </p>
          <p className="!m-0 text-sm text-gray-500">
            <strong>Aloqa uchun:</strong>{' '}
            <a href="mailto:info@milliyapp.uz" className="font-bold text-[#008080] hover:underline">
              info@milliyapp.uz
            </a>
          </p>

          <hr className="my-2 border-gray-100" />

          <h2 className="text-xl font-bold text-gray-900">1. Shartlarni qabul qilish</h2>
          <p className="leading-relaxed">
            MilliyGo veb-sayti yoki mobil ilovasidan (keyingi o'rinlarda — "Platforma") foydalanish
            orqali siz ushbu Foydalanish shartlariga to'liq rozilik bildirasiz. Agar siz ushbu
            shartlarga rozi bo'lmasangiz, iltimos, Platformadan foydalanmang.
          </p>

          <h2 className="text-xl font-bold text-gray-900">2. Xizmat doirasi va MVP bosqichi</h2>
          <p className="leading-relaxed">
            MilliyGo — G'allaorol tumanida faoliyat yurituvchi tezkor yetkazib berish xizmati
            hisoblanadi. Hozirda xizmat MVP (minimal ishchi mahsulot) bosqichida bo'lib, faqat
            restoranlar, kafelar, fast-fud shaxobchalari, do'konlar va supermarketlardan
            buyurtmalarni yetkazib berish bilan cheklanadi.
          </p>

          <h2 className="text-xl font-bold text-gray-900">
            3. Buyurtmalarni rasmiylashtirish va bekor qilish
          </h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              Foydalanuvchi buyurtma berayotganda to'g'ri telefon raqami, ism va aniq manzilni
              (geolokatsiyani) taqdim etishi shart.
            </li>
            <li>
              Buyurtma hamkor do'kon yoki restoran tomonidan qabul qilinib, tayyorlanish jarayoni
              boshlanganidan so'ng uni bekor qilish imkoniyati cheklanadi.
            </li>
            <li>
              Agar foydalanuvchi noto'g'ri manzil ko'rsatgan bo'lsa va bu kurer yetib borishiga
              to'sqinlik qilsa, buyurtma bekor qilinishi va yetkazib berish haqi undirilishi mumkin.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900">4. To'lov shartlari</h2>
          <p className="leading-relaxed">
            Buyurtmalar uchun to'lovlar naqd pulda kurerga topshirilishi yoki Platformada ulangan
            to'lov tizimlari orqali onlayn tarzda amalga oshiriladi.
          </p>

          <h2 className="text-xl font-bold text-gray-900">5. Javobgarlikni cheklash</h2>
          <p className="leading-relaxed">
            MilliyGo restoran yoki do'konlar tomonidan tayyorlangan taom va mahsulotlarning bevosita
            sifati, tarkibi yoki ta'mi uchun javobgar emas. Ushbu sifat masalalari uchun hamkor
            savdo shaxobchalari javobgarlikni o'z zimmalariga oladilar. MilliyGo buyurtmalarni o'z
            vaqtida va xavfsiz holatda yetkazib berishga javobgardir.
          </p>

          <h2 className="text-xl font-bold text-gray-900">6. Intellektual mulk huquqlari</h2>
          <p className="leading-relaxed">
            Platformadagi barcha dizayn elementlari, logotiplar, dasturiy kod va matnlar MilliyGo
            brendiga tegishli. Ulardan ruxsatsiz foydalanish yoki nusxa ko'chirish qat'iyan man
            etiladi.
          </p>

          <h2 className="text-xl font-bold text-gray-900">7. Xizmatni to'xtatish</h2>
          <p className="leading-relaxed">
            Agar foydalanuvchi tizimdan firibgarlik maqsadida foydalansa, asossiz buyurtmalar bersa
            yoki kurerlar xavfsizligiga tahdid solsa, MilliyGo uning profilini ogohlantirishsiz
            bloklash huquqini saqlab qoladi.
          </p>

          <h2 className="text-xl font-bold text-gray-900">8. Shartlarning o'zgarishi</h2>
          <p className="leading-relaxed">
            Biz ushbu shartlarni vaqti-vaqti bilan o'zgartirishimiz mumkin. Shartlar o'zgargandan
            so'ng Platformadan foydalanishda davom etish yangilangan shartlarni qabul qilganingizni
            anglatadi.
          </p>

          <h2 className="text-xl font-bold text-gray-900">9. Amaldagi qonunchilik</h2>
          <p className="leading-relaxed">
            Ushbu shartlar O'zbekiston Respublikasining amaldagi qonunchiligiga muvofiq tartibga
            solinadi va talqin qilinadi.
          </p>

          <h2 className="text-xl font-bold text-gray-900">10. Bog'lanish</h2>
          <p className="leading-relaxed">
            Foydalanish shartlari bo'yicha savollaringiz bo'lsa, quyidagi aloqa kanallari orqali
            bizga murojaat qiling:
            <br />
            Email:{' '}
            <a href="mailto:info@milliyapp.uz" className="font-bold text-[#008080] hover:underline">
              info@milliyapp.uz
            </a>
            <br />
            Telefon:{' '}
            <a href="tel:+998904969007" className="font-bold text-[#008080] hover:underline">
              +998 90 496 90 07
            </a>
          </p>

          <p className="mt-4 font-semibold text-gray-900">
            MilliyGo xizmatidan foydalanganingiz uchun tashakkur bildiramiz!
          </p>
        </div>
      </main>
    </>
  )
}

export default TermsOfUsePage
