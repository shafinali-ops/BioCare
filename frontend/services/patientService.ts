import api from './api'
import { Appointment, Prescription, HealthRecord } from '@/types'

export const patientService = {
  bookAppointment: async (doctorId: number | string, date: string) => {
    const response = await api.post('/appointments', { doctorId, date })
    return response.data
  },

  getPrescriptions: async () => {
    const response = await api.get('/prescriptions/patient')
    return response.data
  },

  getMedicalHistory: async () => {
    const response = await api.get('/health-records')
    return response.data
  },

  getAppointments: async () => {
    const response = await api.get('/appointments/patient')
    return response.data
  },

  getDoctors: async () => {
    const response = await api.get('/patients/doctors')
    return response.data
  },
  getProfile: async () => {
    const response = await api.get('/patients/profile')
    return response.data
  },

  updateProfile: async (payload: { name?: string; age?: number; gender?: string }) => {
    const response = await api.put('/patients/profile', payload)
    return response.data
  },

  getDashboardStats: async () => {
    const response = await api.get('/patients/dashboard-stats')
    return response.data
  },
}

