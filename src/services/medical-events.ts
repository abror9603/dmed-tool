import { parseActionResponse } from './api-envelope'
import { apiClient } from './http'

export interface MedicalEventIntakePayload {
  jshshir: string
  diagnosis: string
  conclusion: string
}

export const medicalEventsService = {
  async intake(payload: MedicalEventIntakePayload, secretKey: string): Promise<unknown> {
    const { data } = await apiClient.post<unknown>('/api/v1/medical-events/intake', payload, {
      headers: {
        'X-Secret-Key': secretKey,
      },
    })
    parseActionResponse(data)
    return data
  },
}
