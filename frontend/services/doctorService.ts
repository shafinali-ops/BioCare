import api from './api'
import { Consultation, Prescription, Appointment, Patient } from '@/types'

export const doctorService = {
  scheduleAvailability: async (timeSlots: { from: string; to: string }[], date?: string) => {
    const payload: any = { availability: timeSlots }
    if (date) payload.date = date
    const response = await api.put('/doctors/availability', payload)
    return response.data
  },

  bookAppointment: async (doctorId: number, date: string) => {
    const response = await api.post('/appointments', { doctorId, date })
    return response.data
  },

  viewMedicalHistory: async (patientId: string | number) => {
    const response = await api.get(`/health-records/patient/${patientId}`)
    return response.data
  },

  manageConsultation: async (patientId: string | number, consultationData: Partial<Consultation>) => {
    const response = await api.post('/consultations', { patientId, ...consultationData })
    return response.data
  },

  suggestHospital: async (patientLocation: string, condition: string) => {
    const response = await api.post('/hospitals/suggest', { location: patientLocation, condition })
    return response.data
  },

  getPatients: async () => {
    const response = await api.get('/doctors/patients')
    return response.data
  },

  getConsultations: async () => {
    const response = await api.get('/doctors/consultations')
    return response.data
  },

  getAppointments: async () => {
    const response = await api.get('/doctors/appointments')
    return response.data
  },

  createPrescription: async (patientId: number | string, medications: any[]) => {
    const response = await api.post('/prescriptions', { patientId, medication: medications })
    return response.data
  },

  acceptAppointment: async (appointmentId: string) => {
    const response = await api.put(`/appointments/${appointmentId}/accept`)
    return response.data
  },

  rejectAppointment: async (appointmentId: string) => {
    const response = await api.put(`/appointments/${appointmentId}/reject`)
    return response.data
  },

  getDashboardStats: async () => {
    const response = await api.get('/doctors/dashboard-stats')
    return response.data
  },

  getHighRiskPatients: async () => {
    const response = await api.get('/doctors/high-risk-patients')
    return response.data
  },
}

