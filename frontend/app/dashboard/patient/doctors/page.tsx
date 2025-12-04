'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { patientService } from '@/services/patientService'
import { Appointment } from '@/types'
import { toast } from 'react-toastify'
import { useTheme, themes } from '@/contexts/ThemeContext'
import AppointmentBooking from '@/components/features/AppointmentBooking'
import Link from 'next/link'

interface Doctor {
  _id: string
  id: number
  name: string
  specialization: string
  email?: string
  userId?: any
}

export default function PatientDoctorsPage() {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showBooking, setShowBooking] = useState(false)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    try {
      const [appointmentsData] = await Promise.all([
        patientService.getAppointments(),
      ])
      setAppointments(appointmentsData)

      // Fetch doctors from appointments
      const doctorIds = new Set<string>()
      appointmentsData.forEach((apt: any) => {
        if (apt.doctorId?._id) doctorIds.add(apt.doctorId._id)
        if (apt.doctorId?.id) doctorIds.add(String(apt.doctorId.id))
      })

      // Fetch all doctors
      try {
        const doctorsData = await patientService.getDoctors()
        setDoctors(doctorsData)
      } catch (error) {
        // If endpoint doesn't exist, extract from appointments
        const doctorsFromAppointments = appointmentsData
          .map((apt: any) => apt.doctorId)
          .filter((doc: any) => doc && !doctors.find(d => d._id === doc._id || d.id === doc.id))
        setDoctors(doctorsFromAppointments)
      }
    } catch (error: any) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowBooking(true)
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
                <h1 className="text-4xl md:text-5xl font-bold mb-3">My Doctors</h1>
                <p className="text-xl opacity-90">View your doctors and book appointments</p>
              </div>
              <div className="hidden md:block text-8xl opacity-20">👨‍⚕️</div>
            </div>
          </div>
        </div>

        {showBooking && selectedDoctor && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Book Appointment with Dr. {selectedDoctor.name}
              </h2>
              <button
                onClick={() => {
                  setShowBooking(false)
                  setSelectedDoctor(null)
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>
            <AppointmentBooking doctorId={Number(selectedDoctor.id) || Number(selectedDoctor._id)} />
          </div>
        )}

        {/* Doctors List */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Doctors</h2>
          <p className="text-gray-600">Doctors you have appointments with</p>
        </div>

        {doctors.length === 0 ? (
          <div className={`${themeColors.card} rounded-2xl shadow-xl p-12 text-center border-2 ${themeColors.border}`}>
            <div className="text-6xl mb-4">👨‍⚕️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No doctors yet</h3>
            <p className="text-gray-600 mb-4">Book an appointment to see your doctors here</p>
            <button
              onClick={() => setShowBooking(true)}
              className={`${themeColors.button} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition`}
            >
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {doctors.map((doctor) => {
              const doctorAppointments = appointments.filter((apt: any) =>
                apt.doctorId?._id === doctor._id || apt.doctorId?.id === doctor.id
              )
              return (
                <div
                  key={doctor._id || doctor.id}
                  className={`${themeColors.card} rounded-2xl shadow-xl p-6 border-2 ${themeColors.border} hover:shadow-2xl transition-all transform hover:-translate-y-2`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                      👨‍⚕️
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Dr. {doctor.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{doctor.specialization}</p>
                  {doctor.email && (
                    <p className="text-sm text-gray-500 mb-4">{doctor.email}</p>
                  )}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Appointments:</span> {doctorAppointments.length}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/patient/chat?doctorId=${doctor.userId?._id || doctor.userId?.id || doctor._id || doctor.id}`}
                      className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-primary-700 transition text-center"
                    >
                      💬 Chat
                    </Link>
                    <Link
                      href={`/dashboard/patient/video-call?doctorId=${doctor.userId?._id || doctor.userId?.id || doctor._id || doctor.id}`}
                      className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-primary-700 transition text-center"
                    >
                      📞 Call
                    </Link>
                  </div>
                  <button
                    onClick={() => handleBookAppointment(doctor)}
                    className={`w-full mt-2 ${themeColors.button} text-white py-2 px-4 rounded-xl font-semibold hover:shadow-xl transition`}
                  >
                    Book Appointment
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Recent Appointments */}
        <div className={`${themeColors.card} rounded-2xl shadow-xl p-6 border-2 ${themeColors.border}`}>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Recent Appointments</h3>
          <div className="space-y-3">
            {appointments.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="border-b pb-3 last:border-0">
                <p className="font-medium text-gray-800">
                  Appointment #{appointment.id}
                  {(appointment as any).doctorId?.name && (
                    <span className="text-gray-600"> - Dr. {(appointment as any).doctorId.name}</span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(appointment.date).toLocaleDateString()} at {new Date(appointment.date).toLocaleTimeString()}
                </p>
                <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${appointment.status === 'scheduled' ? 'bg-primary-100 text-primary-800' :
                  appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                  {appointment.status}
                </span>
              </div>
            ))}
            {appointments.length === 0 && (
              <p className="text-gray-500">No appointments scheduled</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

