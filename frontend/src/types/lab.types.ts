export interface LabsQuery {
  page?: number
  size?: number
}

export interface LabPayload {
  name: string
  address: string
  phone: string
  email: string
  contact?: string
}

/** Public registration payload — maps home-page lab application form to POST /api/v1/labs. */
export interface LabRegisterPayload {
  name: string
  firstName: string
  lastName: string
  login: string
  password: string
  phoneNumber1: string
  phone: string
  email: string
  address: string
  contact: string
}

export interface Lab {
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
