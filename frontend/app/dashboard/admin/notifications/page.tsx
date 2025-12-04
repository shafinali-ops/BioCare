'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { toast } from 'react-toastify'

interface Notification {
    _id: string
    message: string
    type: string
    read: boolean
    date: string
    createdAt: string
}

const typeIcons: Record<string, string> = {
    doctor_signup: '👨‍⚕️',
    patient_signup: '🧑‍🤝‍🧑',
    appointment_booked: '📅',
    consultation_completed: '✅',
    prescription_created: '💊',
    medicine_added: '💉',
    lhw_patient_registered: '🏥',
    general: '🔔',
    appointment: '📅',
    prescription: '💊',
    message: '💬',
    call: '📞',
    alert: '⚠️'
}

const typeColors: Record<string, string> = {
    doctor_signup: 'bg-blue-100',
    patient_signup: 'bg-green-100',
    appointment_booked: 'bg-purple-100',
    consultation_completed: 'bg-emerald-100',
    prescription_created: 'bg-orange-100',
    medicine_added: 'bg-cyan-100',
    lhw_patient_registered: 'bg-pink-100',
    general: 'bg-gray-100',
    appointment: 'bg-purple-100',
    prescription: 'bg-orange-100',
    message: 'bg-blue-100',
    call: 'bg-green-100',
    alert: 'bg-red-100'
}

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/notifications/admin`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setNotifications(data)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
            toast.error('Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem('token')
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/notifications/${id}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
        } catch (error) {
            toast.error('Failed to mark as read')
        }
    }

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token')
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/notifications/admin/read-all`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            toast.success('All notifications marked as read')
        } catch (error) {
            toast.error('Failed to mark all as read')
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        if (days < 7) return `${days}d ago`
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const unreadCount = notifications.filter(n => !n.read).length

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="admin">
            <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Mark All as Read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="space-y-2">
                    {notifications.length > 0 ? (
                        notifications.map(notification => (
                            <div
                                key={notification._id}
                                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${!notification.read
                                    ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                onClick={() => !notification.read && markAsRead(notification._id)}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${typeColors[notification.type] || 'bg-gray-100'
                                    }`}>
                                    {typeIcons[notification.type] || '🔔'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-900 dark:text-white`}>
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {formatDate(notification.createdAt || notification.date)}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2"></div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <div className="text-4xl mb-2">🔔</div>
                            <p>No notifications yet</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
