'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { toast } from 'react-toastify';
import api from '@/services/api';

export default function AddMedicinePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'General',
        dosage: '',
        frequency: '',
        price: 0,
        stock: 0,
        description: ''
    });

    const categories = [
        'General', 'Antibiotic', 'Painkiller', 'Antiviral', 'Antifungal', 'Vitamin', 'Supplement'
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'stock' || name === 'price' ? parseFloat(value) : value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            await api.post('/pharmacist/medicines', formData);
            toast.success('Medication added successfully!');
            router.push('/dashboard/pharmacist/medicines');
        } catch (error: any) {
            console.error('Error adding medication:', error);
            toast.error(error.response?.data?.message || 'Failed to add medication');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout role="pharmacist">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Add New Medication</h1>
                            <p className="text-gray-600 mt-1">Add a new medication to the inventory</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                                            💊
                                        </span>
                                        Medication Details
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Medication Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                placeholder="e.g. Aspirin"
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Category
                                            </label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all capitalize"
                                            >
                                                {categories.map(cat => (
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
                                                name="dosage"
                                                value={formData.dosage}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                placeholder="e.g. 500mg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Frequency <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="frequency"
                                                value={formData.frequency}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                placeholder="e.g. Twice daily"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Price ($)
                                            </label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                placeholder="9.99"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Stock
                                            </label>
                                            <input
                                                type="number"
                                                name="stock"
                                                value={formData.stock}
                                                onChange={handleChange}
                                                min="0"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                placeholder="100"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                placeholder="Enter medication description..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Adding Medicine...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Add Medicine
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Info Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Quick Tips */}
                        <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-primary-900 mb-2">Inventory Tips</h3>
                                    <ul className="text-sm text-primary-800 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary-500 mt-0.5">•</span>
                                            <span>Ensure medicine names are unique</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary-500 mt-0.5">•</span>
                                            <span>Set accurate reorder levels to get low stock alerts</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary-500 mt-0.5">•</span>
                                            <span>Check expiry dates carefully</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Categories Guide */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                            <h3 className="font-semibold text-green-900 mb-3">Categories Guide</h3>
                            <div className="space-y-2 text-sm text-green-800">
                                <p><span className="font-semibold">Antibiotic:</span> For bacterial infections</p>
                                <p><span className="font-semibold">Painkiller:</span> Analgesics and anti-inflammatories</p>
                                <p><span className="font-semibold">Antiviral:</span> For viral infections</p>
                                <p><span className="font-semibold">Vitamin:</span> Nutritional supplements</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
