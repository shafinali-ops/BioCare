import { User } from '@/types'

export const isAuthenticated = (): boolean => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('token')
  }
  return false
}

export const getUserRole = (): string | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user: User = JSON.parse(userStr)
      return user.role
    }
  }
  return null
}

export const requireAuth = (role?: string): boolean => {
  if (!isAuthenticated()) {
    return false
  }
  if (role) {
    const userRole = getUserRole()
    return userRole === role
  }
  return true
}

