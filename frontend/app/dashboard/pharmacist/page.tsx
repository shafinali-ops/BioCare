'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { pharmacyService } from '@/services/pharmacyService';
import api from '@/services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PharmacistDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalMedicines: 0,
        lowStock: 0,
        activePrescriptions: 0,
        dispensedToday: 0
    });
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch medicines from pharmacist endpoint
            const medicinesResponse = await api.get('/pharmacist/medicines');
            const medicines = medicinesResponse.data.medicines;

            const lowStockCount = medicines.filter((m: any) => m.stock <= 10).length;

            // Fetch prescriptions count
            const prescriptions = await pharmacyService.getAllPrescriptions();
            const activeCount = prescriptions.filter((p: any) => p.status === 'active').length;

            // Mock dispensed today for now
            const dispensedCount = prescriptions.filter((p: any) =>
                p.status === 'dispensed' &&
                new Date(p.updatedAt).toDateString() === new Date().toDateString()
            ).length;

            setStats({
                totalMedicines: medicines.length,
                lowStock: lowStockCount,
                activePrescriptions: activeCount,
                dispensedToday: dispensedCount
            });

            // Process category data for charts
            const categoryMap = new Map();
            medicines.forEach((medicine: any) => {
                const category = medicine.category || 'Other';
                if (!categoryMap.has(category)) {
                    categoryMap.set(category, {
                        category: category,
                        count: 0,
                        totalStock: 0
                    });
                }
                const data = categoryMap.get(category);
                data.count += 1;
                data.totalStock += medicine.stock || 0;
            });

            const chartData = Array.from(categoryMap.values()).map(item => ({
                name: item.category,
                count: item.count,
                stock: item.totalStock
            }));

            setCategoryData(chartData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800">{payload[0].name}</p>
                    <p className="text-sm text-gray-600">Count: {payload[0].value}</p>
                    {payload[0].payload.stock !== undefined && (
                        <p className="text-sm text-gray-600">Stock: {payload[0].payload.stock}</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <DashboardLayout role="pharmacist">
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Pharmacist Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Manage pharmacy inventory and fulfill prescriptions
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-primary-100 font-medium mb-1">Total Medicines</p>
                                <h3 className="text-3xl font-bold">{stats.totalMedicines}</h3>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <span className="text-2xl">💊</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-red-100 font-medium mb-1">Low Stock Alerts</p>
                                <h3 className="text-3xl font-bold">{stats.lowStock}</h3>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <span className="text-2xl">⚠️</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-green-100 font-medium mb-1">Active Prescriptions</p>
                                <h3 className="text-3xl font-bold">{stats.activePrescriptions}</h3>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <span className="text-2xl">📝</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-purple-100 font-medium mb-1">Dispensed Today</p>
                                <h3 className="text-3xl font-bold">{stats.dispensedToday}</h3>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <span className="text-2xl">✅</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                {!loading && categoryData.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Pie Chart - Medicine Count by Category */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Medicine Distribution by Category</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Bar Chart - Stock Levels by Category */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Stock Levels by Category</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={categoryData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="count" fill="#3B82F6" name="Medicine Count" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="stock" fill="#10B981" name="Total Stock" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={() => router.push('/dashboard/pharmacist/prescriptions')}
                        className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-center gap-4 group"
                    >
                        <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-xl group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            📝
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-800">View Prescriptions</h3>
                            <p className="text-sm text-gray-500">Check pending prescriptions</p>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/dashboard/pharmacist/add-medicine')}
                        className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-center gap-4 group"
                    >
                        <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-xl group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            ➕
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-800">Add Medicine</h3>
                            <p className="text-sm text-gray-500">Update pharmacy inventory</p>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/dashboard/pharmacist/medicines')}
                        className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-center gap-4 group"
                    >
                        <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-xl group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            📦
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-800">View Inventory</h3>
                            <p className="text-sm text-gray-500">Manage all medicines</p>
                        </div>
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
