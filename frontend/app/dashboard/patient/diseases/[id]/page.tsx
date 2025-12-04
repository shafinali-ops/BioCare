'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { useTheme, themes } from '@/contexts/ThemeContext'
import { toast } from 'react-toastify'
import Link from 'next/link'

interface Disease {
  _id?: string
  id: string
  name: string
  description: string
  symptoms: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  date: string
  status: 'active' | 'resolved' | 'monitoring'
  doctorNotes?: string
  treatment?: string
  medications?: Array<{
    name: string
    dosage: string
    frequency: string
  }>
  followUpDate?: string
}

export default function DiseaseDetailPage() {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const params = useParams()
  const router = useRouter()
  const diseaseId = params.id as string
  const [disease, setDisease] = useState<Disease | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (diseaseId) {
      fetchDisease()
    }
  }, [diseaseId])

  const fetchDisease = async () => {
    try {
      // This would typically fetch from /diseases/:id or /health-records/:id
      // For now, we'll create a mock structure
      setDisease(null)
    } catch (error: any) {
      toast.error('Failed to fetch disease details')
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

  if (!disease) {
    return (
      <DashboardLayout role="patient">
        <div className="px-4 py-6">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Disease record not found</p>
            <Link href="/dashboard/patient/diseases" className="text-blue-600 hover:underline">
              Back to Disease Tracking
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="patient">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/patient/diseases"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Back to Disease Tracking
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{disease.name}</h1>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm rounded-full font-semibold ${disease.status === 'active' ? 'bg-red-100 text-red-800' :
                    disease.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                  }`}>
                  {disease.status}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full font-semibold ${disease.severity === 'critical' ? 'bg-red-200 text-red-900' :
                    disease.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      disease.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-primary-100 text-primary-800'
                  }`}>
                  {disease.severity} severity
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Disease Information */}
        <div className={`${themeColors.card} rounded-2xl shadow-xl p-6 mb-6 border-2 ${themeColors.border}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Disease Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="text-gray-900">{disease.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {disease.symptoms.map((symptom, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Date Recorded</p>
              <p className="text-gray-900">{new Date(disease.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Treatment Information */}
        {disease.treatment && (
          <div className={`${themeColors.card} rounded-2xl shadow-xl p-6 mb-6 border-2 ${themeColors.border}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Treatment Plan</h2>
            <p className="text-gray-900">{disease.treatment}</p>
          </div>
        )}

        {/* Medications */}
        {disease.medications && disease.medications.length > 0 && (
          <div className={`${themeColors.card} rounded-2xl shadow-xl p-6 mb-6 border-2 ${themeColors.border}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Prescribed Medications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {disease.medications.map((med, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-1">{med.name}</p>
                  <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                  <p className="text-sm text-gray-600">Frequency: {med.frequency}</p>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/patient/pharmacy/prescriptions"
              className="mt-4 inline-block bg-primary-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-primary-700 transition"
            >
              Fulfill Prescription
            </Link>
          </div>
        )}

        {/* Doctor Notes */}
        {disease.doctorNotes && (
          <div className={`${themeColors.card} rounded-2xl shadow-xl p-6 mb-6 border-2 ${themeColors.border}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Doctor Notes</h2>
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-gray-900">{disease.doctorNotes}</p>
            </div>
          </div>
        )}

        {/* Follow-up Information */}
        {disease.followUpDate && (
          <div className={`${themeColors.card} rounded-2xl shadow-xl p-6 mb-6 border-2 ${themeColors.border}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Follow-up</h2>
            <p className="text-gray-900">
              Next follow-up scheduled for: {new Date(disease.followUpDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/dashboard/patient/consultation"
            className={`flex-1 ${themeColors.button} text-white py-3 px-6 rounded-xl font-semibold hover:shadow-xl transition text-center`}
          >
            Consult Doctor
          </Link>
          <Link
            href="/dashboard/patient/appointments"
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition text-center"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

