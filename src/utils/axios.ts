import axios from 'axios'
import { API_BASE } from '@/constants/env'
import { globalOnRequestFulfilled, globalOnResponseRejected } from './axios-interceptor-manager'

const hostname = typeof window !== 'undefined' ? window.location.hostname : ''

export const baseURL =
  hostname === 'sayohat.uz' ? 'https://back.sayohat.uz/booking/api/v1' : API_BASE

const request = axios.create({
  baseURL,
})

request.interceptors.request.use(globalOnRequestFulfilled, (error) => {
  return Promise.reject(error)
})

request.interceptors.response.use((response) => response.data, globalOnResponseRejected)

export default request
