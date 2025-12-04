'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { patientService } from '@/services/patientService'
import { useTheme, themes } from '@/contexts/ThemeContext'
import { toast } from 'react-toastify'
import api from '@/services/api'

interface VoiceNote {
  _id: string
  doctorId: {
    _id: string
    name: string
    specialization: string
  }
  audioUrl: string
  transcript?: string
  createdAt: string
}

export default function PatientVoiceNotesPage() {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVoiceNotes()
  }, [])

  const fetchVoiceNotes = async () => {
    try {
      // Use the new endpoint that gets voice notes for current patient
      const response = await api.get('/voice-notes/patient')
      setVoiceNotes(response.data)
    } catch (error: any) {
      console.error('Failed to fetch voice notes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="patient">
        <div className="text-center py-12">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="patient">
      <div className="px-4 py-6">
        {/* Hero Section */}
        <div className="relative mb-8 overflow-hidden rounded-3xl">
          <div className={`absolute inset-0 bg-gradient-to-r ${themeColors.primary}`}></div>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative text-white p-8 md:p-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">Voice Notes from Doctors</h1>
                <p className="text-xl opacity-90">Listen to voice notes from your doctors</p>
              </div>
              <div className="hidden md:block text-8xl opacity-20">🎤</div>
            </div>
          </div>
        </div>

        {/* Voice Notes List */}
        <div className={`${themeColors.card} rounded-2xl shadow-xl p-6 border-2 ${themeColors.border}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Voice Notes</h2>
          <div className="space-y-4">
            {voiceNotes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎤</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Voice Notes</h3>
                <p className="text-gray-600">Your doctors haven&apos;t sent any voice notes yet</p>
              </div>
            ) : (
              voiceNotes.map((note) => (
                <div key={note._id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        Dr. {note.doctorId.name}
                      </p>
                      <p className="text-sm text-gray-600">{note.doctorId.specialization}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {note.transcript && (
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Transcript:</p>
                      <p className="text-sm text-gray-700">{note.transcript}</p>
                    </div>
                  )}

                  {note.audioUrl && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <audio
                        controls
                        src={note.audioUrl.startsWith('data:') ? note.audioUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${note.audioUrl}`}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

