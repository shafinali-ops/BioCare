import api from './api';

export const vitalService = {
  // Create new vital record
  createVital: async (vitalData: any) => {
    const response = await api.post('/vitals', vitalData);
    return response.data;
  },

  // Get my vitals (patient)
  getMyVitals: async () => {
    const response = await api.get('/vitals');
    return response.data;
  },

  // Get vitals for specific patient (doctor/admin)
  getPatientVitals: async (patientId: string) => {
    const response = await api.get(`/vitals/patient/${patientId}`);
    return response.data;
  },

  // Get single vital record
  getVital: async (id: string) => {
    const response = await api.get(`/vitals/${id}`);
    return response.data;
  },

  // Update vital record
  updateVital: async (id: string, vitalData: any) => {
    const response = await api.put(`/vitals/${id}`, vitalData);
    return response.data;
  },

  // Delete vital record
  deleteVital: async (id: string) => {
    const response = await api.delete(`/vitals/${id}`);
    return response.data;
  },

  // Get latest vital for patient
  getLatestVital: async (patientId: string) => {
    const response = await api.get(`/vitals/latest/${patientId}`);
    return response.data;
  }
};
