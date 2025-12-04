import api from './api'

export interface VoiceNote {
  _id: string
  doctorId: string
  patientId: {
    _id: string
    name: string
  }
  audioUrl: string
  transcript?: string
  appointmentId?: string
  createdAt: string
}

export const voiceNoteService = {
  uploadVoiceNote: async (formData: FormData) => {
    const response = await api.post('/voice-notes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getPatientVoiceNotes: async (patientId: string): Promise<VoiceNote[]> => {
    const response = await api.get(`/voice-notes/patient/${patientId}`)
    return response.data
  },

  getDoctorVoiceNotes: async (): Promise<VoiceNote[]> => {
    const response = await api.get('/voice-notes/doctor')
    return response.data
  },
}

