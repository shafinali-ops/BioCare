'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaVideo, FaComment, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

const PatientAppointments = () => {
    const router = useRouter();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [appointmentData, setAppointmentData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        reason: ''
    });
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

    useEffect(() => {
        fetchData();
        setupSocketListeners();

        return () => {
            const socket = io(SOCKET_URL);
            socket.off('appointment_approved');
            socket.off('appointment_rejected');
            socket.off('appointment_rescheduled');
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            console.log('🔍 Fetching patient appointments and doctors...');

            const [appointmentsRes, doctorsRes] = await Promise.all([
                axios.get(`${API_URL}/appointments/patient`, { headers }),
                axios.get(`${API_URL}/doctors`, { headers })
            ]);

            console.log('✅ Appointments:', appointmentsRes.data);
            console.log('✅ Doctors:', doctorsRes.data);

            const approvedDoctors = doctorsRes.data.filter((d: any) => d.status === 'approved');
            console.log(`Found ${approvedDoctors.length} approved doctors`);

            setAppointments(appointmentsRes.data);
            setDoctors(approvedDoctors);
        } catch (error: any) {
            console.error('❌ Error fetching data:', error);
            toast.error('Failed to fetch data: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const setupSocketListeners = () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (!token || !userStr) return;

        const user = JSON.parse(userStr);
        const socket = io(SOCKET_URL, {
            auth: { token }
        });

        socket.emit('join', `user:${user._id}`);

        socket.on('appointment_approved', (data) => {
            console.log('✅ Appointment approved:', data);
            toast.success(data.message || 'Your appointment has been approved!');
            fetchData();
        });

        socket.on('appointment_rejected', (data) => {
            console.log('❌ Appointment rejected:', data);
            toast.error(data.message || 'Your appointment has been rejected');
            fetchData();
        });

        socket.on('appointment_rescheduled', (data) => {
            console.log('📅 Appointment rescheduled:', data);
            toast.info(data.message || 'Your appointment has been rescheduled');
            fetchData();
        });

        socket.on('consultation_started', (data) => {
            console.log('🏥 Consultation started:', data);
            toast.info(data.message || 'Your consultation has started');
        });

        socket.on('consultation_completed', (data) => {
            console.log('✅ Consultation completed:', data);
            toast.success(data.message || 'Your consultation has been completed');
        });

        socket.on('prescription_created', (data) => {
            console.log('💊 Prescription created:', data);
            toast.success(data.message || 'A new prescription has been created for you');
        });
    };

    const handleBookAppointment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDoctorId || !appointmentData.date || !appointmentData.startTime || !appointmentData.endTime || !appointmentData.reason) {
            toast.error('Please fill all required fields including reason for visit');
            return;
        }

        // Validate end time is after start time
        if (appointmentData.endTime <= appointmentData.startTime) {
            toast.error('End time must be after start time');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            console.log('📅 Booking appointment...');
            console.log('Doctor ID:', selectedDoctorId);
            console.log('Date:', appointmentData.date);
            console.log('Start Time:', appointmentData.startTime);
            console.log('End Time:', appointmentData.endTime);

            const response = await axios.post(
                `${API_URL}/appointments`,
                {
                    doctorId: selectedDoctorId,
                    date: appointmentData.date,
                    time: appointmentData.startTime,
                    startTime: `${appointmentData.date}T${appointmentData.startTime}`,
                    endTime: `${appointmentData.date}T${appointmentData.endTime}`,
                    reason_for_visit: appointmentData.reason
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('✅ Appointment booked:', response.data);
            toast.success('Appointment booked successfully!');
            setAppointmentData({ date: '', startTime: '', endTime: '', reason: '' });
            setSelectedDoctorId('');
            fetchData();
        } catch (error: any) {
            console.error('❌ Error booking appointment:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to book appointment');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted':
            case 'approved': return 'bg-green-100 text-green-700';
            case 'scheduled':
            case 'pending': return 'bg-purple-100 text-purple-700';
            case 'completed': return 'bg-gray-100 text-gray-700';
            case 'cancelled':
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const selectedDoctor = doctors.find(d => d._id === selectedDoctorId);

    const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (activeTab === 'upcoming') {
            return aptDate >= today && apt.status !== 'completed' && apt.status !== 'cancelled';
        } else {
            return aptDate < today || apt.status === 'completed' || apt.status === 'cancelled';
        }
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-50 min-h-screen font-sans">
            <div className="mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                        <p className="text-sm text-gray-500">Manage your doctor visits</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left Column: Book Appointment */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Book Appointment</h2>

                            <form onSubmit={handleBookAppointment} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                                        Select Doctor <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedDoctorId}
                                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm"
                                        required
                                    >
                                        <option value="">-- Select a Doctor --</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor._id} value={doctor._id}>
                                                Dr. {doctor.name} - {doctor.specialization}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedDoctor && (
                                    <div className="bg-purple-50 rounded-xl p-3 flex items-center gap-3 border border-purple-100">
                                        <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 text-lg flex-shrink-0">
                                            👨‍⚕️
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">Dr. {selectedDoctor.name}</h4>
                                            <p className="text-xs text-gray-500">{selectedDoctor.specialization}</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={appointmentData.date}
                                        onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm"
                                        required
                                    />
                                </div>

                                {/* Doctor Availability Display */}
                                {selectedDoctor && selectedDoctor.availability && selectedDoctor.availability.length > 0 && (
                                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                        <h4 className="text-xs font-bold text-blue-900 uppercase mb-2">Doctor&apos;s Available Hours</h4>
                                        <div className="space-y-1">
                                            {selectedDoctor.availability.map((slot: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs">
                                                    <FaClock className="text-blue-600" />
                                                    <span className="font-semibold text-blue-900">
                                                        {slot.from} - {slot.to}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-blue-700 mt-2 italic">
                                            ℹ️ You can book any time within these hours
                                        </p>
                                    </div>
                                )}

                                {/* Custom Time Selection */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                                            From Time <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            value={appointmentData.startTime}
                                            onChange={(e) => setAppointmentData({ ...appointmentData, startTime: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                                            To Time <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            value={appointmentData.endTime}
                                            onChange={(e) => setAppointmentData({ ...appointmentData, endTime: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Time Validation Warning */}
                                {appointmentData.startTime && appointmentData.endTime && (
                                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-xl">
                                        <span className="font-semibold">Selected Time:</span> {appointmentData.startTime} - {appointmentData.endTime}
                                        {appointmentData.endTime <= appointmentData.startTime && (
                                            <p className="text-red-600 mt-1">⚠️ End time must be after start time</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                                        Reason for Visit <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={appointmentData.reason}
                                        onChange={(e) => setAppointmentData({ ...appointmentData, reason: e.target.value })}
                                        placeholder="e.g., fever, cough, regular checkup..."
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm resize-none"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all shadow-lg font-bold text-sm"
                                >
                                    Confirm Booking
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Appointments List */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 min-h-[400px]">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                                <h2 className="text-lg font-bold text-gray-900">My Appointments</h2>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setActiveTab('upcoming')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'upcoming'
                                            ? 'bg-purple-100 text-purple-700 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Upcoming
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('history')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'history'
                                            ? 'bg-purple-100 text-purple-700 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        History
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {filteredAppointments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FaCalendarAlt className="text-gray-300 text-xl" />
                                        </div>
                                        <p className="text-gray-500 text-sm">No {activeTab} appointments found</p>
                                    </div>
                                ) : (
                                    filteredAppointments.map((apt) => {
                                        const date = new Date(apt.date);
                                        const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
                                        const day = date.getDate();

                                        return (
                                            <div key={apt._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:shadow-md transition-all bg-white group">
                                                <div className="flex-shrink-0 w-14 h-14 bg-purple-50 rounded-xl flex flex-col items-center justify-center text-purple-800">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">{month}</span>
                                                    <span className="text-lg font-bold leading-none">{day}</span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-900 text-sm truncate">
                                                        Dr. {apt.doctorId?.name || 'Unknown Doctor'}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 truncate mb-1">
                                                        {apt.doctorId?.specialization || 'General'}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <FaClock className="text-purple-400" />
                                                        <span>{apt.time}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(apt.status)}`}>
                                                        {apt.status}
                                                    </span>

                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => router.push(`/dashboard/patient/chat?doctorId=${apt.doctorId?._id}`)}
                                                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                            title="Message"
                                                        >
                                                            <FaComment />
                                                        </button>
                                                        {(apt.status === 'accepted' || apt.status === 'approved') && (
                                                            <button
                                                                onClick={() => router.push(`/dashboard/patient/video-call?doctorId=${apt.doctorId?._id}`)}
                                                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Video Call"
                                                            >
                                                                <FaVideo />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientAppointments;
