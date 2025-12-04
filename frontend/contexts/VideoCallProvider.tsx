"use client";

import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { socketService } from '../services/socket';
import Peer from 'simple-peer';
import { toast } from 'react-toastify';

interface VideoCallContextType {
    callAccepted: boolean;
    callEnded: boolean;
    stream: MediaStream | undefined;
    remoteStream: MediaStream | undefined;
    name: string;
    setName: (name: string) => void;
    call: any;
    me: string;
    callUser: (id: string, name: string) => void;
    leaveCall: () => void;
    answerCall: () => void;
    rejectCall: () => void;
    isReceivingCall: boolean;
    callerName: string;
    callerId: string;
    myVideo: React.RefObject<HTMLVideoElement>;
    userVideo: React.RefObject<HTMLVideoElement>;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    toggleVideo: () => void;
    toggleAudio: () => void;
    isCalling: boolean;
}

const VideoCallContext = createContext<VideoCallContextType>({} as VideoCallContextType);

export const VideoCallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [stream, setStream] = useState<MediaStream>();
    const [remoteStream, setRemoteStream] = useState<MediaStream>();
    const [name, setName] = useState('');
    const [call, setCall] = useState<any>({});
    const [me, setMe] = useState('');
    const [isReceivingCall, setIsReceivingCall] = useState(false);
    const [callerName, setCallerName] = useState('');
    const [callerId, setCallerId] = useState('');
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isCalling, setIsCalling] = useState(false);

    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<Peer.Instance>();
    const socket = socketService.getSocket();
    const pathname = usePathname();

    // Audio refs for ringtones
    const incomingRingRef = useRef<HTMLAudioElement | null>(null);
    const outgoingRingRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio objects
    useEffect(() => {
        incomingRingRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/1354/1354-preview.mp3'); // Pleasant digital ringtone
        incomingRingRef.current.loop = true;

        outgoingRingRef.current = new Audio('https://upload.wikimedia.org/wikipedia/commons/c/cd/US_ringback_tone.ogg'); // Standard ringback tone
        outgoingRingRef.current.loop = true;
    }, []);

    // Handle incoming call ringtone
    useEffect(() => {
        if (isReceivingCall && !callAccepted) {
            incomingRingRef.current?.play().catch(e => console.error("Error playing incoming ringtone:", e));
        } else {
            incomingRingRef.current?.pause();
            if (incomingRingRef.current) incomingRingRef.current.currentTime = 0;
        }
    }, [isReceivingCall, callAccepted]);

    // Handle outgoing call ringtone
    useEffect(() => {
        if (isCalling && !callAccepted) {
            outgoingRingRef.current?.play().catch(e => console.error("Error playing outgoing ringtone:", e));
        } else {
            outgoingRingRef.current?.pause();
            if (outgoingRingRef.current) outgoingRingRef.current.currentTime = 0;
        }
    }, [isCalling, callAccepted]);

    useEffect(() => {
        // Register user whenever path changes (e.g. after login)
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr || '{}');
            const userId = user.id || user._id;

            console.log('Path changed to:', pathname);
            console.log('Checking registration. User ID:', userId, 'Socket Connected:', socket.connected);

            if (userId && socket.connected) {
                console.log('Registering user with socket (Path Change):', user.name);
                socket.emit('user-join', {
                    userId: userId,
                    role: user.role,
                    name: user.name
                });
            }
        }
    }, [pathname, socket]);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Socket Connected!');
            toast.success('Connected to Signaling Server');

            // Also try to register on connect
            if (typeof window !== 'undefined') {
                const userStr = localStorage.getItem('user');
                const user = JSON.parse(userStr || '{}');
                const userId = user.id || user._id;

                if (userId) {
                    console.log('Registering user with socket (On Connect):', user.name);
                    socket.emit('user-join', {
                        userId: userId,
                        role: user.role,
                        name: user.name
                    });
                }
            }
        });

        return () => {
            socket.off('connect');
        };
    }, [socket]);

    useEffect(() => {
        // Check if mediaDevices is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('❌ navigator.mediaDevices.getUserMedia is not supported in this browser or context (likely due to insecure origin http://ip:port)');
            toast.error('Video calls require HTTPS or localhost. Camera access is blocked by the browser on this connection.', {
                autoClose: 10000,
                position: 'top-center'
            });
            return;
        }

        // Get user media
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                console.log('✅ Camera and microphone access granted');
                console.log('   Stream tracks:', currentStream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }
            })
            .catch(err => {
                console.error('❌ Error accessing media devices:', err);
                console.error('   Error name:', err.name);
                console.error('   Error message:', err.message);

                if (err.name === 'NotReadableError') {
                    toast.error('Camera is in use by another app. Please close other apps/tabs using the camera and refresh this page.', {
                        autoClose: 10000,
                        position: 'top-center'
                    });
                } else if (err.name === 'NotAllowedError') {
                    toast.error('Camera permission denied. Please allow camera access in your browser settings and refresh.', {
                        autoClose: 10000,
                        position: 'top-center'
                    });
                } else if (err.name === 'NotFoundError') {
                    toast.error('No camera or microphone found. Please connect a camera and refresh.', {
                        autoClose: 10000,
                        position: 'top-center'
                    });
                } else {
                    toast.error(`Failed to access camera: ${err.message}. Please check your camera and refresh.`, {
                        autoClose: 10000,
                        position: 'top-center'
                    });
                }
            });

        socket.on('me', (id: string) => setMe(id));

        socket.on('call-made', ({ offer, callerId, callerName: name, callType, roomId }: any) => {
            setIsReceivingCall(true);
            setCallerName(name);
            setCallerId(callerId);
            setCall({ isReceivingCall: true, from: callerId, name, signal: offer, callType, roomId });
        });

        socket.on('call-ended', () => {
            setCallEnded(true);
            connectionRef.current?.destroy();
            window.location.reload(); // Simple way to reset state
        });

        return () => {
            socket.off('call-made');
            socket.off('call-ended');
        };
    }, []);

    const answerCall = () => {
        console.log('📞 Answering call...');
        console.log('   Local stream available:', !!stream);
        console.log('   Stream tracks:', stream?.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));

        setCallAccepted(true);
        setIsReceivingCall(false);

        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on('signal', (data: any) => {
            console.log('📡 Sending answer signal to:', call.from);
            socket.emit('make-answer', { answer: data, to: call.from });
        });

        peer.on('stream', (currentStream: MediaStream) => {
            console.log('📹 Received remote stream (answering call)');
            console.log('   Remote stream tracks:', currentStream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));
            setRemoteStream(currentStream);
            if (userVideo.current) {
                console.log('   ✅ Attaching remote stream to userVideo.current');
                userVideo.current.srcObject = currentStream;
            } else {
                console.log('   ❌ userVideo.current is null!');
            }
        });

        peer.signal(call.signal);

        connectionRef.current = peer;
    };

    const callUser = (id: string, name: string) => {
        console.log('📞 Initiating call to:', id, name);
        console.log('   Local stream available:', !!stream);
        console.log('   Stream tracks:', stream?.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));

        // Validate stream before calling
        if (!stream) {
            console.error('❌ Cannot call: No camera/microphone stream available');
            toast.error('Cannot start call: Camera not available. Please allow camera access and refresh the page.', {
                autoClose: 8000,
                position: 'top-center'
            });
            return;
        }

        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();

        if (videoTracks.length === 0 && audioTracks.length === 0) {
            console.error('❌ Cannot call: No video or audio tracks in stream');
            toast.error('Cannot start call: No camera or microphone detected. Please check your devices.', {
                autoClose: 8000,
                position: 'top-center'
            });
            return;
        }

        setIsCalling(true); // Set calling state
        const peer = new Peer({ initiator: true, trickle: false, stream });

        peer.on('signal', (data: any) => {
            console.log('📡 Sending call offer to:', id);
            socket.emit('call-user', {
                userToCall: id,
                offer: data,
                callerId: me,
                callerName: name,
                callType: 'video'
            });
        });

        peer.on('stream', (currentStream: MediaStream) => {
            console.log('📹 Received remote stream (calling)');
            console.log('   Remote stream tracks:', currentStream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));
            setRemoteStream(currentStream);
            if (userVideo.current) {
                console.log('   ✅ Attaching remote stream to userVideo.current');
                userVideo.current.srcObject = currentStream;
            } else {
                console.log('   ❌ userVideo.current is null!');
            }
        });

        socket.on('answer-made', ({ answer }: any) => {
            console.log('📡 Received answer, call accepted!');
            setCallAccepted(true);
            setIsCalling(false); // Call accepted, no longer just "calling"
            peer.signal(answer);
        });

        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        setIsCalling(false);
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        socket.emit('end-call', { to: call.from || callerId });
        window.location.reload();
    };

    const rejectCall = () => {
        setIsReceivingCall(false);
        socket.emit('reject-call', { to: call.from });
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length > 0) {
                videoTracks[0].enabled = !videoTracks[0].enabled;
                setIsVideoEnabled(videoTracks[0].enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (stream) {
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length > 0) {
                audioTracks[0].enabled = !audioTracks[0].enabled;
                setIsAudioEnabled(audioTracks[0].enabled);
            }
        }
    };

    return (
        <VideoCallContext.Provider value={{
            call,
            callAccepted,
            myVideo,
            userVideo,
            stream,
            remoteStream,
            name,
            setName,
            callEnded,
            me,
            callUser,
            leaveCall,
            answerCall,
            rejectCall,
            isReceivingCall,
            callerName,
            callerId,
            isVideoEnabled,
            isAudioEnabled,
            toggleVideo,
            toggleAudio,
            isCalling // Expose isCalling
        }}>
            {children}
        </VideoCallContext.Provider>
    );
};

export const useVideoCall = () => useContext(VideoCallContext);
