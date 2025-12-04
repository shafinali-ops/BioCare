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

export interface Medicine {
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

export const prescriptionService = {
    // Create a new prescription
    createPrescription: async (data: {
        consultationId: string;
        medicines: Medicine[];
        follow_up_date?: string;
        instructions?: string;
    }) => {
        const response = await axios.post(
            `${API_URL}/prescriptions/create`,
            data,
            getAuthHeaders()
        );
        return response.data;
    },

    // Update prescription
    updatePrescription: async (id: string, data: {
        medicines?: Medicine[];
        follow_up_date?: string;
        instructions?: string;
        status?: 'active' | 'expired' | 'cancelled';
    }) => {
        const response = await axios.put(
            `${API_URL}/prescriptions/${id}/update`,
            data,
            getAuthHeaders()
        );
        return response.data;
    },

    // Get prescription by ID
    getPrescriptionById: async (id: string) => {
        const response = await axios.get(
            `${API_URL}/prescriptions/${id}`,
            getAuthHeaders()
        );
        return response.data;
    },

    // Get prescriptions by patient ID
    getPrescriptionsByPatient: async (patientId: string) => {
        const response = await axios.get(
            `${API_URL}/prescriptions/patient/${patientId}`,
            getAuthHeaders()
        );
        return response.data;
    },

    // Get doctor's prescriptions
    getDoctorPrescriptions: async () => {
        const response = await axios.get(
            `${API_URL}/prescriptions/doctor/my-prescriptions`,
            getAuthHeaders()
        );
        return response.data;
    },

    // Get prescription by consultation ID
    getPrescriptionByConsultation: async (consultationId: string) => {
        const response = await axios.get(
            `${API_URL}/prescriptions/consultation/${consultationId}`,
            getAuthHeaders()
        );
        return response.data;
    }
};
