import type { RadioChangeEvent } from 'antd'
import { Button, Divider, Flex, Form, Input, Typography } from 'antd'
import { type ChangeEvent, type ReactElement } from 'react'

import MailIcon from '@/components/icons/mail'
import { useTranslations } from 'next-intl'
import ReCAPTCHA from 'react-google-recaptcha'
import MainText from './main-text'
import ThirdPartyLogin from './third-party-login'

interface IProps {
  isLoading: boolean
  isLoadingCaptcha?: boolean
  nextPageHandler: (_res?: any) => void
  onLogin: (_data: { phone_number: string; password?: string }) => void
  onTelegramClick?: () => void
}

export default function FirstStep({
  isLoading,
  onLogin,
  onTelegramClick,
}: IProps): ReactElement {
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
        <Form.Item 
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
        </Button>
        <Button
          aria-label="Telegram orqali kirish"
          size="large"
          type="default"
          shape="default"
          className="!h-[56px] w-full shadow-none mt-4 rounded-2xl text-base font-bold border-none bg-[#2AABEE] text-white hover:!bg-[#229ED9] hover:!text-white flex items-center justify-center gap-2"
          onClick={onTelegramClick}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.1213 2.15822C21.6508 1.94429 22.1868 2.45781 21.9902 2.99849L17.1517 16.3021C16.9452 16.87 16.1438 16.9457 15.836 16.4258L12.5709 10.9126C12.3842 10.5972 12.0306 10.4287 11.6669 10.4828L5.78762 11.3563C5.17646 11.4471 4.88726 10.6695 5.37894 10.2524L21.1213 2.15822Z" fill="currentColor"/>
            <path d="M12.5709 10.9126L15.836 16.4258C16.1438 16.9457 15.6946 17.653 15.074 17.5501L10.0152 16.7115C9.72898 16.6641 9.47954 16.4862 9.35677 16.2238L7.16851 11.5546C6.91712 11.0181 7.47648 10.4578 8.02641 10.6976L11.6669 10.4828C12.0306 10.4287 12.3842 10.5972 12.5709 10.9126Z" fill="currentColor"/>
          </svg>
          Telegram orqali kirish
        </Button>
      </Form>
    </>
  )
}
