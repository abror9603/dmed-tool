import { isAxiosError } from 'axios'

export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
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
