'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { doctorService } from '@/services/doctorService'
import { pharmacyService } from '@/services/pharmacyService'
import { useTheme, themes } from '@/contexts/ThemeContext'
import { toast } from 'react-toastify'

interface Patient {
  _id: string
  id?: number
  name: string
}

interface Medication {
  _id?: string
  id?: string
  name: string
  dosage: string
  frequency: string
  category?: string
}

export default function DoctorPrescriptionsPage() {
  const { theme } = useTheme()
  const themeColors = themes[theme]
  const searchParams = useSearchParams()
  const patientIdParam = searchParams.get('patientId')
  const [patients, setPatients] = useState<Patient[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string>(patientIdParam || '')
  const [prescriptionMedications, setPrescriptionMedications] = useState<Array<{
    medicationId: string
    name: string
    dosage: string
    frequency: string
    quantity: number
  }>>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
    if (patientIdParam) {
      setSelectedPatient(patientIdParam)
    }
  }, [patientIdParam])

  const fetchData = async () => {
    try {
      const [patientsData, medicationsData] = await Promise.all([
        doctorService.getPatients(),
        pharmacyService.getAllMedications(),
      ])
      setPatients(patientsData)
      setMedications(medicationsData)
    } catch (error: any) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const addMedication = () => {
    setPrescriptionMedications([
      ...prescriptionMedications,
      { medicationId: '', name: '', dosage: '', frequency: '', quantity: 1 }
    ])
  }

  const updateMedication = (index: number, field: string, value: string | number) => {
    const updated = [...prescriptionMedications]
    updated[index] = { ...updated[index], [field]: value }

    // If medication is selected, auto-fill name
    if (field === 'medicationId' && value) {
      const med = medications.find(m => m._id === value || m.id === value)
      if (med) {
        updated[index].name = med.name
        updated[index].dosage = med.dosage || ''
        updated[index].frequency = med.frequency || ''
      }
    }

    setPrescriptionMedications(updated)
  }

  const removeMedication = (index: number) => {
    setPrescriptionMedications(prescriptionMedications.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) {
      toast.error('Please select a patient')
      return
    }
    if (prescriptionMedications.length === 0) {
      toast.error('Please add at least one medication')
      return
    }

    setSubmitting(true)
    try {
      const meds = prescriptionMedications.map(med => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        quantity: med.quantity
      }))

      // Use patient _id if available, otherwise use id
      const patientId = selectedPatient

      await doctorService.createPrescription(
        patientId,
        meds
      )
      toast.success('E-Prescription created successfully!')
      setSelectedPatient(patientIdParam || '')
      setPrescriptionMedications([])
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create prescription')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="doctor">
        <div className="text-center py-12">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="doctor">
      <div className="px-4 py-6">
        {/* Hero Section */}
        <div className="relative mb-8 overflow-hidden rounded-3xl">
          <div className={`absolute inset-0 bg-gradient-to-r ${themeColors.primary}`}></div>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative text-white p-8 md:p-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">E-Prescriptions</h1>
                <p className="text-xl opacity-90">Create digital prescriptions for your patients</p>
              </div>
              <div className="hidden md:block text-8xl opacity-20">💊</div>
            </div>
          </div>
        </div>

        {/* Prescription Form */}
        <form onSubmit={handleSubmit} className={`${themeColors.card} rounded-2xl shadow-xl p-6 border-2 ${themeColors.border}`}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Patient <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
            >
              <option value="">-- Select Patient --</option>
              {patients.map((patient) => (
                <option key={patient._id || patient.id} value={patient._id || patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          {/* Medications */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Medications <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addMedication}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition"
              >
                + Add Medication
              </button>
            </div>

            <div className="space-y-4">
              {prescriptionMedications.map((med, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
                      <select
                        value={med.medicationId}
                        onChange={(e) => updateMedication(index, 'medicationId', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Select Medication --</option>
                        {medications.map((medication) => (
                          <option key={medication._id || medication.id} value={medication._id || medication.id}>
                            {medication.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        required
                        placeholder="e.g., 500mg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        required
                        placeholder="e.g., Twice daily"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={med.quantity}
                        onChange={(e) => updateMedication(index, 'quantity', parseInt(e.target.value))}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="text-red-600 hover:text-red-700 text-sm font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {prescriptionMedications.length === 0 && (
                <p className="text-gray-500 text-center py-8">Click &quot;Add Medication&quot; to start</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedPatient || prescriptionMedications.length === 0}
            className={`w-full ${themeColors.button} text-white py-3 px-6 rounded-xl font-semibold hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {submitting ? 'Creating Prescription...' : 'Create E-Prescription'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}

