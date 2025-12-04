'use client'

import DashboardLayout from '@/components/layouts/DashboardLayout'
import NotificationList from '@/components/patient/NotificationList'

export default function NotificationsPage() {
    return (
        <DashboardLayout role="patient">
            <div className="p-6 bg-gray-50 min-h-screen font-sans">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-gray-500 text-sm">Stay updated with your appointments and health records</p>
                    </div>
                    <NotificationList />
                </div>
            </div>
        </DashboardLayout>
    )
}
