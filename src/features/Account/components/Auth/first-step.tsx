import type { RadioChangeEvent } from 'antd'
import { Button, Divider, Flex, Form, Input, Typography } from 'antd'
import { type ChangeEvent, type ReactElement } from 'react'

import MailIcon from '@/components/icons/mail'
import { useTranslations } from 'next-intl'
import ReCAPTCHA from 'react-google-recaptcha'
import MainText from './main-text'
import ThirdPartyLogin from './third-party-login'
import TelegramLogoIcon from '@/components/icons/telegram-logo'

interface IProps {
  isLoading: boolean
  isLoadingCaptcha?: boolean
  nextPageHandler: (_res?: any) => void
  onLogin: (_data: { phone_number: string; password?: string }) => void
  onTelegramClick?: () => void
}

export default function FirstStep({ isLoading, onLogin, onTelegramClick }: IProps): ReactElement {
  const [form] = Form.useForm()
  const t = useTranslations()

  const handleFinish = (values: any) => {
    onLogin(values)
  }

  return (
    <>
      <MainText
        title={t('auth.login-to-account')}
        description="Tizimga kiring va buyurtma bering"
      />

      <Form form={form} onFinish={handleFinish} layout="vertical">
        {/* <Form.Item 
          name="phone_number" 
          className="m-0"
          rules={[{ required: true, message: 'Telefon raqamingizni kiriting' }]}
        >
          <Input
            size="large"
            placeholder="+998 90 123 45 67"
            allowClear
            className="mb-4 h-[56px] border-none p-4 text-base placeholder:text-base bg-gray-50 rounded-2xl"
          />
        </Form.Item>
        <Form.Item 
          name="password" 
          className="m-0"
          rules={[{ required: true, message: 'Parolingizni kiriting' }]}
        >
          <Input
            size="large"
            placeholder="Parol"
            allowClear
            type="password"
            className="mb-4 h-[56px] border-none p-4 text-base placeholder:text-base bg-gray-50 rounded-2xl"
          />
        </Form.Item>
        
        <Button
          aria-label={t('auth.continue')}
          size="large"
          type="primary"
          shape="default"
          className="!h-[56px] w-full shadow-none mt-4 rounded-2xl text-base font-bold bg-[#111] hover:bg-[#333]"
          htmlType="submit"
          loading={isLoading}
        >
          Kirish
        </Button> */}
        <Button
          aria-label="Telegram orqali kirish"
          size="large"
          type="default"
          shape="default"
          className="mt-4 flex !h-[56px] w-full items-center justify-center gap-2 rounded-2xl border-none bg-[#2AABEE] text-base font-bold text-white shadow-none hover:!bg-[#229ED9] hover:!text-white"
          onClick={onTelegramClick}
        >
          <TelegramLogoIcon className="text-[24px]" />
          Telegram orqali kirish
        </Button>
      </Form>
    </>
  )
}
