'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMyPatients, startConsultation } from '@/services/lhwService';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { toast } from 'react-toastify';
import api from '@/services/api';

export default function StartConsultationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preSelectedPatientId = searchParams.get('patientId');

    const [patients, setPatients] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        patientId: preSelectedPatientId || '',
        doctorId: '',
        symptoms: ['']
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch patients
            const patientsData = await getMyPatients();
            setPatients(patientsData.patients || []);

            // Fetch doctors
            const doctorsResponse = await api.get('/doctors');
            setDoctors(doctorsResponse.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSymptom = () => {
        setFormData({
            ...formData,
            symptoms: [...formData.symptoms, '']
        });
    };

    const handleRemoveSymptom = (index: number) => {
        const newSymptoms = formData.symptoms.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            symptoms: newSymptoms.length > 0 ? newSymptoms : ['']
        });
    };

    const handleSymptomChange = (index: number, value: string) => {
        const newSymptoms = [...formData.symptoms];
        newSymptoms[index] = value;
        setFormData({
            ...formData,
            symptoms: newSymptoms
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.patientId || !formData.doctorId) {
            toast.error('Please select both patient and doctor');
            return;
        }

        try {
            setSubmitting(true);
            const symptoms = formData.symptoms.filter(s => s.trim() !== '');

            await startConsultation({
                patientId: formData.patientId,
                doctorId: formData.doctorId,
                symptoms: symptoms.length > 0 ? symptoms : undefined
            });

            toast.success('Consultation started successfully!');
            router.push('/dashboard/lhw');
        } catch (error: any) {
            console.error('Error starting consultation:', error);
            toast.error(error.response?.data?.message || 'Failed to start consultation');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedPatient = patients.find(p => p._id === formData.patientId);
    const selectedDoctor = doctors.find(d => d._id === formData.doctorId);

    return (
        <DashboardLayout role="lhw">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Start Consultation</h1>
                            <p className="text-gray-600 mt-1">Connect a patient with a doctor for remote consultation</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Loading...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Form Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Select Patient */}
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                                                👤
                                            </span>
                                            Select Patient
                                        </h2>
                                        <select
                                            value={formData.patientId}
                                            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Choose a patient...</option>
                                            {patients.map((patient) => (
                                                <option key={patient._id} value={patient._id}>
                                                    {patient.name} - {patient.age} years, {patient.gender}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedPatient && (
                                            <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                                                <p className="text-sm text-blue-800">
                                                    <strong>Selected:</strong> {selectedPatient.name} ({selectedPatient.age} years, {selectedPatient.gender})
                                                </p>
                                                <p className="text-sm text-blue-600 mt-1">
                                                    Email: {selectedPatient.userId?.email || 'N/A'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Select Doctor */}
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                                👨‍⚕️
                                            </span>
                                            Select Doctor
                                        </h2>
                                        <select
                                            value={formData.doctorId}
                                            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Choose a doctor...</option>
                                            {doctors.map((doctor) => (
                                                <option key={doctor._id} value={doctor._id}>
                                                    Dr. {doctor.name} - {doctor.specialization}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedDoctor && (
                                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <p className="text-sm text-green-800">
                                                    <strong>Selected:</strong> Dr. {selectedDoctor.name}
                                                </p>
                                                <p className="text-sm text-green-600 mt-1">
                                                    Specialization: {selectedDoctor.specialization}
                                                </p>
                                                {selectedDoctor.email && (
                                                    <p className="text-sm text-green-600">
                                                        Email: {selectedDoctor.email}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Symptoms */}
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                                🩺
                                            </span>
                                            Patient Symptoms (Optional)
                                        </h2>
                                        <div className="space-y-3">
                                            {formData.symptoms.map((symptom, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={symptom}
                                                        onChange={(e) => handleSymptomChange(index, e.target.value)}
                                                        placeholder={`Symptom ${index + 1}`}
                                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    />
                                                    {formData.symptoms.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSymptom(index)}
                                                            className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={handleAddSymptom}
                                                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add Another Symptom
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit Buttons */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 bg-primary-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Starting Consultation...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                    Start Consultation
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => router.back()}
                                            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Info Sidebar */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* How it Works */}
                            <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
                                        <ol className="text-sm text-blue-800 space-y-2">
                                            <li className="flex items-start gap-2">
                                                <span className="font-bold">1.</span>
                                                <span>Select the patient who needs consultation</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-bold">2.</span>
                                                <span>Choose an available doctor</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-bold">3.</span>
                                                <span>Add patient symptoms (optional)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-bold">4.</span>
                                                <span>Submit to create consultation request</span>
                                            </li>
                                        </ol>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Patients</span>
                                        <span className="font-bold text-blue-600">{patients.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Available Doctors</span>
                                        <span className="font-bold text-green-600">{doctors.length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Note */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-yellow-900 mb-2">Note</h3>
                                        <p className="text-sm text-yellow-800">
                                            The doctor will be notified and can review the consultation request. The patient will also receive a notification.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
