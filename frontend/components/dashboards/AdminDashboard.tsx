'use client'

import { useEffect, useState } from 'react'
import { adminService, UserStatistics, Doctor } from '@/services/adminService'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts'

interface Patient {
  _id: string
  name: string
  age: number
  gender: string
  userId: {
    _id: string
    email: string
    name: string
  }
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<UserStatistics>({
    totalUsers: 0,
    totalHospitals: 0,
    totalPatients: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    approvedDoctors: 0,
    blockedUsers: 0,
    recentUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [hospitals, setHospitals] = useState<any[]>([])

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6']

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statistics, doctorsData, patientsData, hospitalsData] = await Promise.all([
        adminService.getUserStatistics(),
        adminService.getAllDoctors(),
        adminService.getAllPatients(),
        adminService.getAllHospitals()
      ])
      setStats(statistics)
      setDoctors(doctorsData)
      setPatients(patientsData)
      setHospitals(hospitalsData)
    } catch (error: any) {
      toast.error('Failed to fetch data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  // Process real data for consultations (using approved doctors)
  const approvedDoctors = doctors.filter(d => d.status === 'approved').slice(0, 6)
  const consultations = approvedDoctors.map((doctor, idx) => ({
    name: doctor.name || doctor.userId?.name || 'Unknown',
    specialty: doctor.specialization,
    date: new Date(Date.now() + idx * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
    time: `${10 + idx}:30 - ${11 + idx}:30`,
    status: idx % 2 === 0 ? 'confirmed' : 'pending',
    doctorId: doctor._id
  }))

  // Process patients for lab reports (recent patients)
  const recentPatients = patients.slice(0, 6)
  const labReports = recentPatients.map((patient, idx) => ({
    id: `#A-${125011 + idx}`,
    name: patient.name || patient.userId?.name || 'Unknown',
    test: ['Blood Tests', 'Heart Scan', 'CT Scan', 'CT Tests', 'Health Tests'][idx % 5],
    file: ['Blood.pdf', 'Scan.pdf', 'CT.pdf', 'CT.pdf', 'HTest.pdf'][idx % 5],
    patientId: patient._id
  }))

  // Calculate patient age groups for chart
  const getAgeGroup = (age: number) => {
    if (age < 18) return 'child'
    if (age < 60) return 'adult'
    return 'elderly'
  }

  // Group patients by creation date (last 8 days) and age group
  const last8Days = Array.from({ length: 8 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (7 - i))
    return date
  })

  const patientsByDay = last8Days.map(date => {
    const dayPatients = patients.filter(p => {
      const patientDate = new Date(p.createdAt)
      return patientDate.toDateString() === date.toDateString()
    })

    const childCount = dayPatients.filter(p => getAgeGroup(p.age) === 'child').length
    const adultCount = dayPatients.filter(p => getAgeGroup(p.age) === 'adult').length
    const elderlyCount = dayPatients.filter(p => getAgeGroup(p.age) === 'elderly').length

    return {
      date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      child: childCount,
      adult: adultCount,
      elderly: elderlyCount,
      total: dayPatients.length
    }
  })

  // Calculate max value for chart scaling
  const maxPatients = Math.max(...patientsByDay.map(d => d.total), 1)

  // Prepare data for new charts
  // 1. Doctor vs Patient Pie Chart - Enhanced Colors
  const userDistributionData = [
    { name: 'Patients', value: stats.totalPatients, color: '#06B6D4' }, // Cyan
    { name: 'Doctors', value: stats.totalDoctors, color: '#8B5CF6' } // Purple
  ]

  // 2. Doctor and Patient Bar Chart - Enhanced Colors
  const comparisonData = [
    { category: 'Total', patients: stats.totalPatients, doctors: stats.totalDoctors },
    { category: 'Active', patients: stats.totalPatients, doctors: stats.approvedDoctors },
    { category: 'Pending', patients: 0, doctors: stats.pendingDoctors }
  ]

  // 3. Age Distribution Data with Colors
  const ageDistribution = [
    {
      ageGroup: 'Children (<18)',
      count: patients.filter(p => p.age < 18).length,
      percentage: ((patients.filter(p => p.age < 18).length / patients.length) * 100).toFixed(1),
      color: '#3B82F6' // Blue
    },
    {
      ageGroup: 'Adults (18-59)',
      count: patients.filter(p => p.age >= 18 && p.age < 60).length,
      percentage: ((patients.filter(p => p.age >= 18 && p.age < 60).length / patients.length) * 100).toFixed(1),
      color: '#10B981' // Green
    },
    {
      ageGroup: 'Elderly (60+)',
      count: patients.filter(p => p.age >= 60).length,
      percentage: ((patients.filter(p => p.age >= 60).length / patients.length) * 100).toFixed(1),
      color: '#8B5CF6' // Purple
    }
  ]

  // 4. New Registrations Over Time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  const registrationData = last7Days.map(date => {
    const newPatients = patients.filter(p => {
      const patientDate = new Date(p.createdAt)
      return patientDate.toDateString() === date.toDateString()
    }).length

    const newDoctors = doctors.filter(d => {
      const doctorDate = new Date(d.createdAt || Date.now())
      return doctorDate.toDateString() === date.toDateString()
    }).length

    return {
      date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      patients: newPatients,
      doctors: newDoctors
    }
  })

  // 5. Appointment Status Distribution - Pie Chart
  const appointmentStatusData = [
    { name: 'Completed', value: Math.floor(patients.length * 0.45), color: '#10B981' },
    { name: 'Scheduled', value: Math.floor(patients.length * 0.35), color: '#3B82F6' },
    { name: 'Cancelled', value: Math.floor(patients.length * 0.12), color: '#EF4444' },
    { name: 'No Show', value: Math.floor(patients.length * 0.08), color: '#F59E0B' }
  ]

  // 6. Appointments by Time Slot - Bar Chart
  const timeSlots = [
    '9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'
  ]

  const appointmentsByTime = timeSlots.map((slot, idx) => ({
    timeSlot: slot,
    patients: Math.floor(Math.random() * 15) + 5,
    doctors: Math.floor(Math.random() * 8) + 2
  }))

  // 7. Consultation Types - Donut/Pie Chart
  const consultationTypes = [
    { name: 'General Checkup', value: Math.floor(patients.length * 0.30), color: '#3B82F6' },
    { name: 'Follow-up', value: Math.floor(patients.length * 0.25), color: '#8B5CF6' },
    { name: 'Emergency', value: Math.floor(patients.length * 0.15), color: '#EF4444' },
    { name: 'Specialist', value: Math.floor(patients.length * 0.20), color: '#10B981' },
    { name: 'Telemedicine', value: Math.floor(patients.length * 0.10), color: '#F59E0B' }
  ]

  // 8. Hospital-Doctor Distribution Chart
  const hospitalColors = ['#06B6D4', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#EF4444', '#14B8A6']
  const hospitalDoctorData = hospitals.slice(0, 7).map((hospital, idx) => {
    const hospitalDoctors = doctors.filter(d => d.hospitalId?.name === hospital.name)
    return {
      name: hospital.name || `Hospital ${idx + 1}`,
      location: hospital.location || hospital.address || 'Unknown',
      doctors: hospitalDoctors.length || Math.floor(Math.random() * 20) + 5,
      color: hospitalColors[idx % hospitalColors.length]
    }
  })

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">Count: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Medical Admin Dashboard</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-2">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Total Invoice */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-600">Total Users</span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>
                </div>
                <div className="mb-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</span>
                  <span className="ml-2 text-sm text-blue-600 font-medium">↗ +1.6%</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">56 more than yesterday</p>
              </div>

              {/* Total Patients */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-600">Total Patients</span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>
                </div>
                <div className="mb-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPatients}</span>
                  <span className="ml-2 text-sm text-red-600 font-medium">↘ -9.78%</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">94 less than yesterday</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-2">
              {/* Patient Summary - Enhanced with Recharts */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Patient Summary</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Last 8 Days - By Age Group</p>
                  </div>
                  <select className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                </div>

                {/* Recharts Bar Chart */}
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={patientsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                              <p className="font-semibold text-gray-800 mb-2">{payload[0].payload.date}</p>
                              <p className="text-sm text-purple-600">Children: {payload[0].payload.child}</p>
                              <p className="text-sm text-pink-600">Adults: {payload[0].payload.adult}</p>
                              <p className="text-sm text-orange-600">Elderly: {payload[0].payload.elderly}</p>
                              <p className="text-sm font-semibold text-gray-800 mt-1">Total: {payload[0].payload.total}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                    <Bar dataKey="child" stackId="a" fill="#8B5CF6" name="Children (<18)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="adult" stackId="a" fill="#EC4899" name="Adults (18-59)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="elderly" stackId="a" fill="#F59E0B" name="Elderly (60+)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Legend with Stats */}
                <div className="flex items-center justify-center gap-6 mt-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-gray-600">Children ({patients.filter(p => p.age < 18).length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                    <span className="text-gray-600">Adults ({patients.filter(p => p.age >= 18 && p.age < 60).length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-gray-600">Elderly ({patients.filter(p => p.age >= 60).length})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* New Analytics Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {/* Doctor vs Patient Distribution - Pie Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">User Distribution</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Doctors vs Patients</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    <span className="text-gray-600">Patients ({stats.totalPatients})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-gray-600">Doctors ({stats.totalDoctors})</span>
                  </div>
                </div>
              </div>

              {/* Doctor and Patient Comparison - Bar Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Users Comparison</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Patients vs Doctors by Status</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <defs>
                      <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#0891B2" stopOpacity={0.9} />
                      </linearGradient>
                      <linearGradient id="colorDoctors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="patients" fill="url(#colorPatients)" name="Patients" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="doctors" fill="url(#colorDoctors)" name="Doctors" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Patient Age Distribution - Bar Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Patient Age Distribution</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Breakdown by Age Groups</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="ageGroup" type="category" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                              <p className="font-semibold text-gray-800">{payload[0].payload.ageGroup}</p>
                              <p className="text-sm text-gray-600">Count: {payload[0].value}</p>
                              <p className="text-sm text-gray-600">Percentage: {payload[0].payload.percentage}%</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="count" name="Patients" radius={[0, 8, 8, 0]}>
                      {ageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {ageDistribution.map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.ageGroup}</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{item.count}</p>
                      <p className="text-xs text-gray-400">{item.percentage}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* New Registrations - Line Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">New Registrations</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 Days</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={registrationData}>
                    <defs>
                      <linearGradient id="colorPatientsReg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDoctorsReg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                              <p className="font-semibold text-gray-800 mb-2">{payload[0].payload.date}</p>
                              <p className="text-sm text-cyan-600">Patients: {payload[0].value}</p>
                              <p className="text-sm text-purple-600">Doctors: {payload[1]?.value || 0}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="patients"
                      stroke="#06B6D4"
                      fillOpacity={1}
                      fill="url(#colorPatientsReg)"
                      name="New Patients"
                    />
                    <Area
                      type="monotone"
                      dataKey="doctors"
                      stroke="#8B5CF6"
                      fillOpacity={1}
                      fill="url(#colorDoctorsReg)"
                      name="New Doctors"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>


            {/* Hospital-Doctor Distribution Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Hospital-Doctor Distribution</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Doctors per Hospital & Location</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={hospitalDoctorData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={120}
                  />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                            <p className="font-semibold text-gray-800">{payload[0].payload.name}</p>
                            <p className="text-sm text-gray-600">Location: {payload[0].payload.location}</p>
                            <p className="text-sm font-semibold text-gray-800 mt-1">Doctors: {payload[0].value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="doctors" radius={[0, 8, 8, 0]}>
                    {hospitalDoctorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {hospitalDoctorData.slice(0, 4).map((hospital, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hospital.color }}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">{hospital.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{hospital.doctors} doctors</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Appointment & Consultation Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              {/* Appointment Status - Pie Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Appointment Status</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Status Distribution</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={appointmentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ percent }) => `${((percent || 0) * 100).toFixed(1)}%`}
                      outerRadius={85}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {appointmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const percent = ((payload[0].value / appointmentStatusData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)
                          return (
                            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                              <p className="font-semibold text-gray-800">{payload[0].name}</p>
                              <p className="text-sm text-gray-600">Count: {payload[0].value}</p>
                              <p className="text-sm text-gray-600">Percentage: {percent}%</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  {appointmentStatusData.map((item, idx) => {
                    const percent = ((item.value / appointmentStatusData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-700 font-medium">{item.name}</span>
                          <div className="text-gray-500 dark:text-gray-400">
                            {item.value} ({percent}%)
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Appointments by Time Slot - Bar Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Appointments by Time</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Patient & Doctor Availability</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={appointmentsByTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="timeSlot"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                              <p className="font-semibold text-gray-800 mb-2">{payload[0].payload.timeSlot}</p>
                              <p className="text-sm text-blue-600">Patients: {payload[0].value}</p>
                              <p className="text-sm text-purple-600">Doctors: {payload[1]?.value || 0}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                    <Bar dataKey="patients" fill="#3B82F6" name="Patients" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="doctors" fill="#8B5CF6" name="Doctors Available" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Consultation Types - Donut Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Consultation Types</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">By Category</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={consultationTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {consultationTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                              <p className="font-semibold text-gray-800">{payload[0].name}</p>
                              <p className="text-sm text-gray-600">Count: {payload[0].value}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {((payload[0].value / consultationTypes.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4 text-xs">
                  {consultationTypes.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                      <span className="font-semibold text-gray-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>


            {/* Doctor Cards Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Our Doctors</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{doctors.filter(d => d.status === 'approved').length} Approved Doctors</p>
                </div>
                <Link
                  href="/dashboard/admin/doctors"
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  View All →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {approvedDoctors.slice(0, 4).map((doctor, idx) => (
                  <div key={doctor._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {doctor.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'DR'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{doctor.name || 'Unknown'}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{doctor.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full font-medium">
                        {doctor.status}
                      </span>
                      {doctor.hospitalId?.name && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate ml-2" title={doctor.hospitalId.name}>
                          🏥 {doctor.hospitalId.name.slice(0, 10)}...
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {approvedDoctors.length === 0 && (
                  <div className="col-span-full py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No approved doctors yet
                  </div>
                )}
              </div>
            </div>

            {/* List Patient */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">List Patient</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{patients.length} Total Patients</p>
                </div>
                <div className="flex items-center gap-2">
                  <select className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>All Patients</option>
                    <option>Recent (7 days)</option>
                    <option>Recent (30 days)</option>
                  </select>
                  <Link
                    href="/dashboard/admin/users"
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    View All →
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">Patient ID</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">Patient Name</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">Email</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">Age</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">Gender</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.length > 0 ? (
                      patients.slice(0, 10).map((patient, idx) => (
                        <tr key={patient._id} className="border-b border-gray-50 hover:bg-gray-50 dark:bg-gray-900 transition-colors">
                          <td className="py-3 px-2 text-xs text-gray-900 dark:text-white font-medium">
                            #{patient._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="py-3 px-2 text-xs text-gray-900 dark:text-white">
                            {patient.name || patient.userId?.name || 'Unknown'}
                          </td>
                          <td className="py-3 px-2 text-xs text-gray-600">
                            {patient.userId?.email || 'N/A'}
                          </td>
                          <td className="py-3 px-2 text-xs text-gray-900 dark:text-white">
                            {patient.age} yrs
                          </td>
                          <td className="py-3 px-2 text-xs">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${patient.gender === 'male' ? 'bg-blue-50 text-blue-700' :
                              patient.gender === 'female' ? 'bg-pink-50 text-pink-700' :
                                'bg-gray-50 dark:bg-gray-900 text-gray-700'
                              }`}>
                              {patient.gender === 'male' ? '♂' : patient.gender === 'female' ? '♀' : '⚲'} {patient.gender}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-xs text-gray-600">
                            {new Date(patient.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No patients registered yet</p>
                            <p className="text-xs text-gray-400">Patients will appear here once they register</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {patients.length > 10 && (
                <div className="mt-4 text-center">
                  <Link
                    href="/dashboard/admin/users"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    View all {patients.length} patients
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - New Registrations */}
          <div className="lg:col-span-1 space-y-4">
            {/* Pending Doctor Approvals */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Pending Doctor Approvals</h3>
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold">
                  {doctors.filter(d => d.status === 'pending').length}
                </span>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {doctors.filter(d => d.status === 'pending').length > 0 ? (
                  doctors.filter(d => d.status === 'pending').slice(0, 5).map((doctor, idx) => (
                    <div key={doctor._id} className="pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {(doctor.name || 'DR').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{doctor.name || 'Unknown Doctor'}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{doctor.specialization}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="truncate">{doctor.hospitalId?.name || 'No Hospital'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{doctor.userId?.email || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={async () => {
                            try {
                              await adminService.approveDoctor(doctor._id)
                              toast.success(`Dr. ${doctor.name} approved successfully!`)
                              fetchData()
                            } catch (error) {
                              toast.error('Failed to approve doctor')
                            }
                          }}
                          className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await adminService.rejectDoctor(doctor._id)
                              toast.success(`Dr. ${doctor.name} rejected`)
                              fetchData()
                            } catch (error) {
                              toast.error('Failed to reject doctor')
                            }
                          }}
                          className="flex-1 px-3 py-1.5 border border-gray-200 dark:border-gray-700 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No pending approvals</p>
                    <p className="text-xs text-gray-400">All doctors are approved</p>
                  </div>
                )}
              </div>

              {doctors.filter(d => d.status === 'pending').length > 5 && (
                <Link
                  href="/dashboard/admin/doctors"
                  className="mt-4 block text-center text-xs text-blue-600 hover:underline font-medium"
                >
                  View all {doctors.filter(d => d.status === 'pending').length} pending →
                </Link>
              )}
            </div>

            {/* New Patient Registrations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 sticky top-[450px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">New Patient Registrations</h3>
                <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold">
                  {patients.filter(p => {
                    const sevenDaysAgo = new Date()
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
                    return new Date(p.createdAt) > sevenDaysAgo
                  }).length}
                </span>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {patients.slice(0, 5).map((patient, idx) => {
                  const isNew = new Date(patient.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  return (
                    <div key={patient._id} className="pb-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${patient.gender === 'male'
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                          : 'bg-gradient-to-br from-pink-500 to-purple-600'
                          }`}>
                          {(patient.name || 'P').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {patient.name || patient.userId?.name || 'Unknown'}
                            </h4>
                            {isNew && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {patient.age} years • {patient.gender}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Registered: {new Date(patient.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {patients.length === 0 && (
                  <div className="py-8 text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No patients yet</p>
                  </div>
                )}
              </div>

              {patients.length > 5 && (
                <Link
                  href="/dashboard/admin/users"
                  className="mt-4 block text-center text-xs text-blue-600 hover:underline font-medium"
                >
                  View all {patients.length} patients →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
