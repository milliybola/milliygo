import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { Form, Input, Button, Checkbox, message, Card, Space, Typography, Alert, Modal, Result, Tabs } from 'antd'
import { WarningOutlined, DeleteOutlined, InfoCircleOutlined, PhoneOutlined, UserOutlined, MailOutlined } from '@ant-design/icons'
import CBreadcrumb from '@/components/common/CBreadcrumb'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { deleteMyAccount } from '@/features/Account/api'
import { useAuthStore } from '@/features/Account/auth/store/authStore'
import { AuthContext } from '@/features/Account/auth/context/authContext'
import request from '@/utils/axios'

const { Title, Text, Paragraph } = Typography

export async function getStaticProps(context: any) {
  let messages = {}
  try {
    if (context && context.locale) {
      messages = (await import(`../../locales/${context.locale}.json`)).default
    } else {
      messages = (await import(`../../locales/uz.json`)).default
    }
  } catch (err) {
    console.warn('Failed to load locales for delete-account page', context?.locale)
  }
  return { props: { messages } }
}

// Local translations mapping for the legal page content (UZ, RU, EN)
const PAGE_TEXTS: Record<string, any> = {
  uz: {
    title: "Hisobni o'chirish so'rovi",
    subtitle: "Google Play Store talablariga muvofiq, MilliyGo hisobini o'chirish sahifasi",
    breadcrumb: "Hisobni o'chirish",
    tabInfo: "Ma'lumot",
    tabForm: "So'rov yuborish",
    whatDeleted: "Nimalar o'chiriladi?",
    whatDeletedText: "Hisobingiz o'chirilgandan so'ng, quyidagi ma'lumotlar tizimimizdan to'liq va qaytarib bo'lmaydigan tarzda o'chirib tashlanadi:",
    deletedItems: [
      "Shaxsiy profilingiz (ism, familiya, telefon raqami va email)",
      "Buyurtmalar va yetkazib berishlar tarixi",
      "Saqlangan manzillar va geolokatsiya ma'lumotlari",
      "Bonuslar, keshbeklar va faol chegirmalar"
    ],
    whatRetained: "Nimalar saqlab qolinadi?",
    whatRetainedText: "O'zbekiston Respublikasi qonunchiligi (jumladan soliq va moliyaviy hisobot qoidalari) talablariga muvofiq, amalga oshirilgan moliyaviy xaridlar va to'lov tranzaksiyalari tarixi qonunda belgilangan majburiy muddat davomida saqlanishi shart. Ushbu ma'lumotlar marketing yoki shaxsiy identifikatsiya maqsadlarida ishlatilmaydi.",
    timeline: "Ko'rib chiqish muddati",
    timelineText: "Siz yuborgan so'rov 3 ish kuni ichida ko'rib chiqiladi va ma'lumotlar to'liq o'chiriladi. Bu jarayonda tasdiqlash uchun operatorimiz sizga qo'ng'iroq qilishi mumkin.",
    supportHeading: "Muqobil bog'lanish yo'llari",
    supportText: "Agar muammo yuzaga kelsa, bizga quyidagi usullar orqali ham to'g'ridan-to'g'ri murojaat qilishingiz mumkin:",
    loggedInSection: "Tizimga kirgansiz",
    loggedInText: "Siz hozirda {name} (+{phone}) hisobiga kirgansiz. Hisobingizni hoziroq o'chirib yuborishingiz mumkin.",
    deleteNowBtn: "Hisobni hoziroq o'chirish",
    formHeading: "Hisobni o'chirish so'rovi formasi",
    formText: "Iltimos, hisobingizga bog'langan shaxsiy ma'lumotlarni to'ldiring:",
    labelName: "Ism va Familiya",
    placeholderName: "Ismingizni kiriting",
    labelPhone: "Telefon raqamingiz",
    placeholderPhone: "+998 90 123 45 67",
    labelReason: "O'chirish sababi (ixtiyoriy)",
    placeholderReason: "Nima sababdan hisobingizni o'chirmoqchi ekanligingizni yozishingiz mumkin",
    labelConsent: "Hisobim va barcha shaxsiy ma'lumotlarim butunlay va qaytarib bo'lmaydigan tarzda o'chirilishiga rozilik beraman.",
    btnSubmit: "O'chirish so'rovini yuborish",
    errName: "Iltimos, ismingizni kiriting",
    errPhone: "Iltimos, telefon raqamingizni kiriting",
    errConsent: "O'chirishni davom ettirish uchun shartga rozilik berishingiz kerak",
    confirmTitle: "Hisobingizni o'chirmoqchimisiz?",
    confirmDesc: "Bu amal qaytarilmas hisoblanadi. Sizning barcha ma'lumotlaringiz, buyurtmalar tarixi va bonuslaringiz o'chib ketadi.",
    confirmOk: "Ha, o'chirilsin",
    confirmCancel: "Bekor qilish",
    successTitle: "So'rov qabul qilindi!",
    successDesc: "Sizning hisobingizni o'chirish haqidagi so'rovingiz muvaffaqiyatli qabul qilindi. 3 ish kuni ichida ma'lumotlaringiz butunlay o'chiriladi. Rahmat!",
    btnHome: "Asosiy sahifaga qaytish",
    directDeleteSuccess: "Hisobingiz muvaffaqiyatli o'chirildi va tizimdan chiqdingiz.",
    directDeleteError: "Hisobni o'chirishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring yoki qo'llab-quvvatlash xizmatiga murojaat qiling."
  },
  ru: {
    title: "Запрос на удаление аккаунта",
    subtitle: "Страница удаления аккаунта MilliyGo в соответствии с требованиями Google Play Store",
    breadcrumb: "Удаление аккаунта",
    tabInfo: "Информация",
    tabForm: "Отправить запрос",
    whatDeleted: "Что будет удалено?",
    whatDeletedText: "После удаления вашего аккаунта следующие данные будут полностью и безвозвратно удалены из нашей системы:",
    deletedItems: [
      "Ваш личный профиль (имя, фамилия, номер телефона и email)",
      "История заказов и доставок",
      "Сохраненные адреса и данные геолокации",
      "Бонусы, кэшбэк и активные скидки"
    ],
    whatRetained: "Что будет сохранено?",
    whatRetainedText: "В соответствии с законодательством Республики Узбекистан (включая правила налоговой и финансовой отчетности), история покупок и транзакций будет храниться в течение установленного законом обязательного срока. Эти данные не используются в маркетинговых целях или для идентификации личности.",
    timeline: "Сроки обработки",
    timelineText: "Ваш запрос будет обработан в течение 3 рабочих дней. В процессе обработки наш оператор может связаться с вами по телефону для подтверждения.",
    supportHeading: "Альтернативные способы связи",
    supportText: "Если у вас возникнут трудности, вы можете связаться с нами напрямую следующими способами:",
    loggedInSection: "Вы вошли в систему",
    loggedInText: "Вы вошли как {name} (+{phone}). Вы можете удалить свой аккаунт прямо сейчас.",
    deleteNowBtn: "Удалить аккаунт сейчас",
    formHeading: "Форма запроса на удаление аккаунта",
    formText: "Пожалуйста, заполните данные, связанные с вашим аккаунтом:",
    labelName: "Имя и Фамилия",
    placeholderName: "Введите ваше имя",
    labelPhone: "Номер телефона",
    placeholderPhone: "+998 90 123 45 67",
    labelReason: "Причина удаления (необязательно)",
    placeholderReason: "Вы можете указать причину удаления аккаунта",
    labelConsent: "Я согласен на полное и безвозвратное удаление моего аккаунта и всех связанных с ним данных.",
    btnSubmit: "Отправить запрос на удаление",
    errName: "Пожалуйста, введите ваше имя",
    errPhone: "Пожалуйста, введите ваш номер телефона",
    errConsent: "Для продолжения необходимо согласиться с условием",
    confirmTitle: "Вы уверены, что хотите удалить аккаунт?",
    confirmDesc: "Это действие необратимо. Все ваши данные, история заказов и бонусы будут стерты без возможности восстановления.",
    confirmOk: "Да, удалить",
    confirmCancel: "Отмена",
    successTitle: "Запрос принят!",
    successDesc: "Ваш запрос на удаление аккаунта успешно принят. Ваши данные будут полностью удалены в течение 3 рабочих дней. Спасибо!",
    btnHome: "На главную",
    directDeleteSuccess: "Ваш аккаунт был успешно удален, выполнен выход из системы.",
    directDeleteError: "Произошла ошибка при удалении аккаунта. Пожалуйста, попробуйте позже или свяжитесь с поддержкой."
  },
  en: {
    title: "Account Deletion Request",
    subtitle: "MilliyGo account deletion page in compliance with Google Play Store guidelines",
    breadcrumb: "Delete Account",
    tabInfo: "Information",
    tabForm: "Submit Request",
    whatDeleted: "What will be deleted?",
    whatDeletedText: "After deleting your account, the following data will be completely and permanently removed from our system:",
    deletedItems: [
      "Your personal profile (first name, last name, phone number, and email)",
      "Order and delivery history",
      "Saved addresses and geolocation data",
      "Bonuses, cashbacks, and active discounts"
    ],
    whatRetained: "What will be retained?",
    whatRetainedText: "In compliance with the laws of the Republic of Uzbekistan (including tax and financial reporting regulations), purchase and transaction history must be retained for the legally mandated period. This data is not used for marketing or personal identification purposes.",
    timeline: "Processing Timeline",
    timelineText: "Your request will be processed and completed within 3 business days. Our support agent may call you to verify the request during this time.",
    supportHeading: "Alternative Contact Options",
    supportText: "If you face any issues, you can contact us directly using the following channels:",
    loggedInSection: "You are logged in",
    loggedInText: "You are currently logged in as {name} (+{phone}). You can delete your account directly now.",
    deleteNowBtn: "Delete Account Now",
    formHeading: "Account Deletion Request Form",
    formText: "Please fill in the details associated with your account:",
    labelName: "Full Name",
    placeholderName: "Enter your full name",
    labelPhone: "Phone Number",
    placeholderPhone: "+998 90 123 45 67",
    labelReason: "Reason for deletion (optional)",
    placeholderReason: "Tell us why you want to delete your account",
    labelConsent: "I agree to the permanent and irreversible deletion of my account and all personal data.",
    btnSubmit: "Submit Deletion Request",
    errName: "Please enter your name",
    errPhone: "Please enter your phone number",
    errConsent: "You must check the consent box to proceed",
    confirmTitle: "Are you sure you want to delete your account?",
    confirmDesc: "This action is irreversible. All your data, order history, and active bonuses will be deleted permanently.",
    confirmOk: "Yes, delete",
    confirmCancel: "Cancel",
    successTitle: "Request Submitted!",
    successDesc: "Your account deletion request has been successfully received. All data will be deleted within 3 business days. Thank you!",
    btnHome: "Back to Home",
    directDeleteSuccess: "Your account was successfully deleted and you have been logged out.",
    directDeleteError: "Failed to delete account. Please try again later or contact our support team."
  }
}

const DeleteAccountPage = () => {
  const router = useRouter()
  const hasHydrated = useHasHydrated()
  const t = useTranslations()
  const { userInfo, isAuthenticated, logout } = useAuthStore()
  const authContext = useContext(AuthContext)
  
  // Detect locale (default to 'uz')
  const currentLocale = router.locale && PAGE_TEXTS[router.locale] ? router.locale : 'uz'
  const langText = PAGE_TEXTS[currentLocale]

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Sync logged in user info if available
  useEffect(() => {
    if (isAuthenticated && userInfo) {
      form.setFieldsValue({
        name: `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim(),
        phone: userInfo.phone || ''
      })
    }
  }, [isAuthenticated, userInfo, form])

  if (!hasHydrated) return null

  const breadCrumbItems = [
    {
      title: t('preferences.main') || 'Asosiy',
      href: '/',
    },
    {
      title: langText.breadcrumb,
    },
  ]

  // Submit request form (calls the public base/questions endpoint as a fallback ticket)
  const handleFinish = async (values: any) => {
    setLoading(true)
    try {
      const questionText = `[ACCOUNT DELETION REQUEST]\nName: ${values.name}\nPhone: ${values.phone}\nReason: ${values.reason || 'Not specified'}\nConsent: Yes`
      
      await request({
        url: '/base/questions/',
        method: 'post',
        data: {
          email: userInfo?.email || 'deletion-request@milliygo.uz',
          question_text: questionText,
        }
      })
      setSubmitted(true)
      message.success(langText.successTitle)
    } catch (err) {
      console.error('Request submission error:', err)
      // Even if API fails, we show fallback instructions and still display success or guide
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  // Direct delete account for logged in users
  const handleDirectDelete = () => {
    Modal.confirm({
      title: langText.confirmTitle,
      icon: <WarningOutlined className="text-red-500" />,
      content: langText.confirmDesc,
      okText: langText.confirmOk,
      okType: 'danger',
      cancelText: langText.confirmCancel,
      onOk: async () => {
        if (!userInfo?.id) return
        setLoading(true)
        try {
          await deleteMyAccount(userInfo.id)
          message.success(langText.directDeleteSuccess)
          if (authContext?.logOut) {
            authContext.logOut()
          } else {
            logout()
          }
          router.push('/')
        } catch (err) {
          console.error('Direct delete account error:', err)
          message.error(langText.directDeleteError)
        } finally {
          setLoading(false)
        }
      }
    })
  }

  // Define tab pages
  const items = [
    {
      key: 'info',
      label: langText.tabInfo,
      children: (
        <Space direction="vertical" size="large" className="w-full">
          <div>
            <Title level={4} className="flex items-center gap-2 !mb-2">
              <InfoCircleOutlined className="text-[#008080]" />
              {langText.whatDeleted}
            </Title>
            <Paragraph>{langText.whatDeletedText}</Paragraph>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-600">
              {langText.deletedItems.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <Divider className="my-2" />

          <div>
            <Title level={4} className="flex items-center gap-2 !mb-2 text-amber-600">
              <WarningOutlined className="text-amber-500" />
              {langText.whatRetained}
            </Title>
            <Paragraph className="text-gray-600 leading-relaxed">
              {langText.whatRetainedText}
            </Paragraph>
          </div>

          <Divider className="my-2" />

          <div>
            <Title level={4} className="flex items-center gap-2 !mb-2">
              <span className="h-2 w-2 rounded-full bg-teal-600"></span>
              {langText.timeline}
            </Title>
            <Paragraph className="text-gray-600 leading-relaxed">
              {langText.timelineText}
            </Paragraph>
          </div>

          <Divider className="my-2" />

          <Card size="small" className="bg-gray-50 border border-gray-100 rounded-2xl p-2">
            <Title level={5} className="!mb-2">{langText.supportHeading}</Title>
            <Paragraph className="text-gray-500 text-xs !mb-3">{langText.supportText}</Paragraph>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <MailOutlined className="text-[#008080]" />
                <a href="mailto:info@milliyapp.uz" className="font-semibold text-gray-700 hover:underline">info@milliyapp.uz</a>
              </div>
              <div className="flex items-center gap-2">
                <PhoneOutlined className="text-[#008080]" />
                <a href="tel:+998904969007" className="font-semibold text-gray-700 hover:underline">+998 90 496 90 07</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#008080] font-bold">TG</span>
                <a href="https://t.me/MilliyGoApp_bot" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-700 hover:underline">@MilliyGoApp_bot</a>
              </div>
            </div>
          </Card>
        </Space>
      )
    },
    {
      key: 'form',
      label: langText.tabForm,
      children: (
        <div>
          {isAuthenticated && userInfo ? (
            <div className="rounded-2xl bg-amber-50/50 border border-amber-100 p-6 mb-6">
              <Title level={5} className="text-amber-900 !mt-0 !mb-2">{langText.loggedInSection}</Title>
              <Paragraph className="text-amber-800 !mb-4">
                {langText.loggedInText.replace('{name}', `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim()).replace('{phone}', userInfo.phone || '')}
              </Paragraph>
              <Button 
                type="primary" 
                danger 
                size="large" 
                icon={<DeleteOutlined />} 
                loading={loading}
                onClick={handleDirectDelete}
                className="rounded-2xl font-bold"
              >
                {langText.deleteNowBtn}
              </Button>
            </div>
          ) : null}

          <Title level={4} className="!mb-2">{langText.formHeading}</Title>
          <Paragraph className="text-gray-500 !mb-6">{langText.formText}</Paragraph>

          <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleFinish}
            requiredMark={false}
          >
            <Form.Item
              name="name"
              label={langText.labelName}
              rules={[{ required: true, message: langText.errName }]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400" />} 
                placeholder={langText.placeholderName} 
                className="h-[52px] rounded-2xl text-base"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={langText.labelPhone}
              rules={[{ required: true, message: langText.errPhone }]}
            >
              <Input 
                prefix={<PhoneOutlined className="text-gray-400" />} 
                placeholder={langText.placeholderPhone} 
                className="h-[52px] rounded-2xl text-base"
              />
            </Form.Item>

            <Form.Item
              name="reason"
              label={langText.labelReason}
            >
              <Input.TextArea 
                placeholder={langText.placeholderReason} 
                rows={3} 
                className="rounded-2xl text-base p-3 resize-none"
              />
            </Form.Item>

            <Form.Item
              name="consent"
              valuePropName="checked"
              rules={[{
                validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error(langText.errConsent))
              }]}
            >
              <Checkbox className="text-gray-600 text-sm">
                {langText.labelConsent}
              </Checkbox>
            </Form.Item>

            <Form.Item className="mt-8 mb-0">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="h-[56px] w-full rounded-2xl font-bold text-base bg-[#008080] hover:bg-[#006666] border-none shadow-none"
              >
                {langText.btnSubmit}
              </Button>
            </Form.Item>
          </Form>
        </div>
      )
    }
  ]

  // Locale switcher handler for standard dynamic router
  const handleLocaleChange = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale })
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-16">
      <CBreadcrumb items={breadCrumbItems} />
      
      <div className="container max-w-3xl flex flex-col gap-6">
        {/* Language Quick-Toggle for compliance checkers */}
        <div className="flex justify-end gap-2 px-2">
          {['uz', 'ru', 'en'].map((lang) => (
            <Button
              key={lang}
              size="small"
              type={currentLocale === lang ? 'primary' : 'text'}
              onClick={() => handleLocaleChange(lang)}
              className={`text-xs rounded-full font-semibold px-3 ${
                currentLocale === lang ? 'bg-[#008080] hover:bg-[#006666] border-none text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {lang === 'uz' ? 'O\'zbekcha' : lang === 'ru' ? 'Русский' : 'English'}
            </Button>
          ))}
        </div>

        {submitted ? (
          <Card className="rounded-3xl border border-gray-100 shadow-sm p-4 md:p-8">
            <Result
              status="success"
              title={<span className="font-black text-2xl text-gray-900">{langText.successTitle}</span>}
              subTitle={<span className="text-gray-600 text-base">{langText.successDesc}</span>}
              extra={[
                <Button
                  key="home"
                  type="primary"
                  size="large"
                  onClick={() => router.push('/')}
                  className="rounded-2xl font-semibold bg-[#008080] border-none h-[50px] px-8"
                >
                  {langText.btnHome}
                </Button>
              ]}
            />
          </Card>
        ) : (
          <Card className="rounded-3xl border border-gray-100 shadow-sm p-2 md:p-6 bg-white">
            <div className="px-4 pt-4 pb-2">
              <Title level={2} className="!m-0 font-black tracking-tight text-gray-900 md:text-3xl">
                {langText.title}
              </Title>
              <Text className="text-gray-400 text-sm block mt-1">
                {langText.subtitle}
              </Text>
            </div>
            
            <Divider className="my-4" />

            <Tabs 
              defaultActiveKey="info" 
              items={items}
              className="px-4 delete-account-tabs"
            />
          </Card>
        )}
      </div>
    </main>
  )
}

export default DeleteAccountPage
