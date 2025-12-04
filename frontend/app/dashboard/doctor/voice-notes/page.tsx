'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { doctorService } from '@/services/doctorService'
import { useTheme, themes } from '@/contexts/ThemeContext'
import { toast } from 'react-toastify'
import api from '@/services/api'

interface Patient {
  _id: string
  id?: number
  name: string
}

interface VoiceNote {
  _id: string
  patientId: {
    name: string
  }
  audioUrl: string
  transcript: string
  createdAt: string
}

export default function DoctorVoiceNotesPage() {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const searchParams = useSearchParams()
  const patientIdParam = searchParams.get('patientId')
  const [patients, setPatients] = useState<Patient[]>([])
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string>(patientIdParam || '')
  const [selectedAppointment, setSelectedAppointment] = useState<string>('')
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    fetchData()
    if (patientIdParam) {
      setSelectedPatient(patientIdParam)
    }
  }, [patientIdParam])

  const fetchData = async () => {
    try {
      const patientsData = await doctorService.getPatients()
      setPatients(patientsData)
      
      // Fetch voice notes
      try {
        const response = await api.get('/voice-notes/doctor')
        setVoiceNotes(response.data)
      } catch (error) {
        console.error('Failed to fetch voice notes')
      }
    } catch (error: any) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setRecording(true)
      toast.info('Recording started...')
    } catch (error) {
      toast.error('Failed to access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      toast.success('Recording stopped')
    }
  }

  const handleUpload = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient')
      return
    }
    if (!audioBlob) {
      toast.error('Please record an audio note first')
      return
    }

    setUploading(true)
    try {
      // Get the actual patient document to find patient._id (not userId)
      const selectedPatientDoc = patients.find(p => 
        String(p._id) === String(selectedPatient) || 
        String(p.id) === String(selectedPatient)
      )
      
      if (!selectedPatientDoc) {
        toast.error('Patient not found')
        setUploading(false)
        return
      }

      // Use patient._id for voice notes (backend expects patient document ID)
      const patientDocId = selectedPatientDoc._id || selectedPatientDoc.id || selectedPatient

      // Convert audio blob to base64 or use FormData
      // For now, we'll use a simpler approach - send as JSON with audio URL
      // In production, you'd upload to cloud storage first
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result as string
          
          // Send as JSON instead of FormData to avoid parsing issues
          const payload = {
            patientId: String(patientDocId),
            transcript: transcript,
            audioUrl: base64Audio, // Send as base64 for now
            ...(selectedAppointment && { appointmentId: selectedAppointment })
          }

          await api.post('/voice-notes', payload)
          
          toast.success('Voice note uploaded successfully!')
          setAudioBlob(null)
          setTranscript('')
          setSelectedPatient(patientIdParam || '')
          setSelectedAppointment('')
          fetchData()
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to upload voice note')
          console.error('Voice note upload error:', error)
          setUploading(false)
        }
      }
      
      reader.onerror = () => {
        toast.error('Failed to read audio file')
        setUploading(false)
      }
      
      // The upload happens in the FileReader callback above
      // Don't set uploading to false here, it's handled in the callback
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload voice note')
      console.error('Voice note upload error:', error)
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="text-center py-12">Loading...</div>
      </DashboardLayout>
    )
  }

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
                <h1 className="text-4xl md:text-5xl font-bold mb-3">Voice Notes</h1>
                <p className="text-xl opacity-90">Upload voice-to-text notes for patients</p>
              </div>
              <div className="hidden md:block text-8xl opacity-20">🎤</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Form */}
          <div className={`${themeColors.card} rounded-2xl shadow-xl p-6 border-2 ${themeColors.border}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Voice Note</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Patient <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map((patient) => (
                    <option key={patient._id || patient.id} value={patient._id || patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transcript (Optional)
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Enter transcript or notes..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div className="flex gap-4">
                {!recording ? (
                  <button
                    onClick={startRecording}
                    className="flex-1 bg-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <span>🎤</span> Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex-1 bg-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 animate-pulse"
                  >
                    <span>⏹️</span> Stop Recording
                  </button>
                )}
              </div>

              {audioBlob && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-800 mb-2">✓ Audio recorded successfully</p>
                  <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={uploading || !selectedPatient || !audioBlob}
                className={`w-full ${themeColors.button} text-white py-3 px-6 rounded-xl font-semibold hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {uploading ? 'Uploading...' : 'Upload Voice Note'}
              </button>
            </div>
          </div>

          {/* Voice Notes List */}
          <div className={`${themeColors.card} rounded-2xl shadow-xl p-6 border-2 ${themeColors.border}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Voice Notes</h2>
            <div className="space-y-4">
              {voiceNotes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No voice notes yet</p>
              ) : (
                voiceNotes.map((note) => (
                  <div key={note._id} className="border-2 border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{note.patientId.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {note.transcript && (
                      <p className="text-sm text-gray-700 mt-2">{note.transcript}</p>
                    )}
                    {note.audioUrl && (
                      <audio controls src={note.audioUrl} className="w-full mt-3" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

