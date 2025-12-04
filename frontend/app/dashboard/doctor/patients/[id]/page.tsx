'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { doctorService } from '@/services/doctorService'
import { Patient, Appointment, Consultation, HealthRecord } from '@/types'
import { toast } from 'react-toastify'
import { useTheme, themes } from '@/contexts/ThemeContext'
import Link from 'next/link'
import { vitalService } from '@/services/vitalService'

export default function PatientDetailPage() {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string
  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [healthRecords, setHealthRecords] = useState<{ records: any[], reports: any[] } | null>(null)
  const [vitals, setVitals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'consultations' | 'records'>('overview')

  useEffect(() => {
    if (patientId) {
      fetchPatientData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId])

  const fetchPatientData = async () => {
    try {
      // Fetch patient details, appointments, and consultations
      const [patientsData, appointmentsData, consultationsData] = await Promise.all([
        doctorService.getPatients(),
        doctorService.getAppointments(),
        doctorService.getConsultations(),
      ])

      const foundPatient = patientsData.find((p: Patient) =>
        p._id === patientId || p.id === patientId || p.id === Number(patientId)
      )

      if (!foundPatient) {
        toast.error('Patient not found')
        setLoading(false)
        return
      }

      setPatient(foundPatient)

      // Fetch health records separately with error handling
      try {
        const healthRecordsData = await doctorService.viewMedicalHistory(patientId)
        setHealthRecords(healthRecordsData)
      } catch (error) {
        console.log('No health records found for patient')
        setHealthRecords({ records: [], reports: [] })
      }

      // Fetch vitals
      try {
        const vitalsData = await vitalService.getPatientVitals(patientId)
        setVitals(vitalsData)
      } catch (error) {
        console.log('No vitals found for patient')
        setVitals([])
      }

      setAppointments(appointmentsData.filter((a: Appointment) => {
        const aptPatientId = typeof a.patientId === 'object' ? (a.patientId as any)?._id : a.patientId
        return aptPatientId === patientId || aptPatientId === Number(patientId)
      }))
      setConsultations(consultationsData.filter((c: Consultation) => {
        const consPatientId = typeof c.patientId === 'object' ? (c.patientId as any)?._id : c.patientId
        return consPatientId === patientId || consPatientId === Number(patientId)
      }))
    } catch (error: any) {
      toast.error('Failed to fetch patient data')
      console.error('Error fetching patient data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="text-center py-12">Loading...</div>
      </DashboardLayout>
    )
  }

  if (!patient) {
    return (
      <DashboardLayout role="doctor">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Patient not found</p>
          <Link href="/dashboard/doctor/patients" className="text-blue-600 hover:underline">
            Back to Patients
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="doctor">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/doctor/patients"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Back to Patients
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{patient.name || 'Unknown Patient'}</h1>
              <p className="text-gray-600">{patient.email}</p>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-5xl shadow-lg">
              👤
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b-2 border-gray-200">
          <div className="flex gap-4">
            {(['overview', 'appointments', 'consultations', 'records'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold border-b-2 transition-colors ${activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`${themeColors.card} rounded-2xl shadow-xl p-6 border-2 ${themeColors.border}`}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-semibold text-gray-900">{patient.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">{patient.email}</p>
                  </div>
                  {patient.age && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Age</p>
                      <p className="font-semibold text-gray-900">{patient.age}</p>
                    </div>
                  )}
                  {patient.gender && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Gender</p>
                      <p className="font-semibold text-gray-900">{patient.gender}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-primary-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Appointments</p>
                    <p className="text-3xl font-bold text-blue-600">{appointments.length}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Consultations</p>
                    <p className="text-3xl font-bold text-green-600">{consultations.length}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Health Records</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {(healthRecords?.records?.length || 0) + vitals.length}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Latest Vitals</h3>
                {vitals.length > 0 ? (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">Recorded on {new Date(vitals[0].createdAt).toLocaleDateString()}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${vitals[0].alertLevel === 'critical' ? 'bg-red-100 text-red-800' :
                        vitals[0].alertLevel === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {vitals[0].alertLevel}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Heart Rate</p>
                        <p className="text-xl font-bold text-gray-900">{vitals[0].heartRate ? `${vitals[0].heartRate} bpm` : '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Blood Pressure</p>
                        <p className="text-xl font-bold text-gray-900">{vitals[0].bloodPressure ? `${vitals[0].bloodPressure.systolic}/${vitals[0].bloodPressure.diastolic}` : '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Temperature</p>
                        <p className="text-xl font-bold text-gray-900">{vitals[0].temperature ? `${vitals[0].temperature}°C` : '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">SpO2</p>
                        <p className="text-xl font-bold text-gray-900">{vitals[0].oxygenSaturation ? `${vitals[0].oxygenSaturation}%` : '-'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No vital signs recorded yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Appointments</h3>
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border-b pb-3 last:border-0">
                    <p className="font-medium text-gray-800">Appointment #{appointment.id}</p>
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
                  <p className="text-gray-500">No appointments found</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'consultations' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Consultations</h3>
              <div className="space-y-3">
                {consultations.map((consultation) => (
                  <div key={consultation.id} className="border-b pb-3 last:border-0">
                    <p className="font-medium text-gray-800">Consultation #{consultation.id}</p>
                    <p className="text-sm text-gray-600">Status: {consultation.status}</p>
                    <p className="text-sm text-gray-600">Date: {new Date(consultation.consultation_date).toLocaleDateString()}</p>
                  </div>
                ))}
                {consultations.length === 0 && (
                  <p className="text-gray-500">No consultations found</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Complete Medical History</h3>
                <Link
                  href={`/dashboard/doctor/vitals?patientId=${patientId}`}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                >
                  View Vitals →
                </Link>
              </div>
              <div className="space-y-4">
                {/* Vital Signs History */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Vital Signs History</h4>
                  {vitals.length > 0 ? (
                    <div className="overflow-x-auto border-2 border-gray-200 rounded-xl">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Heart Rate</th>
                            <th className="px-4 py-3">BP</th>
                            <th className="px-4 py-3">Temp</th>
                            <th className="px-4 py-3">SpO2</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {vitals.map((vital) => (
                            <tr key={vital._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-600">
                                {new Date(vital.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 font-medium text-gray-900">
                                {vital.heartRate ? `${vital.heartRate} bpm` : '-'}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {vital.bloodPressure ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {vital.temperature ? `${vital.temperature}°C` : '-'}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {vital.oxygenSaturation ? `${vital.oxygenSaturation}%` : '-'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${vital.alertLevel === 'critical' ? 'bg-red-100 text-red-800' :
                                  vital.alertLevel === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                  {vital.alertLevel}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No vital signs recorded yet.</p>
                  )}
                </div>

                {/* Health Records */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Medical Records</h4>
                  <div className="space-y-3">
                    {healthRecords?.records?.map((record: any, index: number) => (
                      <div key={index} className="border-2 border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{record.type || 'Medical Record'}</p>
                            <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              Date: {new Date(record.date).toLocaleDateString()}
                            </p>
                            {record.doctorId && (
                              <p className="text-sm text-gray-500">
                                Doctor ID: {record.doctorId}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!healthRecords?.records || healthRecords.records.length === 0) && (
                      <p className="text-gray-500">No medical records found</p>
                    )}
                  </div>
                </div>

                {/* Reports */}
                {healthRecords?.reports && healthRecords.reports.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Medical Reports</h4>
                    <div className="space-y-3">
                      {healthRecords.reports.map((report: any, index: number) => (
                        <div key={index} className="border-2 border-gray-200 rounded-xl p-4">
                          <p className="font-medium text-gray-800">{report.title || 'Medical Report'}</p>
                          <p className="text-sm text-gray-600 mt-1">{report.content || report.description}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Date: {new Date(report.date || report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-3 pt-4 border-t-2 border-gray-200 flex-wrap">
                  <Link
                    href={`/dashboard/doctor/prescriptions?patientId=${patientId}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
                  >
                    Create Prescription
                  </Link>
                  <Link
                    href={`/dashboard/doctor/chat?patientId=${patient?.userId?._id || patient?.userId?.id || patientId}`}
                    className="px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition"
                  >
                    💬 Chat with Patient
                  </Link>
                  <Link
                    href={`/dashboard/doctor/video-call?patientId=${patient?.userId?._id || patient?.userId?.id || patientId}`}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
                  >
                    📞 Video Call
                  </Link>
                  <Link
                    href={`/dashboard/doctor/voice-notes?patientId=${patientId}`}
                    className="px-4 py-2 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition"
                  >
                    🎤 Voice Note
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

