'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { io } from 'socket.io-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'

interface Notification {
    _id: string
    message: string
    type: string
    read: boolean
    createdAt: string
    relatedId?: string
}

export default function NotificationList() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchNotifications()
        setupSocketListeners()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const setupSocketListeners = () => {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        if (!token || !userStr) return

        const user = JSON.parse(userStr)
        const socket = io(SOCKET_URL, {
            auth: { token }
        })

        socket.emit('join', `user:${user._id}`)

        const handleNewNotification = () => {
            fetchNotifications()
        }

        socket.on('appointment_approved', handleNewNotification)
        socket.on('appointment_rejected', handleNewNotification)
        socket.on('appointment_rescheduled', handleNewNotification)
        socket.on('consultation_started', handleNewNotification)
        socket.on('consultation_completed', handleNewNotification)
        socket.on('prescription_created', handleNewNotification)


        return () => {
            socket.off('appointment_approved', handleNewNotification)
            socket.off('appointment_rejected', handleNewNotification)
            socket.off('appointment_rescheduled', handleNewNotification)
            socket.off('consultation_started', handleNewNotification)
            socket.off('consultation_completed', handleNewNotification)
            socket.off('prescription_created', handleNewNotification)
            socket.disconnect()
        }
    }

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setNotifications(response.data)
        } catch (error) {
            console.error('Failed to fetch notifications', error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem('token')
            await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, read: true } : n
            ))
        } catch (error) {
            console.error('Failed to mark as read', error)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Notifications</h2>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No notifications yet</p>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`p-4 rounded-2xl border transition-all ${notification.read
                                ? 'bg-white border-gray-100'
                                : 'bg-purple-50 border-purple-100'
                                }`}
                            onClick={() => !notification.read && markAsRead(notification._id)}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
