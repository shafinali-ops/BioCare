'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyPatients, searchPatients } from '@/services/lhwService';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function LHWPatientsPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const data = await getMyPatients();
            setPatients(data.patients || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            fetchPatients();
            return;
        }

        try {
            setSearching(true);
            const data = await searchPatients(query);
            setPatients(data.patients || []);
        } catch (error) {
            console.error('Error searching patients:', error);
        } finally {
            setSearching(false);
        }
    };

    return (
        <DashboardLayout role="lhw">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">All Patients</h1>
                    <p className="text-gray-600">View and manage all registered patients</p>
                </div>

                {/* Search and Actions */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search by name..."
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg
                            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={fetchPatients}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/lhw/register-patient')}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Register New Patient
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                        <p className="text-blue-700 text-sm font-medium">Total Patients</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">{patients.length}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-700 text-sm font-medium">Active Patients</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">{patients.length}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-purple-700 text-sm font-medium">Registered Today</p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                            {patients.filter(p => new Date(p.createdAt).toDateString() === new Date().toDateString()).length}
                        </p>
                    </div>
                </div>

                {/* Patients Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading || searching ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">{searching ? 'Searching...' : 'Loading patients...'}</p>
                        </div>
                    ) : patients.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-gray-600 mb-4">
                                {searchQuery ? 'No patients found matching your search' : 'No patients registered yet'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => router.push('/dashboard/lhw/register-patient')}
                                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Register First Patient
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Age</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Gender</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Registered</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map((patient, index) => (
                                        <tr key={patient._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {patient.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-800">{patient.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{patient.age}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${patient.gender === 'male' ? 'bg-primary-100 text-primary-800' :
                                                    patient.gender === 'female' ? 'bg-pink-100 text-pink-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {patient.gender}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{patient.userId?.email || 'N/A'}</td>
                                            <td className="py-3 px-4 text-gray-600 text-sm">
                                                {new Date(patient.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => router.push(`/dashboard/lhw/patients/${patient._id}`)}
                                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/dashboard/lhw/start-consultation?patientId=${patient._id}`)}
                                                        className="text-green-600 hover:text-green-700 font-medium text-sm"
                                                    >
                                                        Consult
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination Info */}
                {patients.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600 text-center">
                        Showing {patients.length} patient{patients.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
