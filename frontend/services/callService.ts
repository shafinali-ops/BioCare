import api from './api'

export interface Call {
  _id: string
  callerId: {
    _id: string
    name: string
    email: string
    role: string
  }
  receiverId: {
    _id: string
    name: string
    email: string
    role: string
  }
  status: 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed'
  startedAt: string
  endedAt?: string
  duration?: number
  createdAt: string
}

export const callService = {
  initiateCall: async (receiverId: string): Promise<Call> => {
    const response = await api.post('/calls/initiate', { receiverId })
    return response.data
  },

  checkIncomingCalls: async (): Promise<Call | null> => {
    const response = await api.get('/calls/incoming')
    return response.data
  },

  acceptCall: async (callId: string): Promise<Call> => {
    const response = await api.put(`/calls/${callId}/accept`)
    return response.data
  },

  rejectCall: async (callId: string): Promise<Call> => {
    const response = await api.put(`/calls/${callId}/reject`)
    return response.data
  },

  endCall: async (callId: string): Promise<Call> => {
    const response = await api.put(`/calls/${callId}/end`)
    return response.data
  },

  getCallStatus: async (callId: string): Promise<Call> => {
    const response = await api.get(`/calls/${callId}/status`)
    return response.data
  },
}

