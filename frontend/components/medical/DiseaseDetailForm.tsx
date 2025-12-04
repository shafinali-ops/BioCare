'use client'

import { useState } from 'react'
import { useTheme, themes } from '@/contexts/ThemeContext'
import { toast } from 'react-toastify'

interface DiseaseDetailFormProps {
  issueType: string
  onClose: () => void
  onSubmit: (data: any) => void
}

export default function DiseaseDetailForm({ issueType, onClose, onSubmit }: DiseaseDetailFormProps) {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const [formData, setFormData] = useState({
    symptoms: '',
    duration: '',
    severity: 'moderate',
    additionalInfo: '',
    medications: '',
    allergies: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.symptoms.trim()) {
      toast.error('Please describe your symptoms')
      return
    }
    onSubmit({
      issueType,
      ...formData,
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${themeColors.card} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`bg-gradient-to-r ${themeColors.primary} text-white p-6 rounded-t-2xl`}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Describe Your {issueType} Issue</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptoms & Description *
            </label>
            <textarea
              required
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your symptoms in detail..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select duration</option>
                <option value="few-hours">Few hours</option>
                <option value="1-day">1 day</option>
                <option value="2-3-days">2-3 days</option>
                <option value="1-week">1 week</option>
                <option value="more">More than a week</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Medications (if any)
            </label>
            <input
              type="text"
              value={formData.medications}
              onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="List any medications you're currently taking"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allergies (if any)
            </label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="List any known allergies"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Information
            </label>
            <textarea
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Any other relevant information..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-6 py-3 ${themeColors.button} text-white rounded-lg font-medium hover:shadow-lg transition`}
            >
              Submit & Get Help
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

