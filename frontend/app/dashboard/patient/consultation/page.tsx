'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import VideoCall from '@/components/consultation/VideoCall'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTheme, themes } from '@/contexts/ThemeContext'

export default function ConsultationPage() {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showVideoCall, setShowVideoCall] = useState(false)
  const isEmergency = searchParams.get('emergency') === 'true'
  const isVideo = searchParams.get('video') === 'true'

  useEffect(() => {
    if (isVideo || isEmergency) {
      setShowVideoCall(true)
    }
  }, [isVideo, isEmergency])

  const handleEndCall = () => {
    setShowVideoCall(false)
    router.push('/dashboard/patient')
  }

  if (showVideoCall) {
    return <VideoCall onEndCall={handleEndCall} />
  }

  return (
    <DashboardLayout role="patient">
      <div className="px-4 py-6">
        <div className={`bg-gradient-to-r ${themeColors.primary} text-white rounded-2xl p-8 mb-6`}>
          <h1 className="text-3xl font-bold mb-2">Doctor Consultation</h1>
          <p className="opacity-90">Connect with a healthcare professional</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${themeColors.card} rounded-xl shadow-lg p-6`}>
            <h3 className="text-xl font-semibold mb-4">Available Doctors</h3>
            <div className="space-y-4">
              {['Dr. Sarah Williams', 'Dr. Mark Thompson', 'Dr. Jennifer Lee'].map((doctor, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{doctor}</p>
                      <p className="text-sm text-gray-600">Cardiologist • Available now</p>
                    </div>
                    <button
                      onClick={() => setShowVideoCall(true)}
                      className={`${themeColors.button} text-white px-4 py-2 rounded-lg hover:shadow-lg transition`}
                    >
                      Start Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${themeColors.card} rounded-xl shadow-lg p-6`}>
            <h3 className="text-xl font-semibold mb-4">Consultation Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="font-medium">Video Consultation</p>
                  <p className="text-sm text-gray-600">HD quality video call</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-medium">Chat Support</p>
                  <p className="text-sm text-gray-600">Real-time messaging</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-medium">Prescription</p>
                  <p className="text-sm text-gray-600">Digital prescription after consultation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

