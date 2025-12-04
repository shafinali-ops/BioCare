import api from './api'
import { User } from '@/types'

export const authService = {
  register: async (email: string, password: string, role: string, name?: string, additionalData?: any) => {
    const payload: any = { email, password, role, name }
    if (additionalData) {
      Object.assign(payload, additionalData)
    }
    const response = await api.post('/auth/register', payload)
    return response.data
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  },
}

