// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { authService } from '@/services/authService'
// import { User } from '@/types'
// import Link from 'next/link'
// import { useTheme, themes } from '@/contexts/ThemeContext'
// import ThemeSelector from '@/components/theme/ThemeSelector'

// interface DashboardLayoutProps {
//   children: React.ReactNode
//   role: 'admin' | 'doctor' | 'patient'
// }

// export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
//   const router = useRouter()
//   const { theme } = useTheme()
//   const themeColors = themes[theme]
//   const [user, setUser] = useState<User | null>(null)
//   const [notifications, setNotifications] = useState<any[]>([])

//   useEffect(() => {
//     const currentUser = authService.getCurrentUser()
//     if (!currentUser) {
//       router.push('/auth/login')
//       return
//     }
//     if (currentUser.role !== role) {
//       router.push(`/dashboard/${currentUser.role}`)
//       return
//     }
//     setUser(currentUser)
//   }, [role, router])

//   useEffect(() => {
//     if (!user) return

//     // Fetch notifications
//     const fetchNotifications = async () => {
//       try {
//         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/notifications`, {
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//           },
//         })
//         if (response.ok) {
//           const data = await response.json()
//           setNotifications(data.filter((n: any) => !n.read))
//         }
//       } catch (error) {
//         console.error('Failed to fetch notifications')
//       }
//     }
//     fetchNotifications()

//     // Poll for new notifications every 30 seconds
//     const interval = setInterval(fetchNotifications, 30000)
//     return () => clearInterval(interval)
//   }, [user])

//   const handleLogout = () => {
//     authService.logout()
//     router.push('/')
//   }

//   const navigation = {
//     admin: [
//       { name: 'Dashboard', href: '/dashboard/admin' },
//       { name: 'Users', href: '/dashboard/admin/users' },
//       { name: 'Pharmacy', href: '/dashboard/admin/pharmacy' },
//       { name: 'Hospitals', href: '/dashboard/admin/hospitals' },
//       { name: 'Reports', href: '/dashboard/admin/reports' },
//     ],
//     doctor: [
//       { name: 'Dashboard', href: '/dashboard/doctor' },
//       { name: 'Patients', href: '/dashboard/doctor/patients' },
//       { name: 'Consultations', href: '/dashboard/doctor/consultations' },
//       { name: 'Appointments', href: '/dashboard/doctor/appointments' },
//       { name: 'Availability', href: '/dashboard/doctor/availability' },
//     ],
//     patient: [
//       { name: 'Dashboard', href: '/dashboard/patient' },
//       { name: 'Pharmacy', href: '/dashboard/patient/pharmacy' },
//       { name: 'Appointments', href: '/dashboard/patient/appointments' },
//       { name: 'Health Records', href: '/dashboard/patient/health-records' },
//       { name: 'Prescriptions', href: '/dashboard/patient/prescriptions' },
//       { name: 'Symptom Checker', href: '/dashboard/patient/symptom-checker' },
//       { name: 'Chatbot', href: '/dashboard/patient/chatbot' },
//     ],
//   }

//   if (!user) {
//     return <div className="min-h-screen flex items-center justify-center">Loading...</div>
//   }

//   return (
//     <div className={`min-h-screen ${themeColors.background}`}>
//       <nav className={`${themeColors.card} shadow-xl border-b-2 ${themeColors.border} sticky top-0 z-50 backdrop-blur-sm bg-white dark:bg-slate-900/95`}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-20">
//             <div className="flex items-center">
//               <div className="flex-shrink-0 flex items-center gap-3">
//                 <div className={`w-12 h-12 bg-gradient-to-br ${themeColors.primary} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
//                   🏥
//                 </div>
//                 <h1 className={`text-2xl font-bold bg-gradient-to-r ${themeColors.primary} bg-clip-text text-transparent`}>
//                   Healthcare
//                 </h1>
//               </div>
//               <div className="hidden sm:ml-8 sm:flex sm:space-x-2">
//                 {navigation[role].map((item) => (
//                   <Link
//                     key={item.name}
//                     href={item.href}
//                     className={`${themeColors.text} hover:bg-gray-100 rounded-lg px-4 py-2 text-sm font-semibold transition-all`}
//                   >
//                     {item.name}
//                   </Link>
//                 ))}
//               </div>
//             </div>
//             <div className="flex items-center gap-4">
//               <ThemeSelector />
//               <Link
//                 href={`/dashboard/${role}/notifications`}
//                 className="relative"
//               >
//                 <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-red-600 transition shadow-lg">
//                   🔔
//                   {notifications.length > 0 && (
//                     <span className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full text-xs flex items-center justify-center text-black font-bold shadow-lg">
//                       {notifications.length}
//                     </span>
//                   )}
//                 </div>
//               </Link>
//               <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-xl">
//                 <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                   {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
//                 </div>
//                 <span className={`${themeColors.text} font-semibold hidden md:block`}>{user.name || user.email}</span>
//               </div>
//               <button
//                 onClick={handleLogout}
//                 className="bg-red-500 text-white px-5 py-2.5 rounded-xl hover:bg-red-600 transition shadow-lg font-semibold"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>
//       <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//         {children}
//       </main>
//     </div>
//   )
// }
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authService } from '@/services/authService'
import { User } from '@/types'
import Link from 'next/link'
import { useTheme, themes } from '@/contexts/ThemeContext'
import ThemeSelector from '@/components/theme/ThemeSelector'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'admin' | 'doctor' | 'patient' | 'lhw' | 'pharmacist'
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const [user, setUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    if (currentUser.role !== role) {
      router.push(`/dashboard/${currentUser.role}`)
      return
    }
    setUser(currentUser)
  }, [role, router])

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/notifications`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.filter((n: any) => !n.read))
        }
      } catch (error) {
        console.error('Failed to fetch notifications')
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  const handleLogout = () => {
    authService.logout()
    router.push('/')
  }

  const navigation = {
    admin: [
      { name: 'Dashboard', href: '/dashboard/admin', icon: '📊' },
      { name: 'Patients', href: '/dashboard/admin/users', icon: '👥' },
      { name: 'Doctors', href: '/dashboard/admin/doctors', icon: '👨‍⚕️' },
      { name: 'Pharmacy', href: '/dashboard/admin/pharmacy', icon: '💊' },
      { name: 'Hospitals', href: '/dashboard/admin/hospitals', icon: '🏥' },
    ],
    doctor: [
      { name: 'Dashboard', href: '/dashboard/doctor', icon: '📊' },
      { name: 'Appointments', href: '/dashboard/doctor/appointments', icon: '📅' },
      { name: 'Patients', href: '/dashboard/doctor/patients', icon: '👥' },
      { name: 'Messages', href: '/dashboard/doctor/chat', icon: '💬' },
      { name: 'Consultations', href: '/dashboard/doctor/consultations', icon: '🩺' },
      { name: 'Prescriptions', href: '/dashboard/doctor/prescriptions/create', icon: '💊' },
      { name: 'Availability', href: '/dashboard/doctor/availability', icon: '🕒' },
      { name: 'Video Call', href: '/dashboard/doctor/video-call', icon: '📞' },
    ],
    patient: [
      { name: 'Dashboard', href: '/dashboard/patient', icon: '📊' },
      { name: 'Appointments', href: '/dashboard/patient/appointments', icon: '📅' },
      { name: 'Messages', href: '/dashboard/patient/messages', icon: '💬' },
      { name: 'Video Call', href: '/dashboard/patient/video-call', icon: '📞' },
      { name: 'Consultations', href: '/dashboard/patient/consultations', icon: '🩺' },
      { name: 'Prescriptions', href: '/dashboard/patient/prescriptions', icon: '📝' },
      { name: 'Health Records', href: '/dashboard/patient/health-records', icon: '📋' },
      { name: 'Pharmacy', href: '/dashboard/patient/pharmacy', icon: '💊' },
      { name: 'Symptom Checker', href: '/dashboard/patient/symptom-checker', icon: '🌡️' },
      { name: 'Chatbot', href: '/dashboard/patient/chatbot', icon: '🤖' },
    ],
    lhw: [
      { name: 'Dashboard', href: '/dashboard/lhw', icon: '📊' },
      { name: 'Register Patient', href: '/dashboard/lhw/register-patient', icon: '➕' },
      { name: 'View Patients', href: '/dashboard/lhw/patients', icon: '👥' },
      { name: 'Start Consultation', href: '/dashboard/lhw/start-consultation', icon: '🩺' },
    ],
    pharmacist: [
      { name: 'Dashboard', href: '/dashboard/pharmacist', icon: '📊' },
      { name: 'Medicines', href: '/dashboard/pharmacist/medicines', icon: '💊' },
      { name: 'Prescriptions', href: '/dashboard/pharmacist/prescriptions', icon: '📝' },
      { name: 'Add Medicine', href: '/dashboard/pharmacist/add-medicine', icon: '➕' },
    ],
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className={`min-h-screen ${themeColors.background}`}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="flex h-full flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 bg-gradient-to-br ${themeColors.primary} rounded-2xl flex items-center justify-center text-xl shadow-lg`}
              >
                🏥
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">BioCare</span>
                <span className="text-[11px] text-slate-400 capitalize">
                  {role} dashboard
                </span>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation[role].map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${active
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom user / logout */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {user.name || user.email}
                </span>
                <span className="text-[11px] text-slate-400 capitalize">{role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-red-500 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <header
            className={`bg-primary-500 text-white h-20 flex items-center justify-between px-4 md:px-8 border-b border-primary-600 shadow-sm`}
          >
            {/* Mobile logo & menu placeholder */}
            <div className="flex items-center gap-3 md:hidden">
              <div
                className={`w-9 h-9 bg-gradient-to-br ${themeColors.primary} rounded-2xl flex items-center justify-center text-lg`}
              >
                🏥
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{role}</span>
            </div>

            <div className="hidden md:block text-sm font-semibold text-white/90">
              {role === 'admin' ? 'Admin Panel' : 'Dashboard'}
            </div>

            <div className="flex items-center gap-4">
              <ThemeSelector />
              <Link
                href={`/dashboard/${role}/notifications`}
                className="relative"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer hover:bg-white/30 transition shadow-md">
                  🔔
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-400 rounded-full text-[10px] flex items-center justify-center text-black font-bold shadow">
                      {notifications.length}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 bg-[#f3f4f6] dark:bg-slate-950 px-4 md:px-8 py-6 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800/70">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
