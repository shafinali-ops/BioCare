'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { pharmacyService } from '@/services/pharmacyService';
import { toast } from 'react-toastify';
import api from '@/services/api';

export default function MedicinesPage() {
    const router = useRouter();
    const [medicines, setMedicines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [editingMedicine, setEditingMedicine] = useState<any>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Get unique categories from medicines
    const categories = ['all', ...Array.from(new Set(medicines.map(m => m.category))).filter(Boolean).sort()];

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const response = await api.get('/pharmacist/medicines');
            setMedicines(response.data.medicines);
        } catch (error) {
            console.error('Error fetching medicines:', error);
            toast.error('Failed to load medicines');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.delete(`/pharmacist/medicines/${id}`);
            toast.success('Medication deleted successfully!');
            fetchMedicines();
        } catch (error: any) {
            console.error('Error deleting medication:', error);
            toast.error(error.response?.data?.message || 'Failed to delete medication');
        }
    };

    const handleEdit = (medicine: any) => {
        setEditingMedicine({ ...medicine });
        setShowEditModal(true);
    };

    const handleUpdateMedicine = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await api.put(`/pharmacist/medicines/${editingMedicine._id}`, editingMedicine);
            toast.success('Medication updated successfully!');
            setShowEditModal(false);
            setEditingMedicine(null);
            fetchMedicines();
        } catch (error: any) {
            console.error('Error updating medication:', error);
            toast.error(error.response?.data?.message || 'Failed to update medication');
        }
    };

    const filteredMedicines = medicines.filter(medicine => {
        const name = medicine.name || '';

        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getStockStatusColor = (status: string = 'available') => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800';
            case 'low-stock': return 'bg-yellow-100 text-yellow-800';
            case 'out-of-stock': return 'bg-red-100 text-red-800';
            case 'discontinued': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardLayout role="pharmacist">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Medicines Inventory</h1>
                        <p className="text-gray-600 mt-1">Manage and track all medicines in stock</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/pharmacist/add-medicine')}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Medicine
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                        {categories.map(cat => {
                            const count = cat === 'all'
                                ? medicines.length
                                : medicines.filter(m => m.category === cat).length;

                            const isSelected = selectedCategory === cat;

                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${isSelected
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="capitalize">{cat === 'all' ? 'All' : cat}</span>
                                    <span className={`ml-2 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`}>
                                        ({count})
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search medications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Medicines List */}
                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Medication Name</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Dosage / Frequency</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredMedicines.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                    <p>No medicines found matching your criteria</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMedicines.map((medicine) => (
                                            <tr key={medicine._id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{medicine.name}</div>
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                {medicine.description || 'No description'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-6">
                                                    <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium capitalize">
                                                        {medicine.category}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-6">
                                                    <div className="text-sm font-bold text-gray-900">{medicine.dosage}</div>
                                                    <div className="text-xs text-gray-500">{medicine.frequency}</div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-green-600">
                                                        ${medicine.price.toFixed(2)}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${medicine.stock <= 10 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                        <span className={`text-sm font-medium ${medicine.stock <= 10 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {medicine.stock} units
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            onClick={() => handleEdit(medicine)}
                                                            className="text-primary-500 hover:text-primary-700 text-sm font-medium transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(medicine._id, medicine.name)}
                                                            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {showEditModal && editingMedicine && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-800">Edit Medication</h2>
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingMedicine(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateMedicine} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Medication Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editingMedicine.name}
                                            onChange={(e) => setEditingMedicine({ ...editingMedicine, name: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={editingMedicine.category}
                                            onChange={(e) => setEditingMedicine({ ...editingMedicine, category: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent capitalize"
                                        >
                                            {['General', 'Antibiotic', 'Painkiller', 'Antiviral', 'Antifungal', 'Vitamin', 'Supplement'].map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Dosage <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editingMedicine.dosage}
                                            onChange={(e) => setEditingMedicine({ ...editingMedicine, dosage: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="e.g. 500mg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Frequency <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editingMedicine.frequency}
                                            onChange={(e) => setEditingMedicine({ ...editingMedicine, frequency: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="e.g. Twice daily"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Price ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={editingMedicine.price}
                                            onChange={(e) => setEditingMedicine({ ...editingMedicine, price: parseFloat(e.target.value) })}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Stock
                                        </label>
                                        <input
                                            type="number"
                                            value={editingMedicine.stock}
                                            onChange={(e) => setEditingMedicine({ ...editingMedicine, stock: parseInt(e.target.value) })}
                                            min="0"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={editingMedicine.description}
                                            onChange={(e) => setEditingMedicine({ ...editingMedicine, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Enter medication description..."
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl"
                                    >
                                        Update Medication
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingMedicine(null);
                                        }}
                                        className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
