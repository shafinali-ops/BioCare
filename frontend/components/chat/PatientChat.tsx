'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaVideo, FaPhone, FaEllipsisV, FaSmile, FaPaperclip, FaMicrophone, FaSearch } from 'react-icons/fa';
import VoiceRecorder from './VoiceRecorder';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Message {
    _id: string;
    senderId: {
        _id: string;
        name: string;
        email: string;
        role: string;
    } | string;
    receiverId: {
        _id: string;
        name: string;
        email: string;
        role: string;
    } | string;
    message?: string;
    timestamp?: Date;
    createdAt?: string;
    read: boolean;
    attachment?: {
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        url: string;
        type: 'image' | 'video' | 'audio' | 'document' | 'other';
    };
}

interface Doctor {
    _id: string;
    userId?: {
        _id: string;
        id: string;
    };
    name: string;
    specialization: string;
    hospital?: string;
}

export default function PatientChat() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const doctorId = searchParams.get('doctorId');

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showInfo, setShowInfo] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [doctorUserId, setDoctorUserId] = useState<string>(''); // NEW: Store doctor's User ID

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id || user._id;
        setCurrentUserId(userId || '');

        fetchDoctorsList();
    }, []);

    useEffect(() => {
        if (doctorId) {
            fetchDoctorInfo();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [doctorId]);

    // Fetch messages when doctorUserId is available
    useEffect(() => {
        if (doctorUserId) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [doctorUserId]);

    useEffect(() => {
        scrollToBottom();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);

    const fetchDoctorsList = async () => {
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

    const fetchDoctorInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/doctors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const foundDoctor = response.data.find((d: any) =>
                d.userId?._id === doctorId ||
                d.userId?.id === doctorId ||
                d._id === doctorId ||
                d.id === doctorId
            );
            if (foundDoctor) {
                console.log('✅ Found doctor:', foundDoctor);
                setDoctor(foundDoctor);
                // Extract the User ID from the doctor profile
                const userIdToUse = foundDoctor.userId?._id || foundDoctor.userId?.id || foundDoctor.userId;
                console.log('✅ Doctor User ID for messaging:', userIdToUse);
                setDoctorUserId(userIdToUse);
            } else {
                console.error('❌ Doctor not found with ID:', doctorId);
            }
        } catch (error) {
            console.error('Error fetching doctor info:', error);
        }
    };

    const fetchMessages = async () => {
        if (!doctorUserId) return;
        try {
            const token = localStorage.getItem('token');
            console.log('📥 Fetching messages with doctor User ID:', doctorUserId);
            const response = await axios.get(`${API_URL}/messages/conversation/${doctorUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('📨 Received messages:', response.data.length);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !doctorUserId) return;

        setSending(true);
        try {
            const token = localStorage.getItem('token');
            let response;

            if (selectedFile) {
                const formData = new FormData();
                formData.append('receiverId', doctorUserId);
                if (newMessage.trim()) {
                    formData.append('message', newMessage.trim());
                }
                formData.append('file', selectedFile);

                response = await axios.post(`${API_URL}/messages/send`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                console.log('📤 Sending message to doctor User ID:', doctorUserId);
                response = await axios.post(
                    `${API_URL}/messages/send`,
                    { receiverId: doctorUserId, message: newMessage.trim() },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            setMessages([...messages, response.data]);
            setNewMessage('');
            setSelectedFile(null);
        } catch (error: any) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                toast.error('File size must be less than 50MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const renderAttachment = (attachment: any, isMyMessage: boolean) => {
        const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const fileUrl = `${API_URL_BASE}${attachment.url}`;

        if (attachment.type === 'image') {
            return (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block mb-2">
                    <Image
                        src={fileUrl}
                        alt={attachment.originalName}
                        width={300}
                        height={200}
                        className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition object-cover"
                    />
                </a>
            );
        }

        if (attachment.type === 'video') {
            return (
                <video controls className="max-w-xs rounded-lg mb-2">
                    <source src={fileUrl} type={attachment.mimeType} />
                </video>
            );
        }

        if (attachment.type === 'audio') {
            return (
                <audio controls className="w-64 mb-2">
                    <source src={fileUrl} type={attachment.mimeType} />
                </audio>
            );
        }

        return (
            <a href={fileUrl} download={attachment.originalName} className={`flex items-center gap-2 p-3 rounded-lg mb-2 ${isMyMessage ? 'bg-purple-700' : 'bg-gray-200'} hover:opacity-90 transition`}>
                <span className="text-2xl">📄</span>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isMyMessage ? 'text-white' : 'text-gray-900'}`}>{attachment.originalName}</p>
                    <p className={`text-xs ${isMyMessage ? 'text-purple-100' : 'text-gray-500'}`}>{formatFileSize(attachment.size)}</p>
                </div>
                <span className="text-xl">⬇️</span>
            </a>
        );
    };

    const handleVoiceSend = async (audioBlob: Blob) => {
        if (!doctorUserId || sending) return;

        setSending(true);
        try {
            const token = localStorage.getItem('token');
            const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('receiverId', doctorUserId);
            formData.append('file', audioFile);

            const response = await axios.post(`${API_URL}/messages/send`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessages([...messages, response.data]);
            toast.success('Voice message sent!');
        } catch (error: any) {
            console.error('Error sending voice message:', error);
            toast.error('Failed to send voice message');
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const selectDoctor = (doc: Doctor) => {
        const userId = doc.userId?._id || doc.userId?.id || doc._id;
        router.push(`/dashboard/patient/chat?doctorId=${userId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8.5rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-8.5rem)] bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-200">
            {/* Left Sidebar - Doctors List */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 bg-purple-600 text-white">
                    <h1 className="text-xl font-bold">Messages</h1>
                </div>

                <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search doctors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {doctors
                        .filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((doc) => {
                            const docUserId = doc.userId?._id || doc.userId?.id || doc._id;
                            const isActive = docUserId === doctorId;

                            return (
                                <div
                                    key={doc._id}
                                    onClick={() => selectDoctor(doc)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${isActive ? 'bg-purple-50' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                                            👨‍⚕️
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">Dr. {doc.name}</h3>
                                            <p className="text-sm text-gray-500 truncate">{doc.specialization}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* Center - Chat Area */}
            {doctorId && doctor ? (
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                                👨‍⚕️
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">Dr. {doctor.name}</h2>
                                <p className="text-sm text-green-500">● Online</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push(`/dashboard/patient/video-call?doctorId=${doctorId}`)}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                                title="Video Call"
                            >
                                <FaVideo className="text-gray-600 text-lg" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition" title="Voice Call">
                                <FaPhone className="text-gray-600 text-lg" />
                            </button>
                            <button
                                onClick={() => setShowInfo(!showInfo)}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                                title="Info"
                            >
                                <FaEllipsisV className="text-gray-600 text-lg" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e5e7eb\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
                        <div className="max-w-4xl mx-auto space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaPaperPlane className="text-gray-400 text-2xl" />
                                    </div>
                                    <p className="text-gray-500 mb-2">No messages yet</p>
                                    <p className="text-sm text-gray-400">Start a conversation with Dr. {doctor.name}</p>
                                </div>
                            ) : (
                                <>
                                    {messages.reduce((acc: any[], message, index) => {
                                        const messageDate = formatDate(message.createdAt || message.timestamp || new Date());
                                        const prevMessageDate = index > 0 ? formatDate(messages[index - 1].createdAt || messages[index - 1].timestamp || new Date()) : null;

                                        if (messageDate !== prevMessageDate) {
                                            acc.push(
                                                <div key={`date-${index}`} className="flex justify-center my-4">
                                                    <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-600 font-medium shadow-sm">
                                                        {messageDate}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        const senderId = typeof message.senderId === 'string' ? message.senderId : message.senderId._id;
                                        const isMyMessage = senderId === currentUserId;

                                        acc.push(
                                            <div key={message._id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-md px-4 py-2 rounded-lg shadow ${isMyMessage ? 'bg-purple-500 text-white' : 'bg-white text-gray-900'}`}>
                                                    {message.attachment && renderAttachment(message.attachment, isMyMessage)}
                                                    {message.message && <p className="text-sm">{message.message}</p>}
                                                    <p className={`text-xs mt-1 ${isMyMessage ? 'text-purple-100' : 'text-gray-400'} text-right`}>
                                                        {formatTime(message.createdAt || message.timestamp || new Date())}
                                                    </p>
                                                </div>
                                            </div>
                                        );

                                        return acc;
                                    }, [])}
                                </>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="bg-white border-t border-gray-200 p-4">
                        {selectedFile && (
                            <div className="mb-3 p-3 bg-purple-50 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">
                                        {selectedFile.type.startsWith('image/') ? '🖼️' : selectedFile.type.startsWith('video/') ? '🎥' : selectedFile.type.startsWith('audio/') ? '🎵' : '📄'}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                                    </div>
                                </div>
                                <button onClick={removeFile} type="button" className="text-red-500 hover:text-red-700 font-bold">✕</button>
                            </div>
                        )}

                        <form onSubmit={sendMessage} className="flex items-center gap-2">
                            <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" />

                            <button onClick={() => fileInputRef.current?.click()} type="button" className="p-3 hover:bg-gray-100 rounded-full transition" disabled={sending}>
                                <FaPaperclip className="text-gray-600" />
                            </button>

                            <VoiceRecorder onSend={handleVoiceSend} disabled={sending} />

                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                                disabled={sending}
                            />

                            <button type="submit" disabled={sending || (!newMessage.trim() && !selectedFile)} className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition disabled:opacity-50">
                                <FaPaperPlane />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaPaperPlane className="text-purple-600 text-4xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Doctor</h2>
                        <p className="text-gray-500">Choose a doctor from the list to start messaging</p>
                    </div>
                </div>
            )}

            {/* Right Sidebar - Info Panel */}
            {showInfo && doctor && (
                <div className="w-80 bg-white border-l border-gray-200 p-6">
                    <h3 className="text-lg font-bold mb-4">Contact Info</h3>
                    <div className="text-center mb-6">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-3">
                            👨‍⚕️
                        </div>
                        <h4 className="font-bold text-lg">Dr. {doctor.name}</h4>
                        <p className="text-sm text-gray-500">{doctor.specialization}</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Hospital</p>
                            <p className="font-medium">{doctor.hospital || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Specialization</p>
                            <p className="font-medium">{doctor.specialization}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
