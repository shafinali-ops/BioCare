import api from './api';

// Get all prescriptions
export const getPrescriptions = async (status?: 'pending' | 'collected' | 'all') => {
    const response = await api.get(`/pharmacist/prescriptions${status ? `?status=${status}` : ''}`);
    return response.data;
};

// Get a specific prescription by ID
export const getPrescriptionById = async (id: string) => {
    const response = await api.get(`/pharmacist/prescriptions/${id}`);
    return response.data;
};

// Mark prescription as collected
export const markAsCollected = async (id: string, notes?: string) => {
    const response = await api.post(`/pharmacist/prescriptions/${id}/collected`, { notes });
    return response.data;
};

// Check prescription availability
export const checkPrescriptionAvailability = async (id: string) => {
    const response = await api.get(`/pharmacist/prescriptions/${id}/availability`);
    return response.data;
};

// Get all medicines
export const getMedicines = async (filters?: { status?: string; category?: string }) => {
    const params = new URLSearchParams(filters as any).toString();
    const response = await api.get(`/pharmacist/medicines${params ? `?${params}` : ''}`);
    return response.data;
};

// Search medicines
export const searchMedicines = async (query: string) => {
    const response = await api.get(`/pharmacist/medicines/search?query=${query}`);
    return response.data;
};

// Get low stock medicines
export const getLowStockMedicines = async () => {
    const response = await api.get('/pharmacist/medicines/low-stock');
    return response.data;
};

// Add a new medicine
export const addMedicine = async (medicineData: {
    medicineName: string;
    genericName?: string;
    category?: string;
    manufacturer?: string;
    description?: string;
    stock?: number;
    unit?: string;
    price?: number;
    expiryDate?: string;
    reorderLevel?: number;
}) => {
    const response = await api.post('/pharmacist/medicines', medicineData);
    return response.data;
};

// Update medicine stock
export const updateMedicineStock = async (id: string, data: {
    quantity: number;
    type: 'added' | 'dispensed' | 'expired' | 'returned';
    notes?: string;
}) => {
    const response = await api.post(`/pharmacist/medicines/${id}/stock`, data);
    return response.data;
};

// Update medicine details
export const updateMedicine = async (id: string, updates: any) => {
    const response = await api.put(`/pharmacist/medicines/${id}`, updates);
    return response.data;
};

// Delete medicine
export const deleteMedicine = async (id: string) => {
    const response = await api.delete(`/pharmacist/medicines/${id}`);
    return response.data;
};
