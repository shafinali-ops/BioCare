'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { doctorService } from '@/services/doctorService'
import { Patient } from '@/types'
import { toast } from 'react-toastify'
import { useTheme, themes } from '@/contexts/ThemeContext'
import Link from 'next/link'

export default function DoctorPatientsPage() {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const router = useRouter()

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const data = await doctorService.getPatients()
      setPatients(data)
    } catch (error: any) {
      toast.error('Failed to fetch patients')
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="text-center py-12">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="doctor">
      <div className="p-4">
        {/* Hero Section */}
        <div className="relative mb-4 overflow-hidden rounded-2xl">
          <div className={`absolute inset-0 bg-gradient-to-r ${themeColors.primary}`}></div>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">My Patients</h1>
                <p className="text-lg opacity-90">View and manage your patients</p>
              </div>
              <div className="hidden md:block text-6xl opacity-20">👥</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`${themeColors.card} rounded-2xl shadow-sm p-4 mb-4 border ${themeColors.border}`}>
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              All Patients ({filteredPatients.length})
            </h2>
            <p className="text-gray-600 text-sm">Click on a patient to view details</p>
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className={`${themeColors.card} rounded-2xl shadow-xl p-12 text-center border-2 ${themeColors.border}`}>
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria' : 'You don\'t have any patients yet'}
            </p>
          </div>
        ) : (
          <div className={`${themeColors.card} rounded-2xl shadow-xl border-2 ${themeColors.border} overflow-hidden`}>
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPatients.map((patient, index) => (
                  <tr
                    key={patient._id || patient.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/doctor/patients/${patient._id || patient.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {patient.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {patient.name || 'Unknown Patient'}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {(patient._id || patient.id)?.toString().slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">{patient.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">{patient.age || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.gender === 'male'
                        ? 'bg-primary-100 text-primary-800'
                        : patient.gender === 'female'
                          ? 'bg-pink-100 text-pink-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/doctor/patients/${patient._id || patient.id}`)
                          }}
                          className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs font-semibold"
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/doctor/chat?patientId=${patient.userId?._id || patient.userId?.id}`)
                          }}
                          className="p-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors"
                          title="Message"
                        >
                          💬
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/doctor/video-call?patientId=${patient.userId?._id || patient.userId?.id}`)
                          }}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Video Call"
                        >
                          📞
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

