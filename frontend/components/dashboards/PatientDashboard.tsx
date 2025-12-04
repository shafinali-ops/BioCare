'use client'

import { useEffect, useState } from 'react'
import { patientService } from '@/services/patientService'
import { vitalService } from '@/services/vitalService'
import { Appointment, Prescription } from '@/types'
import { toast } from 'react-toastify'
import { useTheme, themes } from '@/contexts/ThemeContext'
import MedicalIssueCard from '@/components/medical/MedicalIssueCard'
import DiseaseDetailForm from '@/components/medical/DiseaseDetailForm'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AvailableDoctorsList from '@/components/patient/AvailableDoctorsList'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'

export default function PatientDashboard() {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const router = useRouter()
  const [patient, setPatient] = useState<any | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [healthRecords, setHealthRecords] = useState<any>(null)
  const [vitals, setVitals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const [showDiseaseForm, setShowDiseaseForm] = useState(false)
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalConsultations: 0,
    totalPrescriptions: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      console.log('🔍 Fetching dashboard data...');

      // Fetch each endpoint individually to identify which one fails
      let appointmentsData = [];
      let prescriptionsData = [];
      let profileData = null;
      let healthData = null;
      let statsData = null;
      let vitalsData = [];

      try {
        vitalsData = await vitalService.getMyVitals();
        console.log('✅ Vitals fetched:', vitalsData?.length || 0);
      } catch (err: any) {
        console.error('❌ Failed to fetch vitals:', err.message);
      }

      try {
        appointmentsData = await patientService.getAppointments();
        console.log('✅ Appointments fetched:', appointmentsData?.length || 0);
      } catch (err: any) {
        console.error('❌ Failed to fetch appointments:', err.message);
      }

      try {
        prescriptionsData = await patientService.getPrescriptions();
        console.log('✅ Prescriptions fetched:', prescriptionsData?.length || 0);
      } catch (err: any) {
        console.error('❌ Failed to fetch prescriptions:', err.message);
      }

      try {
        profileData = await patientService.getProfile();
        console.log('✅ Profile fetched:', profileData);
      } catch (err: any) {
        console.error('❌ Failed to fetch profile:', err.message);
      }

      try {
        healthData = await patientService.getMedicalHistory();
        console.log('✅ Health records fetched');
      } catch (err: any) {
        console.error('❌ Failed to fetch health records:', err.message);
      }

      try {
        statsData = await patientService.getDashboardStats();
        console.log('✅ Dashboard stats fetched:', statsData);
      } catch (err: any) {
        console.error('❌ Failed to fetch dashboard stats:', err.message);
      }

      console.log('📊 Dashboard data received:');
      console.log('  Appointments:', appointmentsData?.length || 0);
      console.log('  Prescriptions:', prescriptionsData?.length || 0);
      console.log('  Profile:', profileData);
      console.log('  Stats Data:', statsData);

      setAppointments(appointmentsData)
      setPrescriptions(prescriptionsData)
      setPatient(profileData)
      setHealthRecords(healthData)
      setVitals(vitalsData)

      if (statsData) {
        console.log('  Stats from API:', statsData.stats);
        setStats(statsData.stats)
        // Merge profile data if needed, or prefer the one from getProfile
        if (statsData.profile) {
          setPatient((prev: any) => ({ ...prev, ...statsData.profile }))
        }
      } else {
        console.warn('⚠️ No stats data received!');
      }

      console.log('✅ State updated successfully');
    } catch (error: any) {
      console.error('❌ Error fetching data:', error);
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleIssueClick = (issueType: string) => {
    setSelectedIssue(issueType)
    setShowDiseaseForm(true)
  }

  const handleDiseaseSubmit = async (data: any) => {
    setShowDiseaseForm(false)

    // First, send to chatbot for initial assessment
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const chatbotResponse = await fetch(`${apiUrl}/chatbot/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          query: `Patient has ${data.issueType} issue. Symptoms: ${data.symptoms}. Duration: ${data.duration}. Severity: ${data.severity}. Additional info: ${data.additionalInfo}`,
        }),
      })

      const chatbotData = await chatbotResponse.json()

      // Check if it's an emergency
      if (data.severity === 'critical' || data.severity === 'severe') {
        toast.warning('This appears to be an emergency. Redirecting to doctor consultation...')
        // Redirect to doctor consultation or video call
        setTimeout(() => {
          router.push('/dashboard/patient/consultation?emergency=true')
        }, 2000)
      } else {
        // Show chatbot response and pharmacy suggestions
        toast.success('Chatbot has analyzed your symptoms. Check recommendations below.')
        router.push(`/dashboard/patient/chatbot?issue=${encodeURIComponent(JSON.stringify(data))}`)
      }
    } catch (error) {
      toast.error('Failed to process your request')
    }
  }

  const medicalIssues = [
    {
      title: 'Fever & Flu',
      icon: '🌡️',
      description: 'High temperature, body aches, chills',
      urgency: 'medium' as const,
      type: 'Fever',
    },
    {
      title: 'Accident & Injury',
      icon: '🚑',
      description: 'Falls, cuts, fractures, trauma',
      urgency: 'high' as const,
      type: 'Accident',
    },
    {
      title: 'Heart Issues',
      icon: '❤️',
      description: 'Chest pain, palpitations, shortness of breath',
      urgency: 'high' as const,
      type: 'Heart',
    },
    {
      title: 'Eye Problems',
      icon: '👁️',
      description: 'Vision issues, eye pain, redness',
      urgency: 'medium' as const,
      type: 'Eye',
    },
    {
      title: 'Digestive Issues',
      icon: '🤢',
      description: 'Stomach pain, nausea, diarrhea',
      urgency: 'medium' as const,
      type: 'Digestive',
    },
    {
      title: 'Skin Problems',
      icon: '🧴',
      description: 'Rashes, allergies, infections',
      urgency: 'low' as const,
      type: 'Skin',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  console.log('🎨 Rendering dashboard with stats:', stats);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-slate-800">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Main Column */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Quick Actions Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/patient/appointments">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800/20 rounded-xl flex items-center justify-center text-2xl">
                    📅
                  </div>
                  <span className="text-2xl font-bold">{stats.totalAppointments}</span>
                </div>
                <h3 className="text-lg font-bold mb-1">Appointments</h3>
                <p className="text-sm opacity-90">Book and manage appointments</p>
              </div>
            </Link>

            <Link href="/dashboard/patient/consultations">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800/20 rounded-xl flex items-center justify-center text-2xl">
                    🩺
                  </div>
                  <span className="text-2xl font-bold">{stats.totalConsultations}</span>
                </div>
                <h3 className="text-lg font-bold mb-1">Consultations</h3>
                <p className="text-sm opacity-90">Connect with doctors</p>
              </div>
            </Link>

            <Link href="/dashboard/patient/prescriptions">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800/20 rounded-xl flex items-center justify-center text-2xl">
                    💊
                  </div>
                  <span className="text-2xl font-bold">{stats.totalPrescriptions}</span>
                </div>
                <h3 className="text-lg font-bold mb-1">Prescriptions</h3>
                <p className="text-sm opacity-90">View medicine reminders</p>
              </div>
            </Link>
          </div>

          {/* Top Row: Performance & Analytics */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Health Risk Score Card */}
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Health Risk<br />Score</h3>
                {vitals.length > 0 && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${vitals[0].alertLevel === 'critical' ? 'bg-red-100 text-red-800' :
                    vitals[0].alertLevel === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                    <span className="text-xs font-bold uppercase">{vitals[0].alertLevel}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center mb-6 relative">
                {/* Score Circle */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-gray-100 dark:text-gray-700"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={440}
                      strokeDashoffset={
                        vitals.length > 0
                          ? 440 - (440 * (vitals[0].alertLevel === 'critical' ? 90 : vitals[0].alertLevel === 'warning' ? 50 : 15)) / 100
                          : 440
                      }
                      className={`${vitals.length > 0
                        ? vitals[0].alertLevel === 'critical' ? 'text-red-500' :
                          vitals[0].alertLevel === 'warning' ? 'text-yellow-500' :
                            'text-green-500'
                        : 'text-gray-300'
                        } transition-all duration-1000 ease-out`}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-xs text-gray-500">Risk Level</p>
                    <h2 className={`text-3xl font-bold ${vitals.length > 0
                      ? vitals[0].alertLevel === 'critical' ? 'text-red-600' :
                        vitals[0].alertLevel === 'warning' ? 'text-yellow-600' :
                          'text-green-600'
                      : 'text-gray-400'
                      }`}>
                      {vitals.length > 0
                        ? (vitals[0].alertLevel === 'critical' ? 'High' : vitals[0].alertLevel === 'warning' ? 'Med' : 'Low')
                        : 'N/A'}
                    </h2>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600 mb-6">
                {vitals.length > 0
                  ? vitals[0].alertLevel === 'normal'
                    ? 'Your health metrics are looking good! Keep it up.'
                    : 'Some health metrics require attention. Check details.'
                  : 'No health metrics recorded yet.'}
              </p>

              <Link href="/dashboard/patient/health-records">
                <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">
                  Track Health Metrics
                </button>
              </Link>
            </div>

            {/* Weekly Activity Card */}
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Activity</h3>
                <select className="bg-gray-50 dark:bg-gray-900 border-none text-xs font-semibold rounded-lg px-3 py-1.5 outline-none cursor-pointer">
                  <option>Last 7 Days</option>
                  <option>Last Month</option>
                </select>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Mon', appointments: 1, consultations: 2, prescriptions: 1 },
                    { name: 'Tue', appointments: 0, consultations: 1, prescriptions: 2 },
                    { name: 'Wed', appointments: 2, consultations: 3, prescriptions: 1 },
                    { name: 'Thu', appointments: 1, consultations: 1, prescriptions: 3 },
                    { name: 'Fri', appointments: 3, consultations: 2, prescriptions: 2 },
                    { name: 'Sat', appointments: 1, consultations: 1, prescriptions: 1 },
                    { name: 'Sun', appointments: 0, consultations: 0, prescriptions: 0 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      cursor={{ fill: '#F3F4F6' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar dataKey="appointments" name="Apts" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={8} />
                    <Bar dataKey="consultations" name="Cons" fill="#10B981" radius={[4, 4, 0, 0]} barSize={8} />
                    <Bar dataKey="prescriptions" name="Rx" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Interaction Distribution Card */}
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Distribution</h3>
                <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-full">
                  <span className="text-xs font-bold text-gray-500">Total: {appointments.length + 8 + prescriptions.length}</span>
                </div>
              </div>
              <div className="h-64 w-full flex flex-col items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Appointments', value: appointments.length || 5, color: '#8B5CF6' },
                        { name: 'Consultations', value: 8, color: '#10B981' },
                        { name: 'Prescriptions', value: prescriptions.length || 6, color: '#F59E0B' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'Appointments', value: appointments.length || 5, color: '#8B5CF6' },
                        { name: 'Consultations', value: 8, color: '#10B981' },
                        { name: 'Prescriptions', value: prescriptions.length || 6, color: '#F59E0B' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Appointment Timeline Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm xl:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Appointment Timeline</h3>
                  <p className="text-xs text-gray-500">Booked appointments with doctors over time</p>
                </div>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> General
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span> Specialist
                  </span>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { time: '09:00', general: 4, specialist: 2 },
                    { time: '10:00', general: 3, specialist: 4 },
                    { time: '11:00', general: 5, specialist: 3 },
                    { time: '12:00', general: 2, specialist: 5 },
                    { time: '13:00', general: 1, specialist: 2 },
                    { time: '14:00', general: 4, specialist: 3 },
                    { time: '15:00', general: 6, specialist: 4 },
                    { time: '16:00', general: 3, specialist: 5 },
                  ]}>
                    <defs>
                      <linearGradient id="colorGeneral" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSpecialist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Area type="monotone" dataKey="general" stroke="#3B82F6" fillOpacity={1} fill="url(#colorGeneral)" strokeWidth={2} />
                    <Area type="monotone" dataKey="specialist" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorSpecialist)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row: Lab Reports */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm flex-1">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                <button className="px-4 py-2 bg-black text-white rounded-full text-xs font-medium whitespace-nowrap">Lab Reports</button>
                <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-50 dark:bg-gray-900">Prescription</button>
                <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-50 dark:bg-gray-900">Medication</button>
                <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-50 dark:bg-gray-900">Diagnosis</button>
                <button className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-50 dark:bg-gray-900">5+</button>
              </div>
              <div className="flex items-center gap-2">
                <select className="bg-gray-50 dark:bg-gray-900 border-none text-xs font-semibold rounded-lg px-3 py-1.5 outline-none cursor-pointer">
                  <option>Recent</option>
                  <option>All Time</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100 dark:border-gray-700">
                    <th className="pb-4 font-medium pl-2">Test Name <span className="text-[10px]">↕</span></th>
                    <th className="pb-4 font-medium">Referred by <span className="text-[10px]">↕</span></th>
                    <th className="pb-4 font-medium">Date <span className="text-[10px]">↕</span></th>
                    <th className="pb-4 font-medium">Comments</th>
                    <th className="pb-4 font-medium pr-2 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {healthRecords?.reports && healthRecords.reports.length > 0 ? (
                    healthRecords.reports.map((report: any, i: number) => (
                      <tr key={i} className="group hover:bg-gray-50 dark:bg-gray-900 transition-colors">
                        <td className="py-4 pl-2 font-medium text-gray-700">{report.title}</td>
                        <td className="py-4 text-gray-500">Dr. {report.doctorName || 'Unknown'}</td>
                        <td className="py-4 text-gray-500">{new Date(report.date).toLocaleDateString()}</td>
                        <td className="py-4 text-gray-500">{report.comments || 'No comments'}</td>
                        <td className="py-4 pr-2 text-right">
                          <span className="bg-blue-500 text-white text-[10px] px-3 py-1 rounded-full font-medium">View</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500">No lab reports found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="w-full lg:w-80 flex flex-col gap-6">

          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm">
            <div className="flex gap-2 mb-6 justify-center">
              <button className="px-4 py-1.5 bg-black text-white rounded-full text-xs font-medium">Profile</button>
              <button className="px-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-50 dark:bg-gray-900">History</button>
              <button className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-50 dark:bg-gray-900">3+</button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-200 to-purple-300 mb-4 overflow-hidden p-1">
                <div className="w-full h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden relative">
                  {/* Placeholder Image */}
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl">
                    {patient?.name?.[0] || '👤'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{patient?.name || 'Patient Name'}</h3>
              </div>
              <p className="text-xs text-gray-500">{patient?.age || '25'}yrs old · {patient?.gender || 'Male'}</p>
              {patient?.email && <p className="text-xs text-gray-400 mt-1">{patient.email}</p>}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Last Appointment</p>
                <p className="text-xs font-medium text-gray-700">
                  {appointments.length > 0
                    ? new Date(appointments[0].date).toLocaleDateString()
                    : 'No appointments'}
                </p>
              </div>
            </div>
          </div>

          {/* Available Doctors Widget */}
          <AvailableDoctorsList />

          {/* Appointments Widget */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Appointments</h3>
              <div className="flex gap-1">
                <button className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 text-xs hover:bg-gray-100">‹</button>
                <button className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 text-xs hover:bg-gray-100">›</button>
              </div>
            </div>

            {/* Calendar Strip */}
            <div className="flex justify-between mb-6">
              {[
                { day: '19', name: 'Mon', active: false },
                { day: '20', name: 'Mon', active: false },
                { day: '21', name: 'Sun', active: true },
                { day: '22', name: 'Mon', active: false },
              ].map((date, i) => (
                <div key={i} className={`flex flex-col items-center gap-1 p-2 rounded-xl min-w-[3rem] ${date.active ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-400 hover:bg-gray-50'}`}>
                  <span className="text-sm font-bold">{date.day}</span>
                  <span className="text-[10px]">{date.name}</span>
                  {date.active && <div className="w-1 h-1 bg-white rounded-full mt-1"></div>}
                </div>
              ))}
            </div>

            {/* Appointment List */}
            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.slice(0, 3).map((apt, i) => (
                  <div key={i} className="flex gap-3 items-start group">
                    <div className={`w-1 h-10 rounded-full ${i % 2 === 0 ? 'bg-purple-600' : 'bg-green-500'}`}></div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900">Dr. {(apt as any).doctorId?.name || 'Doctor'}</h4>
                      <p className="text-xs text-gray-500">{(apt as any).doctorId?.specialization || 'Specialist'}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-400">{new Date(apt.date).getHours()}:00</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No upcoming appointments</p>
                  <Link href="/dashboard/patient/appointments" className="text-xs text-purple-600 font-bold mt-2 inline-block">
                    Book Now
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
