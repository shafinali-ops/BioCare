'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Consultation, Patient } from '@/types'
import { FaVideo, FaComment, FaPrescriptionBottleAlt, FaNotesMedical, FaCheck, FaSave } from 'react-icons/fa'
import { io } from 'socket.io-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'

export default function ConsultationPage() {
    const { id } = useParams()
    const router = useRouter()
    const [consultation, setConsultation] = useState<Consultation | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'notes' | 'prescription' | 'video' | 'chat'>('notes')

    // Form States
    const [notes, setNotes] = useState({
        symptoms: '',
        diagnosis: '',
        doctor_notes: '',
        recommended_tests: ''
    })

    const [prescription, setPrescription] = useState({
        medicines: [{ medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        follow_up_date: '',
        instructions: ''
    })

    useEffect(() => {
        fetchConsultation()
        setupSocket()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const setupSocket = () => {
        const token = localStorage.getItem('token')
        if (!token) return

        const socket = io(SOCKET_URL, { auth: { token } })
        socket.emit('join', `consultation:${id}`)

        return () => {
            socket.disconnect()
        }
    }

    const fetchConsultation = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(`${API_URL}/consultations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setConsultation(response.data)

            // Initialize form
            const data = response.data
            setNotes({
                symptoms: data.symptoms?.join(', ') || '',
                diagnosis: data.diagnosis || '',
                doctor_notes: data.doctor_notes || '',
                recommended_tests: data.recommended_tests?.join(', ') || ''
            })
        } catch (error) {
            toast.error('Failed to fetch consultation')
            router.push('/dashboard/doctor/appointments')
        } finally {
            setLoading(false)
        }
    }

    const handleStartConsultation = async () => {
        try {
            const token = localStorage.getItem('token')
            await axios.put(`${API_URL}/consultations/${id}/start`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Consultation started')
            fetchConsultation()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to start consultation')
        }
    }

    const handleSaveNotes = async () => {
        try {
            const token = localStorage.getItem('token')
            await axios.put(`${API_URL}/consultations/${id}/update`, {
                symptoms: notes.symptoms.split(',').map(s => s.trim()).filter(s => s),
                diagnosis: notes.diagnosis,
                doctor_notes: notes.doctor_notes,
                recommended_tests: notes.recommended_tests.split(',').map(s => s.trim()).filter(s => s)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Notes saved successfully')
        } catch (error: any) {
            toast.error('Failed to save notes')
        }
    }

    const handleEndConsultation = async () => {
        if (!window.confirm('Are you sure you want to end this consultation? This cannot be undone.')) return

        try {
            const token = localStorage.getItem('token')
            await axios.put(`${API_URL}/consultations/${id}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Consultation completed')
            router.push('/dashboard/doctor/appointments')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to complete consultation')
        }
    }

    const handleAddMedicine = () => {
        setPrescription({
            ...prescription,
            medicines: [...prescription.medicines, { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
        })
    }

    const handleMedicineChange = (index: number, field: string, value: string) => {
        const newMedicines = [...prescription.medicines]
        newMedicines[index] = { ...newMedicines[index], [field]: value }
        setPrescription({ ...prescription, medicines: newMedicines })
    }

    const handleCreatePrescription = async () => {
        try {
            const token = localStorage.getItem('token')
            await axios.post(`${API_URL}/prescriptions`, {
                consultationId: id,
                medicines: prescription.medicines,
                follow_up_date: prescription.follow_up_date,
                instructions: prescription.instructions
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Prescription created successfully')
            setPrescription({
                medicines: [{ medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
                follow_up_date: '',
                instructions: ''
            })
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create prescription')
        }
    }

    if (loading || !consultation) {
        return (
            <DashboardLayout role="doctor">
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </DashboardLayout>
        )
    }

    const patient = consultation.patientId as unknown as Patient

    return (
        <DashboardLayout role="doctor">
            <div className="p-6 bg-gray-50 min-h-screen font-sans">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-2xl">
                            {patient.name?.[0]}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                            <p className="text-gray-500 text-sm">
                                {patient.age} yrs • {patient.gender} • {patient.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${consultation.consultation_status === 'in-progress' ? 'bg-green-100 text-green-700' :
                            consultation.consultation_status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                            {consultation.consultation_status.replace('_', ' ')}
                        </div>

                        {consultation.consultation_status === 'not_started' && (
                            <button
                                onClick={handleStartConsultation}
                                className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 font-bold shadow-lg shadow-green-200 transition-all"
                            >
                                Start Consultation
                            </button>
                        )}

                        {consultation.consultation_status === 'in-progress' && (
                            <button
                                onClick={handleEndConsultation}
                                className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 font-bold shadow-lg shadow-red-200 transition-all"
                            >
                                End Consultation
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Tabs & Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="bg-white rounded-2xl shadow-sm p-2 border border-gray-100 flex gap-2">
                            {[
                                { id: 'notes', label: 'Clinical Notes', icon: FaNotesMedical },
                                { id: 'prescription', label: 'Prescription', icon: FaPrescriptionBottleAlt },
                                { id: 'video', label: 'Video Call', icon: FaVideo },
                                { id: 'chat', label: 'Chat', icon: FaComment }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    <tab.icon /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 min-h-[500px]">
                            {activeTab === 'notes' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-900">Clinical Notes</h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Symptoms</label>
                                            <textarea
                                                value={notes.symptoms}
                                                onChange={(e) => setNotes({ ...notes, symptoms: e.target.value })}
                                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                                                rows={3}
                                                placeholder="Enter symptoms (comma separated)..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Diagnosis</label>
                                            <input
                                                value={notes.diagnosis}
                                                onChange={(e) => setNotes({ ...notes, diagnosis: e.target.value })}
                                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                                                placeholder="Enter diagnosis..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Doctor&apos;s Notes</label>
                                            <textarea
                                                value={notes.doctor_notes}
                                                onChange={(e) => setNotes({ ...notes, doctor_notes: e.target.value })}
                                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                                                rows={5}
                                                placeholder="Detailed notes..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Recommended Tests</label>
                                            <input
                                                value={notes.recommended_tests}
                                                onChange={(e) => setNotes({ ...notes, recommended_tests: e.target.value })}
                                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                                                placeholder="Tests (comma separated)..."
                                            />
                                        </div>
                                        <button
                                            onClick={handleSaveNotes}
                                            disabled={consultation.consultation_status === 'completed'}
                                            className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FaSave /> Save Notes
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'prescription' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-900">Write Prescription</h3>
                                    {prescription.medicines.map((med, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-gray-700">Medicine {idx + 1}</h4>
                                                {idx > 0 && (
                                                    <button
                                                        onClick={() => {
                                                            const newMeds = prescription.medicines.filter((_, i) => i !== idx)
                                                            setPrescription({ ...prescription, medicines: newMeds })
                                                        }}
                                                        className="text-red-500 text-sm font-bold hover:underline"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    placeholder="Medicine Name"
                                                    value={med.medicine_name}
                                                    onChange={(e) => handleMedicineChange(idx, 'medicine_name', e.target.value)}
                                                    className="p-3 rounded-lg border border-gray-200"
                                                />
                                                <input
                                                    placeholder="Dosage (e.g. 500mg)"
                                                    value={med.dosage}
                                                    onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                                                    className="p-3 rounded-lg border border-gray-200"
                                                />
                                                <input
                                                    placeholder="Frequency (e.g. 3/day)"
                                                    value={med.frequency}
                                                    onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                                                    className="p-3 rounded-lg border border-gray-200"
                                                />
                                                <input
                                                    placeholder="Duration (e.g. 7 days)"
                                                    value={med.duration}
                                                    onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                                                    className="p-3 rounded-lg border border-gray-200"
                                                />
                                            </div>
                                            <input
                                                placeholder="Instructions (e.g. after meals)"
                                                value={med.instructions}
                                                onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                                                className="w-full p-3 rounded-lg border border-gray-200"
                                            />
                                        </div>
                                    ))}

                                    <button
                                        onClick={handleAddMedicine}
                                        className="text-purple-600 font-bold text-sm hover:underline"
                                    >
                                        + Add Another Medicine
                                    </button>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Follow-up Date</label>
                                            <input
                                                type="date"
                                                value={prescription.follow_up_date}
                                                onChange={(e) => setPrescription({ ...prescription, follow_up_date: e.target.value })}
                                                className="w-full p-3 rounded-xl border border-gray-200"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCreatePrescription}
                                        disabled={consultation.consultation_status !== 'in-progress'}
                                        className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 font-bold shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaCheck /> Create Prescription
                                    </button>
                                    {consultation.consultation_status !== 'in-progress' && (
                                        <p className="text-center text-xs text-red-500">
                                            Consultation must be in-progress to create prescription
                                        </p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'video' && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 mb-4">Video call feature is integrated. Please use the &quot;Video Call&quot; button in the patient list or dashboard to initiate a call.</p>
                                    <button
                                        onClick={() => router.push(`/dashboard/doctor/video-call?patientId=${patient.userId?._id || patient._id}`)}
                                        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700"
                                    >
                                        Go to Video Call Interface
                                    </button>
                                </div>
                            )}

                            {activeTab === 'chat' && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 mb-4">Chat feature is integrated. Please use the &quot;Chat&quot; button in the patient list or dashboard to initiate a chat.</p>
                                    <button
                                        onClick={() => router.push(`/dashboard/doctor/chat?patientId=${patient.userId?._id || patient._id}`)}
                                        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700"
                                    >
                                        Go to Chat Interface
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Appointment Info</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Date & Time</p>
                                    <p className="text-gray-700 font-medium">
                                        {new Date((consultation.appointmentId as any).date).toLocaleDateString()} at {(consultation.appointmentId as any).time}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Reason for Visit</p>
                                    <p className="text-gray-700 font-medium">
                                        {(consultation.appointmentId as any).reason_for_visit}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
