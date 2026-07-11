import React, { useState, useMemo } from 'react'
import { Modal, Form, Input, Select, Rate, Button, message, Tag, Avatar } from 'antd'
import {
  SearchOutlined,
  CheckCircleFilled,
  PhoneOutlined,
  MessageOutlined,
  UserAddOutlined,
  StarFilled,
  EnvironmentOutlined,
} from '@ant-design/icons'

interface IProvider {
  id: number
  name: string
  avatar: string
  category: string
  rating: number
  reviewsCount: number
  experience: string
  description: string
  priceFrom: string
  phone: string
  telegram: string
  isVerified: boolean
  location: string
}

const CATEGORIES = [
  { id: 'all', name: 'Barchasi', icon: '⚡' },
  { id: 'plumbing', name: 'Santexnika', icon: '🚰' },
  { id: 'electricity', name: 'Elektrik', icon: '🔌' },
  { id: 'cleaning', name: 'Tozalash', icon: '🧹' },
  { id: 'appliance', name: "Texnika ta'mirlash", icon: '⚙️' },
  { id: 'tutor', name: 'Enaga & Repetitor', icon: '📚' },
  { id: 'beauty', name: "Go'zallik", icon: '💅' },
]

const MOCK_PROVIDERS: IProvider[] = [
  {
    id: 1,
    name: 'Diyorbek Rahimov',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
    category: 'plumbing',
    rating: 4.9,
    reviewsCount: 48,
    experience: '6 yil',
    description:
      "Barcha turdagi santexnika ishlarini sifatli va kafolatli bajaramiz. Kranlar o'rnatish, quvurlarni almashtirish.",
    priceFrom: '80 000 UZS',
    phone: '+998 90 123 45 67',
    telegram: '@diyor_santexnik',
    isVerified: true,
    location: "G'allaorol tumani",
  },
  {
    id: 2,
    name: 'Sardor Qodirov',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
    category: 'electricity',
    rating: 4.8,
    reviewsCount: 36,
    experience: '5 yil',
    description:
      "Qisqa tutashuvlarni bartaraf etish, lyustra va rozetkalar o'rnatish, montaj xizmatlari.",
    priceFrom: '100 000 UZS',
    phone: '+998 93 456 78 90',
    telegram: '@sardor_electro',
    isVerified: true,
    location: "G'allaorol shahar",
  },
  {
    id: 3,
    name: 'Malika Axmedova',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    category: 'cleaning',
    rating: 5.0,
    reviewsCount: 92,
    experience: '3 yil',
    description:
      "Xonadonlar, kottejlar va ofislarni tozalash xizmati. General tozalash va ta'mirdan keyingi tozalash.",
    priceFrom: '150 000 UZS',
    phone: '+998 94 987 65 43',
    telegram: '@malika_cleaning',
    isVerified: true,
    location: "G'allaorol shahar",
  },
  {
    id: 4,
    name: 'Jasur Temirov',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150',
    category: 'appliance',
    rating: 4.7,
    reviewsCount: 29,
    experience: '8 yil',
    description:
      "Muzlatgichlar, kir yuvish mashinalari va konditsionerlarni ta'mirlash. Ehtiyot qismlar kafolatlanadi.",
    priceFrom: '120 000 UZS',
    phone: '+998 97 111 22 33',
    telegram: '@jasur_master',
    isVerified: false,
    location: "G'allaorol tumani",
  },
  {
    id: 5,
    name: 'Dilnoza Ismoilova',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
    category: 'tutor',
    rating: 4.9,
    reviewsCount: 54,
    experience: '4 yil',
    description:
      "Boshlang'ich sinflar va maktabgacha ta'lim yoshidagi bolalar uchun ingliz tili va matematika repetitorligi.",
    priceFrom: '70 000 UZS/soat',
    phone: '+998 90 999 88 77',
    telegram: '@dilnoza_tutor',
    isVerified: true,
    location: "G'allaorol shahar",
  },
  {
    id: 6,
    name: 'Gulnoza Karimova',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    category: 'beauty',
    rating: 4.6,
    reviewsCount: 21,
    experience: '2 yil',
    description:
      'Uyingizga borgan holda soch turmaklash, makiyaj va manikyur xizmatlari. Sifatli kosmetika vositalari.',
    priceFrom: '90 000 UZS',
    phone: '+998 93 555 44 33',
    telegram: '@gulnoza_beauty',
    isVerified: false,
    location: "G'allaorol shahar",
  },
]

const DomesticServices = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const handleApply = (values: any) => {
    message.success(
      "Arizangiz muvaffaqiyatli qabul qilindi! Tez orada mutaxassislarimiz siz bilan bog'lanishadi."
    )
    setIsModalOpen(false)
    form.resetFields()
  }

  const filteredProviders = useMemo(() => {
    return MOCK_PROVIDERS.filter((provider) => {
      const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory
      const matchesSearch =
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.experience.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* Hero Header */}
      <div className="border-blue-100 from-blue-600 relative overflow-hidden border-b bg-gradient-to-r to-indigo-700 px-4 py-12 text-white md:px-8 xl:px-16">
        <div className="from-blue-400/20 absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] via-transparent to-transparent" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Maishiy Xizmatlar
              </h1>
              <p className="text-blue-100 mt-2 max-w-xl text-[15px] font-semibold">
                G'allaoroldagi professional ustalar va maishiy xizmat ko'rsatuvchilar. Tez,
                ishonchli va hamyonbop.
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<UserAddOutlined />}
              onClick={() => setIsModalOpen(true)}
              className="h-auto border-none bg-yellow-400 py-3.5 text-base font-bold text-gray-900 shadow-lg hover:!bg-yellow-300 hover:!text-gray-900 active:scale-95"
            >
              Usta bo'lib qo'shilish
            </Button>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="mx-auto mt-8 max-w-6xl px-4 md:px-8">
        {/* Search Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Qanday usta yoki xizmat qidiryapsiz? (Masalan: santexnik, tozalash...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:border-blue-500 h-12 rounded-2xl border-gray-200 px-4 text-base shadow-sm focus:shadow-md"
              allowClear
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mb-8">
          <h3 className="mb-3 text-[15px] font-extrabold uppercase tracking-wider text-gray-400">
            Kategoriyalar
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4.5 flex items-center gap-2 rounded-xl border py-2.5 text-[14px] font-black transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-600 border-blue-600 shadow-blue-200 text-white shadow-md'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Providers Grid */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900">
              Mavjud ustalar ({filteredProviders.length})
            </h2>
          </div>

          {filteredProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-12 text-center">
              <span className="text-4xl">🔍</span>
              <h3 className="mt-3 text-lg font-black text-gray-800">
                Siz qidirgan xizmat topilmadi
              </h3>
              <p className="mt-1 text-sm font-semibold text-gray-500">
                Boshqa kalit so'zlarni kiritib ko'ring yoki barcha toifalarni ko'ring.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="hover:border-blue-100 group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={provider.avatar}
                          size={54}
                          className="border-blue-50 border-2 object-cover"
                        />
                        <div>
                          <h4 className="flex items-center gap-1.5 text-base font-black text-gray-900">
                            {provider.name}
                            {provider.isVerified && (
                              <CheckCircleFilled
                                className="text-blue-500 text-sm"
                                title="Tasdiqlangan usta"
                              />
                            )}
                          </h4>
                          <span className="text-blue-600 text-[12px] font-bold">
                            {CATEGORIES.find((c) => c.id === provider.category)?.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-amber-700">
                        <StarFilled className="text-[13px] text-amber-500" />
                        <span className="text-[13px] font-black">{provider.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Tag className="m-0 border-none bg-gray-100 px-2.5 py-0.5 text-[11px] font-extrabold text-gray-600">
                        Tajriba: {provider.experience}
                      </Tag>
                      <Tag className="m-0 border-none bg-gray-100 px-2.5 py-0.5 text-[11px] font-extrabold text-gray-600">
                        {provider.reviewsCount} ta sharh
                      </Tag>
                    </div>

                    {/* Description */}
                    <p className="mt-3 line-clamp-3 text-[13px] font-medium leading-relaxed text-gray-600">
                      {provider.description}
                    </p>

                    {/* Location */}
                    <div className="mt-4 flex items-center gap-1 text-[12px] font-semibold text-gray-400">
                      <EnvironmentOutlined />
                      <span>{provider.location}</span>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-50 pt-4">
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Boshlang'ich narxi
                      </span>
                      <span className="font-sans text-base font-black text-gray-900">
                        {provider.priceFrom}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="default"
                        shape="circle"
                        icon={<MessageOutlined />}
                        href={`https://t.me/${provider.telegram.replace('@', '')}`}
                        target="_blank"
                        className="hover:!border-blue-600 hover:!text-blue-600 flex items-center justify-center border-gray-200 text-gray-600 active:scale-95"
                      />
                      <Button
                        type="primary"
                        icon={<PhoneOutlined />}
                        href={`tel:${provider.phone}`}
                        className="bg-blue-600 hover:!bg-blue-500 flex items-center justify-center font-bold active:scale-95"
                      >
                        Bog'lanish
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Become Usta Modal Form */}
      <Modal
        title={
          <div className="border-b border-gray-100 pb-2 text-lg font-black text-gray-900">
            Usta sifatida ro'yxatdan o'tish
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={480}
        centered
        className="premium-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleApply}
          initialValues={{ category: 'plumbing' }}
          className="mt-4"
        >
          <Form.Item
            label={<span className="text-sm font-bold text-gray-700">To'liq ismingiz</span>}
            name="name"
            rules={[{ required: true, message: 'Iltimos, ismingizni kiriting' }]}
          >
            <Input
              placeholder="Ism va familiyangizni kiriting"
              className="h-10 rounded-xl border-gray-200"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-sm font-bold text-gray-700">Telefon raqamingiz</span>}
            name="phone"
            rules={[{ required: true, message: 'Iltimos, telefon raqamingizni kiriting' }]}
          >
            <Input placeholder="+998 90 123 45 67" className="h-10 rounded-xl border-gray-200" />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-sm font-bold text-gray-700">
                Telegram foydalanuvchi nomi (@username)
              </span>
            }
            name="telegram"
          >
            <Input placeholder="@username" className="h-10 rounded-xl border-gray-200" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-sm font-bold text-gray-700">Xizmat toifasi</span>}
              name="category"
            >
              <Select className="h-10 rounded-xl" popupClassName="rounded-xl">
                {CATEGORIES.slice(1).map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={<span className="text-sm font-bold text-gray-700">Ish tajribasi</span>}
              name="experience"
              rules={[{ required: true, message: 'Ish tajribasini kiriting' }]}
            >
              <Input placeholder="Masalan: 3 yil" className="h-10 rounded-xl border-gray-200" />
            </Form.Item>
          </div>

          <Form.Item
            label={
              <span className="text-sm font-bold text-gray-700">
                Xizmatlaringiz haqica qisqacha
              </span>
            }
            name="description"
            rules={[{ required: true, message: 'Iltimos, izoh yozing' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Qanday ishlar qila olasiz? Boshlang'ich narxlaringiz qancha?"
              className="rounded-xl border-gray-200"
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-6 flex justify-end gap-3">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="h-11 rounded-xl border-gray-200 font-bold hover:border-gray-300"
            >
              Bekor qilish
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-600 hover:bg-blue-500 h-11 rounded-xl font-bold shadow-md"
            >
              Yuborish
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DomesticServices
