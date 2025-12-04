'use client';

import React, { useState, useEffect } from 'react';
import { useVideoCall } from '@/contexts/VideoCallProvider';
import { FaVideo, FaSearch, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Doctor {
    _id: string;
    userId: {
        _id: string;
        name: string;
    } | string;
    name: string;
    specialization: string;
    hospital?: string;
    socketId?: string;
    isOnline?: boolean;
}

export default function PatientCallInterface() {
    const { callUser, me } = useVideoCall();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        fetchDoctors();
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            setUserName(user.name || 'Patient');
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/doctors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctors(response.data.filter((d: any) => d.status === 'approved'));
        } catch (error) {
            toast.error('Failed to fetch doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleCallDoctor = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setShowModal(true);
    };

    const confirmCall = () => {
        if (!selectedDoctor) return;

        // Use the User ID for calling, as that's what's registered in the socket
        const doctorUserId = typeof selectedDoctor.userId === 'object'
            ? selectedDoctor.userId._id
            : selectedDoctor.userId || selectedDoctor._id;

        console.log('Calling Doctor:', selectedDoctor.name);
        console.log('Doctor ID:', selectedDoctor._id);
        console.log('Doctor User ID (Target):', doctorUserId);

        callUser(doctorUserId, userName);
        toast.success(`Calling Dr. ${selectedDoctor.name}...`);
        setShowModal(false);
    };

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h2 className="text-xl font-bold text-gray-900 mb-1">Video Call Doctors</h2>
                <p className="text-sm text-gray-500">Select a doctor to start a video call</p>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search doctors by name or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm"
                />
            </div>

            {/* Doctor List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredDoctors.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No doctors found
                    </div>
                ) : (
                    filteredDoctors.map(doctor => (
                        <div
                            key={doctor._id}
                            className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-base">
                                    👨‍⚕️
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Dr. {doctor.name}</h4>
                                    <p className="text-xs text-gray-500">{doctor.specialization}</p>
                                    {doctor.hospital && (
                                        <p className="text-[10px] text-gray-400">🏥 {doctor.hospital}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleCallDoctor(doctor)}
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
            {showModal && selectedDoctor && (
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
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                                    👨‍⚕️
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Dr. {selectedDoctor.name}</h4>
                                    <p className="text-xs text-gray-500">{selectedDoctor.specialization}</p>
                                    {selectedDoctor.hospital && (
                                        <p className="text-[10px] text-gray-400 mt-0.5">🏥 {selectedDoctor.hospital}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4">
                            Are you sure you want to start a video call with <span className="font-bold">Dr. {selectedDoctor.name}</span>?
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
