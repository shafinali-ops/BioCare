// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { authService } from '@/services/authService'
// import { toast } from 'react-toastify'
// import Link from 'next/link'
// import { useTheme, themes } from '@/contexts/ThemeContext'

// export default function RegisterPage() {
//   const router = useRouter()
//   const { theme } = useTheme()
//   const themeColors = themes[theme]
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     role: 'patient' as 'admin' | 'doctor' | 'patient',
//     age: '',
//     gender: 'other' as 'male' | 'female' | 'other',
//     specialization: '',
//   })
//   const [loading, setLoading] = useState(false)

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const registerData: any = {
//         email: formData.email,
//         password: formData.password,
//         role: formData.role,
//         name: formData.name,
//       }

//       if (formData.role === 'patient') {
//         registerData.age = parseInt(formData.age)
//         registerData.gender = formData.gender
//       } else if (formData.role === 'doctor') {
//         registerData.specialization = formData.specialization
//       }

//       await authService.register(registerData.email, registerData.password, registerData.role, registerData.name, registerData)
//       toast.success('Registration successful! Please login.')
//       router.push('/auth/login')
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Registration failed')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${themeColors.gradient} py-12 px-4`}>
//       <div className="w-full max-w-2xl">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="inline-block mb-4">
//             <div className={`w-20 h-20 bg-gradient-to-br ${themeColors.primary} rounded-2xl flex items-center justify-center text-4xl shadow-xl`}>
//               🏥
//             </div>
//           </div>
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Your Account</h1>
//           <p className="text-gray-600">Join our healthcare platform today</p>
//         </div>

//         {/* Form Card */}
//         <div className={`${themeColors.card} rounded-2xl shadow-2xl p-8 border-2 ${themeColors.border}`}>
//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div className="grid md:grid-cols-2 gap-5">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
//                   placeholder="Enter your name"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   required
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
//                   placeholder="Enter your email"
//                 />
//               </div>
//             </div>

//             <div className="grid md:grid-cols-2 gap-5">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   required
//                   value={formData.password}
//                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
//                   placeholder="Create a password"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Role
//                 </label>
//                 <select
//                   value={formData.role}
//                   onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
//                 >
//                   <option value="patient">Patient</option>
//                   <option value="doctor">Doctor</option>
//                   <option value="admin">Admin</option>
//                 </select>
//               </div>
//             </div>

//             {formData.role === 'patient' && (
//               <div className="grid md:grid-cols-2 gap-5">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Age
//                   </label>
//                   <input
//                     type="number"
//                     required
//                     min="1"
//                     max="120"
//                     value={formData.age}
//                     onChange={(e) => setFormData({ ...formData, age: e.target.value })}
//                     className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
//                     placeholder="Enter your age"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Gender
//                   </label>
//                   <select
//                     value={formData.gender}
//                     onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
//                     className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
//                   >
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="other">Other</option>
//                   </select>
//                 </div>
//               </div>
//             )}

//             {formData.role === 'doctor' && (
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Specialization
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.specialization}
//                   onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
//                   className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
//                   placeholder="e.g., Cardiology, Pediatrics, etc."
//                 />
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className={`w-full ${themeColors.button} text-white py-3 px-4 rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg`}
//             >
//               {loading ? 'Creating Account...' : 'Create Account'}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{' '}
//               <Link href="/auth/login" className={`font-semibold text-blue-600 hover:underline`}>
//                 Sign In
//               </Link>
//             </p>
//             <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 hover:underline block mt-2">
//               ← Back to home
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { useGsapAnimations, useGsapOnMount } from '@/hooks/useGsapAnimations'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient' as 'admin' | 'doctor' | 'patient' | 'lhw' | 'pharmacist',
    age: '',
    gender: 'other' as 'male' | 'female' | 'other',
    specialization: '',
  })
  const [loading, setLoading] = useState(false)

  // Refs for animations
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const quoteRef = useRef<HTMLParagraphElement>(null)
  const formContainerRef = useRef<HTMLFormElement>(null)
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const conditionalFieldsRef = useRef<HTMLDivElement>(null)

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
      const inputs = formContainerRef.current.querySelectorAll('input, select, button')
      animateStagger(inputs, { stagger: 0.08, delay: 1, y: 20 })
    }
  })

  // Animate conditional fields when role changes
  useEffect(() => {
    if (conditionalFieldsRef.current) {
      const fields = conditionalFieldsRef.current.querySelectorAll('input, select')
      animateStagger(fields, { stagger: 0.1, y: 20 })
    }
  }, [formData.role, animateStagger])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const registerData: any = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        name: formData.name,
      }

      if (formData.role === 'patient') {
        registerData.age = parseInt(formData.age)
        registerData.gender = formData.gender
      } else if (formData.role === 'doctor') {
        registerData.specialization = formData.specialization
      }

      await authService.register(
        registerData.email,
        registerData.password,
        registerData.role,
        registerData.name,
        registerData
      )
      toast.success('Registration successful! Please login.')
      router.push('/auth/login')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left side – image/quote */}
        <div ref={leftPanelRef} className="md:w-1/2 bg-primary-500 text-white relative flex items-center justify-center p-8 md:p-10">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-black/10 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-6 max-w-xs">
            <div className="w-24 h-24 rounded-3xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center text-4xl">
              🧑‍⚕️
            </div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Join BioCare</p>
            <p ref={quoteRef} className="text-2xl md:text-3xl font-semibold leading-snug">
              A global network of patients, doctors and hospitals working together.
            </p>
          </div>
        </div>

        {/* Right side – form */}
        <div className="md:w-1/2 px-8 md:px-10 py-8 flex flex-col justify-center">
          <div className="mb-8">
            <h1 ref={titleRef} className="text-3xl md:text-4xl font-semibold text-slate-900 mb-2">
              Create your account
            </h1>
            <p ref={subtitleRef} className="text-sm md:text-base text-slate-500">
              Join our healthcare platform in just a few steps.
            </p>
          </div>

          <form ref={formContainerRef} onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 text-sm"
                  placeholder="Enter your name"
                />
              </div>
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
            </div>

            <div className="grid md:grid-cols-2 gap-4">
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
                  placeholder="Create a password"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 text-sm"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="lhw">Local Healthcare Worker</option>
                  <option value="pharmacist">Pharmacist</option>
                </select>
              </div>
            </div>

            {formData.role === 'patient' && (
              <div ref={conditionalFieldsRef} className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 text-sm"
                    placeholder="Age"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {formData.role === 'doctor' && (
              <div ref={conditionalFieldsRef} className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Specialization
                </label>
                <input
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-4 py-3 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-slate-900 text-sm"
                  placeholder="e.g., Cardiology, Pediatrics"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full py-3.5 text-sm md:text-base font-semibold text-white bg-primary-500 hover:bg-primary-600 shadow-lg hover:shadow-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs md:text-sm text-slate-500">
            <span>Already have an account? </span>
            <Link href="/auth/login" className="font-semibold text-primary-500 hover:underline">
              Sign in
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