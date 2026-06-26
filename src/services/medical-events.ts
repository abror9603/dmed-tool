import { apiClient } from './http'

export const medicalEventsService = {
  async intake(payload: unknown, secretKey: string): Promise<unknown> {
    const { data } = await apiClient.post<unknown>('/api/v1/medical-events/intake', payload, {
      headers: {
        'X-Secret-Key': secretKey,
      },
    })
    return data
  },
}
