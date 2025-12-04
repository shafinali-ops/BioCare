'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaTrash, FaPaperPlane } from 'react-icons/fa';

interface VoiceRecorderProps {
    onSend: (audioBlob: Blob) => void;
    disabled?: boolean;
}

export default function VoiceRecorder({ onSend, disabled }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioURL, setAudioURL] = useState<string>('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (audioURL) {
                URL.revokeObjectURL(audioURL);
            }
        };
    }, [audioURL]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setRecordedBlob(blob);
                const url = URL.createObjectURL(blob);
                setAudioURL(url);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const cancelRecording = () => {
        if (isRecording) {
            stopRecording();
        }

        setRecordedBlob(null);
        setRecordingTime(0);

        if (audioURL) {
            URL.revokeObjectURL(audioURL);
            setAudioURL('');
        }
    };

    const sendRecording = () => {
        if (recordedBlob) {
            onSend(recordedBlob);
            cancelRecording();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (recordedBlob) {
        return (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🎤</span>
                        <span className="text-sm font-medium text-gray-900">
                            Voice Message ({formatTime(recordingTime)})
                        </span>
                    </div>
                    <audio src={audioURL} controls className="w-full h-8" />
                </div>
                <button
                    onClick={cancelRecording}
                    className="p-2 text-red-500 hover:text-red-700 transition"
                    title="Delete recording"
                >
                    <FaTrash />
                </button>
                <button
                    onClick={sendRecording}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    title="Send voice message"
                    disabled={disabled}
                >
                    <FaPaperPlane />
                </button>
            </div>
        );
    }

    if (isRecording) {
        return (
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg animate-pulse">
                <div className="flex items-center gap-2 flex-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900">
                        Recording... {formatTime(recordingTime)}
                    </span>
                </div>
                <button
                    onClick={stopRecording}
                    className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                    title="Stop recording"
                >
                    <FaStop />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={startRecording}
            disabled={disabled}
            className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Record voice message"
        >
            <FaMicrophone />
        </button>
    );
}
