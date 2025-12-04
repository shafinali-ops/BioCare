'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { patientService } from '@/services/patientService'
import { Prescription } from '@/types'
import { useTheme, themes } from '@/contexts/ThemeContext'
import { toast } from 'react-toastify'
import Link from 'next/link'

export default function PrescriptionFulfillmentPage() {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const data = await patientService.getPrescriptions()
      setPrescriptions(data)
    } catch (error: any) {
      toast.error('Failed to fetch prescriptions')
    } finally {
      setLoading(false)
    }
  }

  const handleFulfillPrescription = (prescriptionId: number | string) => {
    // Navigate to pharmacy with prescription ID
    window.location.href = `/dashboard/patient/pharmacy?prescription=${prescriptionId}`
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
                <h1 className="text-4xl md:text-5xl font-bold mb-3">Prescription Fulfillment</h1>
                <p className="text-xl opacity-90">Get your prescribed medications</p>
              </div>
              <div className="hidden md:block text-8xl opacity-20">💊</div>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <div className={`${themeColors.card} rounded-2xl shadow-xl p-12 text-center border-2 ${themeColors.border}`}>
              <div className="text-6xl mb-4">💊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No prescriptions found</h3>
              <p className="text-gray-600">You don&apos;t have any prescriptions yet</p>
            </div>
          ) : (
            prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className={`${themeColors.card} rounded-2xl shadow-xl p-6 border-2 ${themeColors.border} hover:shadow-2xl transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">Prescription #{prescription.id}</h3>
                      {(prescription as any).doctorId?.name && (
                        <span className="text-gray-600">by Dr. {(prescription as any).doctorId.name}</span>
                      )}
                    </div>
                    <div className="mb-4">
                      <p className="font-semibold text-gray-900 mb-2">Medications:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {prescription.medicines.map((med: any, index: number) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <p className="font-medium text-gray-900">{med.name}</p>
                            <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                            <p className="text-sm text-gray-600">Frequency: {med.frequency}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleFulfillPrescription(prescription.id || prescription._id)}
                    className={`flex-1 ${themeColors.button} text-white py-3 px-6 rounded-xl font-semibold hover:shadow-xl transition`}
                  >
                    Fulfill at Pharmacy
                  </button>
                  <Link
                    href="/dashboard/patient/pharmacy"
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition text-center"
                  >
                    Browse Pharmacy
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

