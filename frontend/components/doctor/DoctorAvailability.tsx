'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorAvailability = () => {
    const [status, setStatus] = useState<'available' | 'busy' | 'offline'>('offline');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/doctors/profile`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus(response.data.currentStatus || 'offline');
        } catch (error) {
            console.error('Failed to fetch status');
        }
    };

    const updateStatus = async (newStatus: 'available' | 'busy' | 'offline') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/doctors/status`,
                {
                    isAvailable: newStatus === 'available',
                    currentStatus: newStatus
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus(newStatus);
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Availability Status</h3>
            <div className="flex space-x-4">
                <button
                    onClick={() => updateStatus('available')}
                    disabled={loading}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${status === 'available'
                        ? 'bg-green-100 text-green-800 border-2 border-green-500'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Available
                </button>
                <button
                    onClick={() => updateStatus('busy')}
                    disabled={loading}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${status === 'busy'
                        ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Busy
                </button>
                <button
                    onClick={() => updateStatus('offline')}
                    disabled={loading}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${status === 'offline'
                        ? 'bg-gray-200 text-gray-800 border-2 border-gray-500'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Offline
                </button>
            </div>
        </div>
    );
};

export default DoctorAvailability;
