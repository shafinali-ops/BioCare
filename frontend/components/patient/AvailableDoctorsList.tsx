'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useVideoCall } from '../../contexts/VideoCallProvider';
import { FaVideo } from 'react-icons/fa';

const AvailableDoctorsList = () => {
    const [doctors, setDoctors] = useState<any[]>([]);
    const { callUser } = useVideoCall();

    useEffect(() => {
        fetchAvailableDoctors();
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchAvailableDoctors, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchAvailableDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/doctors/available`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDoctors(response.data);
        } catch (error) {
            console.error('Failed to fetch doctors');
        }
    };

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Available Doctors</h3>
            <div className="space-y-4">
                {doctors.length > 0 ? (
                    doctors.map((doctor) => (
                        <div key={doctor._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-lg">
                                    👨‍⚕️
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">{doctor.name}</h4>
                                    <p className="text-xs text-gray-500">{doctor.specialization}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => callUser(doctor.userId, doctor.name)}
                                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                                title="Start Video Call"
                            >
                                <FaVideo size={14} />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No doctors currently available</p>
                )}
            </div>
        </div>
    );
};

export default AvailableDoctorsList;
