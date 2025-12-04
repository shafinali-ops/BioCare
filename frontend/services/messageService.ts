import api from './api'

export interface Message {
  _id?: string
  id?: string
  senderId: {
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
  message?: string
  read: boolean
  createdAt: string
  attachment?: {
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
    type: 'image' | 'video' | 'audio' | 'document' | 'other'
  }
}

export interface Conversation {
  userId: string
  user: {
    _id: string
    name: string
    email: string
    role: string
  }
  lastMessage: Message
  unreadCount: number
}

export const messageService = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/messages/conversations')
    return response.data
  },

  getConversation: async (userId: string): Promise<Message[]> => {
    const response = await api.get(`/messages/conversation/${userId}`)
    return response.data
  },

  sendMessage: async (receiverId: string, message: string): Promise<Message> => {
    const response = await api.post('/messages/send', { receiverId, message })
    return response.data
  },

  sendMessageWithFile: async (receiverId: string, message: string, file: File): Promise<Message> => {
    const formData = new FormData()
    formData.append('receiverId', receiverId)
    if (message) {
      formData.append('message', message)
    }
    formData.append('file', file)

    const token = localStorage.getItem('token')
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

    const response = await fetch(`${API_URL}/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to send message with file')
    }

    return response.json()
  },

  markAsRead: async (userId: string): Promise<void> => {
    await api.put(`/messages/read/${userId}`)
  },
}

