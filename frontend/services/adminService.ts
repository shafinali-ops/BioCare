import api from './api'

export interface Doctor {
  _id: string
  name: string
  specialization: string
  status: 'pending' | 'approved' | 'rejected' | 'blocked'
  userId: {
    _id: string
    email: string
    name: string
  }
  hospitalId?: {
    name: string
  }
  createdAt?: string
}

export interface UserStatistics {
  totalUsers: number
  totalPatients: number
  totalDoctors: number
  pendingDoctors: number
  approvedDoctors: number
  blockedUsers: number
  totalHospitals: number
  recentUsers: number
}

export const adminService = {
  generateReport: async () => {
    const response = await api.get('/admin/reports')
    return response.data
  },

  manageUsers: async (userId: string, action: string) => {
    const response = await api.put(`/admin/users/${userId}`, { action })
    return response.data
  },

  getAllUsers: async () => {
    const response = await api.get('/admin/users')
    return response.data
  },

  getAllHospitals: async () => {
    const response = await api.get('/admin/hospitals')
    return response.data
  },

  getAllPatients: async () => {
    const response = await api.get('/admin/patients')
    return response.data
  },

  getAllDoctors: async (): Promise<Doctor[]> => {
    const response = await api.get('/admin/doctors')
    return response.data
  },

  getPendingDoctors: async (): Promise<Doctor[]> => {
    const response = await api.get('/admin/doctors/pending')
    return response.data
  },

  approveDoctor: async (doctorId: string) => {
    const response = await api.put(`/admin/doctors/${doctorId}/approve`)
    return response.data
  },

  rejectDoctor: async (doctorId: string) => {
    const response = await api.put(`/admin/doctors/${doctorId}/reject`)
    return response.data
  },

  blockUser: async (userId: string) => {
    const response = await api.put(`/admin/users/${userId}/block`)
    return response.data
  },

  unblockUser: async (userId: string) => {
    const response = await api.put(`/admin/users/${userId}/unblock`)
    return response.data
  },

  getUserStatistics: async (): Promise<UserStatistics> => {
    const response = await api.get('/admin/statistics')
    return response.data
  },

  createUser: async (userData: any) => {
    const response = await api.post('/admin/users', userData)
    return response.data
  },

  createHospital: async (hospitalData: any) => {
    const response = await api.post('/admin/hospitals', hospitalData)
    return response.data
  },

  updateHospital: async (id: string, hospitalData: any) => {
    const response = await api.put(`/admin/hospitals/${id}`, hospitalData)
    return response.data
  },

  deleteHospital: async (id: string) => {
    const response = await api.delete(`/admin/hospitals/${id}`)
    return response.data
  },
}
