'use client'

import { useState, useEffect } from 'react'
import { aiService } from '@/services/aiService'
import { Diagnosis, SymptomCheckHistory } from '@/types'
import { toast } from 'react-toastify'


export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [currentSymptom, setCurrentSymptom] = useState('')
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<SymptomCheckHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Load symptom history on component mount
  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoadingHistory(true)
    try {
      const response = await aiService.getSymptomHistory()
      if (response.success && response.data) {
        setHistory(response.data)
      }
    } catch (error) {
      console.error('Failed to load symptom history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const addSymptom = () => {
    if (currentSymptom.trim() && !symptoms.includes(currentSymptom.trim())) {
      setSymptoms([...symptoms, currentSymptom.trim()])
      setCurrentSymptom('')
    }
  }

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom))
  }

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      toast.error('Please add at least one symptom')
      return
    }

    setLoading(true)
    try {
      const diagnosisResult = await aiService.analyzeSymptoms(symptoms)
      setDiagnosis(diagnosisResult)
      toast.success('Analysis complete and saved to your history!')
      // Reload history to show the new entry
      await loadHistory()
    } catch (error: any) {
      toast.error('Failed to analyze symptoms')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getTriageLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-900'
      case 'high':
        return 'bg-orange-100 border-orange-500 text-orange-900'
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900'
      case 'low':
        return 'bg-green-100 border-green-500 text-green-900'
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900'
    }
  }

  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-white'
      case 'low':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-400 text-white'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        🏥 AI Symptom Checker
      </h2>

      {/* Input Section */}
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={currentSymptom}
            onChange={(e) => setCurrentSymptom(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
            placeholder="Enter a symptom (e.g., fever, headache)"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-black"
          />
          <button
            onClick={addSymptom}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {symptoms.map((symptom) => (
            <span
              key={symptom}
              className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-4 py-2 rounded-full text-sm flex items-center gap-2 font-medium"
            >
              {symptom}
              <button
                onClick={() => removeSymptom(symptom)}
                className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 font-bold text-lg"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={analyzeSymptoms}
        disabled={loading || symptoms.length === 0}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed mb-6 font-bold text-lg shadow-md"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analyzing Symptoms...
          </span>
        ) : (
          '🔍 Analyze Symptoms'
        )}
      </button>

      {/* Results Section */}
      {diagnosis && (
        <div className="space-y-6">
          {/* Emergency Alert */}
          {diagnosis.is_emergency && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-lg">
                <span className="text-2xl">⚠️</span>
                <span>EMERGENCY - Seek Immediate Medical Attention!</span>
              </div>
            </div>
          )}

          {/* Consult Doctor Immediately Alert */}
          {diagnosis.consult_doctor_immediately && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 rounded-lg p-5 shadow-lg">
              <div className="flex items-start gap-3">
                <span className="text-3xl">🚨</span>
                <div>
                  <h3 className="font-bold text-xl text-orange-800 dark:text-orange-300 mb-2">
                    Immediate Medical Consultation Required
                  </h3>
                  <p className="text-orange-700 dark:text-orange-200 font-medium">
                    Based on your symptoms, we strongly recommend consulting a doctor immediately.
                    Do not delay seeking professional medical advice.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Urgency Statement */}
          {diagnosis.urgency_statement && (
            <div className={`p-5 rounded-lg border-2 shadow-md ${diagnosis.consult_doctor_immediately
              ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
              : diagnosis.triage_level === 'high' || diagnosis.triage_level === 'critical'
                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 dark:border-orange-600'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600'
              }`}>
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-gray-800 dark:text-white">
                <span>⏰</span>
                Urgency Assessment
              </h3>
              <p className={`text-base leading-relaxed font-medium ${diagnosis.consult_doctor_immediately
                ? 'text-red-800 dark:text-red-200'
                : diagnosis.triage_level === 'high' || diagnosis.triage_level === 'critical'
                  ? 'text-orange-800 dark:text-orange-200'
                  : 'text-blue-800 dark:text-blue-200'
                }`}>
                {diagnosis.urgency_statement}
              </p>
            </div>
          )}

          {/* Triage Level */}
          <div className={`p-5 rounded-lg border-2 ${getTriageLevelColor(diagnosis.triage_level)}`}>
            <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
              <span>🎯</span>
              Triage Level: {diagnosis.triage_level.toUpperCase()}
            </h3>
            <p className="font-medium">Category: {diagnosis.urgency_category}</p>
          </div>

          {/* Symptom Severity Analysis */}
          {diagnosis.symptom_severity_analysis && Object.keys(diagnosis.symptom_severity_analysis).length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
              <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                <span>📊</span>
                Symptom Severity Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(diagnosis.symptom_severity_analysis).map(([symptom, severity]) => (
                  <div key={symptom} className="flex justify-between items-center bg-white dark:bg-gray-600 p-3 rounded-lg">
                    <span className="font-medium text-gray-700 dark:text-gray-200 capitalize">{symptom}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${severity === 'severe' ? 'bg-red-500 text-white' :
                      severity === 'moderate' ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                      {severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Possible Conditions */}
          {diagnosis.possible_conditions && diagnosis.possible_conditions.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5">
              <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                <span>🔬</span>
                Possible Conditions
              </h3>
              <div className="space-y-2">
                {diagnosis.possible_conditions.map((condition, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white dark:bg-gray-700 p-3 rounded-lg">
                    <span className="font-medium text-gray-700 dark:text-gray-200">{condition.name}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getConfidenceBadgeColor(condition.confidence)}`}>
                      {condition.confidence.toUpperCase()} confidence
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Home Care Advice */}
          {diagnosis.home_care_advice && diagnosis.home_care_advice.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5">
              <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                <span>🏠</span>
                Home Care Advice
              </h3>
              <ul className="space-y-2">
                {diagnosis.home_care_advice.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-200">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Things to Avoid */}
          {diagnosis.avoid_these && diagnosis.avoid_these.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5">
              <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                <span>⛔</span>
                Things to Avoid
              </h3>
              <ul className="space-y-2">
                {diagnosis.avoid_these.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-200">
                    <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended OTC Medicines */}
          {diagnosis.recommended_otc_medicines && diagnosis.recommended_otc_medicines.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-5">
              <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                <span>💊</span>
                Recommended Over-the-Counter Medicines
              </h3>
              <div className="space-y-3">
                {diagnosis.recommended_otc_medicines.map((medicine, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                    <div className="font-bold text-gray-800 dark:text-white mb-1">{medicine.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{medicine.dosage_note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning Signs to Monitor */}
          {diagnosis.warning_signs_to_monitor && diagnosis.warning_signs_to_monitor.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-5 border-l-4 border-orange-500">
              <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                <span>⚠️</span>
                Warning Signs to Monitor
              </h3>
              <ul className="space-y-2">
                {diagnosis.warning_signs_to_monitor.map((sign, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-200">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">!</span>
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* When to Visit Doctor */}
          {diagnosis.when_to_visit_doctor && diagnosis.when_to_visit_doctor.length > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-5">
              <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                <span>👨‍⚕️</span>
                When to Visit a Doctor
              </h3>
              <ul className="space-y-2">
                {diagnosis.when_to_visit_doctor.map((condition, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-200">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">→</span>
                    <span>{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Overall Recommendation */}
          {diagnosis.recommendation && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-5 border-2 border-blue-300 dark:border-blue-700">
              <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                <span>💡</span>
                Overall Recommendation
              </h3>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{diagnosis.recommendation}</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-300 italic">
            <strong>Disclaimer:</strong> This AI-powered symptom checker is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </div>
        </div>
      )}

      {/* Symptom History Section */}
      <div className="mt-8 border-t pt-6">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span>📋</span>
            Symptom Check History ({history.length})
          </h3>
          <span className="text-2xl">{showHistory ? '▼' : '▶'}</span>
        </button>

        {showHistory && (
          <div className="mt-4 space-y-4">
            {loadingHistory ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">No symptom checks yet. Start by analyzing your symptoms!</p>
              </div>
            ) : (
              history.map((check) => (
                <div
                  key={check._id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(check.createdAt).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {check.input_symptoms.map((symptom, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${check.triage_level === 'critical' ? 'bg-red-500 text-white' :
                      check.triage_level === 'high' ? 'bg-orange-500 text-white' :
                        check.triage_level === 'medium' ? 'bg-yellow-500 text-white' :
                          'bg-green-500 text-white'
                      }`}>
                      {check.triage_level.toUpperCase()}
                    </span>
                  </div>

                  {check.possible_conditions && check.possible_conditions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Possible Conditions:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {check.possible_conditions.slice(0, 3).map((condition, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded border border-gray-300 dark:border-gray-500"
                          >
                            {condition.name} ({condition.confidence})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {check.is_emergency && (
                    <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-semibold">
                      <span>⚠️</span>
                      <span>Emergency flagged</span>
                    </div>
                  )}

                  {check.consult_doctor_immediately && (
                    <div className="mt-3 flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm font-semibold">
                      <span>🚨</span>
                      <span>Immediate doctor consultation recommended</span>
                    </div>
                  )}

                  <button
                    onClick={() => setDiagnosis(check)}
                    className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                  >
                    View Full Details →
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
