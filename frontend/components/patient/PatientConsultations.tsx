'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaVideo, FaComment, FaStethoscope, FaCalendarAlt, FaClock, FaBell } from 'react-icons/fa';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

const PatientConsultations = () => {
    console.log('🎨 PatientConsultations component rendering...');
    const router = useRouter();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🔄 useEffect triggered - fetching appointments');
        fetchAppointments();
    }, []);

    useEffect(() => {
        console.log('🔄 Setting up socket listeners');
        const cleanup = setupSocketListeners();
        return cleanup;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setupSocketListeners = () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (!token || !userStr) return;

        const user = JSON.parse(userStr);
        const socket = io(SOCKET_URL, { auth: { token } });

        socket.emit('join', `user:${user._id}`);

        // Listen for consultation reminders
        socket.on('consultation_reminder', (data) => {
            toast.info(`⏰ Your consultation with Dr. ${data.doctorName} starts in 5 minutes!`, {
                autoClose: 10000
            });
        });

        socket.on('consultation_started', (data) => {
            toast.success(`✅ Dr. ${data.doctorName} has started the consultation`);
            fetchAppointments();
        });

        return () => {
            socket.disconnect();
        };
    };

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            console.log('🔍 Fetching patient appointments...');

            const response = await axios.get(`${API_URL}/appointments/patient`, { headers });

            // Filter to show only approved/accepted appointments with doctors
            const approvedAppointments = response.data.filter(
                (apt: any) => (apt.status === 'approved' || apt.status === 'accepted') && apt.doctorId
            );

            console.log('✅ Approved appointments:', approvedAppointments);
            setAppointments(approvedAppointments);
        } catch (error: any) {
            console.error('❌ Error fetching appointments:', error);
            toast.error('Failed to load appointments');
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const isConsultationTime = (appointment: any) => {
        const now = new Date();
        const startTime = new Date(appointment.startTime);
        const endTime = new Date(appointment.endTime);

        // Allow joining 5 minutes before start time
        const fiveMinutesBefore = new Date(startTime.getTime() - 5 * 60000);

        return now >= fiveMinutesBefore && now <= endTime;
    };

    const getTimeUntilConsultation = (appointment: any) => {
        const now = new Date();
        const startTime = new Date(appointment.startTime);
        const diff = startTime.getTime() - now.getTime();

        if (diff < 0) return 'Started';

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `Starts in ${hours}h ${minutes % 60}m`;
        return `Starts in ${minutes}m`;
    };

    const handleStartConsultation = (appointment: any) => {
        // Relaxed time check for testing
        /*
        if (!isConsultationTime(appointment)) {
            toast.warning('Consultation time has not started yet');
            return;
        }
        */

        // Redirect to chat with doctor
        router.push(`/dashboard/patient/chat?doctorId=${appointment.doctorId._id}&appointmentId=${appointment._id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">My Consultations</h1>
                <p className="text-sm text-gray-600">View your upcoming consultations with doctors</p>
            </div>

            {/* Appointments List */}
            {appointments.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                    <FaStethoscope className="mx-auto text-4xl text-gray-300 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Approved Appointments</h3>
                    <p className="text-sm text-gray-500 mb-4">You don&apos;t have any approved appointments yet</p>
                    <button
                        onClick={() => router.push('/dashboard/patient/appointments')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm"
                    >
                        Book an Appointment
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {appointments.map((appointment) => {
                        const canStart = isConsultationTime(appointment);
                        const timeInfo = getTimeUntilConsultation(appointment);

                        return (
                            <div key={appointment._id} className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow border border-gray-100">
                                {/* Doctor Info */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl">
                                        👨‍⚕️
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-gray-900">
                                            Dr. {appointment.doctorId?.name || 'Unknown'}
                                        </h3>
                                        <p className="text-xs text-gray-600">
                                            {appointment.doctorId?.specialization || 'Specialist'}
                                        </p>
                                    </div>
                                </div>

                                {/* Appointment Details */}
                                <div className="space-y-2 mb-3">
                                    <div className="bg-blue-50 p-2 rounded-lg">
                                        <div className="flex items-center gap-2 text-xs text-blue-800">
                                            <FaCalendarAlt />
                                            <span className="font-medium">
                                                {new Date(appointment.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 p-2 rounded-lg">
                                        <div className="flex items-center gap-2 text-xs text-purple-800">
                                            <FaClock />
                                            <span className="font-medium">
                                                {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {' - '}
                                                {new Date(appointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    {!canStart && (
                                        <div className="bg-yellow-50 p-2 rounded-lg">
                                            <div className="flex items-center gap-2 text-xs text-yellow-800">
                                                <FaBell />
                                                <span className="font-medium">{timeInfo}</span>
                                            </div>
                                        </div>
                                    )}

                                    {canStart && (
                                        <div className="bg-green-50 p-2 rounded-lg">
                                            <div className="flex items-center gap-2 text-xs text-green-800">
                                                <FaBell className="animate-pulse" />
                                                <span className="font-bold">Consultation is ready!</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleStartConsultation(appointment)}
                                        disabled={!canStart}
                                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${canStart
                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        <FaComment />
                                        {canStart ? 'Start Consultation' : 'Not Started Yet'}
                                    </button>

                                    {canStart && (
                                        <button
                                            onClick={() => router.push(`/dashboard/patient/video-call?doctorId=${appointment.doctorId._id}`)}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                                        >
                                            <FaVideo />
                                            Video Call
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PatientConsultations;
