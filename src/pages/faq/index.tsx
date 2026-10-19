import Seo from '@/components/common/Seo'
import FaqPage from '@/features/go/pages/FaqPage'

const QA: [string, string][] = [
  [
    'Qanday qilib buyurtma beraman?',
    "Manzilingizni tanlang, restoran yoki do'konni oching, mahsulotlarni savatga qo'shing va buyurtmani rasmiylashtiring.",
  ],
  [
    "Buyurtmani o'zim olib keta olamanmi?",
    "Ha, restoranlarda «O'zi olib ketish» rejimi mavjud. Do'konlarda olib ketish yo'q.",
  ],
  ["Qanday to'lov turlari mavjud?", "Hozircha buyurtmalar naqd pul bilan to'lanadi."],
]

export default function Faq() {
  return (
    <>
      <Seo
        title="Savol-javoblar"
        description="MilliyGo bo'yicha ko'p so'raladigan savollar: buyurtma berish, yetkazish va olib ketish, to'lov, hisob. Javob topmasangiz — yordam xizmati."
        path="/faq/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: QA.map(([q, a]) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
          })),
        }}
      />
      <FaqPage />
    </>
  )
}
