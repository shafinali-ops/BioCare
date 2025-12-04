'use client'

import { useEffect, useState } from 'react'
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
}

export default function DiseasesPage() {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved' | 'monitoring'>('all')

  useEffect(() => {
    fetchDiseases()
  }, [])

  const fetchDiseases = async () => {
    try {
      // This would typically come from a diseases/health records endpoint
      // For now, we'll create a mock structure
      // In a real app, this would fetch from /health-records or /diseases endpoint
      setDiseases([])
    } catch (error: any) {
      toast.error('Failed to fetch disease records')
    } finally {
      setLoading(false)
    }
  }

  const filteredDiseases = filter === 'all'
    ? diseases
    : diseases.filter(d => d.status === filter)

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
                <h1 className="text-4xl md:text-5xl font-bold mb-3">Disease Tracking</h1>
                <p className="text-xl opacity-90">Monitor and track your health conditions</p>
              </div>
              <div className="hidden md:block text-8xl opacity-20">🏥</div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className={`${themeColors.card} rounded-2xl shadow-xl p-6 mb-8 border-2 ${themeColors.border}`}>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'resolved', 'monitoring'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl font-semibold transition ${filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} (
                {status === 'all' ? diseases.length : diseases.filter(d => d.status === status).length})
              </button>
            ))}
          </div>
        </div>

        {/* Diseases List */}
        <div className="space-y-4 mb-8">
          {filteredDiseases.length === 0 ? (
            <div className={`${themeColors.card} rounded-2xl shadow-xl p-12 text-center border-2 ${themeColors.border}`}>
              <div className="text-6xl mb-4">🏥</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No disease records found</h3>
              <p className="text-gray-600 mb-4">Your disease tracking records will appear here</p>
              <Link
                href="/dashboard/patient/symptom-checker"
                className={`${themeColors.button} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition inline-block`}
              >
                Check Symptoms
              </Link>
            </div>
          ) : (
            filteredDiseases.map((disease) => (
              <div
                key={disease._id || disease.id}
                className={`${themeColors.card} rounded-2xl shadow-xl p-6 border-2 ${themeColors.border} hover:shadow-2xl transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{disease.name}</h3>
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${disease.status === 'active' ? 'bg-red-100 text-red-800' :
                          disease.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                        {disease.status}
                      </span>
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${disease.severity === 'critical' ? 'bg-red-200 text-red-900' :
                          disease.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            disease.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-primary-100 text-primary-800'
                        }`}>
                        {disease.severity} severity
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{disease.description}</p>
                    <div className="mb-3">
                      <p className="font-semibold text-gray-900 mb-1">Symptoms:</p>
                      <div className="flex flex-wrap gap-2">
                        {disease.symptoms.map((symptom, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                    {disease.doctorNotes && (
                      <div className="mb-3 p-3 bg-primary-50 rounded-lg">
                        <p className="font-semibold text-gray-900 mb-1">Doctor Notes:</p>
                        <p className="text-gray-700">{disease.doctorNotes}</p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      Recorded: {new Date(disease.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Link
                    href={`/dashboard/patient/diseases/${disease._id || disease.id}`}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-primary-700 transition text-center"
                  >
                    View Details
                  </Link>
                  <Link
                    href="/dashboard/patient/consultation"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-green-700 transition text-center"
                  >
                    Consult Doctor
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/patient/symptom-checker"
            className={`${themeColors.card} rounded-2xl p-6 shadow-xl border-2 ${themeColors.border} hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg">
                🔍
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Symptom Checker</h3>
            <p className="text-sm text-gray-600">Check your symptoms and get recommendations</p>
          </Link>

          <Link
            href="/dashboard/patient/health-records"
            className={`${themeColors.card} rounded-2xl p-6 shadow-xl border-2 ${themeColors.border} hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg">
                📋
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Health Records</h3>
            <p className="text-sm text-gray-600">View your complete health history</p>
          </Link>

          <Link
            href="/dashboard/patient/consultation"
            className={`${themeColors.card} rounded-2xl p-6 shadow-xl border-2 ${themeColors.border} hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg">
                💬
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Consult Doctor</h3>
            <p className="text-sm text-gray-600">Get professional medical advice</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

