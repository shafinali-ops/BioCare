import api from './api'
import { Diagnosis, UrgencyLevel, Medication } from '@/types'

export const aiService = {
  analyzeSymptoms: async (symptoms: string[]) => {
    const response = await api.post('/ai/symptom-checker', { symptoms })
    return response.data as Diagnosis
  },

  getUrgencyAssessment: async (symptoms: string[]) => {
    const response = await api.post('/ai/urgency-assessment', { symptoms })
    return response.data as UrgencyLevel
  },

  sendChatbotQuery: async (query: string) => {
    const response = await api.post('/chatbot/query', { query })
    return response.data
  },

  getHealthTips: async (healthTypes: string[]) => {
    const response = await api.post('/chatbot/health-tips', { healthTypes })
    return response.data
  },

  recommendMedication: async (symptoms: string[]) => {
    const response = await api.post('/chatbot/recommend-medication', { symptoms })
    return response.data as Medication[]
  },

  getSymptomHistory: async () => {
    const response = await api.get('/ai/symptom-history')
    return response.data
  },

  getSymptomCheckById: async (id: string) => {
    const response = await api.get(`/ai/symptom-history/${id}`)
    return response.data
  },
}

