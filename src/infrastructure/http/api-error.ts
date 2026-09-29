import axios from 'axios'

export function extractApiMessage(error: unknown): string | string[] | null {
  if (!axios.isAxiosError(error)) return null
  const message = error.response?.data?.message
  if (typeof message === 'string') return message
  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return message
  }
  return null
}

export function getHttpStatus(error: unknown): number | null {
  if (!axios.isAxiosError(error)) return null
  return error.response?.status ?? null
}
