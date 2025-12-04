'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { vitalService } from '@/services/vitalService';
import { doctorService } from '@/services/doctorService';
import { toast } from 'react-toastify';
import Link from 'next/link';

function VitalsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const patientId = searchParams.get('patientId');

    const [vitals, setVitals] = useState<any[]>([]);
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        heartRate: '',
        systolic: '',
        diastolic: '',
        temperature: '',
        oxygenSaturation: '',
        weight: '',
        height: '',
        notes: ''
    });

    useEffect(() => {
        if (patientId) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch vitals
            const vitalsData = await vitalService.getPatientVitals(patientId!);
            setVitals(vitalsData);

            // Fetch patient details
            const patients = await doctorService.getPatients();
            const foundPatient = patients.find((p: any) =>
                p._id === patientId || p.id === patientId || p.id === Number(patientId)
            );
            setPatient(foundPatient);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load patient data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const vitalData = {
                heartRate: formData.heartRate ? Number(formData.heartRate) : undefined,
                bloodPressure: formData.systolic && formData.diastolic
                    ? { systolic: Number(formData.systolic), diastolic: Number(formData.diastolic) }
                    : undefined,
                temperature: formData.temperature ? Number(formData.temperature) : undefined,
                oxygenSaturation: formData.oxygenSaturation ? Number(formData.oxygenSaturation) : undefined,
                weight: formData.weight ? Number(formData.weight) : undefined,
                height: formData.height ? Number(formData.height) : undefined,
                notes: formData.notes || undefined
            };

            // NOTE: Backend update needed for doctors to add vitals
            toast.info("Feature to add vitals as doctor coming soon (Backend update needed)");

            setShowAddModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error saving vital:', error);
            toast.error('Failed to save vital record');
        }
    };

    const resetForm = () => {
        setFormData({
            heartRate: '',
            systolic: '',
            diastolic: '',
            temperature: '',
            oxygenSaturation: '',
            weight: '',
            height: '',
            notes: ''
        });
    };

    if (!patientId) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-600">No patient selected.</p>
                <Link href="/dashboard/doctor/patients" className="text-blue-600 hover:underline">
                    Back to Patient List
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href={`/dashboard/doctor/patients/${patientId}`}
                    className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
                >
                    ← Back to Patient Details
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Vital Signs: {patient?.name || 'Loading...'}
                        </h1>
                        <p className="text-gray-600">Monitor and record patient health metrics</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-all shadow-lg font-semibold flex items-center gap-2"
                    >
                        <span className="text-xl">+</span> Record Vitals
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            {vitals.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Latest Heart Rate</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {vitals[0].heartRate ? `${vitals[0].heartRate} bpm` : '-'}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Latest BP</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {vitals[0].bloodPressure ? `${vitals[0].bloodPressure.systolic}/${vitals[0].bloodPressure.diastolic}` : '-'}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Latest Temp</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {vitals[0].temperature ? `${vitals[0].temperature}°C` : '-'}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Latest SpO2</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {vitals[0].oxygenSaturation ? `${vitals[0].oxygenSaturation}%` : '-'}
                        </p>
                    </div>
                </div>
            )}

            {/* Vitals Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">History</h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center">Loading records...</div>
                ) : vitals.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No vital signs recorded for this patient.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-700 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Heart Rate</th>
                                    <th className="px-6 py-4">Blood Pressure</th>
                                    <th className="px-6 py-4">Temperature</th>
                                    <th className="px-6 py-4">SpO2</th>
                                    <th className="px-6 py-4">Weight</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {vitals.map((vital) => (
                                    <tr key={vital._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(vital.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {vital.heartRate ? `${vital.heartRate} bpm` : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {vital.bloodPressure ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}` : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {vital.temperature ? `${vital.temperature}°C` : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {vital.oxygenSaturation ? `${vital.oxygenSaturation}%` : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {vital.weight ? `${vital.weight} kg` : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${vital.alertLevel === 'critical' ? 'bg-red-100 text-red-800' :
                                                vital.alertLevel === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {vital.alertLevel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">
                                            {vital.notes || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Vital Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold text-gray-800">Record Vitals</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label>
                                    <input
                                        type="number"
                                        value={formData.heartRate}
                                        onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="e.g., 72"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.temperature}
                                        onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="e.g., 36.6"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Systolic BP</label>
                                    <input
                                        type="number"
                                        value={formData.systolic}
                                        onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="e.g., 120"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Diastolic BP</label>
                                    <input
                                        type="number"
                                        value={formData.diastolic}
                                        onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="e.g., 80"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">SpO2 (%)</label>
                                    <input
                                        type="number"
                                        value={formData.oxygenSaturation}
                                        onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="e.g., 98"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.weight}
                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="e.g., 70"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        rows={3}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 bg-primary-500 text-white py-3 rounded-xl hover:bg-primary-600 font-semibold">
                                    Save Record
                                </button>
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DoctorVitalsPage() {
    return (
        <DashboardLayout role="doctor">
            <Suspense fallback={<div className="p-6">Loading...</div>}>
                <VitalsContent />
            </Suspense>
        </DashboardLayout>
    );
}
