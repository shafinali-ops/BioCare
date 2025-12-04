'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPrescriptionBottle, FaPlus, FaMinus, FaCalendarAlt, FaPills } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Consultation {
    _id: string;
    appointmentId: any;
    patientId: {
        _id: string;
        name: string;
        age: number;
        gender: string;
    };
    diagnosis: string;
    symptoms: string[];
    consultation_date: string;
    consultation_status: string;
}

interface Medicine {
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

export default function CreatePrescriptionPage() {
    const router = useRouter();
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [selectedConsultation, setSelectedConsultation] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [medicines, setMedicines] = useState<Medicine[]>([
        { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
    const [followUpDate, setFollowUpDate] = useState('');
    const [generalInstructions, setGeneralInstructions] = useState('');

    useEffect(() => {
        fetchCompletedConsultations();
    }, []);

    const fetchCompletedConsultations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/consultations/doctor`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('📋 All consultations from API:', response.data);
            console.log('📋 Total consultations:', response.data.length);

            // Log each consultation status
            response.data.forEach((c: Consultation, index: number) => {
                console.log(`Consultation ${index + 1}:`, {
                    id: c._id,
                    patient: c.patientId?.name,
                    status: c.consultation_status,
                    diagnosis: c.diagnosis,
                    date: c.consultation_date
                });
            });

            // Filter to show only ACTIVE or ENDED consultations
            const completed = response.data.filter((c: Consultation) =>
                c.consultation_status === 'ACTIVE' || c.consultation_status === 'ENDED'
            );

            console.log('✅ Filtered consultations (ACTIVE or ENDED):', completed.length);
            console.log('✅ Completed consultations:', completed);

            // If no completed consultations, show all for debugging
            if (completed.length === 0) {
                console.warn('⚠️ No ACTIVE or ENDED consultations found. Showing all consultations for debugging.');
                setConsultations(response.data);
            } else {
                setConsultations(completed);
            }
        } catch (error: any) {
            console.error('❌ Error fetching consultations:', error);
            console.error('Error response:', error.response?.data);
            toast.error('Failed to load consultations');
        } finally {
            setLoading(false);
        }
    };

    const addMedicine = () => {
        setMedicines([...medicines, {
            medicine_name: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: ''
        }]);
    };

    const removeMedicine = (index: number) => {
        if (medicines.length > 1) {
            setMedicines(medicines.filter((_, i) => i !== index));
        }
    };

    const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
        const updated = [...medicines];
        updated[index] = { ...updated[index], [field]: value };
        setMedicines(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedConsultation) {
            toast.error('Please select a consultation');
            return;
        }

        // Validate medicines
        const validMedicines = medicines.filter(m =>
            m.medicine_name.trim() &&
            m.dosage.trim() &&
            m.frequency.trim() &&
            m.duration.trim()
        );

        if (validMedicines.length === 0) {
            toast.error('Please add at least one complete medicine entry');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                consultationId: selectedConsultation,
                medicines: validMedicines,
                follow_up_date: followUpDate || undefined,
                instructions: generalInstructions || undefined
            };

            console.log('📤 Creating prescription:', payload);

            await axios.post(`${API_URL}/prescriptions`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Prescription created successfully! Patient will be notified.');

            // Reset form
            setSelectedConsultation('');
            setMedicines([{ medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
            setFollowUpDate('');
            setGeneralInstructions('');

            // Refresh consultations
            fetchCompletedConsultations();
        } catch (error: any) {
            console.error('Error creating prescription:', error);
            toast.error(error.response?.data?.message || 'Failed to create prescription');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedConsultationData = consultations.find(c => c._id === selectedConsultation);

    if (loading) {
        return (
            <DashboardLayout role="doctor">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="doctor">
            <div className="p-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-md p-6 mb-4 text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-3 rounded-xl">
                            <FaPrescriptionBottle className="text-3xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Create Prescription</h1>
                            <p className="text-sm opacity-90">Write prescriptions for completed consultations</p>
                        </div>
                    </div>
                </div>

                {consultations.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <FaPills className="mx-auto text-6xl text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Completed Consultations</h3>
                        <p className="text-gray-500">Complete consultations to create prescriptions</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
                        {/* Select Consultation */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Select Consultation <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedConsultation}
                                onChange={(e) => setSelectedConsultation(e.target.value)}
                                required
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                            >
                                <option value="">-- Select Consultation --</option>
                                {consultations.map((consultation) => (
                                    <option key={consultation._id} value={consultation._id}>
                                        {consultation.patientId.name} - {new Date(consultation.consultation_date).toLocaleDateString()} - {consultation.diagnosis}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Patient Info */}
                        {selectedConsultationData && (
                            <div className="bg-primary-50 p-3 rounded-xl border border-primary-200">
                                <h3 className="font-bold text-gray-800 mb-2 text-sm">Patient Information</h3>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-gray-600">Name:</span>
                                        <span className="ml-2 font-medium">{selectedConsultationData.patientId.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Age:</span>
                                        <span className="ml-2 font-medium">{selectedConsultationData.patientId.age} yrs</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Gender:</span>
                                        <span className="ml-2 font-medium">{selectedConsultationData.patientId.gender}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Diagnosis:</span>
                                        <span className="ml-2 font-medium">{selectedConsultationData.diagnosis}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Medicines */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-bold text-gray-700">
                                    Medicines <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={addMedicine}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition"
                                >
                                    <FaPlus /> Add Medicine
                                </button>
                            </div>

                            <div className="space-y-3">
                                {medicines.map((medicine, index) => (
                                    <div key={index} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-gray-700 text-sm">Medicine {index + 1}</h4>
                                            {medicines.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeMedicine(index)}
                                                    className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600"
                                                >
                                                    <FaMinus /> Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Medicine Name*</label>
                                                <input
                                                    type="text"
                                                    value={medicine.medicine_name}
                                                    onChange={(e) => updateMedicine(index, 'medicine_name', e.target.value)}
                                                    required
                                                    placeholder="e.g., Paracetamol"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Dosage*</label>
                                                <input
                                                    type="text"
                                                    value={medicine.dosage}
                                                    onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                                    required
                                                    placeholder="e.g., 500mg"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Frequency*</label>
                                                <input
                                                    type="text"
                                                    value={medicine.frequency}
                                                    onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                                                    required
                                                    placeholder="e.g., 3 times/day"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Duration*</label>
                                                <input
                                                    type="text"
                                                    value={medicine.duration}
                                                    onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                                    required
                                                    placeholder="e.g., 5 days"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Instructions</label>
                                                <input
                                                    type="text"
                                                    value={medicine.instructions}
                                                    onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                                                    placeholder="e.g., Take after meals"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Follow-up Date */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <FaCalendarAlt className="inline mr-2" />
                                Follow-up Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={followUpDate}
                                onChange={(e) => setFollowUpDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        {/* General Instructions */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                General Instructions (Optional)
                            </label>
                            <textarea
                                value={generalInstructions}
                                onChange={(e) => setGeneralInstructions(e.target.value)}
                                rows={3}
                                placeholder="Any additional instructions for the patient..."
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting || !selectedConsultation}
                            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Creating Prescription...' : 'Create Prescription & Notify Patient'}
                        </button>
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
}
