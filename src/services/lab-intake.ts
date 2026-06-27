import { apiClient } from './http'

export interface LabIntakePayload {
  jshshir: string
  patientFullName: string
  testName: string
  testResult: string
  unit: string
  referenceRange: string
  familyDoctorPhone: string
  familyDoctorFcmToken?: string
  familyDoctorId?: string
}

export const labIntakeService = {
  async submit(payload: LabIntakePayload, secretKey: string): Promise<unknown> {
    const { data } = await apiClient.post<unknown>('/api/v1/intake', payload, {
      headers: {
        'X-Secret-Key': secretKey,
      },
    })
    return data
  },
}
