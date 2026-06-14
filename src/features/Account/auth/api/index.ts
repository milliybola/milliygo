import { getFcmToken } from '@/config/firebaseNotification'
import { AuthResponse, AuthOtpResponse } from '@/features/Account/auth/types'
import requestAuth from '@/utils/authRequest'
import request from '@/utils/axios'
import requestBack from '@/utils/ruquestBack'
import { AxiosResponse } from 'axios'

export async function login(
    data: { phone_number: string; password?: string },
    visitor_id: string
): Promise<any> {
    const res: any = await requestAuth({
        url: '/auth/user/login/',
        method: 'post',
        headers: {
            'X-Device-Id': visitor_id,
        },
        data,
    })

    return res
}

export async function sendTelegramOtp(
    data: { code: string },
    visitor_id: string
): Promise<any> {
    const res: any = await requestAuth({
        url: '/auth/user/send-otp/',
        method: 'post',
        headers: {
            'X-Device-Id': visitor_id,
        },
        data,
    })

    return res
}

export async function confirmOTP(data: any): Promise<AuthResponse> {
  const res: AuthResponse = await requestAuth({
    url: '/account/check-otp/',
    method: 'post',
    data,
  })

  return res
}

export async function registerAccEmail(data: {
  email: string
  action?: string
}): Promise<AxiosResponse<AuthResponse>> {
  const res = await requestAuth({
    url: '/account/register/',
    method: 'post',
    data: { email: data.email },
    params: data.action ? { action: data.action } : undefined,
  })

  return res
}

export async function sendEmailCode(data: { email: string }): Promise<AxiosResponse<AuthResponse>> {
  const res = await requestAuth({
    url: '/account/send-email-code/',
    method: 'post',
    data,
  })

  return res
}

export async function checkOtpApi(data: any): Promise<AxiosResponse<AuthResponse>> {
  const res = await requestAuth({
    url: '/account/verify-code/',
    method: 'post',
    data,
  })

  return res
}

export async function checkOtpEmailApi(
  data: any
): Promise<{ access: string; refresh: string; user: any }> {
  return await requestAuth({
    url: '/account/verify-otp-and-create-user/',
    method: 'post',
    data,
  })
}

export async function confirmResetPasswordApi(data: any): Promise<AxiosResponse<AuthResponse>> {
  const res = await requestAuth({
    url: '/account/users/confirm_reset_password/',
    method: 'post',
    data,
  })

  return res
}

export async function updateEmailApi(data: any): Promise<AxiosResponse<AuthResponse>> {
  const res = await requestAuth({
    url: '/account/users/update_email/',
    method: 'post',
    data,
  })

  return res
}

export async function withGoogleAuth(data: { auth_token: string }): Promise<AuthResponse> {
  const res: AuthResponse = await requestAuth({
    url: '/account/socials/with_google/',
    method: 'post',
    data,
  })

  try {
    const fcmToken = await getFcmToken()
    if (fcmToken) {
      await saveFcmToken(fcmToken)
    }
  } catch (err) {
    console.error('saveFcmToken error:', err)
  }

  return res
}

export async function withFacebookAuth(data: { auth_token: string }): Promise<AuthResponse> {
  const res: AuthResponse = await requestAuth({
    url: '/account/socials/with_facebook/',
    method: 'post',
    data,
  })

  return res
}

export async function withOneIdAuth(data: { code: string }): Promise<AuthResponse> {
  return await requestAuth({
    url: 'account/one-id-auth/',
    method: 'post',
    data,
  })
}

export async function withOneIdAuth2(): Promise<AuthResponse> {
  return await request({
    url: 'account/cadastr-info/update',
    method: 'get',
  })
}

async function saveFcmToken(token: string): Promise<any> {
  const res = await requestBack({
    url: `notification/v1/user-notifications/fcm-token?fcm_token=${token}`,
    method: 'put',
  })

  return res
}
