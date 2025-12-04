'use client'

import DashboardLayout from '@/components/layouts/DashboardLayout'
import EnhancedChatbot from '@/components/features/EnhancedChatbot'
import { Suspense } from 'react'

function ChatbotContent() {
  return <EnhancedChatbot />
}

export default function ChatbotPage() {
  return (
    <DashboardLayout role="patient">
      <div className="px-4 py-6">
        <Suspense fallback={<div>Loading...</div>}>
          <ChatbotContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
