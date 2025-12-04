'use client'

import { useState, useEffect } from 'react'
import { useTheme, themes } from '@/contexts/ThemeContext'

interface VideoCallProps {
  doctorName?: string
  onEndCall: () => void
}

export default function VideoCall({ doctorName = 'Dr. Sarah Williams', onEndCall }: VideoCallProps) {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const [isConnected, setIsConnected] = useState(false)
  const [callDuration, setCallDuration] = useState(0)

  useEffect(() => {
    // Simulate connection
    setTimeout(() => setIsConnected(true), 2000)

    // Timer
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl overflow-hidden w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${themeColors.primary} text-white p-4 flex justify-between items-center`}>
          <div>
            <h3 className="text-xl font-bold">{doctorName}</h3>
            <p className="text-sm opacity-90">
              {isConnected ? `Connected • ${formatTime(callDuration)}` : 'Connecting...'}
            </p>
          </div>
          <button
            onClick={onEndCall}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
          >
            End Call
          </button>
        </div>

        {/* Video Area */}
        <div className="flex-1 grid grid-cols-2 gap-4 p-4 bg-gray-800">
          {/* Doctor Video */}
          <div className="bg-gray-700 rounded-xl flex items-center justify-center relative overflow-hidden">
            {isConnected ? (
              <div className="text-center text-white">
                <div className="text-6xl mb-4">👨‍⚕️</div>
                <p className="text-xl font-semibold">{doctorName}</p>
                <p className="text-sm opacity-75">Cardiologist</p>
              </div>
            ) : (
              <div className="text-white text-center">
                <div className="animate-spin text-4xl mb-2">⏳</div>
                <p>Connecting to doctor...</p>
              </div>
            )}
          </div>

          {/* Patient Video */}
          <div className="bg-gray-700 rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">👤</div>
              <p className="text-xl font-semibold">You</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-4 flex justify-center gap-4">
          <button className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition">
            🎤
          </button>
          <button className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition">
            📹
          </button>
          <button className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition">
            📋
          </button>
          <button
            onClick={onEndCall}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition"
          >
            📞
          </button>
        </div>

        {/* Chat Sidebar */}
        <div className="absolute right-4 top-20 w-80 bg-white rounded-xl shadow-2xl h-[calc(90vh-8rem)] flex flex-col hidden lg:flex">
          <div className="bg-gray-100 p-4 rounded-t-xl">
            <h4 className="font-semibold">Chat with Doctor</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="bg-blue-100 rounded-lg p-2">
              <p className="text-sm">Hello, how can I help you today?</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-2 ml-auto">
              <p className="text-sm">I&apos;ve been experiencing chest pain...</p>
            </div>
          </div>
          <div className="p-4 border-t">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

