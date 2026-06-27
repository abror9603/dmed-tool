import { medicalEventsService, type MedicalEventIntakePayload } from './medical-events'

export interface TestSmsRecipient {
  id: string
  name: string
  jshshir: string
}

export interface TestSmsPayload extends MedicalEventIntakePayload {
  secretKey: string
}

export const TEST_SMS_RECIPIENTS: TestSmsRecipient[] = [
  { id: 'jorabek-toshbekov', name: "Jo'rabek Toshbekov", jshshir: '12345678901234' },
  { id: 'avazov-abror', name: 'Avazov Abror', jshshir: '98765432109876' },
  { id: 'javohir-boyaliyev', name: 'Javohir Boyaliyev', jshshir: '11223344556677' },
  { id: 'javlon-abduvahobov', name: 'Javlon Abduvahobov', jshshir: '22334455667788' },
]

export async function sendTestSms(
  recipient: TestSmsRecipient,
  payload: TestSmsPayload,
): Promise<unknown> {
  void recipient
  return medicalEventsService.intake(
    {
      jshshir: payload.jshshir,
      diagnosis: payload.diagnosis,
      conclusion: payload.conclusion,
    },
    payload.secretKey,
  )
}
