'use client';

import React, { useState } from 'react';
import { useVideoCall } from '../../contexts/VideoCallProvider';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaNotesMedical } from 'react-icons/fa';
import ConsultationForm from '@/components/consultation/ConsultationForm';

const VideoCallWindow = () => {
    const {
        callAccepted,
        callEnded,
        leaveCall,
        userVideo,
        myVideo,
        stream,
        remoteStream,
        call,
        isVideoEnabled,
        isAudioEnabled,
        toggleVideo,
        toggleAudio,
        isCalling
    } = useVideoCall();

    const [showConsultation, setShowConsultation] = useState(false);

    // Force attach local stream to video element when window opens
    React.useEffect(() => {
        if (myVideo.current && stream) {
            myVideo.current.srcObject = stream;
        }
    }, [myVideo, stream, isCalling, callAccepted]);

    // Force attach remote stream to video element when it becomes available
    // Force attach remote stream to video element when it becomes available
    React.useEffect(() => {
        if (userVideo.current && remoteStream) {
            userVideo.current.srcObject = remoteStream;
        }
    }, [userVideo, remoteStream, callAccepted]);



    if (!callAccepted && !callEnded && !isCalling) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col">
            <div className="flex-1 flex relative">
                {/* Main Video Area (Remote) */}
                <div className="flex-1 bg-black relative flex items-center justify-center">
                    {/* Always render video element so ref is available */}
                    <video
                        playsInline
                        ref={userVideo}
                        autoPlay
                        className="w-full h-full object-contain"
                        style={{ display: callAccepted && !callEnded ? 'block' : 'none' }}
                    />

                    {/* Calling overlay */}
                    {isCalling && !callAccepted && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900 bg-opacity-90">
                            <div className="text-center">
                                <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <h3 className="text-white text-xl font-semibold">Calling...</h3>
                                <p className="text-gray-400 mt-2">Waiting for answer</p>
                            </div>
                        </div>
                    )}

                    {/* Debug info overlay */}
                    {callAccepted && !callEnded && !remoteStream && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900 bg-opacity-90">
                            <div className="text-center text-white">
                                <div className="text-4xl mb-4">📹</div>
                                <p className="text-lg">Waiting for remote video...</p>
                                <p className="text-sm text-gray-400 mt-2">Stream connecting...</p>
                            </div>
                        </div>
                    )}

                    {/* Local Video (PIP) */}
                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg z-20">
                        {stream ? (
                            <video
                                playsInline
                                muted
                                ref={myVideo}
                                autoPlay
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-xs text-center p-2">
                                Camera Off / Loading...
                            </div>
                        )}
                    </div>
                </div>

                {/* Consultation Sidebar */}
                {showConsultation && (
                    <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
                        <div className="p-4">
                            <h2 className="text-xl font-bold mb-4">Consultation Notes</h2>
                            {call.appointmentId ? (
                                <ConsultationForm appointmentId={call.appointmentId} />
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 mb-4">
                                        Consultations must be linked to a completed appointment.
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Please complete an appointment first, then create the consultation from the appointment details page.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <div className="h-20 bg-gray-800 flex items-center justify-center space-x-6">
                <button
                    onClick={toggleAudio}
                    className={`p-4 rounded-full ${isAudioEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
                >
                    {isAudioEnabled ? <FaMicrophone size={24} /> : <FaMicrophoneSlash size={24} />}
                </button>

                <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full ${isVideoEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
                >
                    {isVideoEnabled ? <FaVideo size={24} /> : <FaVideoSlash size={24} />}
                </button>

                <button
                    onClick={leaveCall}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                    <FaPhoneSlash size={24} />
                </button>

                <button
                    onClick={() => setShowConsultation(!showConsultation)}
                    className={`p-4 rounded-full ${showConsultation ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'} text-white transition-colors`}
                >
                    <FaNotesMedical size={24} />
                </button>
            </div>
        </div>
    );
};

export default VideoCallWindow;
