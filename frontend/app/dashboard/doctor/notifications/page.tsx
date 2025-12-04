'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { notificationService } from '@/services/notificationService'
import { Notification } from '@/types'
import { toast } from 'react-toastify'
import { useTheme, themes } from '@/contexts/ThemeContext'

export default function DoctorNotificationsPage() {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    fetchNotifications()
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications()
      setNotifications(data)
    } catch (error: any) {
      toast.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string | number) => {
    try {
      await notificationService.markAsRead(String(notificationId))
      await fetchNotifications()
      toast.success('Notification marked as read')
    } catch (error: any) {
      toast.error('Failed to mark notification as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read)
      await Promise.all(unreadNotifications.map(n => notificationService.markAsRead(String(n.id))))
      await fetchNotifications()
      toast.success('All notifications marked as read')
    } catch (error: any) {
      toast.error('Failed to mark notifications as read')
    }
  }

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="text-center py-12">Loading...</div>
      </DashboardLayout>
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <DashboardLayout role="doctor">
      <div className="px-4 py-6">
        {/* Hero Section */}
        <div className="relative mb-8 overflow-hidden rounded-3xl">
          <div className={`absolute inset-0 bg-gradient-to-r ${themeColors.primary}`}></div>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative text-white p-8 md:p-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">Notifications</h1>
                <p className="text-xl opacity-90">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
              <div className="hidden md:block text-8xl opacity-20">🔔</div>
            </div>
          </div>
        </div>

        {/* Filter and Actions */}
        <div className={`${themeColors.card} rounded-2xl shadow-xl p-6 mb-8 border-2 ${themeColors.border}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl font-semibold transition ${filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-xl font-semibold transition ${filter === 'unread'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className={`${themeColors.card} rounded-2xl shadow-xl p-12 text-center border-2 ${themeColors.border}`}>
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-gray-600">You&apos;re all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`${themeColors.card} rounded-2xl shadow-xl p-6 border-2 ${notification.read ? themeColors.border : 'border-blue-500'
                  } ${!notification.read ? 'bg-primary-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {!notification.read && (
                        <span className="w-3 h-3 bg-primary-600 rounded-full"></span>
                      )}
                      <p className={`font-semibold text-lg ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.message}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">
                      {new Date(notification.date).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-semibold text-sm"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

