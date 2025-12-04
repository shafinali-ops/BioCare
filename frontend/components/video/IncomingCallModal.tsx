'use client';

import React from 'react';
import { useVideoCall } from '../../contexts/VideoCallProvider';
import { FaPhone, FaPhoneSlash } from 'react-icons/fa';

const IncomingCallModal = () => {
    const { isReceivingCall, callAccepted, callerName, answerCall, rejectCall, call } = useVideoCall();

    if (!isReceivingCall || callAccepted) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <FaPhone className="text-blue-600 text-4xl" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">Incoming Call</h3>
                <p className="text-gray-600 mb-8">
                    <span className="font-semibold text-gray-900">{callerName}</span> is calling you...
                </p>

                <div className="flex justify-center space-x-8">
                    <button
                        onClick={rejectCall}
                        className="flex flex-col items-center space-y-2 group"
                    >
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                            <FaPhoneSlash className="text-red-600 text-xl" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Decline</span>
                    </button>

                    <button
                        onClick={answerCall}
                        className="flex flex-col items-center space-y-2 group"
                    >
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                            <FaPhone className="text-green-600 text-xl animate-bounce" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Accept</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;
