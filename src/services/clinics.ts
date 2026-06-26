import axios from 'axios'

const getApiUrl = () => {
  return localStorage.getItem('dmed-api-url') || 'https://3ed4-185-139-137-95.ngrok-free.app'
}

export const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
})

// Dynamic baseURL injector interceptor
apiClient.interceptors.request.use((config) => {
  config.url = `${getApiUrl()}${config.url}`
  return config
})

export interface ClinicPayload {
  name: string
  address: string
  phone: string
  email: string
  contact?: string
  contactInfo?: string
}

export interface Clinic {
  id: number
  name: string
  address: string
  phone?: string
  contactInfo?: string
  contact?: string
  email: string
  status: 'ACTIVE' | 'INACTIVE'
  secretKey: string | null
}

export const clinicsService = {
  // 1. Yangi klinika yaratish (POST)
  async create(payload: ClinicPayload): Promise<Clinic> {
    const { data } = await apiClient.post<Clinic>('/api/v1/clinics', payload)
    return data
  },

  // 2. Barcha klinikalarni olish (GET)
  async getAll(): Promise<Clinic[]> {
    const { data } = await apiClient.get<Clinic[]>('/api/v1/clinics')
    return data
  },

  // 3. ID bo'yicha klinika olish (GET)
  async getById(id: string | number): Promise<Clinic> {
    const { data } = await apiClient.get<Clinic>(`/api/v1/clinics/${id}`)
    return data
  },

  // 4. Status bo'yicha klinikalarni olish (GET)
  async getByStatus(status: 'ACTIVE' | 'INACTIVE'): Promise<Clinic[]> {
    const { data } = await apiClient.get<Clinic[]>(`/api/v1/clinics/status/${status}`)
    return data
  },

  // 5. Klinika ma'lumotlarini yangilash (PUT)
  async update(id: string | number, payload: ClinicPayload): Promise<Clinic> {
    const { data } = await apiClient.put<Clinic>(`/api/v1/clinics/${id}`, payload)
    return data
  },

  // 6. Klinika statusini o'zgartirish (PATCH)
  async toggleStatus(id: string | number): Promise<Clinic> {
    const { data } = await apiClient.patch<Clinic>(`/api/v1/clinics/${id}/status`)
    return data
  },

  // 7. Klinikani o'chirish (DELETE)
  async delete(id: string | number): Promise<any> {
    const { data } = await apiClient.delete<any>(`/api/v1/clinics/${id}`)
    return data
  },

  // 8. Secret Key kalitini tekshirish (GET)
  async validateKey(secretKey: string): Promise<Clinic> {
    const { data } = await apiClient.get<Clinic>('/api/v1/clinics/validate-key', {
      params: { secretKey }
    })
    return data
  }
}
