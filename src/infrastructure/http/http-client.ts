import axios from 'axios'
import { tokenStorage } from '../auth/token.storage'

const baseURL = import.meta.env.VITE_API_URL

if (!baseURL) {
  throw new Error('VITE_API_URL is not set')
}

export const httpClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

httpClient.interceptors.response.use(undefined, (error: unknown) => {
  if (
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    error.config?.headers?.Authorization
  ) {
    unauthorizedHandler?.()
  }
  return Promise.reject(error)
})
