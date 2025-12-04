'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { doctorService } from '@/services/doctorService'
import { useTheme, themes } from '@/contexts/ThemeContext'
import { toast } from 'react-toastify'
import Link from 'next/link'

export default function DoctorAnalyticsPage() {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const [appointments, setAppointments] = useState<any[]>([])
  const [consultations, setConsultations] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [appointmentsData, consultationsData, patientsData] = await Promise.all([
        doctorService.getAppointments(),
        doctorService.getConsultations(),
        doctorService.getPatients(),
      ])
      setAppointments(appointmentsData)
      setConsultations(consultationsData)
      setPatients(patientsData)
    } catch (error: any) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const totalAppointments = appointments.length
  const completedAppointments = appointments.filter(a => a.status === 'completed').length
  const acceptedAppointments = appointments.filter(a => a.status === 'accepted').length
  const totalPatients = patients.length
  const activeConsultations = consultations.filter(c => c.status === 'in-progress').length

  // Monthly trends (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const monthAppointments = appointments.filter(a => {
      const aptDate = new Date(a.date)
      return aptDate >= monthStart && aptDate <= monthEnd
    }).length

    return {
      month: date.toLocaleString('default', { month: 'short' }),
      count: monthAppointments
    }
  }).reverse()

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
                <h1 className="text-4xl md:text-5xl font-bold mb-3">Analytics & Trends</h1>
                <p className="text-xl opacity-90">View patient trends and performance metrics</p>
              </div>
              <div className="hidden md:block text-8xl opacity-20">📊</div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${themeColors.card} rounded-2xl p-6 shadow-xl border-2 ${themeColors.border} hover:shadow-2xl transition-all`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Total Appointments</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {totalAppointments}
                </p>
              </div>
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-3xl">
                📅
              </div>
            </div>
          </div>

          <div className={`${themeColors.card} rounded-2xl p-6 shadow-xl border-2 ${themeColors.border} hover:shadow-2xl transition-all`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Completed</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  {completedAppointments}
                </p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl">
                ✅
              </div>
            </div>
          </div>

          <div className={`${themeColors.card} rounded-2xl p-6 shadow-xl border-2 ${themeColors.border} hover:shadow-2xl transition-all`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Total Patients</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  {totalPatients}
                </p>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-3xl">
                👥
              </div>
            </div>
          </div>

          <div className={`${themeColors.card} rounded-2xl p-6 shadow-xl border-2 ${themeColors.border} hover:shadow-2xl transition-all`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Active Consultations</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                  {activeConsultations}
                </p>
              </div>
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-3xl">
                💬
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className={`${themeColors.card} rounded-2xl shadow-xl p-6 mb-8 border-2 ${themeColors.border}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Appointment Trends (Last 6 Months)</h2>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{data.month}</span>
                  <span className="text-sm font-bold text-gray-900">{data.count} appointments</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-primary-600 h-4 rounded-full transition-all"
                    style={{ width: `${(data.count / Math.max(...monthlyData.map(d => d.count), 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Activity */}
        <div className={`${themeColors.card} rounded-2xl shadow-xl p-6 border-2 ${themeColors.border}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Patient Activity</h2>
            <Link
              href="/dashboard/doctor/patients"
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {patients.slice(0, 5).map((patient) => {
              const patientAppointments = appointments.filter(a =>
                (a as any).patientId?._id === patient._id || (a as any).patientId?.id === patient.id
              )
              return (
                <div key={patient._id || patient.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{patient.name}</p>
                      <p className="text-sm text-gray-600">
                        {patientAppointments.length} appointment{patientAppointments.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/doctor/patients/${patient._id || patient.id}`}
                      className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              )
            })}
            {patients.length === 0 && (
              <p className="text-gray-500">No patients yet</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

