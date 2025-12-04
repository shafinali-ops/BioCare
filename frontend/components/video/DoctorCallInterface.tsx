'use client';

import React, { useState, useEffect } from 'react';
import { useVideoCall } from '@/contexts/VideoCallProvider';
import { FaVideo, FaPhone, FaSearch, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Patient {
    _id: string;
    name: string;
    userId: {
        _id: string;
        email: string;
    };
    email: string;
    age?: number;
    gender?: string;
    socketId?: string;
    isOnline?: boolean;
}

export default function DoctorCallInterface() {
    const { callUser, me } = useVideoCall();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [userName, setUserName] = useState('');
    const searchParams = useSearchParams();

    useEffect(() => {
        fetchPatients();
        fetchUserInfo();
    }, []);

    useEffect(() => {
        const urlPatientId = searchParams.get('patientId');
        if (urlPatientId && patients.length > 0) {
            const patient = patients.find(p => p.userId._id === urlPatientId);
            if (patient) {
                handleCallPatient(patient);
            }
        }
    }, [searchParams, patients]);

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/doctors/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserName(response.data.name || 'Doctor');
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/doctors/patients`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(response.data);
        } catch (error) {
            toast.error('Failed to fetch patients');
        } finally {
            setLoading(false);
        }
    };

    const handleCallPatient = (patient: Patient) => {
        setSelectedPatient(patient);
        setShowModal(true);
    };

    const confirmCall = () => {
        if (!selectedPatient) return;

        // Use the User ID for socket communication
        const patientSocketId = typeof selectedPatient.userId === 'object'
            ? selectedPatient.userId._id
            : selectedPatient.userId || selectedPatient._id;

        if (!patientSocketId) {
            toast.error('Cannot call patient: Missing User ID');
            return;
        }

        console.log('Calling Patient:', selectedPatient.name);
        console.log('Patient User ID (Target):', patientSocketId);

        callUser(patientSocketId, userName);
        toast.success(`Calling ${selectedPatient.name}...`);
        setShowModal(false);
    };

    const filteredPatients = patients.filter(patient =>
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Video Call Patients</h2>
                <p className="text-sm text-gray-500">Select a patient to start a video call</p>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search patients by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                />
            </div>

            {/* Patient List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPatients.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No patients found
                    </div>
                ) : (
                    filteredPatients.map(patient => (
                        <div
                            key={patient._id}
                            className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-base">
                                    {patient.name[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{patient.name}</h4>
                                    <p className="text-xs text-gray-500">{patient.email}</p>
                                    {patient.age && patient.gender && (
                                        <p className="text-xs text-gray-400">{patient.age} yrs • {patient.gender}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleCallPatient(patient)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm text-sm"
                            >
                                <FaVideo />
                                <span className="hidden sm:inline">Call</span>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Confirmation Modal */}
            {showModal && selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Start Video Call</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="mb-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-lg">
                                    {selectedPatient.name[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{selectedPatient.name}</h4>
                                    <p className="text-xs text-gray-500">{selectedPatient.email}</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4">
                            Are you sure you want to start a video call with <span className="font-bold">{selectedPatient.name}</span>?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmCall}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-semibold flex items-center justify-center gap-2 text-sm"
                            >
                                <FaVideo />
                                Start Call
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
