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
          className="shadow-none border-none text-base bg-transparent font-medium hover:!bg-gray-100"
          shape="default"
          size="middle"
        >
          Orqaga
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#2AABEE] text-white">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.1213 2.15822C21.6508 1.94429 22.1868 2.45781 21.9902 2.99849L17.1517 16.3021C16.9452 16.87 16.1438 16.9457 15.836 16.4258L12.5709 10.9126C12.3842 10.5972 12.0306 10.4287 11.6669 10.4828L5.78762 11.3563C5.17646 11.4471 4.88726 10.6695 5.37894 10.2524L21.1213 2.15822Z"
              fill="currentColor"
            />
            <path
              d="M12.5709 10.9126L15.836 16.4258C16.1438 16.9457 15.6946 17.653 15.074 17.5501L10.0152 16.7115C9.72898 16.6641 9.47954 16.4862 9.35677 16.2238L7.16851 11.5546C6.91712 11.0181 7.47648 10.4578 8.02641 10.6976L11.6669 10.4828C12.0306 10.4287 12.3842 10.5972 12.5709 10.9126Z"
              fill="currentColor"
            />
          </svg>
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
          className="!h-[56px] w-full mt-4 rounded-2xl border-none bg-[#2AABEE] text-base font-bold text-white shadow-none hover:!bg-[#229ED9]"
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
