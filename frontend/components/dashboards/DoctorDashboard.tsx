'use client'

import { useEffect, useState } from 'react'
import { doctorService } from '@/services/doctorService'
import { notificationService } from '@/services/notificationService'
import { Consultation, Appointment, Notification } from '@/types'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { useTheme, themes } from '@/contexts/ThemeContext'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area } from 'recharts'

export default function DoctorDashboard() {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalConsultations: 0,
    totalPrescriptions: 0
  })
  const [highRiskPatients, setHighRiskPatients] = useState<any[]>([])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    try {
      console.log('🔍 Fetching doctor dashboard data...');
      const [consultationsData, appointmentsData, statsData, highRiskPatientsData] = await Promise.all([
        doctorService.getConsultations(),
        doctorService.getAppointments(),
        doctorService.getDashboardStats(),
        doctorService.getHighRiskPatients(),
      ])
      console.log('📊 Stats received:', statsData);
      setConsultations(consultationsData)
      setAppointments(appointmentsData)
      setHighRiskPatients(highRiskPatientsData)

      if (statsData && statsData.stats) {
        console.log('✅ Setting stats:', statsData.stats);
        setStats(statsData.stats)
      } else {
        console.warn('⚠️ No stats in response');
      }

      await fetchNotifications()
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const notificationsData = await notificationService.getNotifications()
      setNotifications(notificationsData)
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  // Derived data
  const nextPatient = appointments.find(a => a.status === 'accepted' && new Date(a.date) > new Date()) || appointments[0]
  const upcomingAppointments = appointments
    .filter(a => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  console.log('🎨 Rendering doctor dashboard with stats:', stats);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Basic Doctor Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, Dr. Sarah Williams</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Increase contrast</span>
            <span className="text-gray-300">|</span>
            <span>Font size</span>
            <div className="w-24 h-1 bg-gray-200 rounded-full relative">
              <div className="w-3 h-3 bg-gray-600 rounded-full absolute top-1/2 -translate-y-1/2 right-0"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link href="/dashboard/doctor/appointments">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                📅
              </div>
              <span className="text-2xl font-bold">{stats.totalAppointments}</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Appointments</h3>
            <p className="text-sm opacity-90">Total appointments scheduled</p>
          </div>
        </Link>

        <Link href="/dashboard/doctor/consultations">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                🩺
              </div>
              <span className="text-2xl font-bold">{stats.totalConsultations}</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Consultations</h3>
            <p className="text-sm opacity-90">Total consultations conducted</p>
          </div>
        </Link>

        <Link href="/dashboard/doctor/prescriptions">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                💊
              </div>
              <span className="text-2xl font-bold">{stats.totalPrescriptions}</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Prescriptions</h3>
            <p className="text-sm opacity-90">Total prescriptions created</p>
          </div>
        </Link>
      </div>

      {/* High Risk Patients Alert Section */}
      {highRiskPatients.length > 0 && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-800 flex items-center gap-2">
              <span className="text-2xl">⚠️</span> High Risk Patients Attention Needed
            </h2>
            <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
              {highRiskPatients.length} Patients
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highRiskPatients.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md border border-red-100 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">{item.patient.name}</h3>
                    <p className="text-sm text-gray-500">ID: {item.patient.userId}</p>
                  </div>
                  <Link
                    href={`/dashboard/doctor/patients/${item.patient._id}`}
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                  >
                    View Profile
                  </Link>
                </div>
                <div className="space-y-2">
                  {item.risks.slice(0, 2).map((risk: any, rIndex: number) => (
                    <div key={rIndex} className={`text-xs p-2 rounded ${risk.level === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      <p className="font-bold uppercase mb-1">{risk.type} Alert ({risk.level})</p>
                      <p>{risk.description}</p>
                      <p className="text-[10px] opacity-75 mt-1">{new Date(risk.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                  {item.risks.length > 2 && (
                    <p className="text-xs text-center text-gray-500 italic">+{item.risks.length - 2} more alerts</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">


          {/* Next Patient Card - Full Width */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-gray-800">Next patient</h3>
              <div className="flex gap-2 text-gray-400">
                <button className="hover:text-gray-600">&lt;</button>
                <button className="hover:text-gray-600">&gt;</button>
              </div>
            </div>

            {nextPatient ? (
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-200 rounded-xl overflow-hidden">
                  {/* Placeholder Avatar */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                    {(nextPatient as any).patientId?.name?.[0] || 'P'}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-blue-600">{(nextPatient as any).patientId?.name || 'Unknown Patient'}</h4>
                  <p className="text-sm text-gray-500">{(nextPatient as any).reason || 'General Consultation'}</p>
                </div>
                <button className="ml-auto w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 dark:bg-gray-900 hover:text-blue-600 transition">
                  📞
                </button>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No upcoming patients</div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span>🕒</span>
                <span>{nextPatient ? new Date(nextPatient.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600">•••</button>
            </div>
          </div>


          {/* Enhanced Overall Appointment Chart - Full Width */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Overall Appointments</h3>
                <p className="text-sm text-gray-500">Weekly appointment distribution</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={[
                { day: 'Mon', appointments: 12, color: '#3B82F6' },
                { day: 'Tue', appointments: 19, color: '#8B5CF6' },
                { day: 'Wed', appointments: 15, color: '#EC4899' },
                { day: 'Thu', appointments: 22, color: '#10B981' },
                { day: 'Fri', appointments: 18, color: '#F59E0B' },
                { day: 'Sat', appointments: 8, color: '#06B6D4' },
                { day: 'Sun', appointments: 5, color: '#EF4444' }
              ]}>
                <defs>
                  <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="colorGradient3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="colorGradient4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="colorGradient5" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="colorGradient6" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="colorGradient7" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-800">{payload[0].payload.day}</p>
                          <p className="text-sm text-gray-600">Appointments: {payload[0].value}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="appointments" radius={[8, 8, 0, 0]}>
                  {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                    <Cell key={`cell-${index}`} fill={`url(#colorGradient${index + 1})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-7 gap-2 mt-6">
              {[
                { day: 'Mon', color: '#3B82F6', count: 12 },
                { day: 'Tue', color: '#8B5CF6', count: 19 },
                { day: 'Wed', color: '#EC4899', count: 15 },
                { day: 'Thu', color: '#10B981', count: 22 },
                { day: 'Fri', color: '#F59E0B', count: 18 },
                { day: 'Sat', color: '#06B6D4', count: 8 },
                { day: 'Sun', color: '#EF4444', count: 5 }
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: item.color }}></div>
                  <p className="text-xs font-semibold text-gray-700">{item.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* New Charts Section */}
        <div className="grid grid-cols-1 gap-6">
          {/* Consultation Status - Pie Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Consultation Status</h3>
              <p className="text-xs text-gray-500">Distribution by status</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: consultations.filter(c => c.status === 'completed').length || 15, color: '#10B981' },
                    { name: 'Pending', value: consultations.filter(c => c.status === 'pending').length || 8, color: '#F59E0B' },
                    { name: 'In Progress', value: consultations.filter(c => c.status === 'in-progress').length || 5, color: '#3B82F6' },
                    { name: 'Cancelled', value: consultations.filter(c => c.status === 'cancelled').length || 2, color: '#EF4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {[0, 1, 2, 3].map((index) => (
                    <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B', '#3B82F6', '#EF4444'][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              {[
                { name: 'Completed', color: '#10B981' },
                { name: 'Pending', color: '#F59E0B' },
                { name: 'In Progress', color: '#3B82F6' },
                { name: 'Cancelled', color: '#EF4444' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Patients Consulted & Prescriptions - Bar Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Patient Activity</h3>
              <p className="text-xs text-gray-500">Consultations vs Prescriptions</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { category: 'This Week', consulted: 28, prescriptions: 24 },
                { category: 'Last Week', consulted: 32, prescriptions: 28 },
                { category: 'This Month', consulted: 95, prescriptions: 87 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="consulted" fill="#8B5CF6" name="Consulted" radius={[8, 8, 0, 0]} />
                <Bar dataKey="prescriptions" fill="#EC4899" name="Prescriptions" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Accepted Appointments Timeline - Area Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Accepted Appointments</h3>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={[
                { date: 'Mon', appointments: 4, consultations: 3 },
                { date: 'Tue', appointments: 6, consultations: 5 },
                { date: 'Wed', appointments: 5, consultations: 4 },
                { date: 'Thu', appointments: 8, consultations: 7 },
                { date: 'Fri', appointments: 7, consultations: 6 },
                { date: 'Sat', appointments: 3, consultations: 2 },
                { date: 'Sun', appointments: 2, consultations: 1 }
              ]}>
                <defs>
                  <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorConsultations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="appointments"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorAppointments)"
                  name="Appointments"
                />
                <Area
                  type="monotone"
                  dataKey="consultations"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorConsultations)"
                  name="Consultations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Right Sidebar (1/3) */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-full">
          <h3 className="font-bold text-gray-800 mb-1">Upcoming appointments</h3>
          <p className="text-xs text-blue-500 font-medium mb-6">September - October</p>

          {/* Mini Calendar Strip */}
          <div className="flex justify-between mb-8 overflow-x-auto pb-2 no-scrollbar">
            {[
              { d: 26, day: 'MON' },
              { d: 27, day: 'TUE', active: true },
              { d: 28, day: 'WED' },
              { d: 29, day: 'THU' },
              { d: 30, day: 'FRI' },
              { d: 1, day: 'SAT' },
              { d: 2, day: 'SUN' },
            ].map((item, i) => (
              <div key={i} className={`flex flex-col items-center min-w-[3rem] gap-1 ${item.active ? 'opacity-100' : 'opacity-40'}`}>
                <span className="text-lg font-bold text-gray-800">{item.d}</span>
                <span className="text-[10px] font-bold text-gray-500">{item.day}</span>
                {item.active && <div className="w-1 h-1 bg-green-500 rounded-full mt-1"></div>}
              </div>
            ))}
          </div>

          {/* Appointments List */}
          <div className="space-y-6 relative">
            {/* Vertical Dotted Line */}
            <div className="absolute left-[3.5rem] top-0 bottom-0 border-l-2 border-dotted border-gray-200"></div>

            {upcomingAppointments.length > 0 ? upcomingAppointments.map((apt, i) => (
              <div key={apt._id} className="relative flex gap-4 group">
                <div className="w-14 text-right pt-1">
                  <span className="text-xs font-bold text-gray-500">
                    {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="w-3 h-3 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-full absolute left-[3.2rem] top-2 z-10"></div>
                <div className="flex-1 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm group-hover:shadow-md transition cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                        {/* Avatar */}
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-xs">
                          {(apt as any).patientId?.name?.[0] || 'P'}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">{(apt as any).patientId?.name || 'Patient'}</h4>
                        <p className="text-[10px] text-gray-500">{apt.reason || 'Consultation'}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-blue-600">📞</button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 text-sm">No upcoming appointments</div>
            )}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/dashboard/doctor/appointments')}
              className="text-blue-500 text-sm font-bold hover:underline"
            >
              View all appointments ↓
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
