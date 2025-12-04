'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { useGsapAnimations, useGsapOnMount } from '@/hooks/useGsapAnimations'
import { FloatingElements } from '@/components/FloatingElements'
import { GlassCard } from '@/components/GlassCard'
import { AnimatedGradient } from '@/components/AnimatedGradient'
import ThemeSelector from '@/components/theme/ThemeSelector'

export default function Home() {
  const [email, setEmail] = useState('')

  // Refs for animation targets
  const heroHeadingRef = useRef<HTMLHeadingElement>(null)
  const heroSubtextRef = useRef<HTMLParagraphElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const statCardsRef = useRef<HTMLDivElement>(null)
  const statsNumbersRef = useRef<HTMLDivElement>(null)

  // Section Refs
  const aboutSectionRef = useRef<HTMLElement>(null)
  const teamSectionRef = useRef<HTMLElement>(null)
  const newsletterRef = useRef<HTMLDivElement>(null)
  const heroVisualRef = useRef<HTMLDivElement>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)

  // Specific Element Refs for Advanced Animations
  const aboutTextContainerRef = useRef<HTMLDivElement>(null)
  const aboutImageRef = useRef<HTMLDivElement>(null)
  const teamImageRef = useRef<HTMLDivElement>(null)
  const teamTextContainerRef = useRef<HTMLDivElement>(null)
  const aboutTitleRef = useRef<HTMLHeadingElement>(null)
  const teamTitleRef = useRef<HTMLHeadingElement>(null)

  const {
    animateLetterReveal,
    animateWordRevealOnScroll,
    animateFadeIn,
    animateOnScroll,
    animateStagger,
    animatePin,
    animateScrub,
    animateScale,
  } = useGsapAnimations()

  // Run animations on mount
  useGsapOnMount(() => {
    // 1. Hero Animations
    if (badgeRef.current) {
      animateFadeIn(badgeRef.current, { duration: 0.6, y: 20, delay: 0.2 })
    }

    // Advanced Letter Reveal for Hero Heading
    if (heroHeadingRef.current) {
      animateLetterReveal(heroHeadingRef.current, {
        stagger: 0.03,
        delay: 0.4,
        duration: 0.8
      })
    }

    if (heroSubtextRef.current) {
      animateFadeIn(heroSubtextRef.current, { duration: 0.8, y: 30, delay: 1.0 })
    }

    // Stagger Stat Cards
    if (statCardsRef.current) {
      const cards = statCardsRef.current.querySelectorAll('.stat-card')
      animateStagger(cards, { stagger: 0.15, delay: 0.6, y: 40 })
    }

    if (heroVisualRef.current) {
      animateFadeIn(heroVisualRef.current, { duration: 1, x: 50, delay: 1.2 })
    }

    if (searchBarRef.current) {
      animateFadeIn(searchBarRef.current, { duration: 0.8, y: 30, delay: 1.4 })
    }

    // 2. Scroll-Triggered Stats
    if (statsNumbersRef.current) {
      const statCards = statsNumbersRef.current.querySelectorAll('.card-3d')
      animateStagger(statCards, {
        stagger: 0.1,
        y: 60,
        duration: 0.8
      })
    }

    // 3. About Section - Sticky Text & Zoom Image
    if (aboutSectionRef.current && aboutTextContainerRef.current && aboutImageRef.current) {
      // Pin the text container while scrolling through the section
      // Note: We use a media query check or just apply it generally if layout permits
      if (window.innerWidth >= 1024) {
        animatePin(aboutTextContainerRef.current, {
          start: 'top center',
          end: '+=400', // Pin for 400px of scroll
          pinSpacing: false // Allow content to flow naturally
        })
      }

      // Zoom in effect on the image linked to scroll (Scrub)
      animateScrub(aboutImageRef.current, {
        from: { scale: 0.9, opacity: 0.8 },
        to: { scale: 1.05, opacity: 1 },
        start: 'top 80%',
        end: 'center center',
        scrub: 1
      })

      // Word reveal for title
      if (aboutTitleRef.current) {
        animateWordRevealOnScroll(aboutTitleRef.current, {
          start: 'top 85%',
          stagger: 0.05
        })
      }
    }

    // 4. Team Section - Reverse Layout Animations
    if (teamSectionRef.current && teamImageRef.current) {
      // Zoom/Parallax for Team Image
      animateScrub(teamImageRef.current, {
        from: { y: 50, scale: 0.95 },
        to: { y: -50, scale: 1.05 },
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
      })

      // Word reveal for team title
      if (teamTitleRef.current) {
        animateWordRevealOnScroll(teamTitleRef.current, {
          start: 'top 85%',
          stagger: 0.05
        })
      }

      // Stagger avatars
      const avatars = teamSectionRef.current.querySelectorAll('.avatar-bubble')
      animateStagger(avatars, {
        stagger: 0.1,
        y: 30,
        duration: 0.5
      })
    }

    // 5. Newsletter Scale Up
    if (newsletterRef.current) {
      animateOnScroll(newsletterRef.current, {
        scale: 1, // Target
        y: 0,
        duration: 0.8,
        start: 'top 85%'
      })
      // Start slightly smaller
      animateScale(newsletterRef.current, { from: 0.9, to: 1, duration: 0.8 })
    }
  })

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for subscribing!')
    setEmail('')
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 relative overflow-hidden selection:bg-teal-500/30">
      {/* 
        Updated Background: 
        Using a very clean, premium slate/white base with subtle gradients 
        instead of the previous heavier gradient.
      */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-primary-50/50 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary-100/50 blur-3xl" />
      </div>

      <FloatingElements variant="orbs" />

      {/* Top nav */}
      <header className="relative z-50 flex items-center justify-between max-w-7xl mx-auto px-6 md:px-10 pt-6 md:pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl shadow-lg shadow-primary-500/20">
            🩺
          </div>
          <span className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            BioCare
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white dark:bg-slate-900/50 backdrop-blur-md border border-white/60 shadow-sm">
          <Link href="/" className="nav-pill" data-active="true">Home</Link>
          <Link href="/#about" className="nav-pill">About</Link>
          <Link href="/#services" className="nav-pill">Services</Link>
          <Link href="/#contact" className="nav-pill">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeSelector />
          <Link href="/auth/login" className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">
            Login
          </Link>
          <Link href="/auth/register" className="primary-btn-gradient shadow-lg shadow-primary-500/20">
            Sign up ↗
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-10 pb-10 pt-12 lg:pt-20">
        <div className="grid lg:grid-cols-[280px,minmax(0,1.4fr),minmax(0,1fr)] gap-8 lg:gap-12 items-start">

          {/* Left Column: Stats (Glass Cards) */}
          <div ref={statCardsRef} className="flex flex-col gap-5 relative z-10 lg:pt-8">
            <GlassCard intensity="medium" hover3D glow className="stat-card p-6 border-l-4 border-l-primary-500">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-bold mb-3">Impact</p>
                <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">20M+</p>
              </div>
              <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                Patients&apos; lives improved by our software ecosystem.
              </p>
            </GlassCard>

            <GlassCard intensity="medium" hover3D glow className="stat-card p-6">
              <p className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">170+</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
                Experts in medicine and healthcare.
              </p>
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white shadow-sm" />
                ))}
                <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  +10
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  +100
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  +1K
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  +10K
                </div>

              </div>
            </GlassCard>
          </div>

          {/* Center Column: Main Content */}
          <div className="flex flex-col gap-8 relative z-10">
            <div ref={badgeRef} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider w-fit">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              Healthcare Platform
            </div>

            <div>
              {/* Hero Heading with Letter Reveal */}
              <h1 ref={heroHeadingRef} className="text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
                We build products that <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-600">redefine healthcare</span>
              </h1>

              <p ref={heroSubtextRef} className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                We bring together everything that&apos;s required to manage a healthcare
                business digitally with cutting-edge technology and human-centric design.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/dashboard/patient" className="primary-btn-gradient h-12 px-8 text-base shadow-xl shadow-primary-500/20">
                Explore Platform
              </Link>
              <Link href="/auth/register" className="h-12 px-8 rounded-full border border-slate-200 bg-white dark:bg-slate-900 text-slate-700 font-semibold hover:bg-slate-50 dark:bg-slate-900 transition flex items-center justify-center">
                View Demo
              </Link>
            </div>

            <GlassCard intensity="light" className="p-5 mt-4 max-w-md bg-white dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Popular Services</p>
                <span className="text-xs text-teal-600 font-medium cursor-pointer hover:underline">View all</span>
              </div>
              <div className="space-y-2">
                {['General Consultation', 'Mental Health', 'Cardiology'].map((item, i) => (
                  <div key={item} className="group flex items-center justify-between p-2 hover:bg-white dark:bg-slate-900/60 rounded-lg transition cursor-pointer">
                    <span className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-xs">{i + 1}</span>
                      {item}
                    </span>
                    <span className="text-slate-400 group-hover:text-primary-600 transition">→</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Visual */}
          <div ref={heroVisualRef} className="relative h-full min-h-[300px] lg:min-h-[400px] mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 to-primary-200/50 rounded-[40px] rotate-3 transform transition-transform hover:rotate-0 duration-700" />
            <GlassCard intensity="medium" glow className="absolute inset-0 rounded-[40px] overflow-hidden border-0 shadow-2xl shadow-primary-900/5">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-90 hover:scale-105 transition-transform duration-[2s]" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />

              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="inline-block px-3 py-1 rounded-lg bg-white dark:bg-slate-900/20 backdrop-blur-md text-xs font-medium mb-3 border border-white/30">
                  Featured Article
                </div>
                <p className="text-lg font-bold leading-snug mb-2">
                  The Future of Digital Health Records
                </p>
                <p className="text-sm text-white/80 line-clamp-2">
                  How AI is transforming the way we manage patient data and improve outcomes.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Search Bar */}
        <div ref={searchBarRef} className="mt-16 relative z-20">
          <GlassCard intensity="strong" className="p-2 flex flex-col md:flex-row items-center gap-2 max-w-3xl mx-auto shadow-2xl shadow-slate-200/50">
            <div className="flex-1 flex items-center px-4 h-12 w-full">
              <span className="text-slate-400 mr-3">🔍</span>
              <input
                className="flex-1 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                placeholder="Search for doctors, clinics, or services..."
              />
            </div>
            <button className="primary-btn-gradient h-12 px-8 rounded-xl w-full md:w-auto">
              Search
            </button>
          </GlassCard>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div ref={statsNumbersRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              { label: 'Active Users', value: '30M+', icon: '👥', color: 'text-blue-500' },
              { label: 'Cost Savings', value: '30%', icon: '💰', color: 'text-teal-500' },
              { label: 'Partner Clinics', value: '500+', icon: '🏥', color: 'text-purple-500' },
              { label: 'Expert Doctors', value: '4.5k', icon: '👨‍⚕️', color: 'text-indigo-500' },
            ].map((stat) => (
              <GlassCard key={stat.label} intensity="light" hover3D className="card-3d p-8 text-center bg-white dark:bg-slate-900/50 border-white/60">
                <div className={`text-4xl mb-4 ${stat.color}`}>{stat.icon}</div>
                <p className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Sticky & Zoom */}
      <section ref={aboutSectionRef} id="about" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left: Image with Zoom Scrub */}
            <div ref={aboutImageRef} className="relative rounded-[40px] overflow-hidden shadow-2xl shadow-teal-900/10 aspect-[4/5] lg:aspect-square">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80')] bg-cover bg-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/40 to-transparent" />

              <GlassCard intensity="medium" className="absolute bottom-8 left-8 right-8 p-6 backdrop-blur-xl bg-white dark:bg-slate-900/90">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-2xl">
                    🛡️
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Certified Excellence</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Recognized by top medical boards</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Right: Sticky Text Content */}
            <div ref={aboutTextContainerRef} className="flex flex-col justify-center h-full py-10">
              <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-4">About Us</p>

              <h2 ref={aboutTitleRef} className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                Highly trained <span className="text-primary-600">medical professionals</span> at your service
              </h2>

              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                We combine cutting-edge technology with compassionate care to deliver exceptional healthcare services tailored to your needs. Our platform connects you with the best specialists worldwide.
              </p>

              <div className="space-y-4">
                {['24/7 Patient Support', 'Integrated Health Records', 'Virtual Consultations'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs">✓</div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link href="/#services" className="primary-btn-gradient px-8 py-4 shadow-lg shadow-primary-500/20">
                  Learn More About Us
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Team Section */}
      <section ref={teamSectionRef} id="team" className="py-24 bg-slate-50 dark:bg-slate-900/50 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div ref={teamTextContainerRef} className="order-2 lg:order-1">
              <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-4">Our Team</p>

              <h2 ref={teamTitleRef} className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                Meet the <span className="text-primary-600">experts</span> behind your health
              </h2>

              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Our multidisciplinary team of doctors, nurses, and technologists work together to provide you with the most advanced care possible.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="avatar-bubble w-14 h-14 rounded-full border-2 border-white shadow-md bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300" />
                  </div>
                ))}
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-medium text-xs">
                  Join
                </div>
              </div>

              <Link href="/team" className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-2 group">
                See all team members <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div ref={teamImageRef} className="order-1 lg:order-2 relative">
              <GlassCard intensity="medium" className="p-2 rounded-[32px] bg-white dark:bg-slate-900/60 backdrop-blur-2xl">
                <div className="rounded-[28px] overflow-hidden aspect-[4/3] relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80')] bg-cover bg-center" />

                  {/* Floating badge */}
                  <div className="absolute top-6 right-6 bg-white dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Available Now</span>
                  </div>
                </div>
              </GlassCard>
            </div>

          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Our Services
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Comprehensive healthcare solutions tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '👨‍⚕️',
                title: 'General Consultation',
                description: 'Connect with experienced doctors for general health concerns and advice.',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: '🧠',
                title: 'Mental Health',
                description: 'Professional mental health support and counseling services.',
                color: 'from-purple-500 to-purple-600'
              },
              {
                icon: '❤️',
                title: 'Cardiology',
                description: 'Specialized heart care and cardiovascular health monitoring.',
                color: 'from-red-500 to-red-600'
              },
              {
                icon: '💊',
                title: 'Pharmacy',
                description: 'Online prescription management and medicine delivery.',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: '📋',
                title: 'Health Records',
                description: 'Secure digital health records accessible anytime, anywhere.',
                color: 'from-primary-500 to-primary-600'
              },
              {
                icon: '📞',
                title: 'Video Consultations',
                description: 'Face-to-face consultations from the comfort of your home.',
                color: 'from-orange-500 to-orange-600'
              }
            ].map((service, index) => (
              <GlassCard key={index} intensity="medium" className="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {service.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Contact Info */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Get in Touch
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg mb-8">
                Have questions? We&apos;re here to help. Reach out to us through any of the channels below.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 flex-shrink-0">
                    📧
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Email</h4>
                    <p className="text-slate-600 dark:text-slate-300">support@biocare.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 flex-shrink-0">
                    📞
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Phone</h4>
                    <p className="text-slate-600 dark:text-slate-300">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 flex-shrink-0">
                    📍
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Address</h4>
                    <p className="text-slate-600 dark:text-slate-300">123 Healthcare Ave, Medical District, CA 90001</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 flex-shrink-0">
                    ⏰
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Hours</h4>
                    <p className="text-slate-600 dark:text-slate-300">24/7 Support Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <GlassCard intensity="medium" className="p-8">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="How can we help?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us more about your inquiry..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full primary-btn-gradient py-3 rounded-xl font-semibold shadow-lg shadow-primary-500/20"
                >
                  Send Message
                </button>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6">
          <GlassCard ref={newsletterRef} intensity="strong" glow className="p-10 md:p-16 text-center rounded-[48px] border-white/50 shadow-2xl shadow-primary-900/5 bg-gradient-to-br from-white/80 to-primary-50/80">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Join our health newsletter
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-lg mx-auto">
              Get the latest updates on medical technology and health tips directly to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition shadow-inner"
              />
              <button type="submit" className="primary-btn-gradient px-8 py-4 rounded-full shadow-lg shadow-primary-500/20 whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white">🩺</div>
                <span className="text-xl font-bold text-white">BioCare</span>
              </div>
              <p className="max-w-xs text-slate-400">
                Revolutionizing healthcare management with intelligent digital solutions.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-primary-400 transition">Solutions</Link></li>
                <li><Link href="#" className="hover:text-primary-400 transition">How it works</Link></li>
                <li><Link href="#" className="hover:text-primary-400 transition">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-primary-400 transition">About</Link></li>
                <li><Link href="#" className="hover:text-primary-400 transition">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary-400 transition">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <p>© 2025 BioCare Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white transition">Privacy</Link>
              <Link href="#" className="hover:text-white transition">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}