'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaPills, FaClock, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaBell } from 'react-icons/fa';
import { prescriptionService } from '@/services/prescriptionService';

const PatientPrescriptions = () => {
    const searchParams = useSearchParams();
    const consultationId = searchParams?.get('consultationId');

    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        fetchPrescriptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [consultationId]);

    const fetchPrescriptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = JSON.parse(atob(token!.split('.')[1])).id;

            let prescriptionsData;
            if (consultationId) {
                prescriptionsData = [await prescriptionService.getPrescriptionByConsultation(consultationId)];
            } else {
                prescriptionsData = await prescriptionService.getPrescriptionsByPatient(userId);
            }

            setPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : []);

            // Generate medication reminders
            generateNotifications(Array.isArray(prescriptionsData) ? prescriptionsData : []);
        } catch (error: any) {
            console.error('Error fetching prescriptions:', error);
            if (error.response?.status === 404) {
                setPrescriptions([]);
            } else {
                toast.error('Failed to fetch prescriptions');
            }
        } finally {
            setLoading(false);
        }
    };

    const generateNotifications = (prescriptions: any[]) => {
        const activeNotifications: any[] = [];
        const now = new Date();

        prescriptions
            .filter(p => p.status === 'active')
            .forEach(prescription => {
                prescription.medicines?.forEach((medicine: any) => {
                    const notification = {
                        id: `${prescription._id}-${medicine.medicine_name}`,
                        type: 'reminder',
                        message: `Time to take ${medicine.medicine_name} - ${medicine.dosage}`,
                        frequency: medicine.frequency,
                        prescription: prescription._id
                    };
                    activeNotifications.push(notification);
                });

                // Follow-up reminder
                if (prescription.follow_up_date) {
                    const followUpDate = new Date(prescription.follow_up_date);
                    const daysUntilFollowUp = Math.ceil((followUpDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                    if (daysUntilFollowUp <= 7 && daysUntilFollowUp > 0) {
                        activeNotifications.push({
                            id: `followup-${prescription._id}`,
                            type: 'follow-up',
                            message: `Follow-up appointment in ${daysUntilFollowUp} days`,
                            date: followUpDate.toLocaleDateString()
                        });
                    }
                }
            });

        setNotifications(activeNotifications);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'expired': return 'bg-gray-100 text-gray-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
                    <p className="text-gray-600 mt-1">View your prescriptions and medication reminders</p>
                </div>

                {/* Notifications Section */}
                {notifications.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-lg p-6 mb-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <FaBell className="text-2xl animate-pulse" />
                            <h2 className="text-xl font-bold">Medication Reminders</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {notifications.map((notification) => (
                                <div key={notification.id} className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        {notification.type === 'reminder' ? (
                                            <FaClock className="text-xl mt-1" />
                                        ) : (
                                            <FaExclamationTriangle className="text-xl mt-1" />
                                        )}
                                        <div>
                                            <p className="font-medium">{notification.message}</p>
                                            {notification.frequency && (
                                                <p className="text-sm opacity-90">Frequency: {notification.frequency}</p>
                                            )}
                                            {notification.date && (
                                                <p className="text-sm opacity-90">Date: {notification.date}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Prescriptions List */}
                <div className="space-y-6">
                    {prescriptions.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <FaPills className="mx-auto text-6xl text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Prescriptions Found</h3>
                            <p className="text-gray-500">Your prescriptions will appear here after consultations</p>
                        </div>
                    ) : (
                        prescriptions.map((prescription) => (
                            <div key={prescription._id} className="bg-white rounded-2xl shadow-lg p-6">
                                {/* Prescription Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            Prescription #{prescription._id.slice(-6).toUpperCase()}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt className="text-purple-600" />
                                                <span>{new Date(prescription.prescription_date).toLocaleDateString()}</span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                                                {prescription.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-700">Prescribed by</p>
                                        <p className="text-lg font-bold text-purple-600">
                                            Dr. {prescription.doctorId?.name || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {prescription.doctorId?.specialization || 'Specialist'}
                                        </p>
                                    </div>
                                </div>

                                {/* Medicines */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <FaPills className="text-purple-600" />
                                        Medications
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {prescription.medicines?.map((medicine: any, index: number) => (
                                            <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border-l-4 border-purple-500">
                                                <h5 className="font-bold text-gray-900 mb-2 text-lg">
                                                    {medicine.medicine_name}
                                                </h5>
                                                <div className="space-y-1 text-sm text-gray-700">
                                                    <p><span className="font-medium">Dosage:</span> {medicine.dosage}</p>
                                                    <p><span className="font-medium">Frequency:</span> {medicine.frequency}</p>
                                                    <p><span className="font-medium">Duration:</span> {medicine.duration}</p>
                                                    {medicine.instructions && (
                                                        <p className="mt-2 text-xs bg-white/50 p-2 rounded">
                                                            <span className="font-medium">Instructions:</span> {medicine.instructions}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* General Instructions */}
                                {prescription.instructions && (
                                    <div className="bg-yellow-50 rounded-xl p-4 mb-4 border-l-4 border-yellow-500">
                                        <h5 className="font-semibold text-gray-900 mb-2">General Instructions</h5>
                                        <p className="text-sm text-gray-700">{prescription.instructions}</p>
                                    </div>
                                )}

                                {/* Follow-up Date */}
                                {prescription.follow_up_date && (
                                    <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
                                        <div className="flex items-center gap-3">
                                            <FaCheckCircle className="text-blue-600 text-xl" />
                                            <div>
                                                <p className="font-semibold text-gray-900">Follow-up Appointment</p>
                                                <p className="text-sm text-gray-700">
                                                    Scheduled for: {new Date(prescription.follow_up_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientPrescriptions;
