'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { useTheme, themes } from '@/contexts/ThemeContext'
import { toast } from 'react-toastify'
import api from '@/services/api'
import Link from 'next/link'

interface VitalAlert {
  _id: string
  patientId: {
    _id: string
    name: string
  }
  heartRate?: number
  bloodPressure?: {
    systolic: number
    diastolic: number
  }
  temperature?: number
  oxygenSaturation?: number
  alertLevel: 'normal' | 'warning' | 'critical'
  createdAt: string
}

export default function DoctorAlertsPage() {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const [alerts, setAlerts] = useState<VitalAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'warning' | 'critical'>('critical')

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/vitals/alerts')
      setAlerts(response.data)
    } catch (error: any) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter(a => a.alertLevel === filter)

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
                <h1 className="text-4xl md:text-5xl font-bold mb-3">Patient Alerts</h1>
                <p className="text-xl opacity-90">Monitor critical patient vitals and alerts</p>
              </div>
              <div className="hidden md:block text-8xl opacity-20">🚨</div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className={`${themeColors.card} rounded-2xl shadow-xl p-6 mb-8 border-2 ${themeColors.border}`}>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'warning', 'critical'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-4 py-2 rounded-xl font-semibold transition ${filter === level
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)} (
                {level === 'all' ? alerts.length : alerts.filter(a => a.alertLevel === level).length})
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className={`${themeColors.card} rounded-2xl shadow-xl p-12 text-center border-2 ${themeColors.border}`}>
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Alerts</h3>
              <p className="text-gray-600">All patient vitals are within normal range</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert._id}
                className={`${themeColors.card} rounded-2xl shadow-xl p-6 border-2 ${alert.alertLevel === 'critical' ? 'border-red-500 bg-red-50' :
                    alert.alertLevel === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      themeColors.border
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {alert.patientId.name}
                      </h3>
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${alert.alertLevel === 'critical' ? 'bg-red-200 text-red-900' :
                          alert.alertLevel === 'warning' ? 'bg-yellow-200 text-yellow-900' :
                            'bg-green-200 text-green-900'
                        }`}>
                        {alert.alertLevel.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      {alert.heartRate && (
                        <div>
                          <p className="text-sm text-gray-600">Heart Rate</p>
                          <p className="text-lg font-bold text-gray-900">{alert.heartRate} bpm</p>
                        </div>
                      )}
                      {alert.bloodPressure && (
                        <div>
                          <p className="text-sm text-gray-600">Blood Pressure</p>
                          <p className="text-lg font-bold text-gray-900">
                            {alert.bloodPressure.systolic}/{alert.bloodPressure.diastolic} mmHg
                          </p>
                        </div>
                      )}
                      {alert.temperature && (
                        <div>
                          <p className="text-sm text-gray-600">Temperature</p>
                          <p className="text-lg font-bold text-gray-900">{alert.temperature}°C</p>
                        </div>
                      )}
                      {alert.oxygenSaturation && (
                        <div>
                          <p className="text-sm text-gray-600">O2 Saturation</p>
                          <p className="text-lg font-bold text-gray-900">{alert.oxygenSaturation}%</p>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-500">
                      Alerted: {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/dashboard/doctor/patients/${alert.patientId._id}`}
                    className="px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition text-sm"
                  >
                    View Patient
                  </Link>
                  <Link
                    href={`/dashboard/doctor/chat?patientId=${alert.patientId._id}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition text-sm"
                  >
                    Contact Patient
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

