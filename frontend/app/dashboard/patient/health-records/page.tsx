'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { vitalService } from '@/services/vitalService';
import { toast } from 'react-toastify';

export default function MedicalRecordsPage() {
  const [vitals, setVitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVital, setEditingVital] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    heartRate: '',
    systolic: '',
    diastolic: '',
    temperature: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    notes: ''
  });

  useEffect(() => {
    fetchVitals();
  }, []);

  const fetchVitals = async () => {
    try {
      setLoading(true);
      const data = await vitalService.getMyVitals();
      setVitals(data);
    } catch (error) {
      console.error('Error fetching vitals:', error);
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const vitalData = {
        heartRate: formData.heartRate ? Number(formData.heartRate) : undefined,
        bloodPressure: formData.systolic && formData.diastolic
          ? { systolic: Number(formData.systolic), diastolic: Number(formData.diastolic) }
          : undefined,
        temperature: formData.temperature ? Number(formData.temperature) : undefined,
        oxygenSaturation: formData.oxygenSaturation ? Number(formData.oxygenSaturation) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        notes: formData.notes || undefined
      };

      if (editingVital) {
        await vitalService.updateVital(editingVital._id, vitalData);
        toast.success('Medical record updated successfully');
      } else {
        await vitalService.createVital(vitalData);
        toast.success('Medical record created successfully');
      }

      setShowModal(false);
      setEditingVital(null);
      resetForm();
      fetchVitals();
    } catch (error: any) {
      console.error('Error saving vital:', error);
      toast.error(error.response?.data?.message || 'Failed to save medical record');
    }
  };

  const handleEdit = (vital: any) => {
    setEditingVital(vital);
    setFormData({
      heartRate: vital.heartRate || '',
      systolic: vital.bloodPressure?.systolic || '',
      diastolic: vital.bloodPressure?.diastolic || '',
      temperature: vital.temperature || '',
      oxygenSaturation: vital.oxygenSaturation || '',
      weight: vital.weight || '',
      height: vital.height || '',
      notes: vital.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await vitalService.deleteVital(id);
        toast.success('Medical record deleted');
        fetchVitals();
      } catch (error) {
        console.error('Error deleting vital:', error);
        toast.error('Failed to delete record');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      heartRate: '',
      systolic: '',
      diastolic: '',
      temperature: '',
      oxygenSaturation: '',
      weight: '',
      height: '',
      notes: ''
    });
  };

  const getAlertColor = (alertLevel: string) => {
    switch (alertLevel) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Medical Records</h1>
              <p className="text-gray-600">Track and manage your vital signs</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingVital(null);
                setShowModal(true);
              }}
              className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-all shadow-lg font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Record
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {vitals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {(() => {
              const latest = vitals[0];
              return (
                <>
                  {latest.heartRate && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Heart Rate</span>
                        <span className="text-2xl">❤️</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{latest.heartRate} <span className="text-sm font-normal">bpm</span></p>
                    </div>
                  )}
                  {latest.bloodPressure && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Blood Pressure</span>
                        <span className="text-2xl">🩸</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {latest.bloodPressure.systolic}/{latest.bloodPressure.diastolic}
                        <span className="text-sm font-normal ml-1">mmHg</span>
                      </p>
                    </div>
                  )}
                  {latest.temperature && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Temperature</span>
                        <span className="text-2xl">🌡️</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{latest.temperature} <span className="text-sm font-normal">°C</span></p>
                    </div>
                  )}
                  {latest.oxygenSaturation && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Oxygen Saturation</span>
                        <span className="text-2xl">🫁</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{latest.oxygenSaturation} <span className="text-sm font-normal">%</span></p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Records List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Vital Sign History</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading records...</p>
            </div>
          ) : vitals.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 mb-4">No medical records yet</p>
              <button
                onClick={() => setShowModal(true)}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Create your first record
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Heart Rate</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Blood Pressure</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Temp</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">SpO2</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vitals.map((vital) => (
                    <tr key={vital._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(vital.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-gray-800">
                        {vital.heartRate ? `${vital.heartRate} bpm` : '-'}
                      </td>
                      <td className="py-4 px-6 text-gray-800">
                        {vital.bloodPressure ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}` : '-'}
                      </td>
                      <td className="py-4 px-6 text-gray-800">
                        {vital.temperature ? `${vital.temperature}°C` : '-'}
                      </td>
                      <td className="py-4 px-6 text-gray-800">
                        {vital.oxygenSaturation ? `${vital.oxygenSaturation}%` : '-'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getAlertColor(vital.alertLevel)}`}>
                          {vital.alertLevel}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(vital)}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(vital._id)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingVital ? 'Edit Medical Record' : 'Add Medical Record'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingVital(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    value={formData.heartRate}
                    onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 72"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 36.6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Systolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={formData.systolic}
                    onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diastolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={formData.diastolic}
                    onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 80"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oxygen Saturation (%)
                  </label>
                  <input
                    type="number"
                    value={formData.oxygenSaturation}
                    onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 98"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 70"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 170"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any additional notes..."
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 text-white py-3 rounded-xl hover:bg-primary-600 transition-all font-semibold"
                >
                  {editingVital ? 'Update Record' : 'Save Record'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingVital(null);
                  }}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
