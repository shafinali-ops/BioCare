'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaSearch, FaCommentDots, FaUserMd } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Doctor {
    _id: string;
    userId?: {
        _id: string;
        id?: string;
    };
    name: string;
    specialization: string;
    hospital?: string;
    image?: string;
}

export default function PatientMessagesList() {
    const router = useRouter();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/doctors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctors(response.data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChatClick = (doctor: Doctor) => {
        // Use doctor's userId for messaging (not doctor._id which is the profile ID)
        const doctorUserId = doctor.userId?._id || doctor.userId?.id || doctor._id;
        router.push(`/dashboard/patient/chat?doctorId=${doctorUserId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Messages</h1>
                <p className="text-sm text-gray-600">Chat with your doctors</p>
            </div>

            {/* Search Bar */}
            <div className="mb-4 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text-dark"
                    placeholder="Search doctors by name or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border bg-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-sm"
                />
            </div>

            {/* Doctors List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                        <div
                            key={doctor._id}
                            onClick={() => handleChatClick(doctor)}
                            className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl group-hover:bg-purple-200 transition-colors">
                                    {doctor.image ? (
                                        <Image
                                            src={doctor.image}
                                            alt={doctor.name}
                                            width={48}
                                            height={48}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <FaUserMd className="text-purple-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors text-sm">
                                        Dr. {doctor.name}
                                    </h3>
                                    <p className="text-xs text-gray-500">{doctor.specialization}</p>
                                    {doctor.hospital && (
                                        <p className="text-[10px] text-gray-400 mt-0.5">{doctor.hospital}</p>
                                    )}
                                </div>
                                <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                                    <FaCommentDots className="text-gray-400 group-hover:text-purple-600 text-sm" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
                        <FaUserMd className="mx-auto text-3xl text-gray-300 mb-2" />
                        <p className="text-gray-500 text-sm">No doctors found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
