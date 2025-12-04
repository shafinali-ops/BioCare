import api from './api';

// Register a new patient
// Register a new patient
export const registerPatient = async (patientData: {
    name: string;
    age: number;
    gender: string;
    email: string;
    password: string;
}) => {
    const response = await api.post('/lhw/register-patient', patientData);
    return response.data;
};

// Get all patients registered by this LHW
export const getMyPatients = async () => {
    const response = await api.get('/lhw/patients');
    return response.data;
};

// Get a specific patient by ID
export const getPatientById = async (id: string) => {
    const response = await api.get(`/lhw/patients/${id}`);
    return response.data;
};

// Search patients
export const searchPatients = async (query: string) => {
    const response = await api.get(`/lhw/patients/search?query=${query}`);
    return response.data;
};

// Add symptoms to a patient
export const addSymptoms = async (patientId: string, symptomsData: {
    temperature?: number;
    bloodPressure?: {
        systolic: number;
        diastolic: number;
    };
    symptoms?: string[];
    notes?: string;
}) => {
    const response = await api.post(`/lhw/patients/${patientId}/symptoms`, symptomsData);
    return response.data;
};

// Start consultation
export const startConsultation = async (data: {
    patientId: string;
    doctorId: string;
    symptoms?: string[];
}) => {
    const response = await api.post('/lhw/start-consultation', data);
    return response.data;
};

// Get patient's consultation history
export const getPatientConsultations = async (patientId: string) => {
    const response = await api.get(`/lhw/patients/${patientId}/consultations`);
    return response.data;
};
