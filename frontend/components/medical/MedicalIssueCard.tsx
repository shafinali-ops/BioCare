'use client'

import { useTheme, themes } from '@/contexts/ThemeContext'

interface MedicalIssueCardProps {
  title: string
  icon: string
  description: string
  onClick: () => void
  urgency?: 'low' | 'medium' | 'high'
}

export default function MedicalIssueCard({ title, icon, description, onClick, urgency = 'medium' }: MedicalIssueCardProps) {
  const { theme } = useTheme()
  const themeColors = themes[theme]

  const urgencyColors = {
    low: 'border-green-300 bg-green-50',
    medium: 'border-yellow-300 bg-yellow-50',
    high: 'border-red-300 bg-red-50',
  }

  return (
    <div
      onClick={onClick}
      className={`${themeColors.card} ${urgencyColors[urgency]} border-2 rounded-2xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
            {icon}
          </div>
          {urgency === 'high' && (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500 text-white animate-pulse shadow-lg">
              Urgent
            </span>
          )}
        </div>
        <h3 className={`text-xl font-bold ${themeColors.text} mb-3`}>{title}</h3>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>
        <div className={`text-sm font-semibold ${themeColors.button} text-white px-5 py-2.5 rounded-xl inline-flex items-center gap-2 group-hover:shadow-lg transition-all`}>
          Get Help
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </div>
  )
}

