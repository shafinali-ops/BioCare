import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const consultationService = {
    // Create a new consultation
    createConsultation: async (data: {
        appointmentId: string;
        symptoms: string[];
        doctor_notes?: string;
        diagnosis: string;
        recommended_tests?: string[];
    }) => {
        const response = await axios.post(
            `${API_URL}/consultations/create`,
            data,
            getAuthHeaders()
        );
        return response.data;
    },

    // Get consultation by ID
    getConsultationById: async (id: string) => {
        const response = await axios.get(
            `${API_URL}/consultations/${id}`,
            getAuthHeaders()
        );
        return response.data;
    },

    // Get consultations by patient ID
    getConsultationsByPatient: async (patientId: string) => {
        const response = await axios.get(
            `${API_URL}/consultations/byPatient/${patientId}`,
            getAuthHeaders()
        );
        return response.data;
    },

    // Update consultation
    updateConsultation: async (id: string, data: {
        symptoms?: string[];
        doctor_notes?: string;
        diagnosis?: string;
        recommended_tests?: string[];
    }) => {
        const response = await axios.put(
            `${API_URL}/consultations/${id}/update`,
            data,
            getAuthHeaders()
        );
        return response.data;
    },

    // Get doctor's consultations
    getDoctorConsultations: async () => {
        const response = await axios.get(
            `${API_URL}/consultations/doctor/my-consultations`,
            getAuthHeaders()
        );
        return response.data;
    }
};
