'use client'

import { useState, useEffect } from 'react'
import { patientService } from '@/services/patientService'
import { toast } from 'react-toastify'
import { useTheme, themes } from '@/contexts/ThemeContext'

interface Doctor {
  _id: string
  id?: number
  name: string
  specialization: string
  email?: string
  hospitalId?: {
    name?: string
  }
}

interface AppointmentBookingProps {
  doctorId?: number | string
}

export default function AppointmentBooking({ doctorId }: AppointmentBookingProps) {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    doctorId: doctorId || '',
    date: '',
    time: '',
  })
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(true)

  useEffect(() => {
    if (!doctorId) {
      fetchDoctors()
    } else {
      setLoadingDoctors(false)
    }
  }, [doctorId])

  const fetchDoctors = async () => {
    try {
      const data = await patientService.getDoctors()
      setDoctors(data)
    } catch (error: any) {
      toast.error('Failed to load doctors. Please try again.')
      console.error('Error fetching doctors:', error)
    } finally {
      setLoadingDoctors(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const appointmentDate = `${formData.date}T${formData.time}`
      // Use the selected doctor ID (can be string _id or number id)
      const selectedDoctorId = formData.doctorId
      await patientService.bookAppointment(selectedDoctorId, appointmentDate)
      toast.success('Appointment booked successfully!')
      setFormData({ doctorId: doctorId || '', date: '', time: '' })
      // Trigger a page refresh or callback if needed
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  const selectedDoctor = doctors.find(d =>
    d._id === formData.doctorId ||
    d.id?.toString() === formData.doctorId?.toString() ||
    String(d._id) === String(formData.doctorId)
  )

  return (
    <div className="bg-white rounded-[2rem] shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-900">Book Appointment</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {!doctorId && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Select Doctor <span className="text-red-500">*</span>
            </label>
            {loadingDoctors ? (
              <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading doctors...</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  required
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition bg-white text-sm outline-none appearance-none"
                >
                  <option value="">-- Select a Doctor --</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id || doctor.id} value={doctor._id || doctor.id}>
                      Dr. {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400 text-xs">▼</div>
              </div>
            )}
            {selectedDoctor && (
              <div className="mt-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-lg">
                    👨‍⚕️
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Dr. {selectedDoctor.name}
                    </p>
                    <p className="text-xs text-gray-600">{selectedDoctor.specialization}</p>
                    {selectedDoctor.hospitalId?.name && (
                      <p className="text-xs text-gray-500">{selectedDoctor.hospitalId.name}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {doctors.length === 0 && !loadingDoctors && (
              <p className="text-sm text-red-600 mt-2">No doctors available. Please contact support.</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition text-sm outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || loadingDoctors || !formData.doctorId}
          className="w-full bg-purple-600 text-white py-3.5 px-6 rounded-xl font-bold text-sm hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Booking...
            </span>
          ) : (
            'Confirm Booking'
          )}
        </button>
      </form>
    </div>
  )
}

