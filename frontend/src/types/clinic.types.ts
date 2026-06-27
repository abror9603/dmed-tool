export type ClinicType = 'DAVLAT' | 'XUSUSIY' | 'TEZYOR_103'

export const CLINIC_TYPES: ClinicType[] = ['DAVLAT', 'XUSUSIY', 'TEZYOR_103']

export interface ClinicsQuery {
  page?: number
  size?: number
}

export interface ClinicPayload {
  name: string
  address: string
  phone: string
  email: string
  contact?: string
  contactInfo?: string
}

export interface Clinic {
  id: number | string
  name: string
  address: string
  phone?: string
  contactInfo?: string
  contact?: string
  email: string
  status: 'ACTIVE' | 'INACTIVE'
  secretKey: string | null
}
