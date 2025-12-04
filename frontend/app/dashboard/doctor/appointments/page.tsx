'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { doctorService } from '@/services/doctorService'
import { Appointment } from '@/types'
import { toast } from 'react-toastify'
import axios from 'axios'
import { io } from 'socket.io-client'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'

export default function DoctorAppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending')

  useEffect(() => {
    fetchAppointments()
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

    // Join user room
    socket.emit('join', `user:${user._id}`)

    // Listen for new appointment bookings
    socket.on('appointment_booked', (data) => {
      console.log('🔔 New appointment booked:', data)
      toast.info(data.message || 'New appointment request received!')
      fetchAppointments() // Refresh list
    })

    return () => {
      socket.off('appointment_booked')
      socket.disconnect()
    }
  }

  const fetchAppointments = async () => {
    try {
      const data = await doctorService.getAppointments()
      setAppointments(data)
    } catch (error: any) {
      toast.error('Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${API_URL}/appointments/${appointmentId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Appointment accepted!')
      fetchAppointments()
    } catch (error: any) {
      console.error('Error accepting appointment:', error)
      toast.error(error.response?.data?.message || 'Failed to accept appointment')
    }
  }

  const handleReject = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${API_URL}/appointments/${appointmentId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Appointment rejected')
      fetchAppointments()
    } catch (error: any) {
      console.error('Error rejecting appointment:', error)
      toast.error(error.response?.data?.message || 'Failed to reject appointment')
    }
  }

  const handleStartConsultation = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('token')

      // 1. Create consultation
      const response = await axios.post(
        `${API_URL}/consultations`,
        {
          appointmentId,
          symptoms: ['Pending'], // Initial placeholder
          diagnosis: 'Pending', // Initial placeholder
          doctor_notes: 'Consultation started'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const consultationId = response.data.consultation._id

      // 2. Redirect to consultation page
      router.push(`/dashboard/doctor/consultations/${consultationId}`)

    } catch (error: any) {
      // If consultation already exists, try to find it or handle error
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        // Ideally we should fetch the existing consultation ID here, but for now let's just show error
        // Or we could try to fetch consultations for this appointment
        toast.info('Resuming existing consultation...')
        // We might need an endpoint to get consultation by appointmentId, or just list consultations
      }
      console.error('Error starting consultation:', error)
      toast.error(error.response?.data?.message || 'Failed to start consultation')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'approved': return 'bg-green-100 text-green-700'
      case 'scheduled':
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
      case 'cancelled':
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    if (activeTab === 'pending') return apt.status === 'pending' || apt.status === 'scheduled'
    if (activeTab === 'approved') return apt.status === 'approved' || apt.status === 'accepted'
    return true
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="doctor">
      <div className="p-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm">Manage your patient appointments</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-4 max-w-md">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'pending'
                ? 'bg-yellow-100 text-yellow-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Pending ({appointments.filter(a => a.status === 'pending' || a.status === 'scheduled').length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex-1 px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'approved'
                ? 'bg-green-100 text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Approved ({appointments.filter(a => a.status === 'approved' || a.status === 'accepted').length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'all'
                ? 'bg-purple-100 text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              All ({appointments.length})
            </button>
          </div>

          {/* Appointments List */}
          <div className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  📅
                </div>
                <p className="text-gray-500 text-sm">No {activeTab} appointments found</p>
              </div>
            ) : (
              filteredAppointments.map((apt) => {
                const date = new Date(apt.date)
                const month = date.toLocaleString('default', { month: 'short' }).toUpperCase()
                const day = date.getDate()

                return (
                  <div key={apt._id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-all bg-white">
                    {/* Date Badge */}
                    <div className="flex-shrink-0 w-16 h-16 bg-purple-50 rounded-2xl flex flex-col items-center justify-center text-purple-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider">{month}</span>
                      <span className="text-xl font-bold leading-none">{day}</span>
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm truncate">
                        {(apt as any).patientId?.name || 'Patient Name'}
                      </h3>
                      <p className="text-xs text-gray-500 truncate mb-1">
                        Time: {(apt as any).time || date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold">Reason:</span> {(apt as any).reason_for_visit || apt.reason || 'Not specified'}
                      </p>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>

                      {/* Action Buttons */}
                      {(apt.status === 'pending' || apt.status === 'scheduled') && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(apt._id!)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-bold"
                          >
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => handleReject(apt._id!)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-bold"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}

                      {(apt.status === 'approved' || apt.status === 'accepted') && (
                        <button
                          onClick={() => handleStartConsultation(apt._id!)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-bold shadow-lg shadow-purple-200"
                        >
                          ▶ Start Consultation
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
