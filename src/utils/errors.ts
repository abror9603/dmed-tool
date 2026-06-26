import { isAxiosError } from 'axios'
import { getResolvedApiUrl } from '../services/http'

export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      const target = error.config?.url || getResolvedApiUrl()
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return `${fallback} (${target})`
      }
      return error.message || fallback
    }

    const data = error.response?.data

    if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message: unknown }).message
      if (typeof message === 'string') {
        return message
      }
    }

    return error.message || fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
