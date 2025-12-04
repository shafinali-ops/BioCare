import api from './api'

export const pharmacyService = {
  getAllMedications: async (search?: string, category?: string) => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (category) params.append('category', category)

    const response = await api.get(`/pharmacy?${params.toString()}`)
    return response.data
  },

  getMedicationById: async (id: string) => {
    const response = await api.get(`/pharmacy/${id}`)
    return response.data
  },

  getCategories: async () => {
    const response = await api.get('/pharmacy/categories')
    return response.data
  },

  createMedication: async (medicationData: any) => {
    const response = await api.post('/pharmacy', medicationData)
    return response.data
  },

  updateMedication: async (id: string, medicationData: any) => {
    const response = await api.put(`/pharmacy/${id}`, medicationData)
    return response.data
  },

  deleteMedication: async (id: string) => {
    const response = await api.delete(`/pharmacy/${id}`)
    return response.data
  },

  getAllPrescriptions: async () => {
    const response = await api.get('/prescriptions')
    return response.data
  },
}







