import api from './api';
import { ChatMessage, ChatSession, ChatbotAIResponse } from '@/types';

export const chatbotService = {
    // Send text message
    sendMessage: async (message: string, sessionId?: string, language: string = 'auto') => {
        const response = await api.post('/chatbot/message', {
            message,
            sessionId,
            language
        });
        return response.data;
    },

    // Upload and analyze file (PDF, DOC, Image)
    uploadFile: async (file: File, sessionId?: string, additionalMessage?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        if (sessionId) formData.append('sessionId', sessionId);
        if (additionalMessage) formData.append('additionalMessage', additionalMessage);

        const response = await api.post('/chatbot/upload-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Transcribe voice using Whisper
    transcribeVoice: async (audioBlob: Blob, sessionId?: string) => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-message.webm');
        if (sessionId) formData.append('sessionId', sessionId);

        const response = await api.post('/chatbot/transcribe-voice', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Convert text to speech
    textToSpeech: async (text: string, voice: string = 'alloy') => {
        const response = await api.post('/chatbot/text-to-speech', {
            text,
            voice
        }, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Get chat history for a session
    getChatHistory: async (sessionId: string) => {
        const response = await api.get(`/chatbot/history/${sessionId}`);
        return response.data;
    },

    // Get all chat sessions
    getSessions: async () => {
        const response = await api.get('/chatbot/sessions');
        return response.data;
    },

    // Legacy methods (backward compatibility)
    sendQuery: async (query: string) => {
        const response = await api.post('/chatbot/query', { query });
        return response.data;
    },

    getHealthTips: async (healthTypes: string[]) => {
        const response = await api.post('/chatbot/health-tips', { healthTypes });
        return response.data;
    },

    recommendMedication: async (symptoms: string[]) => {
        const response = await api.post('/chatbot/recommend-medication', { symptoms });
        return response.data;
    }
};
