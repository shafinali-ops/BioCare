'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPrescriptionBottle, FaPills, FaCalendarAlt, FaUserMd, FaDownload } from 'react-icons/fa';
import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface Prescription {
  _id: string;
  consultationId: {
    _id: string;
    diagnosis: string;
    symptoms: string[];
  };
  doctorId: {
    _id: string;
    name: string;
    specialization: string;
  };
  medicines: {
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  follow_up_date?: string;
  prescription_date: string;
  status: string;
  instructions?: string;
}

export default function PatientPrescriptionsPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
    setupSocketListeners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupSocketListeners = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) return;

    const user = JSON.parse(userStr);
    const socket = io(SOCKET_URL, { auth: { token } });

    socket.emit('join', `user:${user._id}`);

    // Listen for new prescription notifications
    socket.on('prescription_created', (data) => {
      toast.success(`📋 ${data.message}`, {
        autoClose: 8000,
        onClick: () => {
          fetchPrescriptions();
        }
      });
      fetchPrescriptions();
    });

    return () => {
      socket.disconnect();
    };
  };

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || user._id;

      console.log('🔍 Fetching prescriptions for user:', userId);

      // Backend will convert User ID to Patient profile ID
      const response = await axios.get(`${API_URL}/prescriptions/patient/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Prescriptions loaded:', response.data);
      setPrescriptions(response.data);
    } catch (error: any) {
      console.error('❌ Error fetching prescriptions:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const viewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
  };

  const closePrescription = () => {
    setSelectedPrescription(null);
  };

  const downloadPDF = async (prescriptionId: string) => {
    try {
      const token = localStorage.getItem('token');

      toast.info('Generating PDF...');

      const response = await axios.get(
        `${API_URL}/prescriptions/${prescriptionId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob' // Important for file download
        }
      );

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully!');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="patient">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="patient">
      <div className="p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg p-6 mb-4 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <FaPrescriptionBottle className="text-3xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">My Prescriptions</h1>
              <p className="text-sm opacity-90">View your medical prescriptions from doctors</p>
            </div>
          </div>
        </div>

        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <FaPills className="mx-auto text-4xl text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Prescriptions Yet</h3>
            <p className="text-sm text-gray-500">Your prescriptions will appear here after consultations</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prescriptions.map((prescription) => (
              <div
                key={prescription._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-4 border border-gray-100 cursor-pointer"
                onClick={() => viewPrescription(prescription)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <FaPrescriptionBottle className="text-xl text-primary-600" />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${prescription.status === 'active' ? 'bg-green-100 text-green-700' :
                    prescription.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                    {prescription.status.toUpperCase()}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <FaUserMd className="text-sm" />
                    <span className="font-semibold text-gray-800 text-sm">Dr. {prescription.doctorId.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{prescription.doctorId.specialization}</p>
                </div>

                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-600 mb-0.5">Diagnosis:</p>
                  <p className="text-sm text-gray-800 line-clamp-1">{prescription.consultationId.diagnosis}</p>
                </div>

                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-600 mb-0.5">Medicines:</p>
                  <p className="text-sm text-primary-600 font-semibold">
                    {prescription.medicines.length} medicine{prescription.medicines.length > 1 ? 's' : ''} prescribed
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaCalendarAlt />
                  <span>{new Date(prescription.prescription_date).toLocaleDateString()}</span>
                </div>

                <button className="mt-3 w-full py-2 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition text-sm">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Prescription Detail Modal */}
        {selectedPrescription && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closePrescription}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Prescription Details</h2>
                    <p className="opacity-90 text-sm">Issued on {new Date(selectedPrescription.prescription_date).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={closePrescription}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Doctor Info */}
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                    <FaUserMd className="text-purple-600" />
                    Doctor Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">Dr. {selectedPrescription.doctorId.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Specialization:</span>
                      <span className="ml-2 font-medium">{selectedPrescription.doctorId.specialization}</span>
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-1 text-sm">Diagnosis</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-xl text-sm">{selectedPrescription.consultationId.diagnosis}</p>
                </div>

                {/* Medicines */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                    <FaPills className="text-purple-600" />
                    Prescribed Medicines
                  </h3>
                  <div className="space-y-3">
                    {selectedPrescription.medicines.map((medicine, index) => (
                      <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-base text-purple-900">{medicine.medicine_name}</h4>
                          <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                            Medicine {index + 1}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600 font-medium">Dosage:</span>
                            <span className="ml-2 text-gray-800">{medicine.dosage}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">Frequency:</span>
                            <span className="ml-2 text-gray-800">{medicine.frequency}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">Duration:</span>
                            <span className="ml-2 text-gray-800">{medicine.duration}</span>
                          </div>
                          {medicine.instructions && (
                            <div className="col-span-2">
                              <span className="text-gray-600 font-medium">Instructions:</span>
                              <span className="ml-2 text-gray-800">{medicine.instructions}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Follow-up Date */}
                {selectedPrescription.follow_up_date && (
                  <div className="bg-primary-50 p-3 rounded-xl border border-primary-100">
                    <div className="flex items-center gap-2 text-sm">
                      <FaCalendarAlt className="text-blue-600" />
                      <span className="font-medium text-gray-700">Follow-up Date:</span>
                      <span className="font-bold text-blue-600">
                        {new Date(selectedPrescription.follow_up_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* General Instructions */}
                {selectedPrescription.instructions && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1 text-sm">General Instructions</h3>
                    <p className="text-gray-700 bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-sm">
                      {selectedPrescription.instructions}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={closePrescription}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition text-sm"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => downloadPDF(selectedPrescription._id)}
                    className="flex-1 py-2 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 hover:shadow-xl transition flex items-center justify-center gap-2 text-sm"
                  >
                    <FaDownload /> Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
