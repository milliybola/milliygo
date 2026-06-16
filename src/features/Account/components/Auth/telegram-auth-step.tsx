import TelegramLogoIcon from '@/components/icons/telegram-logo'
import { LeftOutlined } from '@ant-design/icons'
import { Button, Form } from 'antd'
import React, { ReactElement, useState } from 'react'
import OTPInput from 'react-otp-input'

interface IProps {
  isLoading: boolean
  onVerify: (_code: string) => void
  onBack: () => void
}

export default function TelegramAuthStep({ isLoading, onVerify, onBack }: IProps): ReactElement {
  const [otp, setOtp] = useState('')
  const [isError, setIsError] = useState(false)

  const handleFinish = () => {
    if (otp.length === 6) {
      setIsError(false)
      onVerify(otp)
    } else {
      setIsError(true)
    }
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mb-6 flex cursor-pointer items-center" onClick={onBack}>
        <Button
          icon={<LeftOutlined />}
          className="border-none bg-transparent text-base font-medium shadow-none hover:!bg-gray-100"
          shape="default"
          size="middle"
        >
          Orqaga
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[16px] text-[#2AABEE]">
          <TelegramLogoIcon className="text-[40px]" />
        </div>
        <div>
          <h2 className="m-0 text-xl font-bold">Telegram orqali kirish</h2>
          <p className="m-0 text-sm text-gray-500">Botdan olingan kodni kiriting</p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl bg-[#2AABEE] p-5 text-white">
        <div className="mb-3 flex items-start gap-2">
          <div className="mt-1 flex h-4 w-4 items-center justify-center rounded-full border border-white text-[10px] font-bold">
            i
          </div>
          <span className="text-base font-semibold">Qanday kod olish mumkin?</span>
        </div>
        <ol className="m-0 list-none space-y-2 p-0 pl-6 text-sm opacity-90">
          <li>1. Telegram botini oching</li>
          <li>2. /start bosib ro'yxatdan o'ting</li>
          <li>3. Bot yuborgan 6 raqamli kodni kiriting</li>
        </ol>
        <a href="https://t.me/MilliyGoApp_bot" target="_blank" rel="noopener noreferrer">
          <Button
            className="mt-4 border-none bg-white font-semibold text-[#2AABEE] hover:!bg-gray-100 hover:!text-[#2AABEE]"
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            size="middle"
          >
            Botga o'tish
          </Button>
        </a>
      </div>

      <Form onFinish={handleFinish} layout="vertical">
        <div className="mb-2 text-sm font-semibold text-gray-700">6 ta raqamli tasdiqlash kodi</div>
        <Form.Item className="m-0 mb-6" name="otp">
          <OTPInput
            value={otp}
            onChange={(val) => {
              setOtp(val)
              setIsError(false)
            }}
            numInputs={6}
            renderInput={(props) => <input {...props} />}
            inputType="number"
            inputStyle={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '12px',
              fontSize: '24px',
              textAlign: 'center',
              backgroundColor: '#fff',
              border: '2px solid',
              borderColor: isError ? '#FF4E4E' : '#E5E7EB',
            }}
            containerStyle={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              gap: '8px',
            }}
          />
        </Form.Item>

        <Button
          size="large"
          type="primary"
          shape="default"
          className="mt-4 !h-[56px] w-full rounded-2xl border-none bg-[#2AABEE] text-base font-bold text-white shadow-none hover:!bg-[#229ED9]"
          htmlType="submit"
          loading={isLoading}
          disabled={otp.length !== 6}
        >
          Tasdiqlash
        </Button>
      </Form>
    </div>
  )
}
