'use client'

import DashboardLayout from '@/components/layouts/DashboardLayout'
import DoctorChat from '@/components/chat/DoctorChat'

export default function DoctorChatPage() {
  return (
    <DashboardLayout role="doctor">
      <DoctorChat />
    </DashboardLayout>
  )
}
