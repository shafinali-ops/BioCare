'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getPatientById, getPatientConsultations } from '@/services/lhwService';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { toast } from 'react-toastify';

export default function PatientDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const patientId = params.id as string;

    const [patient, setPatient] = useState<any>(null);
    const [consultations, setConsultations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'consultations'>('overview');

    useEffect(() => {
        if (patientId) {
            fetchPatientDetails();
            fetchConsultations();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId]);

    const fetchPatientDetails = async () => {
        try {
            setLoading(true);
            const data = await getPatientById(patientId);
            setPatient(data.patient);
        } catch (error: any) {
            console.error('Error fetching patient:', error);
            toast.error('Failed to load patient details');
        } finally {
            setLoading(false);
        }
    };

    const fetchConsultations = async () => {
        try {
            const data = await getPatientConsultations(patientId);
            setConsultations(data.consultations || []);
        } catch (error) {
            console.error('Error fetching consultations:', error);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="lhw">
                <div className="p-6 flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading patient details...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!patient) {
        return (
            <DashboardLayout role="lhw">
                <div className="p-6">
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-600 mb-4">Patient not found</p>
                        <button
                            onClick={() => router.push('/dashboard/lhw/patients')}
                            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                        >
                            Back to Patients
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="lhw">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => router.push('/dashboard/lhw/patients')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-800">Patient Details</h1>
                            <p className="text-gray-600 mt-1">View and manage patient information</p>
                        </div>
                        <button
                            onClick={() => router.push(`/dashboard/lhw/start-consultation?patientId=${patientId}`)}
                            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Start Consultation
                        </button>
                    </div>
                </div>

                {/* Patient Profile Card */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 mb-6 text-white">
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                            {patient.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-2">{patient.name}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                    <p className="text-blue-100 text-sm">Age</p>
                                    <p className="text-xl font-semibold">{patient.age} years</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                    <p className="text-blue-100 text-sm">Gender</p>
                                    <p className="text-xl font-semibold capitalize">{patient.gender}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                    <p className="text-blue-100 text-sm">Email</p>
                                    <p className="text-xl font-semibold truncate">{patient.userId?.email || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`pb-3 px-4 font-semibold transition-colors border-b-2 ${activeTab === 'overview'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('consultations')}
                                className={`pb-3 px-4 font-semibold transition-colors border-b-2 ${activeTab === 'consultations'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Consultations ({consultations.length})
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                    👤
                                </span>
                                Personal Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between py-3 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">Full Name</span>
                                    <span className="text-gray-800 font-semibold">{patient.name}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">Age</span>
                                    <span className="text-gray-800 font-semibold">{patient.age} years</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">Gender</span>
                                    <span className="text-gray-800 font-semibold capitalize">{patient.gender}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">Email</span>
                                    <span className="text-gray-800 font-semibold">{patient.userId?.email || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="text-gray-600 font-medium">Registered On</span>
                                    <span className="text-gray-800 font-semibold">
                                        {new Date(patient.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    🔐
                                </span>
                                Account Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between py-3 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">User ID</span>
                                    <span className="text-gray-800 font-mono text-sm">{patient.userId?._id || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">Patient ID</span>
                                    <span className="text-gray-800 font-mono text-sm">{patient._id}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">Account Status</span>
                                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        Active
                                    </span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="text-gray-600 font-medium">Last Updated</span>
                                    <span className="text-gray-800 font-semibold">
                                        {new Date(patient.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    📊
                                </span>
                                Quick Stats
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                    <p className="text-blue-700 text-sm font-medium">Total Consultations</p>
                                    <p className="text-3xl font-bold text-blue-900 mt-2">{consultations.length}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                                    <p className="text-green-700 text-sm font-medium">Completed</p>
                                    <p className="text-3xl font-bold text-green-900 mt-2">
                                        {consultations.filter(c => c.consultation_status === 'COMPLETED').length}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                                    <p className="text-orange-700 text-sm font-medium">Pending</p>
                                    <p className="text-3xl font-bold text-orange-900 mt-2">
                                        {consultations.filter(c => c.consultation_status !== 'COMPLETED').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'consultations' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Consultation History</h3>
                        {consultations.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-600 mb-4">No consultations yet</p>
                                <button
                                    onClick={() => router.push(`/dashboard/lhw/start-consultation?patientId=${patientId}`)}
                                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                                >
                                    Start First Consultation
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {consultations.map((consultation) => (
                                    <div key={consultation._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-semibold text-gray-800">
                                                        Dr. {consultation.doctorId?.name || 'Unknown'}
                                                    </h4>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${consultation.consultation_status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                        consultation.consultation_status === 'READY' ? 'bg-primary-100 text-primary-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {consultation.consultation_status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    <strong>Symptoms:</strong> {consultation.symptoms?.join(', ') || 'None recorded'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Diagnosis:</strong> {consultation.diagnosis || 'Pending'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {new Date(consultation.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
