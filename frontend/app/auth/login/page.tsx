// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { authService } from '@/services/authService'
// import { toast } from 'react-toastify'
// import Link from 'next/link'
// import { useTheme, themes } from '@/contexts/ThemeContext'

// export default function LoginPage() {
//   const router = useRouter()
//   const { theme } = useTheme()
//   const themeColors = themes[theme]
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   })
//   const [loading, setLoading] = useState(false)

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const response = await authService.login(formData.email, formData.password)
//       toast.success('Login successful!')

//       const user = response.user
//       if (user.role === 'admin') {
//         router.push('/dashboard/admin')
//       } else if (user.role === 'doctor') {
//         router.push('/dashboard/doctor')
//       } else if (user.role === 'patient') {
//         router.push('/dashboard/patient')
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Login failed')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${themeColors.gradient} py-12 px-4`}>
//       <div className="w-full max-w-md">
//         {/* Logo/Header */}
//         <div className="text-center mb-8">
//           <div className="inline-block mb-4">
//             <div className={`w-20 h-20 bg-gradient-to-br ${themeColors.primary} rounded-2xl flex items-center justify-center text-4xl shadow-xl`}>
//               🏥
//             </div>
//           </div>
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
//           <p className="text-gray-600">Sign in to access your healthcare dashboard</p>
//         </div>

//         {/* Form Card */}
//         <div className={`${themeColors.card} rounded-2xl shadow-2xl p-8 border-2 ${themeColors.border}`}>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 required
//                 value={formData.email}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
//                 placeholder="Enter your email"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 required
//                 value={formData.password}
//                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
//                 placeholder="Enter your password"
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className={`w-full ${themeColors.button} text-white py-3 px-4 rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg`}
//             >
//               {loading ? 'Signing in...' : 'Sign In'}
//             </button>
//           </form>

//           <div className="mt-6 text-center space-y-3">
//             <p className="text-sm text-gray-600">
//               Don't have an account?{' '}
//               <Link href="/auth/register" className={`font-semibold ${themeColors.button.replace('bg-', 'text-').replace('-600', '-600')} hover:underline`}>
//                 Create Account
//               </Link>
//             </p>
//             <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 hover:underline block">
//               ← Back to home
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { useGsapAnimations, useGsapOnMount } from '@/hooks/useGsapAnimations'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  // Refs for animations
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const quoteRef = useRef<HTMLParagraphElement>(null)
  const formContainerRef = useRef<HTMLFormElement>(null)
  const leftPanelRef = useRef<HTMLDivElement>(null)

  const {
    animateTextReveal,
    animateWordReveal,
    animateFadeIn,
    animateStagger,
  } = useGsapAnimations()

  // Run animations on mount
  useGsapOnMount(() => {
    // Left panel animations
    if (leftPanelRef.current) {
      animateFadeIn(leftPanelRef.current, { duration: 0.8, x: -50 })
    }

    if (quoteRef.current) {
      animateWordReveal(quoteRef.current, { stagger: 0.04, delay: 0.6 })
    }

    // Right panel animations
    if (titleRef.current) {
      animateTextReveal(titleRef.current, { stagger: 0.02, delay: 0.3 })
    }

    if (subtitleRef.current) {
      animateFadeIn(subtitleRef.current, { duration: 0.6, y: 20, delay: 0.8 })
    }

    if (formContainerRef.current) {
      const inputs = formContainerRef.current.querySelectorAll('input, button')
      animateStagger(inputs, { stagger: 0.1, delay: 1, y: 20 })
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authService.login(formData.email, formData.password)
      toast.success('Login successful!')

      const user = response.user
      if (user.role === 'admin') {
        router.push('/dashboard/admin')
      } else if (user.role === 'doctor') {
        router.push('/dashboard/doctor')
      } else if (user.role === 'patient') {
        router.push('/dashboard/patient')
      } else if (user.role === 'lhw') {
        router.push('/dashboard/lhw')
      } else if (user.role === 'pharmacist') {
        router.push('/dashboard/pharmacist')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left image / quote side */}
        <div ref={leftPanelRef} className="md:w-1/2 bg-primary-500 text-white relative flex items-center justify-center p-8 md:p-10">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-black/10 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-6 max-w-xs">
            <div className="w-24 h-24 rounded-3xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center text-4xl">
              🧑‍⚕️
            </div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Healthcare first</p>
            <p ref={quoteRef} className="text-2xl md:text-3xl font-semibold leading-snug">
              Putting people first in every healthcare moment.
            </p>
          </div>
        </div>

        {/* Right form side */}
        <div className="md:w-1/2 px-8 md:px-10 py-8 flex flex-col justify-center">
          <div className="mb-8">
            <h1 ref={titleRef} className="text-3xl md:text-4xl font-semibold text-slate-900 mb-2">
              Welcome back!
            </h1>
            <p ref={subtitleRef} className="text-sm md:text-base text-slate-500">
              Enter your email and password to sign in.
            </p>
          </div>

          <form ref={formContainerRef} onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 text-sm"
                placeholder="Enter email"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 text-sm"
                placeholder="Enter password"
              />
            </div>

            <div className="flex items-center justify-between text-xs md:text-sm text-slate-500">
              <span />
              <button
                type="button"
                className="font-semibold text-slate-700 hover:text-slate-900"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full py-3.5 text-sm md:text-base font-semibold text-white bg-primary-500 hover:bg-primary-600 shadow-lg hover:shadow-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>

            {/* OR divider */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              <span>OR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Social buttons (non-functional placeholders) */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-2.5 text-xs md:text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <span className="text-lg">G</span>
                <span>Google</span>
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-2.5 text-xs md:text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <span className="text-lg">f</span>
                <span>Facebook</span>
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs md:text-sm text-slate-500">
            <span>Don&apos;t have an account? </span>
            <Link href="/auth/register" className="font-semibold text-primary-500 hover:underline">
              Register now
            </Link>
          </div>

          <div className="mt-2 text-center">
            <Link href="/" className="text-xs md:text-sm text-slate-400 hover:text-slate-600">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}