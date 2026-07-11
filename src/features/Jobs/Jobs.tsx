import React, { useState, useMemo } from 'react'
import { Modal, Form, Input, Select, Button, message, Tag, Radio } from 'antd'
import {
  SearchOutlined,
  PhoneOutlined,
  MessageOutlined,
  PlusOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  DollarCircleOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'

const BriefcaseIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

interface IVacancy {
  id: number
  title: string
  company: string
  salary: string
  type: 'fulltime' | 'parttime' | 'remote'
  description: string
  requirements: string
  phone: string
  telegram: string
  location: string
  date: string
}

interface IAnnouncement {
  id: number
  title: string
  price: string
  category: 'realestate' | 'auto' | 'electronics' | 'other'
  description: string
  phone: string
  telegram: string
  location: string
  date: string
}

const MOCK_VACANCIES: IVacancy[] = [
  {
    id: 1,
    title: 'Sotuvchi-konsultant',
    company: "G'allaorol Savdo Majmuasi",
    salary: '3 000 000 - 4 500 000 UZS',
    type: 'fulltime',
    description:
      "Kiyim-kechak do'koniga xushmuomala sotuvchi qizlarni ishga taklif qilamiz. Savdo sohasida tajriba bo'lsa yaxshi.",
    requirements: 'Xushmuomalalik, faollik, mijozlar bilan tushunisha olish.',
    phone: '+998 90 321 65 47',
    telegram: '@savdo_gallaorol',
    location: "G'allaorol markazi",
    date: 'Bugun',
  },
  {
    id: 2,
    title: 'Yetkazib beruvchi kuryer (Shaxsiy mashina yoki mototsiklda)',
    company: 'MilliyGo Delivery',
    salary: '4 000 000 - 8 000 000 UZS',
    type: 'parttime',
    description:
      "MilliyGo xizmatiga shaxsiy ulovga ega kuryerlarni taklif etamiz. Buyurtmalar soniga qarab kunlik to'lovlar kafolatlanadi.",
    requirements:
      'Haydovchilik guvohnomasi, shaxsiy transport vositasi, smartfon va xaritani bilish.',
    phone: '+998 93 111 22 44',
    telegram: '@milliygo_delivery',
    location: "G'allaorol tumani",
    date: 'Kecha',
  },
  {
    id: 3,
    title: 'Oshxona yordamchisi',
    company: 'Lazzat Milliy Taomlar',
    salary: '2 500 000 - 3 500 000 UZS',
    type: 'fulltime',
    description:
      'Milliy taomlar oshxonasiga idish-tovoq yuvish va sabzavotlarni tozalashda yordamlashadigan chaqqon xodim kerak.',
    requirements: "Tozalik va tartibga rioya qilish, chaqqonlik, jamoada ishlash ko'nikmasi.",
    phone: '+998 94 444 55 66',
    telegram: '@lazzat_taomlar',
    location: "Zomin-G'allaorol yo'li",
    date: '3 kun oldin',
  },
  {
    id: 4,
    title: 'Administrator',
    company: 'Lalmi Korxonasi',
    salary: '5 000 000 UZS',
    type: 'fulltime',
    description:
      "Ofis ishlarini muvofiqlashtirish, telefon qo'ng'iroqlariga javob berish va hujjatlar bilan ishlash uchun administrator qidirilmoqda.",
    requirements: "Kompyuter savodxonligi (Word, Excel), o'zbek va rus tillarini bilish.",
    phone: '+998 99 888 77 66',
    telegram: '@lalmi_admin',
    location: "G'allaorol shahar",
    date: '4 kun oldin',
  },
]

const MOCK_ANNOUNCEMENTS: IAnnouncement[] = [
  {
    id: 1,
    title: '2 xonali kvartira ijaraga beriladi',
    price: '2 000 000 UZS/oy',
    category: 'realestate',
    description:
      "G'allaorol markazida, maktab va bog'cha yaqinida joylashgan 2 xonali uy oilaga ijaraga beriladi. Hamma sharoitlari bor.",
    phone: '+998 90 999 88 11',
    telegram: '@ijara_gallaorol',
    location: "G'allaorol shahar",
    date: 'Bugun',
  },
  {
    id: 2,
    title: 'Chevrolet Spark sotiladi (Srochniy)',
    price: '6 800 USD',
    category: 'auto',
    description:
      "Yili 2018, yurgani 95 000 km, kraskasi toza. 2-pozitsiya, holati a'lo. Real xaridorlar uchun narxini kelishamiz.",
    phone: '+998 93 777 55 44',
    telegram: '@spark_sotiladi',
    location: "G'allaorol tumani",
    date: 'Kecha',
  },
  {
    id: 3,
    title: 'Kir yuvish mashinasi Samsung (Ishlatilgan)',
    price: '1 900 000 UZS',
    category: 'electronics',
    description:
      "Samsung 6 kg. Holati yaxshi, hech qanday nuqsoni yo'q. Yangi model olinganligi sababli sotilyapti.",
    phone: '+998 99 555 33 22',
    telegram: '@samsung_sell',
    location: "G'allaorol shahar",
    date: '2 kun oldin',
  },
  {
    id: 4,
    title: "Yo'qolgan kalitlar to'plami topildi",
    price: 'Suyunchi evaziga',
    category: 'other',
    description:
      "Istirohat bog'i atrofidan avtomobil pulti va 3 ta kalit solingan kalitlar to'plami topib olindi. Egasidan bog'lanishni so'raymiz.",
    phone: '+998 90 666 44 22',
    telegram: '@find_keys',
    location: "Markaziy Istirohat Bog'i",
    date: '3 kun oldin',
  },
]

const ANNOUNCEMENT_CATEGORIES = {
  realestate: "Ko'chmas mulk 🏠",
  auto: 'Avtotransport 🚗',
  electronics: 'Elektronika 📱',
  other: "Boshqa e'lonlar 📦",
}

const Jobs = () => {
  const [activeTab, setActiveTab] = useState<'vacancies' | 'announcements'>('vacancies')
  const [searchQuery, setSearchQuery] = useState('')
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<IVacancy | null>(null)

  const [postForm] = Form.useForm()
  const [applyForm] = Form.useForm()
  const [postType, setPostType] = useState<'vacancy' | 'announcement'>('vacancy')

  const handlePostSubmit = (values: any) => {
    message.success(
      "E'loningiz muvaffaqiyatli qabul qilindi! Tekshiruvdan so'ng 24 soat ichida chop etiladi."
    )
    setIsPostModalOpen(false)
    postForm.resetFields()
  }

  const handleApplySubmit = (values: any) => {
    message.success('Arizangiz ish beruvchiga muvaffaqiyatli yuborildi!')
    setIsApplyModalOpen(false)
    applyForm.resetFields()
  }

  const filteredVacancies = useMemo(() => {
    return MOCK_VACANCIES.filter((v) => {
      return (
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
  }, [searchQuery])

  const filteredAnnouncements = useMemo(() => {
    return MOCK_ANNOUNCEMENTS.filter((a) => {
      return (
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-emerald-100 bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-12 text-white md:px-8 xl:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Ish va Turli xil E'lonlar
              </h1>
              <p className="mt-2 max-w-xl text-[15px] font-semibold text-emerald-100">
                G'allaoroldagi bo'sh ish o'rinlari bilan tanishing yoki uyingizdagi buyumlarni
                soting. Hammasi bir joyda!
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setIsPostModalOpen(true)}
              className="h-auto border-none bg-yellow-400 py-3.5 text-base font-bold text-gray-900 shadow-lg hover:!bg-yellow-300 hover:!text-gray-900 active:scale-95"
            >
              E'lon berish
            </Button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto mt-8 max-w-6xl px-4 md:px-8">
        {/* Navigation Tabs and Search */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          {/* Custom Tabs */}
          <div className="flex w-full rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm md:w-auto">
            <button
              onClick={() => {
                setActiveTab('vacancies')
                setSearchQuery('')
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-black transition-all duration-300 md:flex-initial ${
                activeTab === 'vacancies'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-950'
              }`}
            >
              <BriefcaseIcon />
              <span>Bo'sh ish o'rinlari</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('announcements')
                setSearchQuery('')
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-black transition-all duration-300 md:flex-initial ${
                activeTab === 'announcements'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-950'
              }`}
            >
              <AppstoreOutlined />
              <span>Turli xil e'lonlar</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="flex-1 md:max-w-md">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder={
                activeTab === 'vacancies'
                  ? 'Kompaniya yoki ish nomini qidiring...'
                  : "E'lon nomi yoki tavsifini qidiring..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 rounded-2xl border-gray-200 px-4 text-sm shadow-sm focus:border-emerald-500"
              allowClear
            />
          </div>
        </div>

        {/* Dynamic Display Grid */}
        {activeTab === 'vacancies' ? (
          <div>
            <h2 className="mb-4 text-lg font-black text-gray-900">
              Ish o'rinlari ({filteredVacancies.length})
            </h2>
            {filteredVacancies.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-12 text-center">
                <span className="text-4xl">💼</span>
                <h3 className="mt-3 text-lg font-black text-gray-800">
                  Bo'sh ish o'rinlari topilmadi
                </h3>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  Qidiruv so'rovini o'zgartirib ko'ring.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredVacancies.map((vacancy) => (
                  <div
                    key={vacancy.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-emerald-100 hover:shadow-md"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[12px] font-black uppercase tracking-wider text-emerald-600">
                            {vacancy.company}
                          </span>
                          <h3 className="mt-1 text-base font-black text-gray-900 group-hover:text-emerald-700">
                            {vacancy.title}
                          </h3>
                        </div>
                        <Tag className="m-0 border-none bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700">
                          {vacancy.type === 'fulltime'
                            ? "To'liq kun"
                            : vacancy.type === 'parttime'
                              ? 'Yarim kun'
                              : 'Masofaviy'}
                        </Tag>
                      </div>

                      {/* Meta Info */}
                      <div className="mt-4 flex flex-wrap gap-4 text-[12px] font-semibold text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <DollarCircleOutlined className="text-sm text-gray-400" />
                          <span className="font-sans font-bold text-gray-900">
                            {vacancy.salary}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <EnvironmentOutlined className="text-sm text-gray-400" />
                          <span>{vacancy.location}</span>
                        </span>
                      </div>

                      {/* Description */}
                      <p className="mt-3 line-clamp-3 text-[13px] font-medium leading-relaxed text-gray-600">
                        {vacancy.description}
                      </p>

                      {/* Requirements */}
                      <div className="mt-3 rounded-xl bg-gray-50/80 p-3">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          Talablar:
                        </span>
                        <p className="m-0 text-[12px] font-semibold text-gray-700">
                          {vacancy.requirements}
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                      <span className="text-[11px] font-bold text-gray-400">
                        Joylashtirildi: {vacancy.date}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          type="default"
                          shape="circle"
                          icon={<MessageOutlined />}
                          href={`https://t.me/${vacancy.telegram.replace('@', '')}`}
                          target="_blank"
                          className="flex items-center justify-center border-gray-200 text-gray-600 hover:!border-emerald-600 hover:!text-emerald-600"
                        />
                        <Button
                          type="primary"
                          className="bg-emerald-600 font-bold hover:!bg-emerald-500"
                          onClick={() => {
                            setSelectedJob(vacancy)
                            setIsApplyModalOpen(true)
                          }}
                        >
                          Ariza yuborish
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="mb-4 text-lg font-black text-gray-900">
              E'lonlar ({filteredAnnouncements.length})
            </h2>
            {filteredAnnouncements.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-12 text-center">
                <span className="text-4xl">📦</span>
                <h3 className="mt-3 text-lg font-black text-gray-800">E'lonlar topilmadi</h3>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  Qidiruv so'rovini o'zgartirib ko'ring.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-emerald-100 hover:shadow-md"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-black leading-tight text-gray-900 group-hover:text-emerald-700">
                          {announcement.title}
                        </h3>
                      </div>

                      {/* Category Tag */}
                      <div className="mt-2.5">
                        <Tag className="m-0 border-none bg-emerald-50/70 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700">
                          {ANNOUNCEMENT_CATEGORIES[announcement.category]}
                        </Tag>
                      </div>

                      {/* Description */}
                      <p className="mt-3.5 line-clamp-3 text-[13px] font-medium leading-relaxed text-gray-600">
                        {announcement.description}
                      </p>

                      {/* Location */}
                      <div className="mt-4 flex items-center gap-1.5 text-[12px] font-semibold text-gray-400">
                        <EnvironmentOutlined />
                        <span>{announcement.location}</span>
                      </div>
                    </div>

                    {/* Pricing & Footer Actions */}
                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-50 pt-4">
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          Narxi
                        </span>
                        <span className="font-sans text-base font-black text-emerald-600">
                          {announcement.price}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="default"
                          shape="circle"
                          icon={<MessageOutlined />}
                          href={`https://t.me/${announcement.telegram.replace('@', '')}`}
                          target="_blank"
                          className="flex items-center justify-center border-gray-200 text-gray-600 hover:!border-emerald-600 hover:!text-emerald-600"
                        />
                        <Button
                          type="primary"
                          icon={<PhoneOutlined />}
                          href={`tel:${announcement.phone}`}
                          className="flex items-center justify-center bg-emerald-600 font-bold hover:!bg-emerald-500"
                        >
                          Qo'ng'iroq
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Modal */}
      <Modal
        title={
          <div className="border-b border-gray-100 pb-2 text-lg font-black text-gray-900">
            Yangi e'lon / vakansiya joylashtirish
          </div>
        }
        open={isPostModalOpen}
        onCancel={() => setIsPostModalOpen(false)}
        footer={null}
        width={500}
        centered
      >
        <div className="mt-4">
          <div className="mb-5 flex justify-center">
            <Radio.Group
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              buttonStyle="solid"
              className="custom-radio-group font-black"
            >
              <Radio.Button value="vacancy" className="px-5">
                Bo'sh ish o'rni
              </Radio.Button>
              <Radio.Button value="announcement" className="px-5">
                Turli xil e'lon
              </Radio.Button>
            </Radio.Group>
          </div>

          <Form form={postForm} layout="vertical" onFinish={handlePostSubmit}>
            <Form.Item
              label={<span className="text-sm font-bold text-gray-700">Sarlavha</span>}
              name="title"
              rules={[{ required: true, message: 'Sarlavhani kiriting' }]}
            >
              <Input placeholder="Sarlavhani kiriting" className="h-10 rounded-xl" />
            </Form.Item>

            {postType === 'vacancy' ? (
              <>
                <Form.Item
                  label={
                    <span className="text-sm font-bold text-gray-700">
                      Tashkilot / Kompaniya nomi
                    </span>
                  }
                  name="company"
                  rules={[{ required: true, message: 'Kompaniya nomini kiriting' }]}
                >
                  <Input placeholder="Masalan: MilliyGo" className="h-10 rounded-xl" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    label={<span className="text-sm font-bold text-gray-700">Bandlik turi</span>}
                    name="type"
                    initialValue="fulltime"
                  >
                    <Select className="h-10 rounded-xl">
                      <Select.Option value="fulltime">To'liq kun</Select.Option>
                      <Select.Option value="parttime">Yarim kun</Select.Option>
                      <Select.Option value="remote">Masofaviy</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-sm font-bold text-gray-700">Oylik maosh</span>}
                    name="salary"
                    rules={[{ required: true, message: 'Maoshni kiriting' }]}
                  >
                    <Input placeholder="Kelishiladi yoki miqdori" className="h-10 rounded-xl" />
                  </Form.Item>
                </div>

                <Form.Item
                  label={<span className="text-sm font-bold text-gray-700">Nomzodga talablar</span>}
                  name="requirements"
                  rules={[{ required: true, message: 'Talablarni yozing' }]}
                >
                  <Input.TextArea
                    placeholder="Masalan: Rus tilini bilishi, xushmuomalalik..."
                    rows={3}
                    className="rounded-xl"
                  />
                </Form.Item>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label={<span className="text-sm font-bold text-gray-700">Kategoriya</span>}
                  name="category"
                  initialValue="electronics"
                >
                  <Select className="h-10 rounded-xl">
                    <Select.Option value="realestate">Ko'chmas mulk</Select.Option>
                    <Select.Option value="auto">Avtotransport</Select.Option>
                    <Select.Option value="electronics">Elektronika</Select.Option>
                    <Select.Option value="other">Boshqa e'lonlar</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={<span className="text-sm font-bold text-gray-700">Narxi</span>}
                  name="price"
                  rules={[{ required: true, message: 'Narxni kiriting' }]}
                >
                  <Input placeholder="Masalan: 1 500 000 UZS" className="h-10 rounded-xl" />
                </Form.Item>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-sm font-bold text-gray-700">Telefon raqam</span>}
                name="phone"
                rules={[{ required: true, message: 'Telefon raqamni kiriting' }]}
              >
                <Input placeholder="+998 90 123 45 67" className="h-10 rounded-xl" />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-sm font-bold text-gray-700">
                    Telegram foydalanuvchi nomi
                  </span>
                }
                name="telegram"
              >
                <Input placeholder="@username" className="h-10 rounded-xl" />
              </Form.Item>
            </div>

            <Form.Item
              label={<span className="text-sm font-bold text-gray-700">Manzil</span>}
              name="location"
              rules={[{ required: true, message: 'Manzilni kiriting' }]}
            >
              <Input placeholder="Masalan: G'allaorol shahar" className="h-10 rounded-xl" />
            </Form.Item>

            <Form.Item
              label={<span className="text-sm font-bold text-gray-700">Batafsil tavsif</span>}
              name="description"
              rules={[{ required: true, message: "Batafsil ma'lumot yozing" }]}
            >
              <Input.TextArea
                placeholder="Batafsil tavsif kiriting..."
                rows={4}
                className="rounded-xl"
              />
            </Form.Item>

            <Form.Item className="mb-0 mt-6 flex justify-end gap-3">
              <Button
                onClick={() => setIsPostModalOpen(false)}
                className="h-10 rounded-xl font-bold"
              >
                Bekor qilish
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="h-10 rounded-xl bg-emerald-600 font-bold shadow-md hover:bg-emerald-500"
              >
                Chop etish
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Apply to Job Modal */}
      <Modal
        title={
          <div className="border-b border-gray-100 pb-2 text-lg font-black text-gray-900">
            Ishga ariza topshirish
          </div>
        }
        open={isApplyModalOpen}
        onCancel={() => setIsApplyModalOpen(false)}
        footer={null}
        width={450}
        centered
      >
        {selectedJob && (
          <div className="mt-4">
            <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">
                {selectedJob.company}
              </span>
              <h4 className="m-0 text-base font-black text-gray-900">{selectedJob.title}</h4>
            </div>

            <Form form={applyForm} layout="vertical" onFinish={handleApplySubmit}>
              <Form.Item
                label={<span className="text-sm font-bold text-gray-700">To'liq ismingiz</span>}
                name="name"
                rules={[{ required: true, message: 'Ismingizni kiriting' }]}
              >
                <Input placeholder="Ism va familiyangiz" className="h-10 rounded-xl" />
              </Form.Item>

              <Form.Item
                label={<span className="text-sm font-bold text-gray-700">Telefon raqamingiz</span>}
                name="phone"
                rules={[{ required: true, message: 'Telefon raqamingizni kiriting' }]}
              >
                <Input placeholder="+998 90 123 45 67" className="h-10 rounded-xl" />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-sm font-bold text-gray-700">
                    O'zingiz haqingizda / Tajribangiz
                  </span>
                }
                name="summary"
                rules={[
                  { required: true, message: "O'zingiz haqingizda qisqacha ma'lumot yozing" },
                ]}
              >
                <Input.TextArea
                  placeholder="Yoshingiz, yashash joyingiz va tajribangiz haqida yozing..."
                  rows={4}
                  className="rounded-xl"
                />
              </Form.Item>

              <Form.Item className="mb-0 mt-6 flex justify-end gap-3">
                <Button
                  onClick={() => setIsApplyModalOpen(false)}
                  className="h-10 rounded-xl font-bold"
                >
                  Bekor qilish
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="h-10 rounded-xl bg-emerald-600 font-bold hover:bg-emerald-500"
                >
                  Yuborish
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Jobs
