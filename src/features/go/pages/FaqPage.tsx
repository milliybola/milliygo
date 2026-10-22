import { TELEGRAM_BOT_NAME } from '@/constants/env'
import Link from 'next/link'
import { SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY, SUPPORT_TELEGRAM } from '../layout/GoFooter'
import { Card, Page } from '../ui/primitives'

const FAQ: { group: string; items: { q: string; a: string }[] }[] = [
  {
    group: 'Buyurtma berish',
    items: [
      {
        q: 'Qanday qilib buyurtma beraman?',
        a: "Manzilingizni tanlang, restoran yoki do'konni oching, kerakli mahsulotlarni savatga qo'shing va savatdan buyurtmani rasmiylashtiring. Buyurtma holatini «Buyurtmalarim» bo'limida kuzatib borasiz.",
      },
      {
        q: 'Nega manzilni tanlash kerak?',
        a: "Yetkazish vaqti, narxi va qaysi maskanlar sizga yetkazib berishi manzilga bog'liq. Manzil tanlanmasa, maskanlar ro'yxatini ko'rishingiz mumkin, lekin yetkazish shartlari ko'rsatilmaydi.",
      },
      {
        q: "Bir nechta restoran yoki do'kondan buyurtma bera olamanmi?",
        a: 'Ha. Har bir maskan uchun alohida savat yuritiladi, buyurtmalar esa alohida rasmiylashtiriladi.',
      },
      {
        q: 'Aksiyalar (1+1, 2+1) qanday ishlaydi?',
        a: "Aksiyali mahsulotda belgi ko'rsatiladi. Savatda bepul donalar va tejagan summangiz alohida ko'rinadi, yakuniy narxni server hisoblaydi.",
      },
    ],
  },
  {
    group: 'Yetkazish va olib ketish',
    items: [
      {
        q: 'Yetkazish qancha vaqt oladi va qancha turadi?',
        a: "Yetkazish vaqti va narxi maskan va manzilingizga qarab belgilanadi, manzil tanlangach maskan kartasida va savatda ko'rinadi.",
      },
      {
        q: "Buyurtmani o'zim olib keta olamanmi?",
        a: "Ha, restoranlarda «O'zi olib ketish» rejimi mavjud. Buyurtma tayyor bo'lganda sizga xabar beriladi va restoran manzili xaritada ko'rsatiladi. Do'konlarda olib ketish mavjud emas.",
      },
      {
        q: 'Buyurtmani qanday kuzataman?',
        a: "«Buyurtmalarim» bo'limidan kerakli buyurtmani oching: holati bosqichma-bosqich, yetkazishda esa kuryer ma'lumotlari ko'rsatiladi.",
      },
      {
        q: "Buyurtmani bekor qilsam bo'ladimi?",
        a: "Bekor qilish buyurtma holatiga bog'liq. Buyurtma tayyorlanishni boshlagan bo'lsa, yordam xizmatiga murojaat qiling.",
      },
    ],
  },
  {
    group: "To'lov",
    items: [
      {
        q: "Qanday to'lov turlari mavjud?",
        a: "Hozircha buyurtmalar naqd pul bilan to'lanadi. Qaytim kerak bo'lsa, buyurtma berishda summani ko'rsating.",
      },
    ],
  },
  {
    group: 'Hisob',
    items: [
      {
        q: 'Qanday kiraman?',
        a: `Telegramdagi @${TELEGRAM_BOT_NAME} orqali olingan 6 xonali kod bilan kirasiz. Alohida parol shart emas.`,
      },
      {
        q: "Hisobimni qanday o'chiraman?",
        a: "Hisobni o'chirish bo'yicha ko'rsatma «Hisobni o'chirish» sahifasida berilgan.",
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <Page className="py-5 lg:py-8">
      <div className="mx-auto max-w-[820px]">
        <nav aria-label="Yo'l" className="mb-3 text-[0.875rem] text-go-muted">
          <Link href="/" className="text-go-muted no-underline hover:text-go-green">
            Asosiy
          </Link>
          <span className="mx-2">/</span>
          <span>Savol-javoblar</span>
        </nav>
        <h1 className="m-0 mb-1 text-[1.75rem] font-[900] leading-tight tracking-[-0.6px] text-go-ink lg:text-[2.25rem]">
          Savol-javoblar
        </h1>
        <p className="m-0 mb-6 text-[0.9375rem] text-go-muted">
          MilliyGo xizmatidan foydalanish bo&apos;yicha eng ko&apos;p so&apos;raladigan savollar.
        </p>

        {FAQ.map((g) => (
          <section key={g.group} className="mb-6">
            <h2 className="m-0 mb-3 text-[1.125rem] font-[900] text-go-ink">{g.group}</h2>
            <Card className="divide-y divide-solid divide-go-line overflow-hidden">
              {g.items.map((it) => (
                <details key={it.q} className="group">
                  <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-[1rem] font-[700] text-go-ink lg:px-5 [&::-webkit-details-marker]:hidden">
                    {it.q}
                    <span
                      aria-hidden
                      className="shrink-0 text-[1.375rem] font-[500] leading-none text-go-muted transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="m-0 px-4 pb-4 text-[0.9375rem] leading-relaxed text-go-muted lg:px-5">
                    {it.a}
                  </p>
                </details>
              ))}
            </Card>
          </section>
        ))}

        <Card className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5">
          <div>
            <div className="text-[1.0625rem] font-[900] text-go-ink">Javob topa olmadingizmi?</div>
            <div className="text-[0.875rem] text-go-muted">Yordam xizmati sizga yordam beradi.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={SUPPORT_TELEGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center rounded-full bg-go-green px-5 text-[0.9375rem] font-[800] text-white no-underline"
            >
              Telegramda yozish
            </a>
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="inline-flex min-h-[44px] items-center rounded-full bg-go-chip px-5 text-[0.9375rem] font-[800] text-go-ink no-underline"
            >
              {SUPPORT_PHONE_DISPLAY}
            </a>
          </div>
        </Card>
      </div>
    </Page>
  )
}
