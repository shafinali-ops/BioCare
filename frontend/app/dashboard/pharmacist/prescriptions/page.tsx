'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { pharmacyService } from '@/services/pharmacyService';
import { toast } from 'react-toastify';

export default function PharmacistPrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const data = await pharmacyService.getAllPrescriptions();
            setPrescriptions(data);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            toast.error('Failed to load prescriptions');
        } finally {
            setLoading(false);
        }
    };

    const filteredPrescriptions = prescriptions.filter(prescription =>
        prescription.patientId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prescription.doctorId?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout role="pharmacist">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Prescriptions</h1>
                        <p className="text-gray-600 mt-1">View and manage patient prescriptions</p>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search patient or doctor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Patient</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Doctor</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Diagnosis</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredPrescriptions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-gray-500">
                                                No prescriptions found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPrescriptions.map((prescription) => (
                                            <tr key={prescription._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-6 text-gray-600">
                                                    {new Date(prescription.prescription_date).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-medium text-gray-900">{prescription.patientId?.name}</div>
                                                    <div className="text-sm text-gray-500">{prescription.patientId?.age} yrs, {prescription.patientId?.gender}</div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-medium text-gray-900">Dr. {prescription.doctorId?.name}</div>
                                                    <div className="text-sm text-gray-500">{prescription.doctorId?.specialization}</div>
                                                </td>
                                                <td className="py-4 px-6 text-gray-600">
                                                    {prescription.consultationId?.diagnosis || 'N/A'}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        prescription.status === 'dispensed' ? 'bg-primary-100 text-primary-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <button
                                                        onClick={() => setSelectedPrescription(selectedPrescription?._id === prescription._id ? null : prescription)}
                                                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
                                                    >
                                                        {selectedPrescription?._id === prescription._id ? 'Hide Details' : 'View Details'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Expanded Details View */}
                {selectedPrescription && (
                    <div className="mt-6 bg-white rounded-xl shadow-lg border border-primary-100 overflow-hidden animate-fade-in-up">
                        <div className="bg-primary-500 px-6 py-4 border-b border-primary-600 flex justify-between items-center">
                            <h3 className="font-bold text-white">
                                Prescription Details for {selectedPrescription.patientId?.name}
                            </h3>
                            <button
                                onClick={() => setSelectedPrescription(null)}
                                className="text-white hover:text-gray-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Medicines</h4>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {selectedPrescription.medicines.map((med: any, index: number) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-start justify-between mb-2">
                                                <span className="font-bold text-gray-800">{med.medicine_name}</span>
                                                <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">{med.frequency}</span>
                                            </div>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p><span className="font-medium">Dosage:</span> {med.dosage}</p>
                                                <p><span className="font-medium">Duration:</span> {med.duration}</p>
                                                {med.instructions && (
                                                    <p className="text-gray-500 italic mt-2">&quot;{med.instructions}&quot;</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedPrescription.instructions && (
                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                                    <h4 className="text-sm font-semibold text-yellow-800 mb-1">Doctor&apos;s Instructions</h4>
                                    <p className="text-yellow-900">{selectedPrescription.instructions}</p>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/prescriptions/${selectedPrescription._id}/download`, '_blank')}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download PDF
                                </button>
                                {selectedPrescription.status === 'active' && (
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                        onClick={() => toast.info('Dispense functionality coming soon!')}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Mark as Dispensed
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
